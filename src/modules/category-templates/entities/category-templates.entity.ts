import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryScope } from 'prisma/generated/prisma/enums';
import { CategoryEntity } from 'src/modules/categories/entities/category.entity';

export class CategoryTemplatesEntity {
  @ApiProperty({
    description: 'Unique numeric ID of the category template.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Canonical name of the template.',
    example: 'Utilities',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Optional description providing details about this template.',
    example: 'Electricity, water, gas, internet, etc.',
  })
  description?: string;

  @ApiProperty({
    enum: CategoryScope,
    description: 'Scope of the template (e.g., global).',
    example: CategoryScope.GLOBAL,
  })
  scope: CategoryScope;

  @ApiPropertyOptional({
    type: () => CategoryEntity,
    isArray: true,
    description: 'Ledger categories created from this template.',
  })
  categories?: CategoryEntity[];
}
