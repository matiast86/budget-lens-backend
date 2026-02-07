import { Injectable } from '@nestjs/common';
import { Debt, Prisma } from 'prisma/generated/prisma/client';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import { DebtWithSplit } from 'src/types/entities/debt.types';

@Injectable()
export class DebtsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByOwnerId(
    debtOwnerId: number,
    skip: number,
    take: number,
    orderBy?: Prisma.TransactionDebtOwnerOrderByWithRelationInput,
  ): Promise<DebtWithSplit[]> {
    return await this.prisma.transactionDebtOwner.findMany({
      where: { debtOwnerId },
      skip,
      take,
      orderBy,
      include: { debt: true, debtOwner: true },
    });
  }

  async findById(id: number): Promise<DebtWithSplit | null> {
    return await this.prisma.transactionDebtOwner.findUnique({
      where: { debtId: id },
      include: { debt: true, debtOwner: true },
    });
  }

  async findDebtOnlyById(id: number): Promise<Debt | null> {
    return await this.prisma.debt.findUnique({ where: { id } });
  }

  async create(data: Prisma.DebtCreateInput): Promise<DebtWithSplit> {
    const created = await this.prisma.debt.create({
      data,
    });
    const result = await this.prisma.transactionDebtOwner.findUnique({
      where: { debtId: created.id },
      include: { debt: true, debtOwner: true },
    });
    if (!result) throw new Error(`Debt with id: ${created.id} not found`);
    return result;
  }

  async update(
    id: number,
    data: Prisma.DebtUpdateInput,
    splitData?: Prisma.TransactionDebtOwnerUpdateInput,
  ): Promise<DebtWithSplit> {
    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) {
        await tx.debt
          .update({ where: { id }, data })
          .catch(handleP2025(`Debt with id: ${id} not found`));
      }
      if (splitData && Object.keys(splitData).length) {
        await tx.transactionDebtOwner
          .update({ where: { debtId: id }, data: splitData })
          .catch(handleP2025(`Debt with id: ${id} not found`));
      }
    });
    const updated = await this.findById(id);
    if (!updated) throw new Error(`Debt with id: ${id} not found`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.transactionDebtOwner.deleteMany({ where: { debtId: id } });
      await tx.debt
        .delete({ where: { id } })
        .catch(handleP2025(`Debt with id: ${id} not found`));
    });
  }
}
