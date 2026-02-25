import { ApiProperty } from '@nestjs/swagger';
import { DebtOwnerReportDto } from './debt/debt-owner-report.dto';
import { DebtPeriodAmountDto } from './debt/debt-period-amount.dto';
import { DebtReportMetaDto } from './debt/debt-report-meta.dto';

export class DebtReportDto {
  @ApiProperty({
    type: () => DebtReportMetaDto,
    description: 'Report metadata: period range and currency.',
  })
  meta: DebtReportMetaDto;

  @ApiProperty({
    type: () => DebtOwnerReportDto,
    isArray: true,
    description:
      'Per-owner debt breakdown. Each owner exposes a collapsed total and an expanded per-description view.',
  })
  owners: DebtOwnerReportDto[];

  @ApiProperty({
    type: () => DebtPeriodAmountDto,
    isArray: true,
    description:
      'Net grand total per period across all owners. Ordered to match meta.periods by index.',
  })
  grandTotal: DebtPeriodAmountDto[];

  constructor(partial: Partial<DebtReportDto>) {
    Object.assign(this, partial);
  }
}
