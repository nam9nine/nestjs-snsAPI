import { IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entitiy';
import { PostsModel } from 'src/posts/posts.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class CommentModel extends BaseModel {
  @IsString()
  @Column()
  comment: string;

  @IsNumber()
  @Column({
    nullable: true,
    default: 0,
  })
  likeCount: number;
  //user
  @ManyToOne(() => UsersModel, (user) => user.comments)
  user: UsersModel;
  //post
  @ManyToOne(() => PostsModel, (post) => post.comments)
  post: PostsModel;
}
