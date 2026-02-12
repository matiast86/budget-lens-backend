import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Currency } from 'prisma/generated/prisma/enums';
import { DebtAssignmentDto } from './debt-assignment.dto';

export class CreateTransactionDto {
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

  @ApiPropertyOptional({
    type: [DebtAssignmentDto],
    description:
      'Debt assignments linking this transaction to one or more debt owners.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DebtAssignmentDto)
  debtAssignments: DebtAssignmentDto[] = [];

  @ApiProperty({
    description: 'Date the transaction occurred (ISO 8601).',
    example: '2025-02-01T00:00:00.000Z',
  })
  @IsDateString()
  transactionDate: string;

  @ApiPropertyOptional({
    description:
      'Month this transaction belongs to; defaults to transactionDate when omitted.',
    example: '2025-02-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  paymentMonthValue?: string;

  @ApiPropertyOptional({
    description: 'Number of total installments; defaults to 1.',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  installments?: number;

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

  @ApiProperty({
    description:
      'Week number of the breakdown (1-4) when the transaction is for current month.',
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  weekNumber?: number;

  @ApiPropertyOptional({
    description:
      'Whether this transaction impacts cashflow analysis. For credit cards: set to false for unbilled charges. Defaults to true for non-CC, false for CC.',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  impactsCashflow?: boolean;

  constructor(partial: Partial<CreateTransactionDto>) {
    Object.assign(this, partial);
  }
}
