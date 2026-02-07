import { TransactionResponseDto } from 'src/modules/transactions/dto/transaction-response.dto';
import { TransactionDetailView } from 'src/types/entities/transaction.types';
import { categoryToResponseDto } from './category.mapper';
import { debtArrayToArrayDto } from './debt.mapper';
import { paymentMethodToResponseDto } from './payment-method.mapper';
import { transactionBdArrayToArrayDto } from './transaction-bd.mapper';

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
    debts: debtOwners ? debtArrayToArrayDto(debtOwners) : [],
    group,
    transactionsBreakDown: transactionBdArrayToArrayDto(transactionsBreakDown),
  });
};

export const transactionArrayToArrayDto = (
  transactionArray: TransactionDetailView[],
): TransactionResponseDto[] => {
  return transactionArray ? transactionArray.map(transactionToResponseDto) : [];
};
