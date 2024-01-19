import {
  BadGatewayException,
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UsersModel } from 'src/users/entities/users.entity';
import { CommentsService } from '../comments.service';
import { RolesEnum } from 'src/users/const/enum.const';
import { BroadcastOperator } from 'socket.io';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };
    const { user } = req;
    if (!user) {
      throw new UnauthorizedException('해당 user가 없습니다');
    }
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const userId = user.id;
    const postId = parseInt(req.params.postId);
    if (!postId) {
      throw new BadRequestException('post Id가 입력되지 않았습니다');
    }
    const commentId = parseInt(req.params.commentId);
    if (!commentId) {
      throw new BadRequestException('post Id가 입력되지 않았습니다');
    }

    const isOk = await this.commentsService.getMyComment(
      userId,
      postId,
      commentId,
    );

    if (!isOk) {
      throw new ForbiddenException('해당 권한이 없습니다');
    }
    return true;
  }
}
