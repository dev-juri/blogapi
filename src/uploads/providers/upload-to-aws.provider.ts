import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadToAwsProvider {
  constructor(private readonly configService: ConfigService) {}

  public async fileUpload(file: Express.Multer.File) {
    try {
      const s3 = new S3({
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
        region: this.configService.get('AWS_REGION'),
      });

      const uploadResult = await s3
        .upload({
          Bucket: this.configService.get('appConfig.awsBucketName'),
          Body: file.buffer,
          Key: this.generateFileName(file),
          ContentType: file.mimetype
        })
        .promise();

      return uploadResult.Key;
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }

  private generateFileName(file: Express.Multer.File) {
    // Extract file name from the file
    let name = file.originalname.split('.')[0];

    // Remove whitespaces in file name
    name.replace(/\s/g, '').trim();

    // Extract the extension of the file
    let extension = path.extname(file.originalname);

    // Generate a timestamp and append file name to the timestamp
    let timestamp = new Date().getTime().toString().trim();

    // Return the file uuid
    return `${name}-${timestamp}-${uuidv4()}${extension}`;
  }
}
