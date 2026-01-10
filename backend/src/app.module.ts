import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoController } from './controllers/video.controller';
import { InstructionsController } from './controllers/instructions.controller';

@Module({
  imports: [],
  controllers: [AppController, VideoController, InstructionsController],
  providers: [AppService],
})
export class AppModule {}
