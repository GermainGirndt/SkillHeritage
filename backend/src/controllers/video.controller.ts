import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream, statSync, existsSync } from 'fs';
import { join } from 'path';

@Controller('video')
export class VideoController {

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          cb(null, 'latest.mp4');
        },
      }),
    }),
  )
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return { ok: true };
  }

  @Get('stream')
  streamVideo(@Req() req, @Res() res) {
    const videoPath = join(process.cwd(), 'uploads', 'latest.mp4');

    if (!existsSync(videoPath)) {
      return res.status(404).send('No video uploaded');
    }

    const videoSize = statSync(videoPath).size;
    const range = req.headers.range;

    if (!range) {
      res.status(400).send('Requires Range header');
      return;
    }

    const CHUNK_SIZE = 1 * 10 ** 6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'video/mp4',
    });

    createReadStream(videoPath, { start, end }).pipe(res);
  }
}
