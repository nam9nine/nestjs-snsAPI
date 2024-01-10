import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { UsersModel } from '../entities/users.entity';

export const User = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user as UsersModel;

    if (!user) {
      throw new InternalServerErrorException('guard와 함께 사용해주세요');
    }
    if (!data) {
      return user;
    }

    return user[data];
  },
);
