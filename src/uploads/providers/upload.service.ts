import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UploadToAwsProvider } from './upload-to-aws.provider';
import { Repository } from 'typeorm';
import { Upload } from '../upload.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UploadFile } from '../interfaces/upload-file.interface';
import { fileTypes } from '../enums/file-types.enum';

@Injectable()
export class UploadService {
  constructor(
    private readonly uploadToAwsProvider: UploadToAwsProvider,

    private readonly configService: ConfigService,

    @InjectRepository(Upload)
    private readonly uploadsRepository: Repository<Upload>,
  ) {}

  public async uploadFile(file: Express.Multer.File) {
    try {
      // throw error for unsupported MIME types
      if (
        !['image/gif', 'image/jpeg', 'image/jpg', 'image/png'].includes(
          file.mimetype,
        )
      ) {
        throw new BadRequestException('Mime type not supported');
      }

      // Upload the file to AWS S3 Bucket
      const name = await this.uploadToAwsProvider.fileUpload(file);

      // Generate a new entry in database
      const uploadFile: UploadFile = {
        name: name,
        path: `https://${this.configService.get('appConfig.awsCloudfrontURL')}/${name}`,
        type: fileTypes.IMAGE,
        mime: file.mimetype,
        size: file.size,
      };

      const upload = this.uploadsRepository.create(uploadFile);
      return await this.uploadsRepository.save(upload);
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
