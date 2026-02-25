import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DebtPeriodAmountDto } from './debt-period-amount.dto';

export class DebtDetailDto {
  @ApiPropertyOptional({
    description:
      'User-defined label for this debt. Multiple independent debt records sharing the same description (e.g. a recurring phone bill) are grouped into a single row. Null if no description was provided.',
    example: 'Celular Sofi',
  })
  description: string;

  @ApiProperty({
    type: () => DebtPeriodAmountDto,
    isArray: true,
    description:
      'Signed amount per period for this debt group. Ordered to match meta.periods by index. Zero for periods where this debt has no records.',
  })
  amounts: DebtPeriodAmountDto[];

  constructor(partial: Partial<DebtDetailDto>) {
    Object.assign(this, partial);
  }
}
