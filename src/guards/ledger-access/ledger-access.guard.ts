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
import { CollaborationsService } from 'src/modules/collaborations/collaborations.service';
import { CategoriesService } from 'src/modules/categories/categories.service';
import { DebtOwnersService } from 'src/modules/debt-owners/debt-owners.service';
import { DebtsService } from 'src/modules/debts/debts.service';
import { GroupsService } from 'src/modules/groups/groups.service';
import { LedgerRequest } from 'src/modules/ledgers/entities/ledger-request';
import { LedgersService } from 'src/modules/ledgers/ledgers.service';
import { JwtPayload } from 'src/types/payload/payload';

@Injectable()
export class LedgerAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly ledgersService: LedgersService,
    private readonly groupsService: GroupsService,
    private readonly categoriesService: CategoriesService,
    private readonly debtOwnersService: DebtOwnersService,
    private readonly collaborationsService: CollaborationsService,
    private readonly debtsService: DebtsService,
  ) {}

  private async resolveLedgerId(
    meta:
      | {
          type:
            | 'group'
            | 'category'
            | 'debtOwner'
            | 'ledger'
            | 'collaboration'
            | 'debt';
          param: string;
        }
      | undefined,
    request: LedgerRequest,
    context: ExecutionContext,
  ): Promise<number> {
    if (meta) {
      const rawId = request.params?.[meta.param];
      const entityId = Number(rawId);
      if (!Number.isInteger(entityId)) {
        throw new BadRequestException(`${meta.param} is missing or invalid`);
      }

      if (meta.type === 'group') {
        const group = await this.groupsService.findEntityById(entityId);
        if (!group) throw new NotFoundException('Group not found');

        (request as LedgerRequest & { group?: typeof group }).group = group;
        return group.ledgerId;
      }

      if (meta.type === 'category') {
        const category = await this.categoriesService.findEntityById(entityId);
        if (!category) throw new NotFoundException('Category not found');

        (request as LedgerRequest & { category?: typeof category }).category =
          category;
        return category.ledgerId;
      }

      if (meta.type === 'debtOwner') {
        const owner = await this.debtOwnersService.findEntityById(entityId);
        if (!owner) throw new NotFoundException('Debt owner not found');
        // optional reuse:
        (request as LedgerRequest & { debtOwner?: typeof owner }).debtOwner =
          owner;
        return owner.ledgerId;
      }

      if (meta.type === 'ledger') {
        const ledger = await this.ledgersService.getEntityById(entityId);
        if (!ledger) throw new NotFoundException('Ledger not found');
        // optional reuse:
        (request as LedgerRequest & { ledger?: typeof ledger }).ledger = ledger;
        return ledger.id;
      }

      if (meta.type === 'collaboration') {
        const collaboration =
          await this.collaborationsService.findEntityById(entityId);
        if (!collaboration)
          throw new NotFoundException('Collaboration not found');
        // optional reuse:
        (
          request as LedgerRequest & { collaboration?: typeof collaboration }
        ).collaboration = collaboration;
        return collaboration.ledgerId;
      }

      if (meta.type === 'debt') {
        const debt = await this.debtsService.findEntityById(entityId);
        if (!debt) throw new NotFoundException('Collaboration not found');
        const debtOwner = await this.debtOwnersService.findEntityById(
          debt.debtOwnerId,
        );
        if (!debtOwner) throw new NotFoundException('Debt owner not found');
        // optional reuse:
        (request as LedgerRequest & { debt?: typeof debt }).debt = debt;
        return debtOwner.ledgerId;
      }

      throw new BadRequestException('Unsupported ledger source');
    }

    const rawLedgerId =
      this.reflector.getAllAndOverride<string | number>('ledgerId', [
        context.getHandler(),
        context.getClass(),
      ]) ?? request.params?.ledgerId;
    const ledgerId = Number(rawLedgerId);
    if (!Number.isInteger(ledgerId)) {
      throw new BadRequestException('ledgerId is missing or invalid');
    }
    return ledgerId;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<LedgerRequest>();
    const user: JwtPayload | undefined = request.user;
    if (!user) throw new UnauthorizedException('Token not found.');

    const meta = this.reflector.getAllAndOverride<{
      type:
        | 'group'
        | 'category'
        | 'debtOwner'
        | 'ledger'
        | 'collaboration'
        | 'debt';
      param: string;
    }>('ledgerFrom', [context.getHandler(), context.getClass()]);

    const ledgerId = await this.resolveLedgerId(meta, request, context);

    const ledger = await this.ledgersService.getEntityById(ledgerId);
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
