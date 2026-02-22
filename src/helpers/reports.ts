import { DebtDirection } from 'prisma/generated/prisma/enums';
import { CashflowPeriodAmountDto } from 'src/modules/reports/dto/cashflow/cashflow-period-amount.dto';
import { CategoryEvolutionPeriodDto } from 'src/modules/reports/dto/category-evolution/category-evolution-period.dto';
import { CategoryTotalPeriodDto } from 'src/modules/reports/dto/category-evolution/category-total-period.dto';
import { DebtPeriodAmountDto } from 'src/modules/reports/dto/debt/debt-period-amount.dto';
import { DebtOwnersReport } from 'src/types/entities/debt.types';
import { TransactionDebtOwnerWithBasicDebt } from 'src/types/entities/transaction-debt-owner';
import {
  TransactionByCategoryReport,
  TransactionReport,
} from 'src/types/entities/transaction.types';
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

export const extractPeriodsFromCategories = (
  transactions: TransactionByCategoryReport[],
): string[] => {
  const seen = new Set<string>();
  for (const t of transactions) {
    seen.add(periodMapper(t.paymentMonth));
  }
  return Array.from(seen).sort();
};

export const extractCategoryTotalPeriodDto = (
  transactions: TransactionByCategoryReport[],
  periods: string[],
  baseCpiIndex: number,
): CategoryTotalPeriodDto[] => {
  const byPeriod = new Map<
    string,
    { totalNominalAmount: number; totalRealAmount: number | null }
  >(periods.map((p) => [p, { totalNominalAmount: 0, totalRealAmount: 0 }]));
  for (const t of transactions) {
    const p = periodMapper(t.paymentMonth);
    const entry = byPeriod.get(p);
    const debtAmount =
      t.debtOwners.length > 0
        ? t.debtOwners.reduce((sum, d) => sum + Number(d.amount), 0)
        : 0;
    const totalNominal = Number(t.monthlyAmount) - debtAmount;
    const totalReal = t.cpiIndex
      ? (totalNominal / Number(t.cpiIndex)) * baseCpiIndex
      : null;
    if (entry) {
      entry.totalNominalAmount += totalNominal;
      entry.totalRealAmount =
        totalReal !== null && entry.totalRealAmount !== null
          ? (entry.totalRealAmount += totalReal)
          : (entry.totalRealAmount = null);
    }
  }
  return periods.map((p) => {
    const { totalNominalAmount, totalRealAmount } = byPeriod.get(p)!;
    return new CategoryTotalPeriodDto({
      period: p,
      totalNominalAmount,
      totalRealAmount,
    });
  });
};

export const extractCategoryEvolutionPeriodAmount = (
  transactions: TransactionByCategoryReport[],
  periods: string[],
  totalPerPeriod: CategoryTotalPeriodDto[],
  baseCpiIndex: number,
): CategoryEvolutionPeriodDto[] => {
  const byPeriod = new Map<
    string,
    { nominalAmount: number; realAmount: number | null; share: number }
  >(periods.map((p) => [p, { nominalAmount: 0, realAmount: 0, share: 0 }]));
  for (const t of transactions) {
    const p = periodMapper(t.paymentMonth);

    const entry = byPeriod.get(p);
    const debtAmount =
      t.debtOwners.length > 0
        ? t.debtOwners.reduce((sum, d) => sum + Number(d.amount), 0)
        : 0;
    const totalNominal = Number(t.monthlyAmount) - debtAmount;
    const totalReal = t.cpiIndex
      ? (totalNominal / Number(t.cpiIndex)) * baseCpiIndex
      : null;
    if (entry) {
      entry.nominalAmount += totalNominal;
      entry.realAmount =
        totalReal !== null && entry.realAmount !== null
          ? (entry.realAmount += totalReal)
          : (entry.realAmount = null);
    }
  }
  return periods.map((p) => {
    const { nominalAmount, realAmount } = byPeriod.get(p)!;
    const periodTotal = totalPerPeriod.find(
      (tp) => tp.period === p,
    )!.totalNominalAmount;
    return new CategoryEvolutionPeriodDto({
      period: p,
      nominalAmount,
      realAmount,
      share: periodTotal !== 0 ? nominalAmount / periodTotal : 0,
    });
  });
};
