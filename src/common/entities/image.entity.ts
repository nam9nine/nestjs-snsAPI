import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PostsModel } from 'src/posts/posts.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UsedType {
  POST = 'POST',
  USER = 'USER',
}
@Entity()
export class ImageModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  @IsNumber()
  order: number;

  @Column()
  @IsString()
  @IsOptional()
  path?: string;

  @ManyToOne((type) => PostsModel, (post) => post.images)
  post: PostsModel;

  @Column({
    enum: UsedType,
  })
  type: UsedType;
}
