import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { CommonService } from 'src/common/common.service';
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
  @UseGuards(AccessTokenGuard)
  getMyChats(@User('id') id: number, @Body() dto: paginateDto) {
    return this.chatsService.getMyChats(dto, id);
  }
}
