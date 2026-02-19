import { ApiProperty } from '@nestjs/swagger';
import { CashflowEntryTypeDto } from './cashflow/cashflow-entry-type.dto';
import { CashflowMetaDto } from './cashflow/cashflow-meta.dto';
import { CashflowPeriodAmountDto } from './cashflow/cashflow-period-amount.dto';

export class CashflowReportDto {
  @ApiProperty({
    type: () => CashflowMetaDto,
    description: 'Report metadata: period range, current week, and currency.',
  })
  meta: CashflowMetaDto;

  @ApiProperty({
    type: () => CashflowEntryTypeDto,
    description: 'Income section: totals and per-payment-method breakdown.',
  })
  income: CashflowEntryTypeDto;

  @ApiProperty({
    type: () => CashflowEntryTypeDto,
    description: 'Expense section: totals and per-payment-method breakdown.',
  })
  expense: CashflowEntryTypeDto;

  @ApiProperty({
    type: () => CashflowPeriodAmountDto,
    isArray: true,
    description:
      'Net grand total per period (income + expense). Expense values are negative, so this represents the net balance. Ordered to match meta.periods by index.',
  })
  grandTotal: CashflowPeriodAmountDto[];

  constructor(partial: Partial<CashflowReportDto>) {
    Object.assign(this, partial);
  }
}
