import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLedgerDto {
  @ApiProperty({
    description:
      'Name of the ledger, usually representing a shared or personal account.',
    example: 'Home Budget 2025',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description:
      'Short description to help identify the purpose of this ledger.',
    example: 'Tracks monthly family expenses and shared utilities.',
  })
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  description?: string;
}
