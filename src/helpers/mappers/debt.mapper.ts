import { DebtResponseDto } from 'src/modules/debts/dto/debt-response.dto';
import { DebtWithSplit } from 'src/types/entities/debt.types';
import { periodMapper } from '../dates';

export const debtToResponseDto = (debt: DebtWithSplit): DebtResponseDto => {
  const {
    debt: debtRecord,
    debtOwner,
    debtOwnerId,
    transactionId,
    direction,
    amount,
  } = debt;
  return new DebtResponseDto({
    id: debtRecord.id,
    debtOwnerId,
    debtOwnerName: debtOwner?.name,
    transactionId,
    direction,
    amount: Number(amount),
    period: periodMapper(debtRecord.period),
    description: debtRecord.description ?? undefined,
  });
};

export const debtArrayToArrayDto = (
  debtArray: DebtWithSplit[],
): DebtResponseDto[] => {
  return debtArray.map(debtToResponseDto);
};
