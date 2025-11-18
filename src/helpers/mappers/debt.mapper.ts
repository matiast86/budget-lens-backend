import { DebtEntity } from 'src/modules/debts/entities/debt.entity';
import { DebtWithRelations } from 'src/types/entities/entities-with-relations';

export const debtToEntity = (debt: DebtWithRelations) => {};

export const debtEntityToResponseDto = (debt: DebtEntity) => {};

export const debtArrayToArrayDto = (debtArray: DebtEntity[]) => {};
