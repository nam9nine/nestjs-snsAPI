import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BearerGuard implements CanActivate {
  constructor(
    private readonly AuthService: AuthService,
    private readonly UserService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rowToken = req.headers['authorization'];

    if (!rowToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }
    const refreshToken = this.AuthService.extractTokenFromHeader(
      rowToken,
      false,
    );

    const { email, type } = this.AuthService.vertifyToken(refreshToken);
    const user = await this.UserService.getUsersWithEmail(email);
    req.user = user;
    req.type = type;
    req.token = refreshToken;

    return true;
  }
}

export class RefreshTokenGuard extends BearerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const req = context.switchToHttp().getRequest();

    if (req.type !== 'refresh') {
      throw new UnauthorizedException('refresh 토큰이 아닙니다');
    }
    return true;
  }
}

export class AccessTokenGuard extends BearerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const req = context.switchToHttp().getRequest();

    if (req.type !== 'access') {
      throw new UnauthorizedException('access토큰이 아닙니다');
    }
    return true;
  }
}
