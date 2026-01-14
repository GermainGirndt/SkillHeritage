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
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('transcription')
export class TranscriptionController {


  @Post()
  @UseInterceptors(FileInterceptor('audiofile'))
  async transcribe(@UploadedFile() audiofile) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  fs.writeFileSync("./src/assets/temp.webm", audiofile.buffer);

    const transcription =
      await client.audio.transcriptions.create({
        file: fs.createReadStream("./src/assets/temp.webm"),
        model: 'gpt-4o-transcribe',
      });

    return transcription;
  }


}
