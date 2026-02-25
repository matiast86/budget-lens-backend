import { ApiProperty } from '@nestjs/swagger';

export class DebtPeriodAmountDto {
  @ApiProperty({
    description: 'Period in YYYY-MM format.',
    example: '2026-01',
  })
  period: string;

  @ApiProperty({
    description:
      'Net debt amount for this period. Positive = owed to me (OWED_TO_ME), negative = owed by me (OWED_BY_ME). When an owner has debts in both directions, this is the net sum.',
    example: -50000,
  })
  amount: number;

  constructor(partial: Partial<DebtPeriodAmountDto>) {
    Object.assign(this, partial);
  }
}
