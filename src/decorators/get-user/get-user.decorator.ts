import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  <T extends keyof User>(data: T | undefined, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const user = req.user as User;

    return data ? user[data] : user;
  },
);
