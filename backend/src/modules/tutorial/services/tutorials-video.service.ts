// tutorials-video.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Response, Request } from 'express';
import { Connection, Model, Types } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Tutorial, TutorialDocument } from './../schemas/tutorial.schema';

@Injectable()
export class TutorialsVideoService {
  private readonly bucket: GridFSBucket;

  constructor(
    @InjectModel(Tutorial.name)
    private readonly tutorialModel: Model<TutorialDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'tutorialVideos',
    });
  }

  async downloadTutorialVideoFile(params: {
    tutorialId: string;
    res: Response;
  }): Promise<void> {
    const { tutorialId, res } = params;

    if (!Types.ObjectId.isValid(tutorialId)) {
      throw new BadRequestException('Invalid tutorial id');
    }

    // Grab both id + filename if you have it (recommended)
    const tutorial = await this.tutorialModel
      .findById(tutorialId, { videoGridFsFileId: 1, videoFileName: 1 })
      .lean();

    if (!tutorial) {
      throw new NotFoundException(`Tutorial with id ${tutorialId} not found`);
    }

    const fileIdRaw = tutorial.videoGridFsFileId;
    const fileIdStr =
      typeof fileIdRaw === 'string' ? fileIdRaw : fileIdRaw?.toString?.();

    if (!fileIdStr || !Types.ObjectId.isValid(fileIdStr)) {
      throw new NotFoundException('Tutorial has no valid video file id');
    }

    const fileId = new Types.ObjectId(fileIdStr);

    const files = await this.bucket.find({ _id: fileId }).toArray();
    if (!files.length) {
      throw new NotFoundException('Video file not found in GridFS');
    }

    const file = files[0] as any;

    const fileSize: number = file.length;
    const contentType: string =
      file.metadata?.contentType || file.contentType || 'video/mp4';

    // Prefer your tutorial doc filename; fallback to GridFS filename
    const downloadName =
      tutorial.videoFileName || file.filename || `tutorial-${tutorialId}.mp4`;

    // Important headers for download
    res.status(200);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(fileSize));

    // Force download (attachment)
    // Use RFC 5987-ish safe encoding for weird chars
    const encoded = encodeURIComponent(downloadName).replace(/%20/g, '+');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${downloadName.replace(/"/g, '')}"; filename*=UTF-8''${encoded}`,
    );

    // Stream from GridFS to client
    const stream = this.bucket.openDownloadStream(fileId);
    stream.on('error', () => res.end());
    stream.pipe(res);
  }

  /**
   * Streams the tutorial video (stored in GridFS) to the response.
   * Supports HTTP Range requests for browser <video> seeking/streaming.
   */
  async streamTutorialVideo(params: {
    tutorialId: string;
    req: Request;
    res: Response;
  }): Promise<void> {
    const { tutorialId, req, res } = params;

    if (!Types.ObjectId.isValid(tutorialId)) {
      throw new BadRequestException('Invalid tutorial id');
    }

    const tutorial = await this.tutorialModel
      .findById(tutorialId, { videoGridFsFileId: 1 })
      .lean();

    if (!tutorial) {
      throw new NotFoundException(`Tutorial with id ${tutorialId} not found`);
    }

    const fileIdRaw = tutorial.videoGridFsFileId;
    const fileIdStr =
      typeof fileIdRaw === 'string' ? fileIdRaw : fileIdRaw?.toString?.();

    if (!fileIdStr || !Types.ObjectId.isValid(fileIdStr)) {
      throw new NotFoundException('Tutorial has no valid video file id');
    }

    const fileId = new Types.ObjectId(fileIdStr);

    // Fetch GridFS file metadata (size, contentType, etc.)
    const files = await this.bucket.find({ _id: fileId }).toArray();
    if (!files.length) {
      throw new NotFoundException('Video file not found in GridFS');
    }

    const file = files[0] as any;
    const fileSize: number = file.length;
    const contentType: string =
      file.metadata?.contentType || file.contentType || 'video/mp4'; // fallback

    const rangeHeader = req.headers.range;

    // Always advertise range support for media players
    res.setHeader('Accept-Ranges', 'bytes');

    // If no Range header, stream the entire file (200)
    if (!rangeHeader) {
      res.status(200);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', String(fileSize));

      this.bucket
        .openDownloadStream(fileId)
        .on('error', () => res.end())
        .pipe(res);

      return;
    }

    // Parse Range: "bytes=start-end"
    const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader);
    if (!match) {
      throw new BadRequestException('Invalid Range header');
    }

    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

    const invalid =
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start < 0 ||
      end < 0 ||
      start >= fileSize ||
      end >= fileSize ||
      start > end;

    if (invalid) {
      // 416 Range Not Satisfiable
      res.status(416);
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      res.end();
      return;
    }

    const chunkSize = end - start + 1;

    // Partial content response (206)
    res.status(206);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(chunkSize));
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);

    // GridFS openDownloadStream options: start is inclusive; end is exclusive
    this.bucket
      .openDownloadStream(fileId, { start, end: end + 1 })
      .on('error', () => res.end())
      .pipe(res);
  }
}
