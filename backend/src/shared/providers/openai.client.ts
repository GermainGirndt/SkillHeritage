import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TranscriptionSegment } from 'openai/resources/audio/transcriptions';

interface ISearchVectorStoreParams {
  intent: string;
  maxNumResults?: number;
}

interface SearchHit {
  fileId: string;
  filename: string;
  score: number;
}

interface IStoreFileInVectorStoreRequestParams {
  file: File;
}

interface IStoreFileInVectorStoreResponse {
  fileId: string;
  filename: string;
  createdAt: string;
}

interface TranscriptionResponse {
  text: string;
  segments: TranscriptionSegment[];
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




  // for audio transcibing, for voice search
  async transcribe(file): Promise<string> {
    try {
      const response = await this.client.audio.transcriptions.create({
        model: 'whisper-1',
        file: file,
      });

      return response.text;
    } catch (error) {
      console.error('OpenAI Transcription error:', error);
      return '';
    }
  }

  async getTimestamps(file): Promise<TranscriptionResponse> {
    try {
      const response = await this.client.audio.transcriptions.create({
        model: 'whisper-1',
        file: file,
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });

      return { text: response.text, segments: response.segments }
    } catch (error) {
      console.error('OpenAI Transcription error:', error);
      return null;
    }
  }

  async getTitle(transcription): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: "gpt-5",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "This is the text: " + transcription + " Give it a short, catchy title. Return only the title.",
              },
            ],
          },
        ],
      });

      const title = response.output_text;



      return title
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }

  async getShortDescription(transcription): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: "gpt-5",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "This is the text: " + transcription + " Give it a short one sentence description. Return only the description.",
              },
            ],
          },
        ],
      });

      const description = response.output_text;



      return description;
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }



  async getInstructions(transcription): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: "gpt-5",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:"This is the text: " + transcription + " Give back structured, short step by step instructions. Return only the instructions.",
              },
            ],
          },
        ],
      });

      const instructions = response.output_text;



      return instructions
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }


  get sdk(): OpenAI {
    return this.client;
  }

  async searchInVectorStore({
    intent,
    maxNumResults = 5,
  }: ISearchVectorStoreParams): Promise<SearchHit[]> {
    const page = await this.client.vectorStores.search(this.vectorStoreId, {
      query: intent,
      max_num_results: maxNumResults,
    });

    const results: SearchHit[] = [];

    while (results.length < maxNumResults) {
      page.data.forEach((item) => {
        if (results.length >= maxNumResults) {
          return;
        }

        if (!item.file_id) {
          throw new Error(`Item is missing file_id: ${JSON.stringify(item)}`);
        }
        if (!item.filename) {
          throw new Error(`Item is missing filename: ${JSON.stringify(item)}`);
        }
        if (item.score === undefined) {
          throw new Error(`Item is missing score: ${JSON.stringify(item)}`);
        }

        results.push({
          fileId: item.file_id,
          filename: item.filename,
          score: item.score,
        });
      });

      if (!page.hasNextPage()) {
        break;
      }
      await page.getNextPage();
    }

    return results;
  }

  async storeFileInVectorStore({
    file,
  }: IStoreFileInVectorStoreRequestParams): Promise<IStoreFileInVectorStoreResponse> {
    const vectorStoreFile = await this.client.vectorStores.files.uploadAndPoll(
      this.vectorStoreId,
      file,
    );

    const { id: fileId, created_at: createdAt } = vectorStoreFile;

    return {
      fileId,
      filename: file.name,
      createdAt: new Date(createdAt).toISOString(),
    };
  }
}
