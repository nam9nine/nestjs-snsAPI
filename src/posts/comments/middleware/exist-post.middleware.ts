import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request } from 'express';

import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class ExistPostIdMiddleware implements NestMiddleware {
  constructor(private readonly postsService: PostsService) {}
  async use(req: Request, res: any, next: NextFunction) {
    const postId = req.params.postId;
    if (!postId) {
      throw new BadRequestException('postId는 필수입니다');
    }

    const post = await this.postsService.checkPostExistById(parseInt(postId));
    if (!post) {
      throw new BadRequestException(`해당 post가 없습니다 id : ${postId}`);
    }

    next();
  }
}
