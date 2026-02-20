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
    // TODO: implement
  }

  // ---------------------------------------------------------------------------
  // Category Evolution
  // ---------------------------------------------------------------------------

  async getCategoryEvolutionData(ledgerId: number, from: Date, to: Date) {
    // TODO: implement
  }
}
