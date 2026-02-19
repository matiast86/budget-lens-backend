import { ApiProperty } from '@nestjs/swagger';
import { DebtDetailDto } from './debt-detail.dto';
import { DebtPeriodAmountDto } from './debt-period-amount.dto';

export class DebtOwnerReportDto {
  @ApiProperty({
    description: 'Unique numeric ID of the debt owner.',
    example: 4,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the debt owner.',
    example: 'Sofi',
  })
  name: string;

  @ApiProperty({
    type: () => DebtPeriodAmountDto,
    isArray: true,
    description:
      'Net signed total per period for this owner across all their debts. Ordered to match meta.periods by index. Used for the collapsed row view.',
  })
  total: DebtPeriodAmountDto[];

  @ApiProperty({
    type: () => DebtDetailDto,
    isArray: true,
    description:
      'Per-description debt breakdown for this owner. Used for the expanded row view. Each entry groups all debt records sharing the same description.',
  })
  debts: DebtDetailDto[];

  constructor(partial: Partial<DebtOwnerReportDto>) {
    Object.assign(this, partial);
  }
}
