import { Controller, Get, Req, Res } from '@nestjs/common';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';

@Controller('video')
export class VideoController {
  @Get('stream')
  streamVideo(@Req() req, @Res() res) {
    console.log(__dirname);
    const videoPath = join(__dirname, '..', 'assets', 'videos', 'sample.mp4');
    const videoSize = statSync(videoPath).size;

    const range = req.headers.range;
    if (!range) {
      res.status(400).send('Requires Range header');
      return;
    }

    const CHUNK_SIZE = 1 * 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    });

    const stream = createReadStream(videoPath, { start, end });
    stream.pipe(res);
  }
}
