import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoController } from './controllers/video.controller';
import { InstructionsController } from './controllers/instructions.controller';
import { TranscriptionController } from './controllers/transcription.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, VideoController, TranscriptionController, InstructionsController],
  providers: [AppService],
})
export class AppModule { }
