import { IsNumber, IsString } from 'class-validator';
import { join } from 'path';
import { PostsModel } from 'src/posts/posts.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { POST_ROUTER_IMAGE_PATH } from '../const/path.const';
import { Transform } from 'class-transformer';

export enum ImageUsedType {
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
  @Transform(({ value, obj }) => {
    if (obj.type === ImageUsedType.POST) {
      return `/${join(POST_ROUTER_IMAGE_PATH, value)}`;
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne((type) => PostsModel, (post) => post.images)
  post: PostsModel;

  @Column({
    enum: ImageUsedType,
  })
  type: ImageUsedType;
}
