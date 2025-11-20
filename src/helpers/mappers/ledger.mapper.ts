import { LedgerResponseDto } from 'src/modules/ledgers/dto/ledger-response.dto';
import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';
import { LedgerWithRelations } from 'src/types/entities/entities-with-relations';
import {
  collaborationArrayToArrayDto,
  collaborationToEntity,
} from './collaboration.mapper';
import { creditCardToEntity } from './credit-cards.mapper';
import { groupArrayToArrayDto, groupToEntity } from './group.mapper';
import {
  transactionArrayToArrayDto,
  transactionToEntity,
} from './transaction.mapper';

export const ledgerToEntity = (ledger: LedgerWithRelations): LedgerEntity => {
  const {
    id,
    name,
    description,
    ownerId,
    collaborations,
    groups,
    transactions,
    creditCards,
    createdAt,
    updatedAt,
  } = ledger;

  return new LedgerEntity({
    id,
    name,
    description: description ? description : undefined,
    ownerId,
    collaborations: collaborations?.map(collaborationToEntity) ?? [],
    groups: groups?.map(groupToEntity) ?? [],
    transactions: transactions?.map(transactionToEntity) ?? [],
    creditCards: creditCards?.map((cc) => creditCardToEntity(cc.creditCard)),
    createdAt,
    updatedAt,
  });
};

export const ledgerEntityToResponseDto = (
  ledger: LedgerEntity,
): LedgerResponseDto => {
  const {
    id,
    name,
    description,
    ownerId,
    collaborations,
    groups,
    transactions,
    creditCards,
    createdAt,
    updatedAt,
  } = ledger;
  return new LedgerResponseDto({
    id,
    name,
    description,
    ownerId,
    collaborations: collaborationArrayToArrayDto(collaborations),
    groups: groupArrayToArrayDto(groups),
    transactions: transactionArrayToArrayDto(transactions),
    creditCards,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
};

export const ledgerArrayToArrayDto = (
  entityArray: LedgerEntity[],
): LedgerResponseDto[] => {
  return entityArray.map(ledgerEntityToResponseDto);
};
