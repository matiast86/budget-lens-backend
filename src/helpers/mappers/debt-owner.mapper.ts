import { DebtOwnerResponseDto } from 'src/modules/debt-owners/dto/debt-owner-response.dto';
import { DebtOwnerWithDebts } from 'src/types/entities/debt.types';
import { debtToResponseDto } from './debt.mapper';

export const debtOwnerToResponseDto = (
  debtOwner: DebtOwnerWithDebts,
): DebtOwnerResponseDto => {
  const { id, name, debts, ledgerId } = debtOwner;
  return new DebtOwnerResponseDto({
    id,
    name,
    ledgerId,
    debts: debts ? debts.map(debtToResponseDto) : [],
  });
};

export const debtOwnerArrayToArrayDto = (
  debtOwnerArray: DebtOwnerWithDebts[],
): DebtOwnerResponseDto[] => {
  return debtOwnerArray.map(debtOwnerToResponseDto);
};
