import {
  Controller,
  Get,
  Post,
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

interface IEnhancedTutorial {
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
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<IEnhancedTutorial[]> {
    const { intent, max_num_results: maxNumResults } = request.query;
    console.log(
      `Receive search tutorials request with intent=${intent} and max_num_results=${maxNumResults}`,
    );

    if (typeof intent !== 'string' || intent.trim() === '') {
      response.status(400).json({
        error:
          'Query parameter "intent" is required and must be a non-empty string.',
      });
      return;
    }

    if (
      typeof maxNumResults !== 'undefined' &&
      typeof maxNumResults !== 'number' &&
      typeof maxNumResults === 'string' &&
      isNaN(Number(maxNumResults))
    ) {
      response.status(400).json({
        error: `Query parameter "max_num_results" must be either a number or undefined. Received: ${maxNumResults} of type ${typeof maxNumResults}`,
      });
      return;
    }

    const maxNumResultsParsed: number | undefined =
      typeof maxNumResults === 'undefined' ? undefined : Number(maxNumResults);

    console.log('Calling semantic search service...');
    const { files: vectorStoreFiles } =
      await this.semanticSearchService.searchInVectorStore({
        intent,
        maxNumResults: maxNumResultsParsed,
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
    const enhancedTutorials: IEnhancedTutorial[] = vectorStoreFiles.flatMap(
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
    @Res() response: Response,
  ): Promise<void> {
    console.log(
      `Received request to store tutorial transcript in vector store for file: ${transcriptFile}`,
    );

    if (!transcriptFile) {
      response.status(400).json({
        error: 'Request must contain a file field named "transcriptFile".',
      });
      return;
    }

    // Validate transcript file is a file
    if (!transcriptFile.buffer || !Buffer.isBuffer(transcriptFile.buffer)) {
      response.status(400).json({
        error: `"transcriptFile" must include a file buffer (memory storage).`,
        got: transcriptFile,
      });
      return;
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
      response.status(200).json(storeResponse);
    } catch (error) {
      console.error(
        'Error storing tutorial transcript in vector store:',
        error,
      );
      response.status(500).json({
        error: 'Failed to store tutorial transcript in vector store.',
      });
    }
  }
}
