import { TransactionBreakDownResponseDto } from 'src/modules/transactions-break-down/dto/transaction-break-down-response.dto';
import { TransactionBreakDownMinimal } from 'src/types/entities/entities-with-relations';

export const transactionBdToResponseDto = (
  tbd: TransactionBreakDownMinimal,
): TransactionBreakDownResponseDto => {
  const { id, transactionId, weekNumber, amount } = tbd;
  return new TransactionBreakDownResponseDto({
    id,
    transactionId,
    weekNumber,
    amount: Number(amount),
  });
};

export const transactionBdArrayToArrayDto = (
  tbdArray: TransactionBreakDownMinimal[],
): TransactionBreakDownResponseDto[] => {
  return tbdArray ? tbdArray.map(transactionBdToResponseDto) : [];
};
