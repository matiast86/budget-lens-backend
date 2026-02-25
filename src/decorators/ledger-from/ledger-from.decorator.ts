import { SetMetadata } from '@nestjs/common';

export const LedgerFrom = (
  type:
    | 'group'
    | 'debtOwner'
    | 'ledger'
    | 'collaboration'
    | 'debt'
    | 'transaction'
    | 'category',
  param = 'id',
) => SetMetadata('ledgerFrom', { type, param });
