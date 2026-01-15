import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIClient } from 'src/shared/providers/openai.client';

interface ISemanticSearchTutorialsRequest {
  intent: string;
  maxNumResults?: number;
}

interface ISemanticSearchTutorialsResponse {
  intent: string;
  files: { fileId: string; filename: string; score: number }[];
}
@Injectable()
export class SemanticSearchService {
  constructor(private readonly openAIClient: OpenAIClient) {}

  async semanticSearchTutorials({
    intent,
    maxNumResults,
  }: ISemanticSearchTutorialsRequest): Promise<ISemanticSearchTutorialsResponse> {
    if (!intent || intent.trim() === '') {
      throw new BadRequestException(
        'Parameter "intent" is required and must be a non-empty string.',
      );
    }

    if (maxNumResults !== undefined && isNaN(Number(maxNumResults))) {
      throw new BadRequestException(
        'Parameter "maxNumResults" must be a number.',
      );
    }

    if (!maxNumResults) {
      maxNumResults = 5; // Default to 5 results if not specified
    }

    const response = await this.openAIClient.searchTutorialsVectorStore({
      intent,
      maxNumResults,
    });
    console.log('Received response from vector store search:', response);

    // parse and validate response
    const files = response.data.map((hit) => {
      const { file_id: fileId, filename, score } = hit;

      if (!fileId || !filename || score === undefined) {
        throw new BadRequestException(
          'Received invalid data from vector store search.',
        );
      }

      return { fileId, filename, score };
    });

    return {
      intent,
      files,
    };
  }
}
