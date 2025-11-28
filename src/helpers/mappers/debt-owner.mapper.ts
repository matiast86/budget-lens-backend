import { DebtOwnerResponseDto } from 'src/modules/debt-owners/dto/debt-owner-response.dto';
import { DebtOwnerMinimal } from 'src/types/entities/entities-with-relations';

export const debtOwnerToResponseDto = (
  debtOwnerEntity: DebtOwnerMinimal,
): DebtOwnerResponseDto => {
  const { id, name } = debtOwnerEntity;
  return new DebtOwnerResponseDto({ id, name });
};

export const debtOwnerArrayToArrayDto = (
  debtOwnerArray: DebtOwnerMinimal[],
): DebtOwnerResponseDto[] => {
  return debtOwnerArray.map(debtOwnerToResponseDto);
};
