import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import { SignInProvider } from './sign-in.provider';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshTokensProvider } from './refresh-tokens.provider';

@Injectable()
export class AuthService {
  constructor(
    /**
     * Injecting UserService
     */
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly signInProvider: SignInProvider,

    private readonly refreshTokensProvider: RefreshTokensProvider
  ) {}
  public async signin(signInDto: SignInDto) {
    return this.signInProvider.signIn(signInDto)
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokensProvider.refreshToken(refreshTokenDto);
  }
}
