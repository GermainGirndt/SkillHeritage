import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Tutorial, TutorialDocument } from '../schemas/tutorial.schema';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { OpenAIClient } from '../../../shared/providers/openai.client';
import { fileTypeFromBuffer } from 'file-type';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import { spawn } from 'child_process';

interface IFindAllParams {
  limit?: number;
}

@Injectable()
export class TutorialsService {
  private readonly bucket: GridFSBucket;

  constructor(
    @InjectModel(Tutorial.name)
    private readonly tutorialModel: Model<TutorialDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly openAiClient: OpenAIClient,
  ) {
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'tutorialVideos',
    });
  }

  async getById(id: string): Promise<Tutorial> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid tutorial id');
    }
    const tutorial = await this.tutorialModel.findById(id).lean();
    if (!tutorial) throw new NotFoundException('Tutorial not found');
    return tutorial;
  }

  async getManyByIds(ids: string[]): Promise<Tutorial[]> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    const objectIds = validIds.map((id) => new Types.ObjectId(id));

    const tutorials = await this.tutorialModel
      .find({ _id: { $in: objectIds } })
      .lean();

    return tutorials;
  }

  async getManyByVectorStoreFileIds(
    vectorStoreFileIds: string[],
  ): Promise<Tutorial[]> {
    if (vectorStoreFileIds.length === 0) {
      return [];
    }

    if (
      vectorStoreFileIds.some(
        (id) => typeof id !== 'string' || id.trim() === '',
      )
    ) {
      throw new BadRequestException(
        'All file IDs must be non-empty strings in getManyByVectorStoreFileIds',
      );
    }

    const tutorials = await this.tutorialModel
      .find({ vectorStoreFileId: { $in: vectorStoreFileIds } })
      .lean();

    return tutorials;
  }

  async findAll({ limit = 0 }: IFindAllParams = {}): Promise<Tutorial[]> {
    return this.tutorialModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async transcribeAudio(buffer: Buffer): Promise<string> {
    return this.openAiClient.transcribe(buffer);
  }

  /**
   * Upload → transcode to MP4(H.264/AAC)+faststart → store as video/mp4
   */
  async createFromVideoUpload(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Missing video file');
    if (!file.buffer?.length) throw new BadRequestException('Empty video file');

    const originalName = (file.originalname || 'video').trim();

    // Protect DB
    const MAX_BYTES = 250 * 1024 * 1024; // 250MB (adjust)
    if (file.size && file.size > MAX_BYTES) {
      throw new BadRequestException(
        `Video too large (${file.size} bytes). Max allowed is ${MAX_BYTES} bytes.`,
      );
    }

    // Sniff container (helps sanity-check inputs; we still transcode anyway)
    const detected = await fileTypeFromBuffer(file.buffer);
    const detectedMime = (detected?.mime || '').toLowerCase();

    // Allow more inputs, since we transcode.
    if (detectedMime && !detectedMime.startsWith('video/')) {
      throw new BadRequestException(
        `Unsupported upload type (detected "${detectedMime}"). Please upload a video file.`,
      );
    }

    // 1) Standardize to MP4(H.264/AAC)+faststart
    let mp4Buffer: Buffer;
    try {
      mp4Buffer = await this.transcodeToMp4Faststart(file.buffer);
    } catch (error) {
      console.error(`Video transcoding failed: ${error}`);
      throw error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
        ? error
        : new InternalServerErrorException('Video transcoding failed');
    }

    // 2) Stable filename: always mp4 now
    const uniqueFilename = `tutorial-${uuidv4()}.mp4`;
    const contentTypeToStore = 'video/mp4';

    // 3) Store in GridFS (contentType set on the file doc!)
    let gridFsFileId: Types.ObjectId;
    try {
      gridFsFileId = await this.uploadBufferToGridFS({
        buffer: mp4Buffer,
        filename: uniqueFilename,
        contentType: contentTypeToStore,
        metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
          clientMimeType: (file.mimetype || '').toLowerCase(),
          detectedMime,
          standardized: true,
          videoCodecTarget: 'h264',
          audioCodecTarget: 'aac',
          faststart: true,
        },
      });
    } catch (error) {
      console.error(`Failed to upload video to GridFS: ${error}`);
      throw new InternalServerErrorException('Failed to store video file');
    }

    // 4) Create tutorial doc linked to GridFS file
    let created: TutorialDocument;
    try {
      created = await this.tutorialModel.create({
        videoGridFsFileId: gridFsFileId,
        videoFileName: uniqueFilename,
        videoOriginalFileName: originalName,
        videoMimeType: contentTypeToStore,
        processingStatus: 'uploaded',
      });
    } catch (error) {
      console.error(`Failed to create tutorial document: ${error}`);
      throw new InternalServerErrorException(
        'Failed to create tutorial document',
      );
    }

    return {
      tutorialId: created.id,
      tutorialIdPrivate: created._id.toString(),
      videoFileName: created.videoFileName,
      videoFileId: gridFsFileId.toString(),
      videoMimeType: contentTypeToStore,
    };
  }

  private uploadBufferToGridFS(params: {
    buffer: Buffer;
    filename: string;
    contentType: string;
    metadata?: Record<string, any>;
  }): Promise<Types.ObjectId> {
    const { buffer, filename, contentType, metadata = {} } = params;

    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, {
        metadata: {
          ...metadata,
          contentType,
          filename,
        },
      });

      uploadStream.on('error', reject);
      uploadStream.on('finish', () =>
        resolve(uploadStream.id as unknown as Types.ObjectId),
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  /**
   * Transcodes ANY input video buffer → MP4 (H.264/AAC) with moov atom front-loaded.
   *
   * Notes:
   * - Uses temp files because `-movflags +faststart` needs seekable output.
   * - Requires ffmpeg available at runtime.
   */
  private async transcodeToMp4Faststart(input: Buffer): Promise<Buffer> {
    const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'tutorial-'));
    const inPath = path.join(tmpDir, `in-${uuidv4()}`);
    const outPath = path.join(tmpDir, `out-${uuidv4()}.mp4`);

    try {
      await fsp.writeFile(inPath, input);

      const ffmpeg = 'ffmpeg';

      const args = [
        '-y',
        '-i',
        inPath,

        // Video: H.264 for best cross-device support
        '-c:v',
        'libx264',
        '-profile:v',
        'main',
        '-pix_fmt',
        'yuv420p',

        // Good baseline for mobile/web; adjust if you want smaller files
        '-preset',
        'veryfast',
        '-crf',
        '23',

        // Audio: AAC
        '-c:a',
        'aac',
        '-b:a',
        '128k',

        // Make MP4 start fast (moov atom at front)
        '-movflags',
        '+faststart',

        // Optional: if you want to avoid weirdness when audio is missing, etc.
        // '-map', '0:v:0?',
        // '-map', '0:a:0?',

        outPath,
      ];

      const proc = spawn(ffmpeg, args, { stdio: ['ignore', 'pipe', 'pipe'] });

      let stderr = '';
      proc.stderr.on('data', (d) => (stderr += d.toString()));

      const exitCode: number = await new Promise((resolve, reject) => {
        proc.on('error', reject);
        proc.on('close', resolve);
      });

      if (exitCode !== 0) {
        throw new InternalServerErrorException(
          `ffmpeg failed (code ${exitCode}). ${stderr.slice(-2000)}`,
        );
      }

      const out = await fsp.readFile(outPath);
      if (!out?.length) {
        throw new InternalServerErrorException(
          'Transcoding produced empty output',
        );
      }
      return out;
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
      if (e instanceof InternalServerErrorException) throw e;
      throw new InternalServerErrorException(
        e?.message || 'Failed to transcode video',
      );
    } finally {
      // cleanup best-effort
      try {
        await fsp.rm(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  }

  /**
   * Used by Range streaming: get GridFS file doc (length, contentType, filename)
   */
  async getGridFsFileInfo(fileId: Types.ObjectId) {
    const _id = new ObjectId(fileId.toHexString());
    const files = await this.bucket.find({ _id }).limit(1).toArray();
    if (!files.length)
      throw new NotFoundException('Video file not found in GridFS');
    return files[0]; // has length, contentType, filename, metadata...
  }

  /**
   * Full stream (no Range)
   */
  pipeGridFsToResponse(fileId: Types.ObjectId, res: NodeJS.WritableStream) {
    const _id = new ObjectId(fileId.toHexString());
    return this.bucket.openDownloadStream(_id).pipe(res);
  }

  /**
   * Range stream (start..end inclusive)
   * GridFS expects `end` as exclusive.
   */
  pipeGridFsRangeToResponse(
    fileId: Types.ObjectId,
    start: number,
    endInclusive: number,
    res: NodeJS.WritableStream,
  ) {
    const _id = new ObjectId(fileId.toHexString());
    return this.bucket
      .openDownloadStream(_id, { start, end: endInclusive + 1 })
      .pipe(res);
  }
}
