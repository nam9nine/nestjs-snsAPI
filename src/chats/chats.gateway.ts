import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from 'src/common/exception-filter/socket-catch-http.execption-filter';
import { SocketBearerTokenGuard } from 'src/auth/guard/socket/socket.bearer-token.guard';

@WebSocketGateway({
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
  ) {}
  @WebSocketServer()
  server: Server;

  handleConnection(sockect: Socket) {
    console.log(sockect.id);
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
  @UseGuards(SocketBearerTokenGuard)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() usersId: CreateChatDto,
    @ConnectedSocket() socket: Socket,
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
