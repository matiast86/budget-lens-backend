import { Injectable, NotFoundException } from '@nestjs/common';
import { Ledger, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LedgerDetailView } from 'src/types/entities/ledger.types';

@Injectable()
export class LedgersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(ownerId: string): Promise<Ledger[]> {
    return await this.prisma.ledger.findMany({
      where: { ownerId },
    });
  }

  async findAllPaginated(
    skip: number,
    take: number,
    where?: Prisma.LedgerWhereInput,
  ): Promise<Ledger[]> {
    return await this.prisma.ledger.findMany({
      where,
      skip,
      take,
    });
  }

  async findLedgerById(id: number): Promise<LedgerDetailView> {
    try {
      return await this.prisma.ledger.findUniqueOrThrow({
        where: { id },
        include: {
          collaborations: true,
          transactions: {
            include: {
              category: true,
              paymentMethod: true,
              debtOwner: true,
              group: true,
              transactionsBreakDown: true,
            },
          },
          paymentMethods: { include: { paymentMethod: true } },
          groups: true,
          debtOwners: true,
        },
      });
    } catch {
      throw new NotFoundException(`Ledger with id: ${id} not found`);
    }
  }

  async findLedgerByName(name: string): Promise<Ledger> {
    try {
      return await this.prisma.ledger.findFirstOrThrow({
        where: { name },
        include: {
          collaborations: true,
          transactions: {
            include: { category: true, paymentMethod: true, debtOwner: true },
          },
          paymentMethods: { include: { paymentMethod: true } },
          groups: true,
          debtOwners: true,
        },
      });
    } catch {
      throw new NotFoundException(`Ledger with id: ${name} not found`);
    }
  }

  async update(id: number, data: Prisma.LedgerUpdateInput): Promise<Ledger> {
    return await this.prisma.ledger.update({
      where: { id },
      data,
    });
  }

  async create(data: Prisma.LedgerCreateInput): Promise<Ledger> {
    return await this.prisma.ledger.create({
      data,
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.ledger.delete({ where: { id } });
  }
}
