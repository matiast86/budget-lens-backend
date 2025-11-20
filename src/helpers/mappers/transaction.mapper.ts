import { TransactionResponseDto } from 'src/modules/transactions/dto/transaction-response.dto';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { TransactionWithRelations } from 'src/types/entities/entities-with-relations';
import {
  categoryEntityToResponseDto,
  categoryToEntity,
} from './category.mapper';
import { groupToEntity } from './group.mapper';
import {
  transactionBdArrayToArrayDto,
  transactionBreakDownToEntity,
} from './transaction-bd.mapper';

export const transactionToEntity = (
  transaction: TransactionWithRelations,
): TransactionEntity => {
  const {
    id,
    ledgerId,
    status,
    entryType,
    categoryId,
    groupId,
    transactionDate,
    paymentMonth,
    installments,
    installment,
    comment,
    currency,
    type,
    monthlyAmount,
    debtOwnerId,
    category,
    group,
    transactionsBreakDown,
  } = transaction;
  return new TransactionEntity({
    id,
    ledgerId,
    status,
    entryType,
    categoryId,
    groupId: groupId ?? undefined,
    transactionDate: transactionDate,
    paymentMonth: paymentMonth ?? undefined,
    installments,
    installment,
    comment: comment ?? undefined,
    currency,
    type,
    monthlyAmount: Number(monthlyAmount),
    debtOwnerId: debtOwnerId ? debtOwnerId : undefined,
    category: categoryToEntity(category),
    group: group ? groupToEntity(group) : undefined,
    transactionsBreakDown:
      transactionsBreakDown?.map(transactionBreakDownToEntity) ?? [],
  });
};

export const transactionEntityToResponseDto = (
  transaction: TransactionEntity,
): TransactionResponseDto => {
  const {
    id,
    ledgerId,
    status,
    entryType,
    categoryId,
    category,
    groupId,
    transactionDate,
    paymentMonth,
    installments,
    installment,
    comment,
    currency,
    type,
    monthlyAmount,
    debtOwnerId,
    transactionsBreakDown,
  } = transaction;
  return new TransactionResponseDto({
    id,
    ledgerId,
    status,
    entryType,
    categoryId,
    category: categoryEntityToResponseDto(category),
    groupId,
    transactionDate: transactionDate.toISOString(),
    paymentMonth: paymentMonth ? paymentMonth.toISOString() : undefined,
    installments,
    installment,
    comment: comment ?? undefined,
    currency,
    type,
    monthlyAmount,
    debtOwnerId,
    transactionsBreakDown: transactionBdArrayToArrayDto(transactionsBreakDown),
  });
};

export const transactionArrayToArrayDto = (
  transactionArray: TransactionEntity[],
): TransactionResponseDto[] => {
  return transactionArray.map(transactionEntityToResponseDto);
};
