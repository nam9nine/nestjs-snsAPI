import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/enum.const';
import { PostsModel } from 'src/posts/posts.entity';
import { BaseModel } from 'src/common/entities/base.entitiy';
import { IsEmail, Length } from 'class-validator';
import { lengthValidationFunc } from 'src/common/validation-message/length-validation.message';
import { Exclude } from 'class-transformer';
import { ChatsModel } from 'src/chats/entities/chats.entity';
import { MessagesModel } from 'src/chats/messages/entities/message.entity';
import { CommentModel } from 'src/posts/comments/entities/comment.entity';
import { FollowModel } from './follow-user.entity';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @Length(1, 20, {
    message: lengthValidationFunc,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsEmail()
  email: string;

  @Column()
  @Length(3, 8, {
    message: lengthValidationFunc,
  })
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (posts) => posts.author, {
    onDelete: 'CASCADE',
  })
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chats) => chats.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (messages) => messages.user, {})
  messages: MessagesModel[];

  @OneToMany(() => CommentModel, (comments) => comments.user, {})
  comments: CommentModel[];

  @OneToMany(() => FollowModel, (followees) => followees.follower)
  @JoinTable()
  followees: FollowModel[];

  @OneToMany(() => FollowModel, (followers) => followers.followee)
  followers: FollowModel[];

  @Column({
    default: 0,
  })
  followeesCount: number;

  @Column({
    default: 0,
  })
  followersCount: number;
}
