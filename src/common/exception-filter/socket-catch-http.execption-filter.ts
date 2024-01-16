import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

//http exception을 ws exception으로 변환해줘서 서버가 터지는 일이 없도록 한다
@Catch(HttpException)
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient();

    socket.emit('exception', {
      data: exception.getResponse(),
    });
  }
}
