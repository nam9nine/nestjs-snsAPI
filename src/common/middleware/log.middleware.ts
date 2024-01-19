import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class LogMidddleware implements NestMiddleware {
  use(req: Response, res: Request, next: NextFunction) {
    console.log(`[req] path : ${req.url}`);

    next();
  }
}
