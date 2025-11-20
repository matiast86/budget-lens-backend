import { TransactionBreakDownResponseDto } from 'src/modules/transactions-break-down/dto/transaction-break-down-response.dto';
import { TransactionsBreakDownEntity } from 'src/modules/transactions-break-down/entities/transactions-break-down.entity';
import { TransactionBreakDownMinimal } from 'src/types/entities/entities-with-relations';

export const transactionBreakDownToEntity = (
  tbd: TransactionBreakDownMinimal,
): TransactionsBreakDownEntity => {
  const { id, transactionId, weekNumber, amount } = tbd;

  return new TransactionsBreakDownEntity({
    id,
    transactionId,
    weekNumber,
    amount: Number(amount),
  });
};

export const transactionBdToResponseDto = (
  tbd: TransactionsBreakDownEntity,
): TransactionBreakDownResponseDto => {
  const { id, transactionId, weekNumber, amount } = tbd;
  return new TransactionBreakDownResponseDto({
    id,
    transactionId,
    weekNumber,
    amount,
  });
};

export const transactionBdArrayToArrayDto = (
  tbdArray: TransactionsBreakDownEntity[],
): TransactionBreakDownResponseDto[] => {
  return tbdArray.map(transactionBdToResponseDto);
};
