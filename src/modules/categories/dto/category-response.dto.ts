import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique numeric ID of the category.',
    example: 3,
  })
  id: number;

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

  @ApiProperty({
    description: 'Reference to the ledger this category belongs to.',
    example: 101,
    required: true,
  })
  ledgerId: number;

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}
