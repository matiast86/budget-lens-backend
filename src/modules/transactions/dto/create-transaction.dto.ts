import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Currency, DebtDirection } from 'prisma/generated/prisma/enums';

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
    description: 'Optional reference to a debt owner for shared debt.',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  debtOwnerId?: number;

  @ApiPropertyOptional({
    description: 'Optional debt amount associated with this transaction.',
    example: 12000,
  })
  @IsOptional()
  @IsNumber()
  debtAmount?: number;

  @ApiPropertyOptional({
    enum: DebtDirection,
    description: 'Optional debt direction for shared debt.',
    example: DebtDirection.OWED_BY_ME,
  })
  @IsOptional()
  @IsEnum(DebtDirection)
  debtDirection?: DebtDirection;

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
  constructor(partial: Partial<CreateTransactionDto>) {
    Object.assign(this, partial);
  }
}
