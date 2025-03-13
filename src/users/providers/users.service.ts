import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { GetUsersParamDto } from '../dtos/get-users-param.dto';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ConfigType } from '@nestjs/config';
import profileConfig from '../config/profile.config';
import { UsersCreateManyProvider } from './users-create-many.provider';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { CreateUserProvider } from './create-user.provider';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';
import { FindOneByGoogleIdProvider } from './find-one-by-google-id.provider';
import { CreateGoogleUserProvider } from './create-google-user.provider';
import { GoogleUser } from '../interfaces/google-user.interface';

/**
 * Class to connect to Users table and perform business operations.
 * @class
 */
@Injectable()
export class UsersService {
  constructor(
    /**
     * Injecting  usersRepository
     */
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: ConfigType<typeof profileConfig>,

    private readonly createUserProvider: CreateUserProvider,

    private readonly usersCreateManyProvider: UsersCreateManyProvider,

    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,

    private readonly findOnByGoogleIdProvider: FindOneByGoogleIdProvider,

    private readonly createGoogleUserProvider: CreateGoogleUserProvider,
  ) {}

  public async createUser(createUserDto: CreateUserDto) {
    return this.createUserProvider.createUser(createUserDto);
  }

  /**
   * The method to get all the Users from the database.
   * @param getUserParamDto
   * @param limit
   * @param page
   * @returns
   */
  public findAll(
    getUserParamDto: GetUsersParamDto,
    limit: number,
    page: number,
  ) {
    throw new HttpException(
      {
        status: HttpStatus.MOVED_PERMANENTLY,
        error: 'The API endpoint does not exist',
        filename: 'users.service.ts',
        lineNumber: 88,
      },
      HttpStatus.MOVED_PERMANENTLY,
      {
        description: 'Occured because the API endpoint was permanently moved.',
        cause: new Error(),
      },
    );
  }

  /**
   * Finding a single User by the ID of the User
   * @param id
   * @returns
   */
  public async findOneById(id: number) {
    let user = undefined;

    try {
      user = await this.usersRepository.findOneBy({ id: id });
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, Please try again later',
        {
          description: 'Error connecting to the database',
        },
      );
    }

    // Handle exception when user doesn't exist.
    if (!user) {
      throw new BadRequestException('The user id does not exist');
    }

    return user;
  }

  public async findOneByEmail(email: string) {
    return await this.findOneUserByEmailProvider.findOneByEmail(email);
  }

  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    return await this.usersCreateManyProvider.createMany(createManyUsersDto);
  }

  public async findOnByGoogleId(googleId: string) {
    return await this.findOnByGoogleIdProvider.findOneByGoogleId(googleId);
  }

  public async createGoogleUser(googleUser: GoogleUser) {
    return await this.createGoogleUserProvider.createGoogleUser(googleUser);
  }
}
