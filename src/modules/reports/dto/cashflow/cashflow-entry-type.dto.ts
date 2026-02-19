import { ApiProperty } from '@nestjs/swagger';
import { CashflowPaymentMethodDto } from './cashflow-payment-method.dto';
import { CashflowPeriodAmountDto } from './cashflow-period-amount.dto';

export class CashflowEntryTypeDto {
  @ApiProperty({
    type: () => CashflowPeriodAmountDto,
    isArray: true,
    description:
      'Aggregated totals per period for this entry type across all payment methods. Ordered to match meta.periods by index.',
  })
  total: CashflowPeriodAmountDto[];

  @ApiProperty({
    type: () => CashflowPaymentMethodDto,
    isArray: true,
    description: 'Per-payment-method breakdown for this entry type.',
  })
  paymentMethods: CashflowPaymentMethodDto[];

  constructor(partial: Partial<CashflowEntryTypeDto>) {
    Object.assign(this, partial);
  }
}
