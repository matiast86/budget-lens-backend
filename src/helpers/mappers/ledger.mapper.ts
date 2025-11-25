import { LedgerResponseDto } from 'src/modules/ledgers/dto/ledger-response.dto';
import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';
import { LedgerWithRelations } from 'src/types/entities/entities-with-relations';
import {
  collaborationArrayToArrayDto,
  collaborationToEntity,
} from './collaboration.mapper';
import { groupArrayToArrayDto, groupToEntity } from './group.mapper';
import {
  paymentMethodArrayToArrayDto,
  paymentMethodToEntity,
} from './payment-method.mapper';
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
    paymentMethods,
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
    paymentMethods:
      paymentMethods?.map((pm) => paymentMethodToEntity(pm.paymentMethod)) ??
      [],
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
    paymentMethods,
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
    paymentMethods: paymentMethodArrayToArrayDto(paymentMethods),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
};

export const ledgerArrayToArrayDto = (
  entityArray: LedgerEntity[],
): LedgerResponseDto[] => {
  return entityArray.map(ledgerEntityToResponseDto);
};
