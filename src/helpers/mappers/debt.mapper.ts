import { DebtResponseDto } from 'src/modules/debts/dto/debt-response.dto';
import { DebtWithRelations } from 'src/types/entities/entities-with-relations';
import { debtOwnerToResponseDto } from './debt-owner.mapper';

export const debtToResponseDto = (debt: DebtWithRelations): DebtResponseDto => {
  const { id, debtOwnerId, direction, amount, month, owner } = debt;
  return new DebtResponseDto({
    id,
    debtOwnerId,
    direction,
    amount,
    month: month.toISOString(),
    owner: debtOwnerToResponseDto(owner),
  });
};

export const debtArrayToArrayDto = (
  debtArray: DebtWithRelations[],
): DebtResponseDto[] => {
  return debtArray.map(debtToResponseDto);
};
