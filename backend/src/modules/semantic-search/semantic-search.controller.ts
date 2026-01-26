import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SemanticSearchService } from './services/semantic-search.service';
import { TutorialsService } from '../tutorial/services/tutorials.service';
import { Tutorial } from '../tutorial/schemas/tutorial.schema';
import { FileInterceptor } from '@nestjs/platform-express';

interface ISemanticSearchHit {
  fileId: string;
  filename: string;
  score: number;
  tutorial: Tutorial;
}

@Controller('semantic-search')
export class SemanticSearchController {
  constructor(
    private semanticSearchService: SemanticSearchService,
    private tutorialsService: TutorialsService,
  ) {}

  @Get('tutorials')
  async searchTutorials(
    @Query('intent') intent: string,
    @Query('top_k') topK: string,
  ): Promise<ISemanticSearchHit[]> {
    console.log(
      `Receive search tutorials request with intent=${intent} and max_num_results=${topK}`,
    );

    if (typeof intent !== 'string' || intent.trim() === '') {
      throw new BadRequestException(
        'Query parameter "intent" is required and must be a non-empty string.',
      );
    }

    if (
      typeof topK !== 'undefined' &&
      typeof topK !== 'number' &&
      typeof topK === 'string' &&
      isNaN(Number(topK))
    ) {
      throw new BadRequestException(
        `Query parameter "top_k" must be either a number or undefined. Received: ${topK} of type ${typeof topK}`,
      );
    }

    const topKParsed: number | undefined =
      typeof topK === 'undefined' ? undefined : Number(topK);

    console.log('Calling semantic search service...');
    const { files: vectorStoreFiles } =
      await this.semanticSearchService.searchInVectorStore({
        intent,
        topK: topKParsed,
      });
    console.log(
      'Received files from semantic search service:',
      vectorStoreFiles,
    );
    const vectorStoreFileIds: string[] = vectorStoreFiles.map(
      (file) => file.fileId,
    );

    console.log('Fetching tutorials by file ids:', vectorStoreFileIds);
    const tutorials =
      await this.tutorialsService.getManyByVectorStoreFileIds(
        vectorStoreFileIds,
      );
    console.log('Received tutorials from tutorial service:', tutorials);

    if (tutorials.length === 0) {
      return [];
    }

    // enhance with relevance score (sorted)
    const enhancedTutorials: ISemanticSearchHit[] = vectorStoreFiles.flatMap(
      (vectorStoreFile) => {
        {
          const { fileId, filename, score } = vectorStoreFile;
          const tutorial = tutorials.find(
            (tut) => tut.vectorStoreFileId === vectorStoreFile.fileId,
          );

          if (!tutorial) {
            console.warn(
              `Tutorial with filename ${filename} not found in database.`,
            );
            return [];
          }

          return {
            fileId,
            filename,
            score,
            tutorial,
          };
        }
      },
    );
    console.log('Enhanced tutorials:', enhancedTutorials);

    return enhancedTutorials;
  }

  // Test only endpoint
  // TODO: Remove before delivery
  @Post('tutorial-transcript')
  @UseInterceptors(FileInterceptor('transcriptFile'))
  async storeTutorialTranscriptIntoVectorStore(
    @UploadedFile() transcriptFile: Express.Multer.File,
  ): Promise<void> {
    console.log(
      `Received request to store tutorial transcript in vector store for file: ${transcriptFile}`,
    );

    if (!transcriptFile) {
      throw new BadRequestException(
        'Request must contain a file field named "transcriptFile".',
      );
    }

    // Validate transcript file is a file
    if (!transcriptFile.buffer || !Buffer.isBuffer(transcriptFile.buffer)) {
      throw new BadRequestException(
        `"transcriptFile" must include a file buffer (memory storage). Received: ${transcriptFile}`,
      );
    }

    try {
      const bytes = new Uint8Array(transcriptFile.buffer);
      const file = new File([bytes], transcriptFile.originalname, {
        type: transcriptFile.mimetype,
      });

      console.log('Created File object from uploaded transcript file:', file);

      const storeResponse =
        await this.semanticSearchService.storeFileInVectorStore({
          file,
        });
      console.log(
        'Successfully stored tutorial transcript in vector store:',
        storeResponse,
      );
      return;
    } catch (error) {
      console.error(
        'Error storing tutorial transcript in vector store:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to store tutorial transcript in vector store.',
      );
    }
  }
}
