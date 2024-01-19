import { PartialType } from '@nestjs/mapped-types';
import { CommentModel } from '../entities/comment.entity';

export class updateCommentDto extends PartialType(CommentModel) {}
