import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/common/decorator/is-public.decorator';

@Injectable()
export class ChangeIsPublic implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const isPublic = await this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getClass(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();

    console.log('interceptor');
    if (isPublic) {
      req.isPublic = false;
    }
    return next.handle().pipe(tap((observe) => console.log(observe)));
  }
}
