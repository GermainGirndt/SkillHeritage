import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TutorialsController } from './tutorials.controller';
import { TutorialsService } from './tutorials.service';
import { Tutorial, TutorialSchema } from './schemas/tutorial.schema';
import { TutorialProcessingService } from './jobs/tutorial-processing.service';
import { TutorialProcessingJob } from './jobs/tutorial-processing.job';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tutorial.name, schema: TutorialSchema },
    ]),
  ],
  controllers: [TutorialsController],
  providers: [
    TutorialsService,
    TutorialProcessingService,
    TutorialProcessingJob,
  ],
  exports: [TutorialsService],
})
export class TutorialsModule {}
