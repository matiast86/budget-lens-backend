import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Currency } from 'prisma/generated/prisma/enums';

export class CreateIncomeDto {
  @ApiProperty({
    description: 'ID of the selected category.',
    example: 3,
  })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({
    description: 'ID of the selected group.',
    example: 78,
  })
  @IsInt()
  @Min(1)
  groupId: number;

  @ApiProperty({
    description: "ID of the transaction's payment method.",
    example: 2,
  })
  @IsInt()
  @Min(1)
  paymentMethodId: number;

  @ApiProperty({
    description: 'Date the transaction occurred (ISO 8601).',
    example: '2025-02-01T00:00:00.000Z',
  })
  @IsDateString()
  transactionDate: Date;

  @ApiPropertyOptional({
    description:
      'Month this transaction belongs to; defaults to transactionDate when omitted.',
    example: '2025-02-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  paymentMonthValue?: Date;

  @ApiPropertyOptional({
    description: 'Optional comment or note related to this transaction.',
    example: 'Shared dinner with family, reimbursed by Ana.',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    enum: Currency,
    description: 'Currency of the transaction amount.',
    example: Currency.ARS,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiPropertyOptional({
    description: 'Exchange rate used when currency differs from ledger.',
    example: 950.5,
  })
  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @ApiProperty({
    description: 'Total transaction amount.',
    example: 27500.5,
  })
  @IsNumber()
  @Min(0)
  totalProvidedAmount: number;

  @ApiPropertyOptional({
    description:
      'Whether this income transaction impacts cashflow analysis. Defaults to true.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  impactsCashflow?: boolean;

  constructor(partial: Partial<CreateIncomeDto>) {
    Object.assign(this, partial);
  }
}
