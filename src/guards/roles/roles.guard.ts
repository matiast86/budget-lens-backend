import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from 'prisma/generated/prisma/enums';
import { JwtPayload } from 'src/types/payload/payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator on this endpoint → allow access.
    if (!requiredRoles) return true;

    const request: Request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    const hasRole = requiredRoles.some((role) => role === user?.role);

    if (!user || !hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
