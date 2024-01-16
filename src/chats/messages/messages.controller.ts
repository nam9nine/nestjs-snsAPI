import { Body, Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagePaginate } from './dto/message-paginate.dto';

@Controller('chats/:cid/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async getMessages(
    @Param('cid', ParseIntPipe) cid: number,
    @Body() dto: MessagePaginate,
  ) {
    return await this.messagesService.messagesPaginate(dto, cid);
  }
}
