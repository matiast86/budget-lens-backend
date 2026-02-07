import { Injectable } from '@nestjs/common';
import { Ledger, Prisma } from 'prisma/generated/prisma/client';
import { handleP2025 } from 'src/helpers/errors';
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

  async findLedgerById(id: number): Promise<LedgerDetailView | null> {
    return await this.prisma.ledger.findUnique({
      where: { id },
      include: {
        collaborations: true,
        transactions: {
          include: {
            category: true,
            paymentMethod: true,
            debtOwners: {
              include: {
                debt: true,
                debtOwner: true,
              },
            },
            group: true,
            transactionsBreakDown: true,
          },
        },
        paymentMethods: { include: { paymentMethod: true } },
        groups: true,
        debtOwners: true,
        categories: true,
      },
    });
  }

  async findLedgerByName(
    name: string,
    ownerId: string,
  ): Promise<Ledger | null> {
    return await this.prisma.ledger.findFirst({
      where: { name, ownerId },
      include: {
        collaborations: true,
        transactions: {
          include: {
            category: true,
            paymentMethod: true,
            debtOwners: {
              include: {
                debt: true,
                debtOwner: true,
              },
            },
          },
        },
        paymentMethods: { include: { paymentMethod: true } },
        groups: true,
        debtOwners: true,
      },
    });
  }

  async update(id: number, data: Prisma.LedgerUpdateInput): Promise<Ledger> {
    return await this.prisma.ledger
      .update({
        where: { id },
        data,
      })
      .catch(handleP2025(`Ledger with id: ${id} not found.`));
  }

  async create(data: Prisma.LedgerCreateInput): Promise<Ledger> {
    return await this.prisma.ledger.create({
      data,
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.ledger
      .delete({ where: { id } })
      .catch(handleP2025(`Ledger with id: ${id} not found.`));
  }
}
