// tutorials.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response, Request } from 'express';
import { TutorialsService } from './services/tutorials.service';
import { TutorialsVideoService } from './services/tutorials-video.service';
import { CreateTutorialResponseDto } from './dtos/create-tutorial.response';

@Controller('tutorials')
export class TutorialsController {
  constructor(
    private readonly tutorialsService: TutorialsService,
    private readonly tutorialsVideoService: TutorialsVideoService,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.tutorialsService.getById(id);
  }

  @Get(':id/video')
  async downloadVideoFile(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    console.log(`Received request to download video for tutorial id: ${id}`);

    const response = await this.tutorialsVideoService.downloadTutorialVideoFile(
      {
        tutorialId: id,
        res,
      },
    );

    console.log(`Completed video download request for tutorial id: ${id}`);
    return response;
  }

  /**
   * Stream a tutorial video from GridFS (supports Range requests).
   * GET /tutorials/:id/video
   */
  @Get(':id/video/stream')
  async streamVideo(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    console.log(`Received request to stream video for tutorial id: ${id}`);

    const response = await this.tutorialsVideoService.streamTutorialVideo({
      tutorialId: id,
      req,
      res,
    });

    console.log(`Completed video stream request for tutorial id: ${id}`);
    return response;
  }

  /**
   * Upload a video as multipart/form-data:
   * - field name: "file"
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB (adjust as needed)
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CreateTutorialResponseDto> {
    console.log(`Processing incoming request at ${new Date().toISOString()}`);
    console.log(`Received file: ${file?.originalname}, size: ${file?.size}`);
    return this.tutorialsService.createFromVideoUpload(file);
  }
    @Post('stt')
  @UseInterceptors(FileInterceptor('file'))
  async speechToText(@UploadedFile() file: Express.Multer.File) {
    console.log('Received audio for STT');
    const text = await this.tutorialsService.transcribeAudio(file.buffer);
    return { text };
  }
}
