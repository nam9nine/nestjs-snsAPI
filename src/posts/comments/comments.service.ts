import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommentModel } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostsService } from '../posts.service';
import { CommentPaginateDto } from './dto/comment-paginate.dto';
import { CommonService } from 'src/common/common.service';
import { updateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentModel)
    private readonly commentsRepository: Repository<CommentModel>,
    private readonly postsService: PostsService,
    private readonly commonService: CommonService,
  ) {}

  async getMyComment(userId: number, commentId: number) {
    const existComment = await this.commentsRepository.exist({
      where: {
        user: {
          id: userId,
        },

        id: commentId,
      },
    });
    return existComment;
  }
  async createComment(dto: CreateCommentDto, userId: number, postId: number) {
    const post = await this.postsService.getPostById(postId);

    const comment = await this.commentsRepository.save({
      ...dto,
      likeCount: 0,
      user: {
        id: userId,
      },
      post: {
        id: post.id,
      },
    });
    return comment;
  }
  async getCommentById(commentId: number) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });
    if (!comment) {
      throw new BadRequestException('해당 comment가 없습니다');
    }
    return comment;
  }
  commentPaginate(dto: CommentPaginateDto, postId: number) {
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      `posts/${postId}/comment`,
      {
        where: {
          post: {
            id: postId,
          },
        },
        relations: ['post', 'user'],
        select: {
          user: {
            nickname: true,
            id: true,
          },
        },
      },
    );
  }

  async patchComment(commentId: number, dto: updateCommentDto) {
    const oldComment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });
    if (!oldComment) {
      throw new BadRequestException('해당 comment가 없습니다');
    }
    const preComment = await this.commentsRepository.preload({
      id: commentId,
      comment: dto.comment,
    });
    const comment = await this.commentsRepository.save(preComment);
    return comment;
  }
  async deleteComment(commentId: number) {
    const oldComment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });
    if (!oldComment) {
      throw new BadRequestException('해당 comment가 없습니다');
    }
    await this.commentsRepository.delete(commentId);
    return true;
  }
}
