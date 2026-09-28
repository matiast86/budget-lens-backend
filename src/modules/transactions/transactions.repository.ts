import { Injectable } from '@nestjs/common';
import {
  Currency,
  DebtDirection,
  EntryType,
  Prisma,
  Transaction,
  TransactionType,
} from 'prisma/generated/prisma/client';
import { TransactionCreateInput } from 'prisma/generated/prisma/models';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TransactionBreakDownsAndGroups,
  TransactionCollitions,
  TransactionDetailView,
  TransactionGroupAndCategory,
} from 'src/types/entities/transaction.types';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: TransactionCreateInput,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<TransactionDetailView> {
    return await client.transaction.create({
      data,
      include: {
        category: true,
        paymentMethod: true,
        debtOwners: { include: { debtOwner: true, debt: true } },
        group: true,
        transactionsBreakDown: true,
        derivedFrom: true,
        feedsDerived: true,
      },
    });
  }

  async findById(id: number): Promise<TransactionDetailView | null> {
    return await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        paymentMethod: true,
        debtOwners: { include: { debtOwner: true, debt: true } },
        group: true,
        transactionsBreakDown: true,
        derivedFrom: true,
        feedsDerived: true,
      },
    });
  }

  async findAllByPaginated(
    where: Prisma.TransactionWhereInput,
    skip: number,
    take: number,
    orderBy?: Prisma.TransactionOrderByWithRelationInput,
  ): Promise<TransactionDetailView[]> {
    return await this.prisma.transaction.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        category: true,
        paymentMethod: true,
        debtOwners: { include: { debtOwner: true, debt: true } },
        group: true,
        transactionsBreakDown: true,
        derivedFrom: true,
        feedsDerived: true,
      },
    });
  }

  async update(
    id: number,
    data: Prisma.TransactionUpdateInput,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<TransactionDetailView> {
    return await client.transaction
      .update({
        where: { id },
        data,
        include: {
          category: true,
          paymentMethod: true,
          debtOwners: { include: { debtOwner: true, debt: true } },
          group: true,
          transactionsBreakDown: true,
          derivedFrom: true,
          feedsDerived: true,
        },
      })
      .catch(handleP2025(`Transaction with id: ${id} not found.`));
  }

  async delete(
    id: number,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    await client.transaction
      .delete({ where: { id } })
      .catch(handleP2025(`Transaction with id: ${id} not found.`));
  }

  async findByGroupAndCategory(
    categoryId: number,
    paymentMethodId: number,
    groupId: number,
    currency: Currency,
    entryType: EntryType,
  ): Promise<TransactionBreakDownsAndGroups | null> {
    return await this.prisma.transaction.findFirst({
      where: { categoryId, paymentMethodId, groupId, currency, entryType },
      include: { transactionsBreakDown: true, group: true },
    });
  }

  async createTransactionDebtOwner(
    transactionId: number,
    debtOwnerId: number,
    amount: number,
    direction: DebtDirection,
    period: Date,
    description: string,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    await client.transactionDebtOwner.create({
      data: {
        transaction: { connect: { id: transactionId } },
        debtOwner: { connect: { id: debtOwnerId } },
        amount,
        direction,
        debt: {
          create: {
            period,
            description,
          },
        },
      },
    });
  }

  async runInTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: { timeout?: number; maxWait?: number },
  ) {
    return await this.prisma.$transaction(fn, options);
  }

  async findBalanceInRange(
    ledgerId: number,
    categoryId: number,
    paymentMethodId: number,
    paymentMonth: Date,
    upto: Date,
  ): Promise<Transaction[]> {
    return await this.prisma.transaction.findMany({
      where: {
        ledgerId,
        categoryId,
        paymentMethodId,
        paymentMonth: {
          gte: paymentMonth,
          lte: upto,
        },
      },
    });
  }

  async findLatestFixedByGroupAndCategory(
    groupId: number,
    categoryId: number,
    currency: Currency,
    entryType: EntryType,
  ): Promise<TransactionGroupAndCategory[]> {
    const frontier = await this.prisma.transaction.findFirst({
      where: {
        groupId,
        categoryId,
        currency,
        transactionType: TransactionType.FIXED,
        entryType,
      },
      orderBy: { paymentMonth: 'desc' },
      select: { paymentMonth: true },
    });
    if (!frontier) return [];
    return this.prisma.transaction.findMany({
      where: {
        groupId,
        categoryId,
        currency,
        transactionType: TransactionType.FIXED,
        entryType,
        paymentMonth: frontier.paymentMonth,
      },
      include: {
        paymentMethod: true,
        group: { select: { name: true } },
        category: { select: { name: true } },
        debtOwners: { include: { debtOwner: true, debt: true } },
      },
    });
  }

  async findFixedInRange(
    ledgerId: number,
    groupId: number,
    categoryId: number,
    currency: Currency,
    entryType: EntryType,
    from: Date,
    to: Date,
  ): Promise<TransactionCollitions[]> {
    return this.prisma.transaction.findMany({
      where: {
        ledgerId,
        groupId,
        categoryId,
        currency,
        transactionType: TransactionType.FIXED,
        entryType,
        paymentMonth: { gte: from, lte: to },
      },
      select: { id: true },
    });
  }

  async findByIds(ids: number[]) {
    return await this.prisma.transaction.findMany({
      where: { id: { in: ids } },
    });
  }
  async findSiblingForMonth(
    groupId: number,
    categoryId: number,
    currency: Currency,
    entryType: EntryType,
    paymentMethodId: number,
    month: Date,
  ) {
    // 1. Fetch one transaction (findFirst).
    // 2. Filter by groupId, categoryId, currency, entryType, paymentMethodId,
    //    and paymentMonth equal to `month` exactly (month must already be a
    //    UTC month-floored Date, same convention as everywhere else).
    // 3. Do NOT filter by transactionType — the source may be a plain
    //    VARIABLE row, not a FIXED one.
    // 4. Select only { id, totalAmount }.
    // 5. Return the match, or null if none found — the caller skips that
    //    month entirely rather than creating a 0-amount row.
    return await this.prisma.transaction.findFirst({
      where: {
        groupId,
        categoryId,
        currency,
        entryType,
        paymentMethodId,
        paymentMonth: month,
      },
      select: { id: true, totalAmount: true },
    });
  }

  async createDerivationLink(
    derivedId: number,
    sourceId: number,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    // 1. Create one TransactionDerivation row.
    // 2. Connect `derived` to derivedId, connect `source` to sourceId.
    // 3. Use `client`, not this.prisma, so it joins whatever transaction the
    //    caller already has open (mirrors createTransactionDebtOwner above).
    // 4. Return nothing (void). Caller is responsible for not calling this
    //    twice with the same (derivedId, sourceId) pair — @@unique will throw.
    await client.transactionDerivation.create({
      data: {
        derived: { connect: { id: derivedId } },
        source: { connect: { id: sourceId } },
      },
    });
  }

  async findDerivationsBySource(
    sourceId: number,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    // 1. Fetch all TransactionDerivation rows.
    // 2. Filter by sourceId.
    // 3. Use `client`, not this.prisma — this is called right after that
    //    source's new totalAmount was written inside the same open
    //    transaction, so it must read through that same transaction to see
    //    the uncommitted value (default ReadCommitted isolation would
    //    otherwise return stale data here).
    // 4. Return the rows as-is; let the caller reduce to distinct derivedId.

    return await client.transactionDerivation.findMany({ where: { sourceId } });
  }

  async findDerivationsByDerived(
    derivedId: number,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    // 1. Fetch all TransactionDerivation rows.
    // 2. Filter by derivedId.
    // 3. Include the linked `source` transaction on each row — the caller
    //    needs source.totalAmount immediately to recompute the sum.
    // 4. Use `client`, not this.prisma — same read-your-own-writes reason as
    //    findDerivationsBySource.
    // 5. Return the rows.
    return await client.transactionDerivation.findMany({
      where: { derivedId },
      include: {
        source: true,
      },
    });
  }

  async findDerivedInRange(
    ledgerId: number,
    groupId: number,
    categoryId: number,
    currency: Currency,
    entryType: EntryType,
    from: Date,
    to: Date,
  ) {
    // 1. Fetch all transactions.
    // 2. Filter by ledgerId, groupId, categoryId, currency, entryType.
    // 3. Also filter transactionType = FIXED AND derivationRate not null —
    //    both together, so this doesn't collide with an unrelated ordinary
    //    FIXED bundle sharing the same group/category/currency/entryType.
    // 4. Filter paymentMonth between from and to, inclusive.
    // 5. Select only { id }.
    // 6. Return the rows (empty array = clear to create; mirrors
    //    findFixedInRange's idempotency check).
    return await this.prisma.transaction.findMany({
      where: {
        ledgerId,
        groupId,
        categoryId,
        currency,
        entryType,
        transactionType: TransactionType.FIXED,
        derivationRate: { not: null },
        paymentMonth: { gte: from, lte: to },
      },
      select: { id: true },
    });
  }
}
