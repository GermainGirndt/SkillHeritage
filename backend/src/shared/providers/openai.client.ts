import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface ISearchVectorStoreParams {
  intent: string;
  maxNumResults?: number;
}

@Injectable()
export class OpenAIClient {
  private readonly client: OpenAI;
  private readonly vectorStoreId: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    this.vectorStoreId = this.configService.get<string>(
      'SKILL_HERITAGE_TUTORIALS_VECTOR_STORE_ID',
    );

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in configuration.');
    }

    if (!this.vectorStoreId) {
      throw new Error(
        'SKILL_HERITAGE_TUTORIALS_VECTOR_STORE_ID is not defined in configuration.',
      );
    }

    this.client = new OpenAI({ apiKey });
  }

  get sdk(): OpenAI {
    return this.client;
  }

  async searchTutorialsVectorStore({
    intent,
    maxNumResults = 5,
  }: ISearchVectorStoreParams) {
    return this.client.vectorStores.search(this.vectorStoreId, {
      query: intent,
      max_num_results: maxNumResults,
    });
  }
}
