import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { EnterChatDto } from './dto/enter-chat.dto';
import { SendMessageDto } from './messages/dto/create-message.dto';
import { UsersModel } from 'src/users/entities/users.entity';
import { MessagesService } from './messages/messages.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.execption-filter';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { TokenEnum } from 'src/auth/const/token-enum.const';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('start');
  }
  async handleConnection(socket: Socket & { user: UsersModel }) {
    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, false);
      const payload = this.authService.vertifyToken(token);
      const user = await this.usersService.getUsersWithEmail(payload.email);
      socket.user = user;
      return true;
    } catch (e) {
      socket.disconnect();
    }
  }
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  handleDisconnect(socket: Socket) {
    console.log(`disconnect id : ${socket.id}`);
  }
  // @IsPublic(TokenEnum.ACCESS)
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() usersId: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(usersId);
  }
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() dto: EnterChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    for (const id of dto.chatsId) {
      const chat = await this.chatsService.existChat(id);
      if (!chat) {
        throw new WsException({
          code: 100,
          message: `해당 chat이 없습니다 chatId : ${id}`,
        });
      }
    }

    socket.join(dto.chatsId.map((id) => id.toString()));
  }
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('send_message')
  async handleEvent(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chatExists = await this.chatsService.existChat(dto.chatId);
    if (!chatExists) {
      throw new WsException(
        `해당 chat방이 존재하지 않습니다 chatId : ${dto.chatId}`,
      );
    }
    const message = await this.messagesService.createMessage(
      dto,
      socket.user.id,
    );
    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);
  }
}
