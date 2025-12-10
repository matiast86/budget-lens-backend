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
import { LedgerRequest } from 'src/modules/ledgers/entities/ledger-request';
import { LedgersService } from 'src/modules/ledgers/ledgers.service';
import { JwtPayload } from 'src/types/payload/payload';

@Injectable()
export class LedgerAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly ledgersService: LedgersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<LedgerRequest>();
    const user: JwtPayload | undefined = request.user;
    if (!user) throw new UnauthorizedException('Token not found.');

    const rawLedgerId =
      this.reflector.getAllAndOverride<string | number>('ledgerId', [
        context.getHandler(),
        context.getClass(),
      ]) ?? request.params?.ledgerId;
    const ledgerId = Number(rawLedgerId);

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
    request.ledger = ledger;

    return true;
  }
}
