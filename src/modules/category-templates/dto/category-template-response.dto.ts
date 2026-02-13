import { ApiProperty } from '@nestjs/swagger';
import { CategoryScope } from 'prisma/generated/prisma/enums';

export class CategoryTemplateResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the category template.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the category template.',
    example: 'Utilities',
  })
  name: string;

  @ApiProperty({
    description: 'Optional description of the category template.',
    example: 'Includes water, gas, and electricity bills.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    enum: CategoryScope,
    description: 'Scope of the category template.',
    example: CategoryScope.GLOBAL,
  })
  scope: CategoryScope;

  constructor(partial: {
    id: number;
    name: string;
    description: string | null;
    scope: CategoryScope;
  }) {
    this.id = partial.id;
    this.name = partial.name;
    this.description = partial.description ?? undefined;
    this.scope = partial.scope;
  }
}