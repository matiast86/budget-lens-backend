import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryTotalPeriodDto {
  @ApiProperty({
    description: 'Period in YYYY-MM format.',
    example: '2025-09',
  })
  period: string;

  @ApiProperty({
    description:
      'Sum of nominalAmount across all categories for this period. Corresponds to the "Total Inicial Mes" row.',
    example: -2842864,
  })
  totalNominalAmount: number;

  @ApiPropertyOptional({
    description:
      'Sum of realAmount across all categories for this period. Null when no inflation index data is available for the period.',
    example: -1950000,
  })
  totalRealAmount: number | null;

  constructor(partial: Partial<CategoryTotalPeriodDto>) {
    Object.assign(this, partial);
  }
}
