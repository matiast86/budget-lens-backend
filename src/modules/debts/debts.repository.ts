import { Injectable, NotFoundException } from '@nestjs/common';
import { Debt, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DebtsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByOwnerId(
    debtOwnerId: number,
    skip: number,
    take: number,
    orderBy?: Prisma.DebtOrderByWithRelationInput,
  ): Promise<Debt[]> {
    return await this.prisma.debt.findMany({
      where: { debtOwnerId },
      skip,
      take,
      orderBy,
    });
  }

  async findById(id: number): Promise<Debt> {
    try {
      return await this.prisma.debt.findUniqueOrThrow({ where: { id } });
    } catch {
      throw new NotFoundException(`Debt with id: ${id} not found`);
    }
  }

  async create(data: Prisma.DebtCreateInput): Promise<Debt> {
    return this.prisma.debt.create({ data });
  }

  async update(id: number, data: Prisma.DebtUpdateInput): Promise<Debt> {
    return await this.prisma.debt.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.debt.delete({ where: { id } });
  }
}
