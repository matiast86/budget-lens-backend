import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, Matches, Min } from 'class-validator';
import { Currency } from 'prisma/generated/prisma/enums';

export class CreateBalanceDto {
  @ApiProperty({
    description: "ID of the transaction's payment method.",
    example: 2,
  })
  @IsInt()
  @Min(1)
  paymentMethodId: number;

  @ApiProperty({
    description:
      'Month this transaction belongs to; defaults to transactionDate when omitted.',
    example: '2025-02-01T00:00:00.000Z',
  })
  @IsDateString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'paymentMonthValue must be YYYY-MM' })
  paymentMonthValue: string;

  @Matches(/^\d{4}-\d{2}$/, { message: 'bundleTo must be YYYY-MM' })
  bundleTo: string;

  @ApiProperty({
    enum: Currency,
    description: 'Currency of the transaction amount.',
    example: Currency.ARS,
  })
  @IsEnum(Currency)
  currency: Currency;

  constructor(partial: Partial<CreateBalanceDto>) {
    Object.assign(this, partial);
  }
}
