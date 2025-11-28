import { LedgerResponseDto } from 'src/modules/ledgers/dto/ledger-response.dto';
import { LedgerWithRelations } from 'src/types/entities/entities-with-relations';
import { collaborationArrayToArrayDto } from './collaboration.mapper';
import { groupArrayToArrayDto } from './group.mapper';
import { paymentMethodArrayToArrayDto } from './payment-method.mapper';
import { transactionArrayToArrayDto } from './transaction.mapper';

export const ledgerToResponseDto = (
  ledger: LedgerWithRelations,
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
    description: description ?? undefined,
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
  entityArray: LedgerWithRelations[],
): LedgerResponseDto[] => {
  return entityArray ? entityArray.map(ledgerToResponseDto) : [];
};
