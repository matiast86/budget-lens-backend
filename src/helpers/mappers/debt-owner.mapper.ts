import { DebtOwnerResponseDto } from 'src/modules/debt-owners/dto/debt-owner-response.dto';
import { DebtOwnerWithDebts } from 'src/types/entities/debt.types';

export const debtOwnerToResponseDto = (
  debtOwner: DebtOwnerWithDebts,
): DebtOwnerResponseDto => {
  const { id, name, debts } = debtOwner;
  return new DebtOwnerResponseDto({ id, name, debts });
};

export const debtOwnerArrayToArrayDto = (
  debtOwnerArray: DebtOwnerWithDebts[],
): DebtOwnerResponseDto[] => {
  return debtOwnerArray.map(debtOwnerToResponseDto);
};
