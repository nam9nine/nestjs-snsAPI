import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token-guard';
import { User } from 'src/users/decorator/user.decorator';
import { PostsService } from '../posts.service';
import { CommentPaginateDto } from './dto/comment-paginate.dto';

@Controller('posts/:postId/comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // @Get()
  // getMyCommnets(@Param('postId', ParseIntPipe) postId: number) {
  //   return this.commentsService.getMyComments(postId);
  // }
  @Get()
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() dto: CommentPaginateDto,
  ) {
    return this.commentsService.commentPaginate(dto, postId);
  }
  @Get(':commentId')
  async getCommentById(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    return await this.commentsService.getCommentById(postId, commentId);
  }
  @Post()
  @UseGuards(AccessTokenGuard)
  async myComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @User('id') userId: number,
  ) {
    const comment = await this.commentsService.createComment(
      dto,
      userId,
      postId,
    );
    return comment;
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':commentId')
  patchComment(
    @Body() newComment: string,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.patchComment(postId, commentId, newComment);
  }

  @Delete(':commentId')
  @UseGuards(AccessTokenGuard)
  deleteComment(@Param('commentId', ParseIntPipe) id: number) {
    return this.commentsService.deleteComment(id);
  }

  // @Patch()
  // updateComent() {}
}
