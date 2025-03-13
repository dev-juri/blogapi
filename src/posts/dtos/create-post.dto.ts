import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { postType } from '../enums/postType.enum';
import { postStatus } from '../enums/postStatus.enum';
import { CreatePostMetaOptionsDto } from '../../meta-options/dtos/create-post-meta-options.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(512)
  @ApiProperty({
    description: 'This is the title for the blog post',
    example: 'This is a title',
  })
  title: string;

  @IsEnum(postType)
  @IsNotEmpty()
  @ApiProperty({
    enum: postType,
    description: "Possible values: 'post', 'page', 'story', 'series'",
  })
  postType: postType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @ApiProperty({
    example: 'my-blog-post',
    description: "For Example - 'my-url'",
  })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'A slug should be all small letters and uses only "-" and without spaces. For example "my-slug"',
  })
  slug: string;

  @IsEnum(postStatus)
  @IsNotEmpty()
  @ApiProperty({
    enum: postStatus,
    description:
      "Possible values: 'draft', 'scheduled', 'reviewed','published'",
  })
  status: postStatus;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'This is the content of the post',
    example: 'The post content',
  })
  content?: string;

  @IsJSON()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Serialize your JSON object else a validation error will be thrown.',
    example: '{"xyz": "abc"}',
  })
  schema?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(1024)
  @ApiPropertyOptional({
    description: 'Featured image for your blogpost',
    example: 'https://xyz.com/img.png',
  })
  featuredImageUrl?: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The date on which the blogpost was published',
    example: '2024-09-14T07:46:32+0000',
  })
  publishedOn?: Date;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Array of ids of tags',
    example: [1, 2],
  })
  tags?: number[];

  @ApiPropertyOptional({
    type: 'object',
    required: false,
    items: {
      type: 'object',
      properties: {
        metaValue: {
          type: 'json',
          description: 'The metaValue is a JSON string',
          example: '{"sidebarEnabled": true}',
        },
      },
    },
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePostMetaOptionsDto)
  metaOptions?: CreatePostMetaOptionsDto | null;
}
