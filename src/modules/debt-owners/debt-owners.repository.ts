import { Injectable, NotFoundException } from '@nestjs/common';
import { DebtOwner, Prisma } from '@prisma/client';
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

  async findById(id: number): Promise<DebtOwnerWithDebts> {
    try {
      return await this.prisma.debtOwner.findUniqueOrThrow({
        where: { id },
        include: { debts: true },
      });
    } catch {
      throw new NotFoundException(`Debt owner with id: ${id} not found.`);
    }
  }

  async findByNameInLedger(
    ledgerId: number,
    name: string,
  ): Promise<DebtOwnerWithDebts> {
    try {
      return await this.prisma.debtOwner.findFirstOrThrow({
        where: { ledgerId, name },
        include: { debts: true },
      });
    } catch {
      throw new NotFoundException(`Debt owner with name: ${name} not found.`);
    }
  }

  async create(data: Prisma.DebtOwnerCreateInput): Promise<DebtOwner> {
    return await this.prisma.debtOwner.create({ data });
  }

  async update(
    id: number,
    data: Prisma.DebtOwnerUpdateInput,
  ): Promise<DebtOwner> {
    return await this.prisma.debtOwner.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.debtOwner.delete({ where: { id } });
  }
}
