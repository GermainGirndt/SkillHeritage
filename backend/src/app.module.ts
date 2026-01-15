import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoController } from './controllers/video.controller';
import { InstructionsController } from './controllers/instructions.controller';
import { TranscriptionController } from './controllers/transcription.controller';
import { SemanticSearchController } from './modules/semantic-search/semantic-search.controller';
import { configValidationSchema } from './configValidationSchema';
import { TutorialsModule } from './modules/tutorial/tutorials.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SemanticSearchModule } from './modules/semantic-search/semantic-search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    TutorialsModule,
    SemanticSearchModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    VideoController,
    TranscriptionController,
    InstructionsController,
    SemanticSearchController,
  ],
  providers: [AppService],
})
export class AppModule {}
