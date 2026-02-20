import { ApiProperty } from '@nestjs/swagger';

export class CashflowPeriodAmountDto {
  @ApiProperty({
    description: 'Period in YYYY-MM format.',
    example: '2025-09',
  })
  period: string;

  @ApiProperty({
    description:
      'Sum of monthlyAmount for all matching transactions in this period. Represents the full planned amount at the start of the month.',
    example: 150000,
  })
  planned: number;

  @ApiProperty({
    description:
      'Remaining amount from the current week onwards (CURRENT month), 0 for CLOSED months, or equal to inicialMes for FUTURE months.',
    example: 95000,
  })
  balance: number;

  constructor(partial: Partial<CashflowPeriodAmountDto>) {
    Object.assign(this, partial);
  }
}
