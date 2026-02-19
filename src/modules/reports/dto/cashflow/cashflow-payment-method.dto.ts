import { ApiProperty } from '@nestjs/swagger';
import { CashflowGroupDto } from './cashflow-group.dto';
import { CashflowPeriodAmountDto } from './cashflow-period-amount.dto';

export class CashflowPaymentMethodDto {
  @ApiProperty({
    description: 'Unique numeric ID of the payment method.',
    example: 7,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the payment method.',
    example: 'VISA GAL',
  })
  name: string;

  @ApiProperty({
    type: () => CashflowPeriodAmountDto,
    isArray: true,
    description:
      'Aggregated totals per period across all groups under this payment method. Ordered to match meta.periods by index.',
  })
  total: CashflowPeriodAmountDto[];

  @ApiProperty({
    type: () => CashflowGroupDto,
    isArray: true,
    description: 'Per-group breakdown under this payment method.',
  })
  groups: CashflowGroupDto[];

  constructor(partial: Partial<CashflowPaymentMethodDto>) {
    Object.assign(this, partial);
  }
}
