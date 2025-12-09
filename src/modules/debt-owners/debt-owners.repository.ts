import { Injectable } from '@nestjs/common';
import { DebtOwner, Prisma } from 'prisma/generated/prisma/client';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import { DebtOwnerWithDebts } from 'src/types/entities/debt.types';

@Injectable()
export class DebtOwnersRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findAllByLedgerId(
    skip: number,
    take: number,
    ledgerId: number,
  ): Promise<DebtOwnerWithDebts[]> {
    return await this.prisma.debtOwner.findMany({
      where: { ledgerId },
      skip,
      take,
      orderBy: { name: 'asc' },
      include: { debts: true },
    });
  }

  async findById(id: number): Promise<DebtOwnerWithDebts | null> {
    return await this.prisma.debtOwner.findUnique({
      where: { id },
      include: { debts: true },
    });
  }

  async findByNameInLedger(
    ledgerId: number,
    name: string,
  ): Promise<DebtOwnerWithDebts | null> {
    return await this.prisma.debtOwner.findUnique({
      where: { ledgerId_name: { ledgerId, name } },
      include: { debts: true },
    });
  }

  async create(data: Prisma.DebtOwnerCreateInput): Promise<DebtOwner> {
    return await this.prisma.debtOwner.create({ data });
  }

  async update(
    id: number,
    data: Prisma.DebtOwnerUpdateInput,
  ): Promise<DebtOwner> {
    return await this.prisma.debtOwner
      .update({ where: { id }, data })
      .catch(handleP2025(`Debt Owner with id: ${id} not found.`));
  }

  async delete(id: number): Promise<void> {
    await this.prisma.debtOwner
      .delete({ where: { id } })
      .catch(handleP2025(`Debt Owner with id: ${id} not found.`));
  }
}
