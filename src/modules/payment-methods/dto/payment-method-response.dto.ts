import { ApiProperty } from '@nestjs/swagger';
import { CreditBrand, Currency, PaymentType } from '@prisma/client';
import { TransactionResponseDto } from 'src/modules/transactions/dto/transaction-response.dto';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';

export class PaymentMethodResponseDto {
  @ApiProperty({
    description: 'Payment method ID.',
    example: 12,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the payment method.',
    example: 'Mercado Pago',
  })
  name: string;

  @ApiProperty({
    enum: PaymentType,
    description: 'Type of payment method.',
    example: PaymentType.WALLET,
  })
  type: PaymentType;

  @ApiProperty({
    required: false,
    enum: CreditBrand,
    description: 'Brand for credit cards. Null otherwise.',
    example: CreditBrand.MASTER,
  })
  brand?: CreditBrand;

  @ApiProperty({
    required: false,
    example: '#4CAF50',
    description: 'UI display color.',
  })
  color?: string;

  @ApiProperty({
    required: false,
    example: 'mdi-wallet-outline',
    description: 'Icon identifier.',
  })
  icon?: string;

  @ApiProperty({
    enum: Currency,
    required: false,
    description: 'Currency linked to this method.',
    example: Currency.ARS,
  })
  currency?: Currency;

  @ApiProperty({
    description: 'Flag indicating if this method is active.',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'User ID who owns this method.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  userId: string;

  @ApiProperty({
    type: () => [TransactionEntity],
    description: 'Transactions linked to this payment method.',
  })
  transactions: TransactionResponseDto[];

  constructor(partial: Partial<PaymentMethodResponseDto>) {
    Object.assign(this, partial);
  }
}
