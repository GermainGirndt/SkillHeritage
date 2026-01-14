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
interface InstructionsSearchHit {
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

    const { intent, max_num_results } = request.query;

    if (typeof intent !== 'string' || intent.trim() === '') {
      response.status(400).json({
        error:
          'Query parameter "intent" is required and must be a non-empty string.',
      });
      return;
    }

    if (max_num_results && isNaN(Number(max_num_results))) {
      response.status(400).json({
        error: 'Query parameter "max_num_results" must be a number.',
      });
      return;
    }

    // Default to 5 results if not specified
    const maxNumResults: number = max_num_results ? Number(max_num_results) : 5;

    const results = await client.vectorStores.search(vectorStoreId, {
      query: intent,
      max_num_results: maxNumResults,
    });

    console.log(`Search results for query "${intent}":`);
    console.log(results);

    return results;
  }
}
