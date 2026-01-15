import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIClient } from 'src/shared/providers/openai.client';

interface IFindTutorialsRequest {
  intent: string;
  maxNumResults?: number;
}

interface IFindTutorialsResponse {
  intent: string;
  files: { fileId: string; filename: string; score: number }[];
}

interface IStoreFileInVectorStoreRequestParams {
  file: File;
}

interface IStoreFileInVectorStoreResponse {
  fileId: string;
  filename: string;
  createdAt: string;
}

@Injectable()
export class SemanticSearchService {
  constructor(private readonly openAIClient: OpenAIClient) {}

  async searchInVectorStore({
    intent,
    maxNumResults,
  }: IFindTutorialsRequest): Promise<IFindTutorialsResponse> {
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

    const searchHits = await this.openAIClient.searchInVectorStore({
      intent,
      maxNumResults,
    });
    console.log('Received response from vector store search:', searchHits);
    // parse and validate response
    const files = searchHits.map((hit) => {
      const { fileId, filename, score } = hit;

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

  public async storeFileInVectorStore({
    file,
  }: IStoreFileInVectorStoreRequestParams): Promise<IStoreFileInVectorStoreResponse> {
    console.log('Storing file in vector store:', file.name);
    console.log('File size (bytes):', file.size);
    console.log(file);

    const storedFileData = await this.openAIClient.storeFileInVectorStore({
      file,
    });
    console.log(
      'Received response from vector store file storage:',
      storedFileData,
    );

    return storedFileData;
  }
}
