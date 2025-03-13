import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadService } from './providers/upload.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadService]
})
export class UploadsModule {}
