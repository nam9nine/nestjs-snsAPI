import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { PostsService } from 'src/posts/posts.service';
import { RolesEnum } from 'src/users/const/enum.const';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsSerivce: PostsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { user } = req;
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const userId = parseInt(user.id);
    const postId = parseInt(user.id);

    if (!postId) {
      throw new BadRequestException('postId를 입력해주세요');
    }

    const existPost = await this.postsSerivce.getMyPostById(userId, postId);

    if (!existPost) {
      throw new ForbiddenException('권한이 없습니다');
    }

    return true;
  }
}
