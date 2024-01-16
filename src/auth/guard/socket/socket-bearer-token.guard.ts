import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SocketBearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient();
    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];

    if (!rawToken) {
      throw new WsException('token이 없습니다');
    }
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, false);
      const payload = this.authService.vertifyToken(token);
      const user = await this.usersService.getUsersWithEmail(payload.email);
      socket.user = user;
      socket.token = token;
      socket.tokenType = payload.type;
      return true;
    } catch (e) {
      throw new WsException('토큰이 유효하지 않습니다');
    }
  }
}
