import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { User } from 'src/users/decorator/user.decorator';
import { paginateDto } from 'src/posts/dto/paginate-post.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}
  @Get()
  getAllChats() {
    return this.chatsService.getChats();
  }
  @Get('myChats')
  getMyChats(@User('id') id: number, @Query() dto: paginateDto) {
    return this.chatsService.getMyChats(dto, id);
  }
}
