import { PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { PostsModel } from '../posts.entity';

export class CreatePostDto extends PickType(PostsModel, [
  'title',
  'content',
  'image',
]) {}
