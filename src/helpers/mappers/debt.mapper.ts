import { Debt } from '@prisma/client';
import { DebtResponseDto } from 'src/modules/debts/dto/debt-response.dto';

export const debtToResponseDto = (debt: Debt): DebtResponseDto => {
  const { id, debtOwnerId, direction, amount, month } = debt;
  return new DebtResponseDto({
    id,
    debtOwnerId,
    direction,
    amount,
    month: month.toISOString(),
  });
};

export const debtArrayToArrayDto = (debtArray: Debt[]): DebtResponseDto[] => {
  return debtArray.map(debtToResponseDto);
};
