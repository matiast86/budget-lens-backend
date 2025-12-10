import { SetMetadata } from '@nestjs/common';

export const LedgerFrom = (type: 'group' | 'debtOwner', param = 'id') =>
  SetMetadata('ledgerFrom', { type, param });
