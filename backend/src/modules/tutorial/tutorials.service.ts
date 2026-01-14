import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Tutorial, TutorialDocument } from './schemas/tutorial.schema';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TutorialsService {
  private readonly bucket: GridFSBucket;

  constructor(
    @InjectModel(Tutorial.name)
    private readonly tutorialModel: Model<TutorialDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {
    // Uses the same MongoDB database as your Mongoose connection
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'tutorialVideos',
    });
  }

  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid tutorial id');
    }

    const tutorial = await this.tutorialModel.findById(id).lean();
    if (!tutorial) throw new NotFoundException('Tutorial not found');

    return {
      id: tutorial._id.toString(),
      videoGridFsFileId: tutorial.videoGridFsFileId.toString(),
      processingStatus: tutorial.processingStatus,
      createdAt: tutorial.createdAt,
      updatedAt: tutorial.updatedAt,
    };
  }

  async createFromVideoUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Missing video file');
    }
    if (!file.buffer?.length) {
      throw new BadRequestException('Empty video file');
    }

    if (!file.originalname)
      throw new BadRequestException('Missing original filename');

    const originalExtension = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
    );

    if (originalExtension !== '.mp4') {
      throw new BadRequestException('Only .mp4 files are supported');
    }

    const uniqueFilename = `tutorial-${uuidv4()}${originalExtension}`;

    // Upload into GridFS
    const gridFsFileId = await this.uploadBufferToGridFS({
      buffer: file.buffer,
      filename: uniqueFilename,
      contentType: file.mimetype || 'application/octet-stream',
    });

    // Create tutorial doc linked to the GridFS file
    const created = await this.tutorialModel.create({
      videoGridFsFileId: gridFsFileId,
      videoFileName: uniqueFilename,
      processingStatus: 'uploaded',
    });

    return {
      tutorialId: created.id,
      tutorialIdPrivate: created._id.toString(),
      videoFileName: created.videoFileName,
      videoFileId: gridFsFileId.toString(),
    };
  }

  private uploadBufferToGridFS(params: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  }): Promise<Types.ObjectId> {
    const { buffer, filename, contentType } = params;

    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, {
        metadata: {
          contentType,
          // you can add more metadata later (userId, source, etc)
          uploadedAt: new Date().toISOString(),
        },
      });

      uploadStream.on('error', (err) => reject(err));
      uploadStream.on('finish', () =>
        resolve(uploadStream.id as Types.ObjectId),
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
