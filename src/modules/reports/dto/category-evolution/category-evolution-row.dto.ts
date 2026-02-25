import { ApiProperty } from '@nestjs/swagger';
import { CategoryEvolutionPeriodDto } from './category-evolution-period.dto';

export class CategoryEvolutionRowDto {
  @ApiProperty({
    description: 'Unique numeric ID of the category.',
    example: 5,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the category.',
    example: 'Gastos de la casa',
  })
  name: string;

  @ApiProperty({
    type: () => CategoryEvolutionPeriodDto,
    isArray: true,
    description:
      'Nominal amount, CPI-adjusted real amount, and percentage share per period. Ordered to match meta.periods by index.',
  })
  amounts: CategoryEvolutionPeriodDto[];

  constructor(partial: Partial<CategoryEvolutionRowDto>) {
    Object.assign(this, partial);
  }
}
