import { PickType } from '@nestjs/mapped-types';
import { MessagesModel } from '../entities/message.entity';
import { IsNumber } from 'class-validator';

export class SendMessageDto extends PickType(MessagesModel, ['message']) {
  @IsNumber()
  chatId: number;
}
