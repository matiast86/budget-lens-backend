import { SetMetadata } from '@nestjs/common';

export const LedgerFrom = (
  type: 'group' | 'debtOwner' | 'ledger' | 'collaboration' | 'debt',
  param = 'id',
) => SetMetadata('ledgerFrom', { type, param });
