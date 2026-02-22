import { TransactionDebtOwnerResponseDto } from 'src/modules/transactions/dto/transaction-debt-owner-response.dto';
import { TransactionResponseDto } from 'src/modules/transactions/dto/transaction-response.dto';
import { TransactionDetailView } from 'src/types/entities/transaction.types';
import { categoryToResponseDto } from './category.mapper';
import { debtToResponseDto } from './debt.mapper';
import { paymentMethodToResponseDto } from './payment-method.mapper';
import { transactionBdArrayToArrayDto } from './transaction-bd.mapper';

export const transactionDebtOwnerToResponseDto = (
  tdo: TransactionDetailView['debtOwners'][number],
): TransactionDebtOwnerResponseDto => {
  return new TransactionDebtOwnerResponseDto({
    transactionId: tdo.transactionId,
    debtOwnerId: tdo.debtOwnerId,
    debtOwnerName: tdo.debtOwner.name,
    amount: Number(tdo.amount),
    direction: tdo.direction,
    debt: debtToResponseDto(tdo.debt),
  });
};

export const transactionToResponseDto = (
  transaction: TransactionDetailView,
): TransactionResponseDto => {
  const {
    id,
    ledgerId,
    status,
    entryType,
    category,
    transactionDate,
    paymentMonth,
    installments,
    installment,
    comment,
    currency,
    totalAmount,
    paymentMethod,
    monthlyAmount,
    isPaid,
    impactsCashflow,
    cpiIndex,
    realMonthlyAmount,
    debtOwners,
    group,
    transactionsBreakDown,
  } = transaction;
  return new TransactionResponseDto({
    id,
    ledgerId,
    status,
    entryType,
    category: categoryToResponseDto(category),
    transactionDate: transactionDate.toISOString(),
    paymentMonth: paymentMonth ? paymentMonth.toISOString() : undefined,
    installments,
    installment,
    comment: comment ?? undefined,
    currency,
    totalAmount: Number(totalAmount),
    paymentMethod: paymentMethodToResponseDto(paymentMethod),
    monthlyAmount: Number(monthlyAmount),
    isPaid,
    impactsCashflow,
    cpiIndex: cpiIndex ? Number(cpiIndex) : undefined,
    realMonthlyAmount: realMonthlyAmount
      ? Number(realMonthlyAmount)
      : undefined,
    debtOwners: debtOwners
      ? debtOwners.map(transactionDebtOwnerToResponseDto)
      : [],
    group,
    transactionsBreakDown: transactionBdArrayToArrayDto(transactionsBreakDown),
  });
};

export const transactionArrayToArrayDto = (
  transactionArray: TransactionDetailView[],
): TransactionResponseDto[] => {
  return transactionArray.map(transactionToResponseDto);
};
