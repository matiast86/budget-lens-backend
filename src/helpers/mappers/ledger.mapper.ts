import { LedgerDashboardResponseDto } from 'src/modules/ledgers/dto/ledger-dashboard-response.dto';
import { LedgerResponseDto } from 'src/modules/ledgers/dto/ledger-response.dto';
import {
  LedgerDashboardView,
  LedgerDetailView,
} from 'src/types/entities/ledger.types';
import { collaborationArrayToArrayDto } from './collaboration.mapper';
import { groupArrayToArrayDto } from './group.mapper';
import { paymentMethodArrayToArrayDto } from './payment-method.mapper';
import { transactionArrayToArrayDto } from './transaction.mapper';

export const ledgerToDetailsResponseDto = (
  ledger: LedgerDetailView,
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
    paymentMethods: paymentMethodArrayToArrayDto(
      paymentMethods.map((pm) => pm.paymentMethod),
    ),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
};

export const ledgerArrayToArrayDto = (
  entityArray: LedgerDetailView[],
): LedgerResponseDto[] => {
  return entityArray ? entityArray.map(ledgerToDetailsResponseDto) : [];
};

export const ledgerToDashboardView = (
  ledger: LedgerDashboardView,
): LedgerDashboardResponseDto => {
  const { id, name, description, createdAt, updatedAt } = ledger;
  return new LedgerDashboardResponseDto({
    id,
    name,
    description: description ?? undefined,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  });
};

export const ledgerDashboardArrayToArrayDto = (
  entityArray: LedgerDashboardView[],
): LedgerDashboardResponseDto[] => {
  return entityArray ? entityArray.map(ledgerToDashboardView) : [];
};
