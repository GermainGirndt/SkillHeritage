import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SemanticSearchService } from './services/semantic-search.service';
import { Tutorial, TutorialSchema } from '../tutorial/schemas/tutorial.schema';
import { OpenAIClient } from 'src/shared/providers/openai.client';
import { TutorialsService } from '../tutorial/services/tutorials.service';
import { SemanticSearchController } from './semantic-search.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tutorial.name, schema: TutorialSchema },
    ]),
  ],
  controllers: [SemanticSearchController],
  providers: [OpenAIClient, TutorialsService, SemanticSearchService],
  exports: [SemanticSearchService],
})
export class SemanticSearchModule {}
