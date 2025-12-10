import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { LedgersService } from 'src/modules/ledgers/ledgers.service';
import { UserDashboardView } from 'src/types/entities/user.types';

@Injectable()
export class LedgerAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly ledgersService: LedgersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user: UserDashboardView = request.user;
    if (!user) throw new UnauthorizedException('Token not found.');

    const ledgerId =
      this.reflector.getAllAndOverride<number>('ledgerId', [
        context.getHandler(),
        context.getClass(),
      ]) ?? Number(request.params?.ledgerId);

    if (!Number.isInteger(ledgerId))
      throw new BadRequestException('ledgerId is missing or invalid');

    const ledger = await this.ledgersService.findOne(user.id, ledgerId);
    if (!ledger) throw new NotFoundException('Ledger not found');

    const collaboration = ledger.collaborations.some(
      (c) => c.userId === user.id,
    );

    const isAllowed = user.id === ledger.ownerId || collaboration;

    if (!isAllowed)
      throw new ForbiddenException(
        `Only ledger owners or collaborators can perform this action.`,
      );

    // attach the loaded ledger for downstream handlers/controllers
    (request as Request & { ledger?: typeof ledger }).ledger = ledger;

    return true;
  }
}
