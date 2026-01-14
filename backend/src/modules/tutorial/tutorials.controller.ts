import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TutorialsService } from './tutorials.service';
import { CreateTutorialResponseDto } from './dtos/create-tutorial.response';
import { Types } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

@Controller('tutorials')
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.tutorialsService.getById(id);
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
    console.log(`Processing incoming rquest at ${new Date().toISOString()}`);
    console.log(`Received file: ${file?.originalname}, size: ${file?.size}`);
    return this.tutorialsService.createFromVideoUpload(file);
  }
}
