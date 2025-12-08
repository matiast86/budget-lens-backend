import { TransactionBreakDown } from 'prisma/generated/prisma/client';
import { TransactionBreakDownResponseDto } from 'src/modules/transactions-break-down/dto/transaction-break-down-response.dto';

export const transactionBdToResponseDto = (
  tbd: TransactionBreakDown,
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
  tbdArray: TransactionBreakDown[],
): TransactionBreakDownResponseDto[] => {
  return tbdArray ? tbdArray.map(transactionBdToResponseDto) : [];
};
