import { DebtOwner } from 'prisma/generated/prisma/client';
import { DebtOwnerResponseDto } from 'src/modules/debt-owners/dto/debt-owner-response.dto';
import { TransactionDebtOwnerResponseDto } from 'src/modules/transactions/dto/transaction-debt-owner-response.dto';
import { DebtOwnerWithTransactions } from 'src/types/entities/debt.types';
import { debtToResponseDto } from './debt.mapper';

export const debtOwnerToResponseDto = (
  debtOwner: DebtOwnerWithTransactions,
): DebtOwnerResponseDto => {
  const { id, name, ledgerId, transactions } = debtOwner;
  return new DebtOwnerResponseDto({
    id,
    name,
    ledgerId,
    transactions: transactions.map(
      (tdo) =>
        new TransactionDebtOwnerResponseDto({
          transactionId: tdo.transactionId,
          debtOwnerId: tdo.debtOwnerId,
          debtOwnerName: name,
          amount: Number(tdo.amount),
          direction: tdo.direction,
          debt: debtToResponseDto(tdo.debt),
        }),
    ),
  });
};

export const debtOwnerArrayToArrayDto = (
  debtOwnerArray: DebtOwnerWithTransactions[],
): DebtOwnerResponseDto[] => {
  return debtOwnerArray.map(debtOwnerToResponseDto);
};

export const minimumOwnerToResponseDto = (
  debtOwner: DebtOwner,
): DebtOwnerResponseDto => {
  const { id, name, ledgerId } = debtOwner;
  return new DebtOwnerResponseDto({ id, name, ledgerId });
};
