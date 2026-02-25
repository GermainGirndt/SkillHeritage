import {  Injectable, NotFoundException } from '@nestjs/common';
import { OpenAIClient } from 'src/shared/providers/openai.client';
import * as fs from 'fs';
import { Connection, Model, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Tutorial, TutorialDocument } from 'src/modules/tutorial/schemas/tutorial.schema';
import { GridFSBucket } from 'mongodb';
import { once } from 'events';
import { TranscriptionSegment } from 'openai/resources/audio/transcriptions';

interface TranscriptionResponse {
  text: string;
  segments: TranscriptionSegment[];
}

@Injectable()
export class TranscriptionOpenaiAPIService {
  bucket: GridFSBucket
  constructor(
    @InjectModel(Tutorial.name)
    @InjectConnection() private readonly connection: Connection, private readonly openAIClient: OpenAIClient
  ) {
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'tutorialVideos',
    });
  }
  async generateTranscriptionFromFileId(id: Types.ObjectId):Promise<TranscriptionResponse> {

    const files = await this.bucket.find({ _id: id }).toArray();
    if (!files.length) {
      throw new NotFoundException('Video file not found in GridFS');
    }

    const writeStream = fs.createWriteStream('./video.mp4');
    const gridStream = this.bucket.openDownloadStream(id);


    gridStream.pipe(writeStream);

    await once(writeStream, 'finish');


    const stream = fs.createReadStream('./video.mp4');
    return this.openAIClient.getTimestamps(stream)
  }

}


