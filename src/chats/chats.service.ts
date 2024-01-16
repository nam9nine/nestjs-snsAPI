import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatsModel } from './entities/chats.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { CommonService } from 'src/common/common.service';
import { ChatPaginateDto } from './dto/chats-paginate.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
    private readonly usersService: UsersService,
  ) {}
  getChats() {
    return this.chatsRepository.find({
      relations: ['users'],
    });
  }
  async createChat(chatDto: CreateChatDto) {
    if (!chatDto.usersId) {
      throw new BadRequestException('chat 없음');
    }
    const chat = await this.chatsRepository.save({
      users: chatDto.usersId.map((id) => ({ id })),
    });
    return this.chatsRepository.findOne({
      where: {
        id: chat.id,
      },
    });
  }

  getMyChats(dto: ChatPaginateDto, userId: number) {
    const user = this.usersService.getUserById(userId);
    return this.commonService.paginate<ChatsModel>(
      dto,
      this.chatsRepository,
      'chats/myChats',
      {
        where: {
          users: {
            id: userId,
          },
        },
        relations: ['users'],
      },
    );
  }
  async existChat(chatId: number) {
    return await this.chatsRepository.exist({
      where: {
        id: chatId,
      },
    });
  }
}
