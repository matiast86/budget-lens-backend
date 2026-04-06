import { Injectable } from '@nestjs/common';
import { Ledger, Prisma } from 'prisma/generated/prisma/client';
import { handleP2025 } from 'src/helpers/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  LedgerDetailView,
  LedgerMinimal,
  LedgerWithCollaborations,
} from 'src/types/entities/ledger.types';

@Injectable()
export class LedgersRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOneMinimal(id: number): Promise<LedgerMinimal | null> {
    return await this.prisma.ledger.findUnique({
      where: { id },
      select: { id: true, currency: true, baseCpiIndex: true },
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
            group: true,
            transactionsBreakDown: true,
            debtOwners: {
              include: {
                debtOwner: true,
                debt: true,
              },
            },
          },
          orderBy: { transactionDate: 'desc' },
        },
        paymentMethods: { include: { paymentMethod: true } },
        groups: true,
        debtOwners: true,
        categories: true,
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
      include: { paymentMethods: true },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prisma.ledger
      .delete({ where: { id } })
      .catch(handleP2025(`Ledger with id: ${id} not found.`));
  }

  async findEntityById(id: number): Promise<LedgerWithCollaborations | null> {
    return await this.prisma.ledger.findUnique({
      where: { id },
      select: { id: true, name: true, ownerId: true, collaborations: true },
    });
  }
}
