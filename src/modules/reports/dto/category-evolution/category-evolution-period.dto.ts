import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryEvolutionPeriodDto {
  @ApiProperty({
    description: 'Period in YYYY-MM format.',
    example: '2025-09',
  })
  period: string;

  @ApiProperty({
    description:
      'Sum of monthlyAmount for this category in this period. Negative for expenses, positive for income.',
    example: -1478910,
  })
  nominalAmount: number;

  @ApiPropertyOptional({
    description:
      'Sum of realMonthlyAmount (CPI-adjusted to ledger base index) for this category in this period. Null when no inflation index data is available for the period.',
    example: -980000,
  })
  realAmount: number | null;

  @ApiProperty({
    description:
      'Share of this category relative to the total nominal amount across all categories for this period. Value between 0 and 1 (e.g., 0.31 = 31%). Use for heat map intensity and percentage labels.',
    example: 0.52,
    minimum: 0,
    maximum: 1,
  })
  share: number;

  constructor(partial: Partial<CategoryEvolutionPeriodDto>) {
    Object.assign(this, partial);
  }
}
