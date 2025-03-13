import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './providers/posts.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dtos/create-post.dto';
import { PatchPostDto } from './dtos/patch-post.dto';
import { GetPostsDto } from './dtos/get-posts.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    /**
     * Injecting PostService
     */
    private readonly postsService: PostsService,
  ) {}

  @Get('/:userId?')
  public getPosts(
    @Param('userId') userId: string,
    @Query() postQuery: GetPostsDto,
  ) {
    console.log(postQuery);
    return this.postsService.findAll(userId, postQuery);
  }

  @ApiResponse({
    status: 201,
    description: 'You get a 201 response if your post is created successfully.',
  })
  @ApiOperation({
    summary: 'Creates a new blogpost',
  })
  @Post()
  public createPost(
    @Body() createPostDto: CreatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.create(createPostDto, user);
  }

  @ApiResponse({
    status: 200,
    description: 'A 200 response if the post is updated successfully.',
  })
  @ApiOperation({
    summary: 'Updates an existing blogpost.',
  })
  @Patch()
  public updatePost(@Body() patchPostDto: PatchPostDto) {
    return this.postsService.update(patchPostDto);
  }

  @Delete()
  public deletePost(@Query('id', ParseIntPipe) id: number) {
    return this.postsService.delete(id);
  }
}
