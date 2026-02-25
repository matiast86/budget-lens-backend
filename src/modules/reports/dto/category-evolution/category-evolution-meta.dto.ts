import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'prisma/generated/prisma/client';

export class CategoryEvolutionMetaDto {
  @ApiProperty({
    description:
      'Ordered list of periods (YYYY-MM) covered by this report. All amount arrays use this as their positional index.',
    example: ['2025-07', '2025-08', '2025-09', '2025-10'],
    isArray: true,
    type: String,
  })
  periods: string[];

  @ApiProperty({
    description: 'Start of the requested period range (YYYY-MM).',
    example: '2025-07',
  })
  from: string;

  @ApiProperty({
    description: 'End of the requested period range (YYYY-MM).',
    example: '2026-02',
  })
  to: string;

  @ApiProperty({
    enum: Currency,
    description: 'Currency of all nominal and real amounts in this report.',
    example: Currency.ARS,
  })
  currency: Currency;

  constructor(partial: Partial<CategoryEvolutionMetaDto>) {
    Object.assign(this, partial);
  }
}
