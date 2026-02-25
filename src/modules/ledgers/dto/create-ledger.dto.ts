import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @ApiProperty({
    enum: Currency,
    description: 'Default currency for this ledger.',
    example: Currency.ARS,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiPropertyOptional({
    description:
      'Short description to help identify the purpose of this ledger.',
    example: 'Tracks monthly family expenses and shared utilities.',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
