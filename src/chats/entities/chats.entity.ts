import { BaseModel } from 'src/common/entities/base.entitiy';
import { UsersModel } from 'src/users/entities/users.entity';
import { Entity, ManyToMany, OneToMany } from 'typeorm';
import { MessagesModel } from '../messages/entities/message.entity';

@Entity()
export class ChatsModel extends BaseModel {
  @ManyToMany(() => UsersModel, (users) => users.chats)
  users: UsersModel[];

  @OneToMany(() => MessagesModel, (messages) => messages.chats)
  messages: MessagesModel[];
}
