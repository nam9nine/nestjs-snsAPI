import { PickType } from '@nestjs/mapped-types';
import { CommentModel } from '../entities/comment.entity';

export class CreateCommentDto extends PickType(CommentModel, ['comment']) {}
