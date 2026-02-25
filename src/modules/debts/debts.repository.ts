import { Injectable } from '@nestjs/common';
import { Debt, Prisma } from 'prisma/generated/prisma/client';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import { DebtWithOwner } from 'src/types/entities/debt.types';

@Injectable()
export class DebtsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByOwnerId(
    debtOwnerId: number,
    skip: number,
    take: number,
  ): Promise<Debt[]> {
    return await this.prisma.debt.findMany({
      where: { transactionDebtOwner: { debtOwnerId } },
      skip,
      take,
    });
  }

  async findById(id: number): Promise<Debt | null> {
    return await this.prisma.debt.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.DebtUpdateInput): Promise<Debt> {
    return await this.prisma.debt
      .update({ where: { id }, data })
      .catch(handleP2025(`Debt with id: ${id} not found`));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.debt
      .delete({ where: { id } })
      .catch(handleP2025(`Debt with id: ${id} not found`));
  }

  async findWithOwnerById(id: number): Promise<DebtWithOwner | null> {
    return await this.prisma.debt.findUnique({
      where: { id },
      include: { transactionDebtOwner: true },
    });
  }
}
