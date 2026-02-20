import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'prisma/generated/prisma/enums';

export class CashflowMetaDto {
  @ApiProperty({
    description:
      'Ordered list of periods (YYYY-MM) covered by this report. All amount arrays use this as their positional index.',
    example: ['2025-09', '2025-10', '2025-11', '2025-12', '2026-01'],
    isArray: true,
    type: String,
  })
  periods: string[];

  @ApiProperty({
    description:
      'Current week of the month (1–4) at the time this report was generated. Used to compute balance for the CURRENT period.',
    example: 3,
    minimum: 1,
    maximum: 4,
  })
  currentWeek: number;

  @ApiProperty({
    enum: Currency,
    description: 'Currency of all amounts in this report.',
    example: Currency.ARS,
  })
  currency: Currency;

  @ApiProperty({
    description: 'Start of the requested period range (YYYY-MM).',
    example: '2025-09',
  })
  from: string;

  @ApiProperty({
    description: 'End of the requested period range (YYYY-MM).',
    example: '2026-01',
  })
  to: string;

  constructor(partial: Partial<CashflowMetaDto>) {
    Object.assign(this, partial);
  }
}
