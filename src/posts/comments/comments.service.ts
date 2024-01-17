import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommentModel } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostsService } from '../posts.service';
import { CommentPaginateDto } from './dto/comment-paginate.dto';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentModel)
    private readonly commentsRepository: Repository<CommentModel>,
    private readonly postsService: PostsService,
    private readonly commonService: CommonService,
  ) {}

  getMyComments(postId: number) {
    return this.commentsRepository.find({
      where: {
        id: postId,
      },
      relations: ['user', 'post'],
    });
  }
  async createComment(dto: CreateCommentDto, userId: number, postId: number) {
    const post = await this.postsService.getPostById(postId);

    // if (!post) {
    //   throw new BadRequestException(
    //     `해당 포스터는 없습니다 postID : ${postId}`,
    //   );
    // }

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
  async getCommentById(postId: number, commentId: number) {
    const post = await this.postsService.getPostById(postId);
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
      },
    );
  }

  async patchComment(postId: number, commentId: number, newComment: string) {
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
      comment: newComment,
    });
    const comment = await this.commentsRepository.save(preComment);
    return comment;
  }
  async deleteComment(commentId: number) {
    await this.commentsRepository.delete(commentId);
    return true;
  }
}
