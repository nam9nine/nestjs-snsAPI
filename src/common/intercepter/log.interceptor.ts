import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // [req] path , date
    const now = new Date();

    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;
    console.log(`[req] path : ${path} time : ${now.toLocaleString('kr')}`);

    return next
      .handle()
      .pipe(
        tap((Observable) =>
          console.log(
            `[res] path : ${path} time : ${new Date().toLocaleString('kr')} ${
              new Date().getMilliseconds() - now.getMilliseconds()
            }ms`,
          ),
        ),
      );
  }
}
