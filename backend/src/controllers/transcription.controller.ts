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
import { spawn } from 'child_process';


@Controller('transcription')
export class TranscriptionController {



  @Post()
  @UseInterceptors(FileInterceptor('videoFile'))
  async transcribe(@UploadedFile() videoFile, @Body() body) {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const ffmpegPath = require('ffmpeg-static');
    fs.writeFileSync("./src/assets/temp.mp4", videoFile.buffer);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn(ffmpegPath!, [
        '-y',
        '-loglevel', 'error',
        '-i', "./src/assets/temp.mp4",
        '-vn',
        '-ac', '1',
        '-ar', '16000',
        '-ab', '128k',
        "./src/assets/temp.mp3",
      ]);

      const timeout = setTimeout(() => {
        ffmpeg.kill('SIGKILL');
        reject(new Error('ffmpeg timed out'));
      }, 30_000); // 30s max

      ffmpeg.stderr.on('data', (data) => {
        console.error('ffmpeg stderr:', data.toString());
      });

      ffmpeg.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      ffmpeg.on('close', (code) => {
        clearTimeout(timeout);

        if (code === 0 && fs.existsSync("./src/assets/temp.mp3")) {
          resolve();
        } else {
          reject(new Error(`ffmpeg failed with code ${code}`));
        }
      });
    });
    var transcription;
    if ( body.type== "segment") {
      transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream("./src/assets/temp.mp3"),
        model: 'gpt-4o-transcribe',
        response_format: 'json',
        timestamp_granularities: ['segment'],
      });
    }
    else if (body.type == "word") {
      console.log("word")
      transcription = await client.audio.transcriptions.create({
        file: fs.createReadStream("./src/assets/temp.mp3"),
        model: 'gpt-4o-transcribe',
        response_format: 'json',
        timestamp_granularities: ['word'],
      });
    }
    else {
      transcription =
        await client.audio.transcriptions.create({
          file: fs.createReadStream("./src/assets/temp.mp3"),
          model: 'gpt-4o-transcribe',
        });

    }



    return transcription;

  }

}