import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicGuard implements CanActivate {
  constructor(private readonly AuthService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // 요청 객체에 있는 authorization키만 뽑아서 {authorization : Basic {token}}을 가져온다
    const rawToken = req.headers['authorization'];
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }
    const token = this.AuthService.extractTokenFromHeader(rawToken, true);
    const { email, password } = this.AuthService.decodeBasicToken(token);
    const user = await this.AuthService.authenticateWithEmailAndPassword({
      email,
      password,
    });
    req.user = user;

    return true;
  }
}
