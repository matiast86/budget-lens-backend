import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionReport } from 'src/types/entities/transaction.types';

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Cashflow
  // ---------------------------------------------------------------------------

  async getCashflowData(
    ledgerId: number,
    from: Date,
    to: Date,
  ): Promise<TransactionReport[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        ledgerId,
        paymentMonth: { gte: from, lte: to }, // ← paymentMonth, not transactionDate
      },
      select: {
        paymentMethod: { select: { name: true } },
        paymentMethodId: true,
        group: { select: { name: true } },
        groupId: true,
        category: { select: { name: true } },
        categoryId: true,
        paymentMonth: true,
        entryType: true,
        monthlyAmount: true,
        status: true,
        ledger: { select: { currency: true } },
        transactionsBreakDown: {
          select: { weekNumber: true, amount: true },
        },
        debtOwners: {
          select: { amount: true, direction: true }, // only what's needed for adjustment
        },
      },
    });
    return transactions;
  }

  // ---------------------------------------------------------------------------
  // Debt
  // ---------------------------------------------------------------------------

  async getDebtData(ledgerId: number, from: Date, to: Date) {
    const [ledger, owners] = await Promise.all([
      this.prisma.ledger.findUniqueOrThrow({
        where: { id: ledgerId },
        select: { currency: true },
      }),
      this.prisma.debtOwner.findMany({
        where: {
          ledgerId,
          transactions: {
            some: { debt: { period: { gte: from, lte: to } } },
          },
        },
        select: {
          id: true,
          name: true,
          transactions: {
            where: { debt: { period: { gte: from, lte: to } } },
            select: {
              amount: true,
              direction: true,
              debt: { select: { period: true, description: true } },
            },
          },
        },
      }),
    ]);

    return { owners, currency: ledger.currency };
  }

  // ---------------------------------------------------------------------------
  // Category Evolution
  // ---------------------------------------------------------------------------

  async getCategoryEvolutionData(ledgerId: number, from: Date, to: Date) {
    // TODO: implement
  }
}
