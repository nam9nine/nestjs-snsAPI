import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';

import { BasicGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token-guard';
import { registerDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/email')
  registerUser(@Body() body: registerDto) {
    return this.authService.registerWithEmail(body);
  }

  @Post('login/email')
  @UseGuards(BasicGuard)
  loginUser(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const decodeToken = this.authService.decodeBasicToken(token);
    return this.authService.loginWithEmail(decodeToken);
  }
  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const newToken = this.authService.rotateToken(token, false);
    return {
      accessToken: newToken,
    };
  }
  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  /**
   * refresh토큰이 완료 됐을 때
   *
   * 1. refresh토큰 재발급을 서버에게 요청해야됨
   */
}
