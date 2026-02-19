import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'prisma/generated/prisma/client';

export class DebtReportMetaDto {
  @ApiProperty({
    description:
      'Ordered list of periods (YYYY-MM) covered by this report. All amount arrays use this as their positional index.',
    example: ['2026-01', '2026-02', '2026-03'],
    isArray: true,
    type: String,
  })
  periods: string[];

  @ApiProperty({
    description: 'Start of the requested period range (YYYY-MM).',
    example: '2026-01',
  })
  from: string;

  @ApiProperty({
    description: 'End of the requested period range (YYYY-MM).',
    example: '2026-06',
  })
  to: string;

  @ApiProperty({
    enum: Currency,
    description: 'Currency of all amounts in this report.',
    example: Currency.ARS,
  })
  currency: Currency;

  constructor(partial: Partial<DebtReportMetaDto>) {
    Object.assign(this, partial);
  }
}
