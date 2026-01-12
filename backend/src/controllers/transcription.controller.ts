import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  Res,
  Param,
  Body,
} from '@nestjs/common';
import OpenAI from "openai";
import * as fs from 'fs';

@Controller('transcription')
export class TranscriptionController {


  @Post()
  async transcribe() {

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const transcription =
      await client.audio.transcriptions.create({
        file: fs.createReadStream('./src/assets/test.mp3'),
        model: 'gpt-4o-transcribe',
      });

    return transcription
  }
}
