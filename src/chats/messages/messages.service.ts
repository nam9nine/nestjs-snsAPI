import { Injectable } from '@nestjs/common';
import { MessagesModel } from './entities/message.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SendMessageDto } from './dto/create-message.dto';
import { UsersModel } from 'src/users/entities/users.entity';
import { MessagePaginate } from './dto/message-paginate.dto';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}

  getAllMessages() {}
  // message : string , chatId : nubmer
  async createMessage(dto: SendMessageDto, authorId: number) {
    const message = await this.messagesRepository.save({
      ...dto,
      user: {
        id: authorId,
      },
      chat: {
        id: dto.chatId,
      },
    });
    return message;
  }

  async messagesPaginate(dto: MessagePaginate, cid: number) {
    return await this.commonService.paginate(
      dto,
      this.messagesRepository,
      'messages',
      {
        relations: ['user', 'chat'],
        where: {
          chat: {
            id: cid,
          },
        },
      },
    );
  }
}
