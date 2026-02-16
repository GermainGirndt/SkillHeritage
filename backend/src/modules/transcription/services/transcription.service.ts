import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OpenAIClient } from 'src/shared/providers/openai.client';
import { Connection, Model, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Tutorial, TutorialDocument } from 'src/modules/tutorial/schemas/tutorial.schema';
import { GridFSBucket } from 'mongodb';
import { spawn } from 'child_process';
import * as path from 'path';

interface TranscriptionResponse {
  text: string;
  segments: any[];
}

@Injectable()
export class TranscriptionService {
  bucket: GridFSBucket
  constructor(
    @InjectModel(Tutorial.name)
    private readonly tutorialModel: Model<TutorialDocument>,
    @InjectConnection() private readonly connection: Connection, private readonly openAIClient: OpenAIClient
  ) {
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'tutorialVideos',
    });
  }
  async transcribe(id): Promise<TranscriptionResponse> {

    const ffmpegPath = require('ffmpeg-static');
    const files = await this.bucket.find({ _id: id }).toArray();
    if (!files.length) {
      throw new NotFoundException('Video file not found in GridFS');
    }

    // Stream from GridFS to client
    return new Promise((resolve, reject) => {

      const videoStream = this.bucket.openDownloadStream(id);

      const ffmpeg = spawn(ffmpegPath!, [
        '-i', 'pipe:0',
        '-vn',
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
        '-f', 'wav',
        'pipe:1'
      ]);

      const python = spawn('python3.13', [
        path.join(__dirname, '../transcription.py'),
      ]);



      let output = '';
      let error = '';

      videoStream.on('error', (err) => {
        ffmpeg.stdin.destroy(err);
        reject(new Error('GridFS stream error: ' + err.message));
      });

      ffmpeg.stdin.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code !== 'EPIPE') reject(new Error('FFmpeg stdin error: ' + err.message));
      });

      ffmpeg.stdout.on('error', (err) => reject(new Error('FFmpeg stdout error: ' + err.message)));
      ffmpeg.stderr.on('data', (data) => console.error('FFmpeg stderr:', data.toString()));
      ffmpeg.on('error', (err) => reject(new Error('FFmpeg process error: ' + err.message)));

      python.stdin.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code !== 'EPIPE') reject(new Error('Python stdin error: ' + err.message));
      });

      python.stdout.on('error', (err) => reject(new Error('Python stdout error: ' + err.message)));
      python.stderr.on('data', (data) => console.error('Python stderr:', data.toString()));
      python.on('error', (err) => reject(new Error('Python process error: ' + err.message)));


      // Pipe streams
      videoStream.pipe(ffmpeg.stdin);
      ffmpeg.stdout.pipe(python.stdin);

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(error));
        }

        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(e);
        }
      });
    });
  }

}