import { IsNumber, IsString } from 'class-validator';

export class CreateChatDto {
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  usersId: number[];
}
