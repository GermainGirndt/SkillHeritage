import {
  Injectable,
} from '@nestjs/common';
import { OpenAIClient } from 'src/shared/providers/openai.client';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { GridFSBucket } from 'mongodb';

interface LLMResponse {
  title: string;
  description: string;
  instructions: string;
}

@Injectable()
export class LLMService {
  bucket: GridFSBucket;
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly openAIClient: OpenAIClient,
  ) {
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'tutorialVideos',
    });
  }

 
  async generateTutorialContentFromTranscription(transcription:string): Promise<LLMResponse> {
    const title = await this.openAIClient.getTitle(transcription);
    const description =
      await this.openAIClient.getShortDescription(transcription);
    const instructions = await this.openAIClient.getInstructions(transcription);
    return {
      title: title,
      description: description,
      instructions: instructions,
    };
  }
}
