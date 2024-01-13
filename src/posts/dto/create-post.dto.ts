import { PickType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PostsModel } from '../posts.entity';
import { ImageModel } from 'src/common/entities/image.entity';

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString({
    each: true,
  })
  @IsOptional()
  images?: string[];
}
