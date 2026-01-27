import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  async transcribe(id):Promise<TranscriptionResponse> {

    const files = await this.bucket.find({ _id: id }).toArray();
    if (!files.length) {
      throw new NotFoundException('Video file not found in GridFS');
    }

    // Stream from GridFS to client
    const writeStream = fs.createWriteStream('./video.mp4');
    const gridStream = this.bucket.openDownloadStream(id);


    gridStream.pipe(writeStream);

    await once(writeStream, 'finish');


    const stream = fs.createReadStream('./video.mp4');
    return this.openAIClient.getTimestamps(stream)
  }

}


