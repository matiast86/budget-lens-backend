import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { TransactionWithRelations } from 'src/types/entities/entities-with-relations';

export const transactionToEntity = (
  transaction: TransactionWithRelations,
) => {};

export const transactionEntityToResponseDto = (
  transaction: TransactionEntity,
) => {};

export const transactionArrayToArrayDto = (
  transactionArray: TransactionEntity[],
) => {};
