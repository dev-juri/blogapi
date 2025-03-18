import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiHeaders, ApiOperation } from '@nestjs/swagger';
import { Express } from 'express';
import { UploadService } from './providers/upload.service';

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadService: UploadService
  ) {}

  @UseInterceptors(FileInterceptor('file'))
  @ApiHeaders([
    { name: 'Authorization', description: 'Bearer token' },
    {name: 'Content-Type',description: 'multipart/form-data'},
  ])
  @ApiOperation({ summary: 'Upload a new image to the server'})
  @Post('file')
  public async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.uploadFile(file);
  }
}