import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Currency } from 'prisma/generated/prisma/enums';

export class CreateLedgerDto {
  @ApiProperty({
    description:
      'Name of the ledger, usually representing a shared or personal account.',
    example: 'Home Budget 2025',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  currency: Currency;

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
