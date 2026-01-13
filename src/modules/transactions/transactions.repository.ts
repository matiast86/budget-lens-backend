import { Injectable } from '@nestjs/common';
import {
  Currency,
  EntryType,
  Prisma,
  Transaction,
} from 'prisma/generated/prisma/client';
import { TransactionCreateInput } from 'prisma/generated/prisma/models';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TransactionBreakDownsAndGroups,
  TransactionDetailView,
} from 'src/types/entities/transaction.types';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: TransactionCreateInput): Promise<TransactionDetailView> {
    return await this.prisma.transaction.create({
      data,
      include: {
        category: true,
        paymentMethod: true,
        debtOwner: true,
        group: true,
        transactionsBreakDown: true,
      },
    });
  }

  async findById(id: number): Promise<TransactionDetailView | null> {
    return await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        paymentMethod: true,
        debtOwner: true,
        group: true,
        transactionsBreakDown: true,
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
        debtOwner: true,
        group: true,
        transactionsBreakDown: true,
      },
    });
  }

  async update(
    id: number,
    data: Prisma.TransactionUpdateInput,
  ): Promise<Transaction> {
    return await this.prisma.transaction
      .update({ where: { id }, data })
      .catch(handleP2025(`Transaction with id: ${id} not found.`));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.transaction
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
}
