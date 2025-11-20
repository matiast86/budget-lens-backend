import { DebtResponseDto } from 'src/modules/debts/dto/debt-response.dto';
import { DebtEntity } from 'src/modules/debts/entities/debt.entity';
import { DebtWithRelations } from 'src/types/entities/entities-with-relations';
import {
  debtOwnerEntityToResponseDto,
  debtOwnerToEntity,
} from './debt-owner.mapper';

export const debtToEntity = (debt: DebtWithRelations): DebtEntity => {
  const { id, debtOwnerId, direction, amount, month, owner } = debt;
  return new DebtEntity({
    id,
    debtOwnerId,
    direction,
    amount,
    month,
    owner: debtOwnerToEntity(owner),
  });
};

export const debtEntityToResponseDto = (debt: DebtEntity): DebtResponseDto => {
  const { id, debtOwnerId, direction, amount, month, owner } = debt;
  return new DebtResponseDto({
    id,
    debtOwnerId,
    direction,
    amount,
    month: month.toISOString(),
    owner: debtOwnerEntityToResponseDto(owner),
  });
};

export const debtArrayToArrayDto = (
  debtArray: DebtEntity[],
): DebtResponseDto[] => {
  return debtArray.map(debtEntityToResponseDto);
};
