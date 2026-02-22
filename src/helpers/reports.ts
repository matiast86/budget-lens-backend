import { DebtDirection } from 'prisma/generated/prisma/enums';
import { CashflowPeriodAmountDto } from 'src/modules/reports/dto/cashflow/cashflow-period-amount.dto';
import { DebtPeriodAmountDto } from 'src/modules/reports/dto/debt/debt-period-amount.dto';
import { DebtOwnersReport } from 'src/types/entities/debt.types';
import { TransactionDebtOwnerWithBasicDebt } from 'src/types/entities/transaction-debt-owner';
import { TransactionReport } from 'src/types/entities/transaction.types';
import { periodMapper } from './dates';

export const extractPeriodsFromTransactions = (
  transactions: TransactionReport[],
): string[] => {
  const seen = new Set<string>();
  for (const t of transactions) {
    seen.add(periodMapper(t.paymentMonth));
  }
  return Array.from(seen).sort();
};

export const getPlannedEffectiveAmount = (
  transaction: TransactionReport,
): number => {
  const owedToMe = transaction.debtOwners
    .filter((o) => o.direction === DebtDirection.OWED_TO_ME)
    .reduce((sum, o) => sum + Number(o.amount), 0);
  return Number(transaction.monthlyAmount) - owedToMe;
};

export const getBalanceEffectiveAmount = (
  transaction: TransactionReport,
  currentWeek: number,
): number => {
  const bd = transaction.transactionsBreakDown;

  const owedToMe: number = transaction.debtOwners
    .filter((o) => o.direction === DebtDirection.OWED_TO_ME)
    .reduce((sum, o) => sum + Number(o.amount), 0);
  if (currentWeek === 1)
    return bd.reduce((sum, bd) => sum + Number(bd.amount), 0) - owedToMe;

  return bd
    .filter((b) => b.weekNumber >= currentWeek)
    .reduce((sum, b) => sum + Number(b.amount), 0);
};

export const createCashflowPeriodAmount = (
  periods: string[],
  transactions: TransactionReport[],
  currentWeek: number,
): CashflowPeriodAmountDto[] => {
  const byPeriod = new Map<string, { planned: number; balance: number }>(
    periods.map((p) => [p, { planned: 0, balance: 0 }]),
  );

  for (const t of transactions) {
    const p = periodMapper(t.paymentMonth);
    const entry = byPeriod.get(p);
    if (entry) {
      entry.planned += getPlannedEffectiveAmount(t);
      entry.balance += getBalanceEffectiveAmount(t, currentWeek);
    }
  }

  return periods.map((p) => {
    const { planned, balance } = byPeriod.get(p)!;
    return new CashflowPeriodAmountDto({ period: p, planned, balance });
  });
};

export const extractPeriodsFromOwners = (
  owners: DebtOwnersReport[],
): string[] => {
  const seen = new Set<string>();
  for (const o of owners) {
    const transactions = o.transactions;
    for (const t of transactions) {
      seen.add(periodMapper(t.debt.period));
    }
  }
  return Array.from(seen).sort();
};

export const extractDebtPeriodAmount = (
  transactions: TransactionDebtOwnerWithBasicDebt[],
  periods: string[],
): DebtPeriodAmountDto[] => {
  const amountByPeriod = new Map<string, number>(periods.map((p) => [p, 0]));

  for (const t of transactions) {
    const p = periodMapper(t.debt.period);
    if (amountByPeriod.has(p)) {
      const signed =
        t.direction === DebtDirection.OWED_TO_ME
          ? Number(t.amount)
          : -Number(t.amount);
      amountByPeriod.set(p, amountByPeriod.get(p)! + signed);
    }
  }

  return periods.map(
    (p) =>
      new DebtPeriodAmountDto({ period: p, amount: amountByPeriod.get(p)! }),
  );
};
