import { DebtOwnerResponseDto } from 'src/modules/debt-owners/dto/debt-owner-response.dto';
import { DebtOwnerEntity } from 'src/modules/debt-owners/entities/debt-owner.entity';
import { DebtOwnerMinimal } from 'src/types/entities/entities-with-relations';

export const debtOwnerToEntity = (
  debtOwner: DebtOwnerMinimal,
): DebtOwnerEntity => {
  const { id, name } = debtOwner;
  return new DebtOwnerEntity({ id, name });
};

export const debtOwnerEntityToResponseDto = (
  debtOwnerEntity: DebtOwnerEntity,
): DebtOwnerResponseDto => {
  const { id, name } = debtOwnerEntity;
  return new DebtOwnerResponseDto({ id, name });
};

export const debtOwnerArrayToArrayDto = (
  debtOwnerArray: DebtOwnerEntity[],
): DebtOwnerResponseDto[] => {
  return debtOwnerArray.map(debtOwnerEntityToResponseDto);
};
