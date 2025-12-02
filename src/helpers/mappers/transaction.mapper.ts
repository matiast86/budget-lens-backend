import { TransactionResponseDto } from 'src/modules/transactions/dto/transaction-response.dto';
import { TransactionDetailView } from 'src/types/entities/transaction.types';
import { categoryToResponseDto } from './category.mapper';
import { debtOwnerToResponseDto } from './debt-owner.mapper';
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
    paymentMethod,
    monthlyAmount,
    debtOwner,
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
    paymentMethod: paymentMethodToResponseDto(paymentMethod),
    monthlyAmount: Number(monthlyAmount),
    debtOwner: debtOwner ? debtOwnerToResponseDto(debtOwner) : undefined,
    transactionsBreakDown: transactionBdArrayToArrayDto(transactionsBreakDown),
  });
};

export const transactionArrayToArrayDto = (
  transactionArray: TransactionDetailView[],
): TransactionResponseDto[] => {
  return transactionArray ? transactionArray.map(transactionToResponseDto) : [];
};
