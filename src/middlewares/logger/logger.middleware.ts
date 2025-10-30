import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log(`A ${req.method} in ${req.url} at ${new Date().toISOString()}`);
    next();
  }
}

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: () => void,
) => {
  console.log(`A ${req.method} in ${req.url} at ${new Date().toISOString()}`);
  next();
};
