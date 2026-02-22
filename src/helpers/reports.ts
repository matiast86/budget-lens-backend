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
) => {
  const periodAmount: CashflowPeriodAmountDto[] = [];
  for (const period of periods) {
    const periodTransactions = transactions.filter(
      (t) => periodMapper(t.paymentMonth) === period,
    );
    const planned: number = periodTransactions.reduce(
      (sum, t) => sum + getPlannedEffectiveAmount(t),
      0,
    );

    const balance: number = periodTransactions.reduce(
      (sum, t) => sum + getBalanceEffectiveAmount(t, currentWeek),
      0,
    );

    const amount: CashflowPeriodAmountDto = new CashflowPeriodAmountDto({
      period,
      planned,
      balance,
    });

    periodAmount.push(amount);
  }
  return periodAmount;
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
