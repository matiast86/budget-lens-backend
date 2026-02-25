import { ApiProperty } from '@nestjs/swagger';
import { CashflowCategoryDto } from './cashflow-category.dto';
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
      'Aggregated totals per period across all categories under this payment method. Ordered to match meta.periods by index.',
  })
  total: CashflowPeriodAmountDto[];

  @ApiProperty({
    type: () => CashflowCategoryDto,
    isArray: true,
    description: 'Per-category breakdown under this payment method.',
  })
  categories: CashflowCategoryDto[];

  constructor(partial: Partial<CashflowPaymentMethodDto>) {
    Object.assign(this, partial);
  }
}
