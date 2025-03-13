import {
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from '../dtos/signin.dto';
import { UsersService } from 'src/users/providers/users.service';
import { HashingProvider } from './hashing.provider';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class SignInProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly hashingProvider: HashingProvider,

    private readonly generateTokensProvider:  GenerateTokensProvider
  ) {}

  public async signIn(signInDto: SignInDto) {
    let user = undefined;

    // Find User using email
    user = await this.usersService.findOneByEmail(signInDto.email);

    // Compare password to the hash in table
    let isEqual: boolean = false;

    try {
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare passwords',
      });
    }

    // Send confirmation
    if (!isEqual) {
      throw new UnauthorizedException('Incorrect password');
    }

    const {accessToken, refreshToken} = await this.generateTokensProvider.generateTokens(user)

    return {
      accessToken,
      refreshToken
    };
  }
}
