import { DebtResponseDto } from 'src/modules/debts/dto/debt-response.dto';
import { DebtEntity } from 'src/modules/debts/entities/debt.entity';
import { DebtWithRelations } from 'src/types/entities/entities-with-relations';

export const debtToEntity = (debt: DebtWithRelations): DebtEntity => {
  const { id, debtOwnerId, direction, amount, month } = debt;
  return new DebtEntity({ id, debtOwnerId, direction, amount, month });
};

export const debtEntityToResponseDto = (debt: DebtEntity): DebtResponseDto => {
  const { id, debtOwnerId, direction, amount, month } = debt;
  return new DebtResponseDto({
    id,
    debtOwnerId,
    direction,
    amount,
    month: month.toISOString(),
  });
};

export const debtArrayToArrayDto = (
  debtArray: DebtEntity[],
): DebtResponseDto[] => {
  return debtArray.map(debtEntityToResponseDto);
};
