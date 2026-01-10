import { Controller, Post, UploadedFile, UseInterceptors, Get, Res, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync, createReadStream, statSync } from 'fs';
import { join } from 'path';

@Controller('video')
export class VideoController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads';
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        cb(null, 'latest.mp4');
      },
    }),
  }))
  uploadVideo(@UploadedFile() file) {
    console.log('Video received and saved!');
    return { status: 'success' };
  }

  @Get('stream')
  async streamVideo(@Req() req, @Res() res) {
    const path = join(process.cwd(), 'uploads/latest.mp4');
    if (!existsSync(path)) return res.status(404).send('No video yet');

    const stat = statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = createReadStream(path, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      });
      file.pipe(res);
    } else {
      res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' });
      createReadStream(path).pipe(res);
    }
  }
}