import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Currency } from 'prisma/generated/prisma/enums';

export class CreateInflationIndexDto {
  @ApiProperty({
    enum: Currency,
    description: 'Currency this inflation index applies to.',
    example: Currency.ARS,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    description:
      'The month this inflation data represents (ISO 8601 date, first day of month).',
    example: '2026-02-01T00:00:00.000Z',
  })
  @IsDateString()
  period: Date;

  @ApiProperty({
    description:
      'Monthly inflation rate as a decimal (e.g., 0.206 = 20.6% inflation).',
    example: 0.02,
    minimum: -1.0,
    maximum: 10.0,
  })
  @IsNumber()
  @Min(-1.0) // Allow deflation (negative inflation)
  @Max(10.0) // Cap at 1000% monthly inflation (extreme edge case)
  monthlyRate: number;

  @ApiProperty({
    description:
      'Cumulative Consumer Price Index with base 100 = January 2024.',
    example: 550.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01) // CPI must be positive
  cpiIndex: number;

  constructor(partial: Partial<CreateInflationIndexDto>) {
    Object.assign(this, partial);
  }
}
