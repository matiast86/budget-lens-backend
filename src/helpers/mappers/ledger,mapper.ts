import { LedgerResponseDto } from 'src/modules/ledgers/dto/ledger-response.dto';
import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';
import { LedgerWithRelations } from 'src/types/entities/entities-with-relations';

export const ledgerToEntity = (
  ledger: LedgerWithRelations,
): Partial<LedgerEntity> => {
  const ledgerEntity: Partial<LedgerEntity> = {
    id: ledger.id,
    name: ledger.name,
    description: ledger.description ? ledger.description : undefined,
    ownerId: ledger.ownerId,
    createdAt: ledger.createdAt,
    updatedAt: ledger.updatedAt,
  };
  return ledgerEntity;
};

export const ledgerEntityToResponseDto = (
  ledger: LedgerEntity,
): Partial<LedgerResponseDto> => {
  const response: Partial<LedgerResponseDto> = {
    id: ledger.id,
    name: ledger.name,
    description: ledger.description,
    ownerId: ledger.ownerId,
  };
  return response;
};

export const ledgerArrayToArrayDto = (
  entityArray: LedgerEntity[],
): LedgerResponseDto[] => {
  const dtoArray: LedgerResponseDto[] = entityArray.map((l) =>
    ledgerEntityToResponseDto(l),
  );

  return dtoArray;
};
