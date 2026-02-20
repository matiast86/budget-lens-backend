import { ApiProperty } from '@nestjs/swagger';
import { CashflowGroupDto } from './cashflow-group.dto';
import { CashflowPeriodAmountDto } from './cashflow-period-amount.dto';

export class CashflowCategoryDto {
  @ApiProperty({
    description: 'Unique numeric ID of the category.',
    example: 5,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the category.',
    example: 'Hogar',
  })
  name: string;

  @ApiProperty({
    type: () => CashflowPeriodAmountDto,
    isArray: true,
    description:
      'Aggregated totals per period across all groups under this category. Ordered to match meta.periods by index.',
  })
  total: CashflowPeriodAmountDto[];

  @ApiProperty({
    type: () => CashflowGroupDto,
    isArray: true,
    description: 'Per-group breakdown under this category.',
  })
  groups: CashflowGroupDto[];

  constructor(partial: Partial<CashflowCategoryDto>) {
    Object.assign(this, partial);
  }
}
