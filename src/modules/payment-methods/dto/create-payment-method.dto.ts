import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  CreditBrand,
  Currency,
  PaymentType,
} from 'prisma/generated/prisma/client';

export class CreatePaymentMethodDto {
  @ApiProperty({
    description: 'Display name of the payment method.',
    example: 'Visa Galicia',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: PaymentType,
    description: 'Type of payment method.',
    example: PaymentType.CREDIT_CARD,
  })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiPropertyOptional({
    enum: CreditBrand,
    description:
      'Only required when type is CREDIT_CARD. Null for cash, bank, wallet.',
    example: CreditBrand.VISA,
  })
  @IsOptional()
  @IsEnum(CreditBrand)
  brand?: CreditBrand;

  @ApiPropertyOptional({
    description: 'Color assigned to this payment method (UI only).',
    example: '#E53935',
  })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({
    description: 'Icon identifier used in UI.',
    example: 'mdi-bank-transfer',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    enum: Currency,
    description: 'Associated currency (useful for cash or bank-based methods).',
    example: Currency.USD,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  constructor(partial: Partial<CreatePaymentMethodDto>) {
    Object.assign(this, partial);
  }
}
