import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TutorialsController } from './tutorials.controller';
import { TutorialsService } from './services/tutorials.service';
import { Tutorial, TutorialSchema } from './schemas/tutorial.schema';
import { TutorialProcessingService } from './jobs/tutorial-processing.service';
import { TutorialProcessingJob } from './jobs/tutorial-processing.job';
import { TutorialsVideoService } from './services/tutorials-video.service';
import { SemanticSearchService } from '../semantic-search/services/semantic-search.service';
import { OpenAIClient } from 'src/shared/providers/openai.client';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tutorial.name, schema: TutorialSchema },
    ]),
  ],
  controllers: [TutorialsController],
  providers: [
    TutorialsService,
    TutorialsVideoService,
    TutorialProcessingService,
    OpenAIClient,
    SemanticSearchService,
    TutorialProcessingJob,
  ],
  exports: [TutorialsService],
})
export class TutorialsModule {}
