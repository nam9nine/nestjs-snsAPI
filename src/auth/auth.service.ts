import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { registerDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import {
  ENV_HASH_ROUNDS_KEY,
  ENV_JWT_SECRET_KEY,
} from 'src/common/const/env-keys.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly JwtService: JwtService,
    private readonly UsersService: UsersService,
    private readonly ConfigService: ConfigService,
  ) {}

  //accessToken, refreshToken 발급
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      sub: user.id,
      email: user.email,
      type: isRefreshToken ? 'refresh' : 'access',
    };
    return this.JwtService.sign(payload, {
      secret: this.ConfigService.get<string>(ENV_JWT_SECRET_KEY),
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  vertifyToken(token: string) {
    try {
      const payload = this.JwtService.verify(token, {
        secret: this.ConfigService.get<string>(ENV_JWT_SECRET_KEY),
      });
      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료되었습니다');
      }
      return error;
    }
  }
  //login 할 때 필요한 함수
  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.UsersService.getUsersWithEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('사용자가 존재하지 않습니다');
    }
    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀 번호가 일치하지 않습니다');
    }
    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(existingUser);
  }

  async registerWithEmail(user: registerDto) {
    const hash = await bcrypt.hash(
      user.password,
      parseInt(this.ConfigService.get<string>(ENV_HASH_ROUNDS_KEY)),
    );

    const createUser = await this.UsersService.createUser({
      ...user,
      password: hash,
    });
    return this.loginUser(createUser);
  }
  extractTokenFromHeader(header: string, isBasicToken: boolean) {
    // asl;dkfjsaasd <- basic token
    const splitToken = header.split(' ');
    const prefix = isBasicToken ? 'Basic' : 'Bearer';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다');
    }
    const token = splitToken[1];

    return token;
  }
  decodeBasicToken(token: string) {
    const decode = Buffer.from(token, 'base64').toString('utf8');
    const split = decode.split(':');
    const email = split[0];
    const password = split[1];

    const object = {
      email,
      password,
    };
    return object;
  }
  rotateToken(token: string, isRefreshToken: boolean) {
    const decode = this.JwtService.verify(token, {
      secret: this.ConfigService.get<string>(ENV_JWT_SECRET_KEY),
    }); //payload

    if (decode.type !== 'refresh') {
      throw new UnauthorizedException('토큰 재발급은 refresh토큰만 가능합니다');
    }
    const accessToken = this.signToken(
      {
        ...decode,
      },
      isRefreshToken,
    );

    return accessToken;
  }
}
