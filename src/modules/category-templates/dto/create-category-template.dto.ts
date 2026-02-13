import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryTemplateDto {
  @ApiProperty({
    description: 'Unique name of the category template.',
    example: 'Utilities',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Optional description providing details about this template.',
    example: 'Includes water, gas, and electricity bills.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
