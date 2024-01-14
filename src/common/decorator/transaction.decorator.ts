import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const QueryRunner = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    if (!req.qr) {
      throw new InternalServerErrorException(
        'Transaction interceptor랑 같이 사용해주세요',
      );
    }
    return req.qr;
  },
);
