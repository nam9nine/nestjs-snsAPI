import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  MaxLengthPassword,
  MinLengthPassword,
  PasswordLenth,
} from './pipe/password.pipe';
import { BasicGuard } from './guard/basic-token.guard';
import { BearerGuard, RefreshTokenGuard } from './guard/bearer-token-guard';
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

  /**
   * accessToken이 완료 됐을 때
   * {authorization : Bearer {token}}
   * 1. refreshToken으로 accessToken을 다시 재발급 받아야함
   * 2. refreshToken을 서버에게 보내면 서버가 access토큰을 다시 재발급 해준다
   *
   * 로직
   * 1. accessToken이 만료됐다는 걸 인지한다
   * 2. headers에 {authorization : Bearer {refreshToken}}을 담아 요청한다
   * 3. extractTokenFromHeader함수에 headers에서 가져온 데이터를 넣어 refreshToken을 발췌한다
   * 4. refreshToken에서 payload부분을 추출해서 access토큰을 만드는 함수에 넣는다
   * 5. access토큰이 생성됨
   *
   */
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
