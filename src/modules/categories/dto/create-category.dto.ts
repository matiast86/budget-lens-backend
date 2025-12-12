import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Unique name of the category.',
    example: 'Utilities',
  })
  name: string;

  @ApiProperty({
    description: 'Optional description providing details about this category.',
    example: 'Includes water, gas, and electricity bills.',
    required: false,
  })
  description?: string;

  constructor(partial: Partial<CreateCategoryDto>) {
    Object.assign(this, partial);
  }
}
