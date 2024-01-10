import { IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entitiy';
import { UsersModel } from 'src/users/entities/users.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
}
