import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadService } from './providers/upload.service';
import { UploadToAwsProvider } from './providers/upload-to-aws.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './upload.entity';

@Module({
  controllers: [UploadsController],
  providers: [UploadService, UploadToAwsProvider],
  imports: [TypeOrmModule.forFeature([Upload])],
})
export class UploadsModule {}
