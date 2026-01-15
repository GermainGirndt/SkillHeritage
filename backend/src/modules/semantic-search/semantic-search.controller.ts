import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { SemanticSearchService } from './services/semantic-search.service';
import { TutorialsService } from '../tutorial/services/tutorials.service';
import { Tutorial } from '../tutorial/schemas/tutorial.schema';

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
    const { files } = await this.semanticSearchService.semanticSearchTutorials({
      intent,
      maxNumResults: maxNumResultsParsed,
    });
    console.log('Received files from semantic search service:', files);

    const fileNames: string[] = files.map((file) => file.filename);

    console.log('Fetching tutorials by file names:', fileNames);
    const tutorials = await this.tutorialsService.getManyByFileNames(fileNames);
    console.log('Received tutorials from tutorial service:', tutorials);

    if (tutorials.length === 0) {
      return [];
    }

    // enhance with relevance score (sorted)
    const enhancedTutorials: IEnhancedTutorial[] = files.map((file) => {
      {
        const { fileId, filename, score } = file;
        const tutorial = tutorials.find(
          (tut) => tut.videoFileName === file.filename,
        );

        if (!tutorial) {
          throw new Error(
            `Tutorial with filename ${filename} not found in database.`,
          );
        }

        return {
          fileId,
          filename,
          score,
          tutorial,
        };
      }
    });
    console.log('Enhanced tutorials:', enhancedTutorials);

    return enhancedTutorials;
  }
}
