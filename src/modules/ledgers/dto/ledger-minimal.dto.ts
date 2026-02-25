import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'prisma/generated/prisma/enums';

export class LedgerMinimalDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: Currency,
    description: 'Default currency for this ledger.',
    example: Currency.ARS,
  })
  currency: Currency;

  @ApiProperty({
    description:
      'CPI index at ledger creation, used as base for inflation-adjusted amounts.',
    example: 253.6538,
  })
  baseCpiIndex: number;

  constructor(partial: Partial<LedgerMinimalDto>) {
    Object.assign(this, partial);
  }
}
