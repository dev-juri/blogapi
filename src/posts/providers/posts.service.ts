import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from '../dtos/create-post.dto';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';
import { postStatus } from '../enums/postStatus.enum';
import { GetPostsDto } from '../dtos/get-posts.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { CreatePostProvider } from './create-post.provider';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Injectable()
export class PostsService {
  constructor(
    /**
     * Injecting Users Service
     */
    private readonly usersService: UsersService,

    private readonly paginationProvide: PaginationProvider,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(MetaOption)
    private readonly metaOptionsRepository: Repository<MetaOption>,

    private readonly tagsService: TagsService,

    private readonly createPostProvider: CreatePostProvider
  ) {}

  /**
   * Creating new posts
   */
  public async create(createPostDto: CreatePostDto, user: ActiveUserData) {

    return await this.createPostProvider.create(createPostDto, user)
  }

  public async findAll(
    userId: string,
    postQuery: GetPostsDto,
  ): Promise<Paginated<Post>> {
    /**let posts = await this.postRepository.find({
      relations: {
        metaOptions: true
      }
    });
    * OR SET eager: true in post entity and call as below
    */
    // let posts = await this.postRepository.find({
    //   relations: {
    //     author: true,
    //     tags: true,
    //   },
    //   skip: (postQuery.page - 1) * postQuery.limit,
    //   take: postQuery.limit,
    // });

    let posts = this.paginationProvide.paginateQuery(
      {
        limit: postQuery.limit,
        page: postQuery.page,
      },
      this.postRepository,
      {
        author: true,
        tags: true,
      },
    );

    return posts;
  }

  public async delete(id: number) {
    await this.postRepository.delete(id);

    return {
      deleted: true,
      id: id,
    };
  }

  public async update(patchPostDto: PatchPostDto) {
    let tags = undefined;
    let post = undefined;

    try {
      tags = await this.tagsService.findMultipleTags(patchPostDto.tags);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, Please try again later',
      );
    }

    /**
     * Number of tags need to be equal
     * */
    if (!tags || tags.length != patchPostDto.tags.length) {
      throw new BadRequestException(
        'Please, check your tag Ids and ensure they are correct.',
      );
    }

    // Find the post
    try {
      post = await this.postRepository.findOneBy({ id: patchPostDto.id });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, Please try again later',
      );
    }

    if (!post) {
      throw new BadRequestException('The post does not exist');
    }

    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.slug = patchPostDto.slug ?? post.slug;
    post.featuredImageUrl =
      patchPostDto.featuredImageUrl ?? post.featuredImageUrl;
    post.publishedOn = patchPostDto.publishedOn ?? post.publishedOn;
    post.tags = tags;

    try {
      await this.postRepository.save(post);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, Please try again later',
      );
    }
    return post;
  }
}
