import { ApiProperty } from '@nestjs/swagger';
import { CashflowPeriodAmountDto } from './cashflow-period-amount.dto';

export class CashflowGroupDto {
  @ApiProperty({
    description: 'Unique numeric ID of the group.',
    example: 3,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the group.',
    example: 'Hogar',
  })
  name: string;

  @ApiProperty({
    type: () => CashflowPeriodAmountDto,
    isArray: true,
    description:
      'Amounts per period for this group. Ordered to match meta.periods by index.',
  })
  amounts: CashflowPeriodAmountDto[];

  constructor(partial: Partial<CashflowGroupDto>) {
    Object.assign(this, partial);
  }
}
