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
import { User } from 'src/users/decorator/user.decorator';
import { CommentPaginateDto } from './dto/comment-paginate.dto';
import { updateCommentDto } from './dto/update-comment.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { TokenEnum } from 'src/auth/const/token-enum.const';
import { IsCommentMineOrAdminGuard } from './guards/is-comment-mine-or-admin.guard';

@Controller('posts/:postId/comment')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // @Get()
  // getMyCommnets(@Param('postId', ParseIntPipe) postId: number) {
  //   return this.commentsService.getMyComments(postId);
  // }
  @Get()
  @IsPublic(TokenEnum.ACCESS)
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() dto: CommentPaginateDto,
  ) {
    return this.commentsService.commentPaginate(dto, postId);
  }
  // @Get(':commentId')
  // @IsPublic(TokenEnum.ACCESS)
  // async getCommentById(@Param('commentId', ParseIntPipe) commentId: number) {
  //   return await this.commentsService.getCommentById(commentId);
  // }
  @Post()
  async postComment(
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

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  patchComment(
    @Body() dto: updateCommentDto,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.patchComment(commentId, dto);
  }

  @Delete(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  deleteComment(@Param('commentId', ParseIntPipe) id: number) {
    return this.commentsService.deleteComment(id);
  }
}
