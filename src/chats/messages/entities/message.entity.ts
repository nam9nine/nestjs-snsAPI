import { IsString } from 'class-validator';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { ChatsModel } from 'src/chats/entities/chats.entity';
import { BaseModel } from 'src/common/entities/base.entitiy';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';

@Entity()
export class MessagesModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.messages)
  user: UsersModel;

  @ManyToOne(() => ChatsModel, (chats) => chats.messages)
  chat: ChatsModel;

  @IsString()
  @Column()
  message: string;
}
