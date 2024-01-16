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
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() usersId: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = await this.chatsService.createChat(usersId);
  }
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
    const message = await this.messagesService.createMessage(dto);
    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);
  }
}
