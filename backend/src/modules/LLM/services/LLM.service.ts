import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpenAIClient } from 'src/shared/providers/openai.client';
import { Connection, Model, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  Tutorial,
  TutorialDocument,
} from 'src/modules/tutorial/schemas/tutorial.schema';
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
    // TODO: Katharina: do we need the tutorialModel?
    @InjectModel(Tutorial.name)
    private readonly tutorialModel: Model<TutorialDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly openAIClient: OpenAIClient,
  ) {
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'tutorialVideos',
    });
  }

  // TODO: Katharina: is there a better naming? Maybe something like "generateTutorialContentFromTranscription"?
  // TODO: Katharina: validate transcription input? E.g. check if it's not empty, not too long, etc.?
  async getLLMResponse(transcription): Promise<LLMResponse> {
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
