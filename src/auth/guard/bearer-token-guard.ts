import {
  BadGatewayException,
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorator/is-public.decorator';
import { TokenEnum } from '../const/token-enum.const';

@Injectable()
export class BearerGuard implements CanActivate {
  constructor(
    private readonly AuthService: AuthService,
    private readonly UserService: UsersService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();

    if (isPublic === TokenEnum.ACCESS) {
      req.isPublic = 'access';
      return true;
    } else if (isPublic === TokenEnum.REFRESH) {
      if (req.isPublic !== 'refresh') {
        req.isPublic = 'access';
        return true;
      }
    }

    const rowToken = req.headers['authorization'];

    if (!rowToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }
    const token = this.AuthService.extractTokenFromHeader(rowToken, false);
    const { email, type } = this.AuthService.vertifyToken(token);
    const user = await this.UserService.getUsersWithEmail(email);

    if (!user) {
      throw new BadRequestException('사용자가 없음 - auth-guard');
    }
    req.user = user;
    req.type = type;
    req.token = token;

    return true;
  }
}
@Injectable()
export class RefreshTokenGuard extends BearerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    req.isPublic = 'refresh';

    await super.canActivate(context);

    if (req.isPublic !== 'refresh') {
      return true;
    }
    if (req.type !== 'refresh') {
      throw new UnauthorizedException('refresh 토큰이 아닙니다');
    }

    return true;
  }
}
@Injectable()
export class AccessTokenGuard extends BearerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    req.isPublic = 'random';

    await super.canActivate(context);

    if (req.isPublic === 'access') {
      return true;
    }

    if (req.type !== 'access') {
      throw new UnauthorizedException('access토큰이 아닙니다');
    }
    return true;
  }
}
