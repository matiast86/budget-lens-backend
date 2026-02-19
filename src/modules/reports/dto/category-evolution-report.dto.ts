import { ApiProperty } from '@nestjs/swagger';
import { CategoryEvolutionMetaDto } from './category-evolution/category-evolution-meta.dto';
import { CategoryEvolutionRowDto } from './category-evolution/category-evolution-row.dto';
import { CategoryTotalPeriodDto } from './category-evolution/category-total-period.dto';

export class CategoryEvolutionReportDto {
  @ApiProperty({
    type: () => CategoryEvolutionMetaDto,
    description: 'Report metadata: period range and currency.',
  })
  meta: CategoryEvolutionMetaDto;

  @ApiProperty({
    type: () => CategoryEvolutionRowDto,
    isArray: true,
    description:
      'Per-category breakdown. Each row contains nominal amounts, CPI-adjusted real amounts, and percentage share per period.',
  })
  categories: CategoryEvolutionRowDto[];

  @ApiProperty({
    type: () => CategoryTotalPeriodDto,
    isArray: true,
    description:
      'Total nominal and real amounts across all categories per period. Corresponds to the "Total Inicial Mes" row. Ordered to match meta.periods by index.',
  })
  totalPerPeriod: CategoryTotalPeriodDto[];

  constructor(partial: Partial<CategoryEvolutionReportDto>) {
    Object.assign(this, partial);
  }
}
