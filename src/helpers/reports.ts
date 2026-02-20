import { DebtDirection } from 'prisma/generated/prisma/enums';
import { CashflowPeriodAmountDto } from 'src/modules/reports/dto/cashflow/cashflow-period-amount.dto';
import { TransactionReport } from 'src/types/entities/transaction.types';
import { getWeekofMonth, periodMapper } from './dates';

export const extractPeriods = (transactions: TransactionReport[]): string[] => {
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
): number => {
  const bd = transaction.transactionsBreakDown;
  const currentWeek = getWeekofMonth(new Date());
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
      (sum, t) => sum + getBalanceEffectiveAmount(t),
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

export const extractPaymentMethods = (
  transactions: TransactionReport[],
): string[] => {
  const paymentMethods = new Set<string>();
  for (const t of transactions) {
    paymentMethods.add(t.paymentMethod.name);
  }

  return Array.from(paymentMethods);
};

export const extractCategories = (
  transactions: TransactionReport[],
): string[] => {
  const categories = new Set<string>();
  for (const t of transactions) {
    categories.add(t.category.name);
  }

  return Array.from(categories);
};

export const extractGroups = (transactions: TransactionReport[]): string[] => {
  const groups = new Set<string>();
  for (const t of transactions) {
    groups.add(t.group.name);
  }
  return Array.from(groups);
};
