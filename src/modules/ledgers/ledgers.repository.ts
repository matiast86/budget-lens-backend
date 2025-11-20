import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LedgerWithRelations } from 'src/types/entities/entities-with-relations';

@Injectable()
export class LedgersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<LedgerWithRelations[]> {
    return await this.prisma.ledger.findMany({
      include: {
        collaborations: true,
        transactions: true,
        creditCards: { include: { creditCard: true } },
        groups: true,
      },
    });
  }

  async findAllPaginated(
    skip: number,
    take: number,
    where?: Prisma.LedgerWhereInput,
  ): Promise<LedgerWithRelations[]> {
    return await this.prisma.ledger.findMany({
      where,
      skip,
      take,
      include: {
        collaborations: true,
        transactions: true,
        creditCards: { include: { creditCard: true } },
        groups: true,
      },
    });
  }

  async findLedgerById(id: number): Promise<LedgerWithRelations> {
    try {
      return await this.prisma.ledger.findFirstOrThrow({
        where: { id },
        include: {
          collaborations: true,
          transactions: true,
          creditCards: { include: { creditCard: true } },
          groups: true,
        },
      });
    } catch {
      throw new NotFoundException(`Ledger with id: ${id} not found`);
    }
  }

  async findLedgerByName(name: string): Promise<LedgerWithRelations> {
    try {
      return await this.prisma.ledger.findFirstOrThrow({
        where: { name },
        include: {
          collaborations: true,
          transactions: true,
          creditCards: { include: { creditCard: true } },
          groups: true,
        },
      });
    } catch {
      throw new NotFoundException(`Ledger with id: ${name} not found`);
    }
  }

  async update(
    id: number,
    data: Prisma.LedgerUpdateInput,
  ): Promise<LedgerWithRelations> {
    return await this.prisma.ledger.update({
      where: { id },
      data,
      include: {
        collaborations: true,
        transactions: true,
        creditCards: { include: { creditCard: true } },
        groups: true,
      },
    });
  }

  async create(data: Prisma.LedgerCreateInput): Promise<LedgerWithRelations> {
    return await this.prisma.ledger.create({
      data,
      include: {
        collaborations: true,
        transactions: true,
        creditCards: { include: { creditCard: true } },
        groups: true,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.ledger.delete({ where: { id } });
  }
}
