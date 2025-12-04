import { Debt } from '@prisma/client';
import { DebtResponseDto } from 'src/modules/debts/dto/debt-response.dto';
import { periodMapper } from '../dates';

export const debtToResponseDto = (debt: Debt): DebtResponseDto => {
  const { id, debtOwnerId, direction, amount, period } = debt;
  return new DebtResponseDto({
    id,
    debtOwnerId,
    direction,
    amount,
    period: periodMapper(period),
  });
};

export const debtArrayToArrayDto = (debtArray: Debt[]): DebtResponseDto[] => {
  return debtArray.map(debtToResponseDto);
};
