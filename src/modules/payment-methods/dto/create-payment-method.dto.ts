import { ApiProperty } from '@nestjs/swagger';
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
  name: string;

  @ApiProperty({
    enum: PaymentType,
    description: 'Type of payment method.',
    example: PaymentType.CREDIT_CARD,
  })
  type: PaymentType;

  @ApiProperty({
    enum: CreditBrand,
    required: false,
    description:
      'Only required when type is CREDIT_CARD. Null for cash, bank, wallet.',
    example: CreditBrand.VISA,
  })
  brand?: CreditBrand;

  @ApiProperty({
    required: false,
    description: 'Color assigned to this payment method (UI only).',
    example: '#E53935',
  })
  color?: string;

  @ApiProperty({
    required: false,
    description: 'Icon identifier used in UI.',
    example: 'mdi-bank-transfer',
  })
  icon?: string;

  @ApiProperty({
    enum: Currency,
    required: false,
    description: 'Associated currency (useful for cash or bank-based methods).',
    example: Currency.USD,
  })
  currency?: Currency;

  constructor(partial: Partial<CreatePaymentMethodDto>) {
    Object.assign(this, partial);
  }
}
