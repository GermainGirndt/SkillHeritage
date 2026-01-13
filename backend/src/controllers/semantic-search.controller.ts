import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  Res,
  Param,
  Body,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';

// /**
//  * A single semantic-search hit. Keep this lightweight for list rendering.
//  * Fetch the full Instructions object separately via an InstructionsRepository.
//  */
// export type InstructionsSearchHit = Pick<
//   Instructions,
//   "id" | "title" | "shortDescription"
// >;

// TODO: Define the interface
// Maybe let the frontend do multiple queries
interface InstructionSearchHit {
  id: string;
  title: string;
  shortDescription: string;
}

@Controller('semantic-search')
export class SemanticSearchController {
  constructor(private configService: ConfigService) {}

  @Get('instructions')
  async search(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const openAIKey = this.configService.get<string>('OPENAI_API_KEY');
    const vectorStoreId = this.configService.get<string>(
      'SKILL_HERITAGE_VECTOR_STORE_ID',
    );
    const client = new OpenAI({ apiKey: openAIKey });

    const intent = request.query.intent;
    if (typeof intent !== 'string' || intent.trim() === '') {
      response.status(400).json({
        error:
          'Query parameter "intent" is required and must be a non-empty string.',
      });
      return;
    }

    const transcription = await client.vectorStores.search(vectorStoreId, {
      query: intent,
      max_num_results: 10,
    });

    return transcription;
  }
}
