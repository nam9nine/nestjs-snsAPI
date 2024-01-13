import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { join } from 'path';
import { POST_ROUTER_IMAGE_PATH } from 'src/common/const/path.const';
import { BaseModel } from 'src/common/entities/base.entitiy';
import { ImageModel } from 'src/common/entities/image.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

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
  images: ImageModel[];
}
