import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIClient } from 'src/shared/providers/openai.client';

interface IFindTutorialsRequest {
  intent: string;
  topK?: number;
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
    topK = 5, // Default to 5 results if not specified
  }: IFindTutorialsRequest): Promise<IFindTutorialsResponse> {
    if (!intent || intent.trim() === '') {
      throw new BadRequestException(
        'Parameter "intent" is required and must be a non-empty string.',
      );
    }

    if (topK !== undefined && isNaN(Number(topK))) {
      throw new BadRequestException('Parameter "topKParsed" must be a number.');
    }

    const searchHits = await this.openAIClient.searchInVectorStore({
      intent,
      topK,
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
    console.log(`Storing file named '${file.name}' into vector store:`);
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
