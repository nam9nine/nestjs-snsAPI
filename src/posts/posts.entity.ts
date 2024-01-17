import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entitiy';
import { ImageModel } from 'src/common/entities/image.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CommentModel } from './comments/entities/comment.entity';

@Entity()
export class PostsModel extends BaseModel {
  @Column()
  @IsString()
  title: string;

  @Column()
  @IsString()
  content: string;
  @Column()
  likeCount: number;
  @Column()
  commentCount: number;

  @ManyToOne(() => UsersModel, (author) => author.posts, {
    nullable: false,
  })
  @JoinColumn()
  author: UsersModel;

  @OneToMany(() => ImageModel, (images) => images.post)
  images?: ImageModel[];

  @OneToMany(() => CommentModel, (comments) => comments.post, {
    onDelete: 'CASCADE',
  })
  comments: CommentModel[];
}
