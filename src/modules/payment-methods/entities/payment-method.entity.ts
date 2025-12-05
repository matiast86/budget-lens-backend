import { ApiProperty } from '@nestjs/swagger';
import {
  CreditBrand,
  Currency,
  PaymentType,
} from 'prisma/generated/prisma/client';
import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class PaymentMethodEntity {
  @ApiProperty({
    description: 'Unique numeric ID of the payment method.',
    example: 9,
  })
  id: number;

  @ApiProperty({
    description: 'Human-readable name of the payment method.',
    example: 'Visa Galicia',
  })
  name: string;

  @ApiProperty({
    enum: PaymentType,
    description: 'Defines the type of payment method.',
    example: PaymentType.CREDIT_CARD,
  })
  type: PaymentType;

  @ApiProperty({
    enum: CreditBrand,
    required: false,
    description:
      'Credit card brand. Required only when type = CREDIT_CARD. Null otherwise.',
    example: CreditBrand.VISA,
  })
  brand?: CreditBrand;

  @ApiProperty({
    required: false,
    description: 'Color code (UI only).',
    example: '#1A73E8',
  })
  color?: string;

  @ApiProperty({
    required: false,
    description: 'Icon identifier for UI rendering.',
    example: 'mdi-credit-card-outline',
  })
  icon?: string;

  @ApiProperty({
    enum: Currency,
    required: false,
    description: 'Currency associated with this payment method.',
    example: Currency.ARS,
  })
  currency?: Currency;

  @ApiProperty({
    description: 'Indicates if this payment method is active.',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'UUID of the user who owns this payment method.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  userId: string;

  @ApiProperty({
    type: () => UserEntity,
    description: 'User who owns this payment method.',
  })
  user: UserEntity;

  @ApiProperty({
    type: () => [TransactionEntity],
    description: 'Transactions made using this payment method.',
  })
  transactions: TransactionEntity[];

  @ApiProperty({
    type: () => [LedgerEntity],
    description:
      'Ledgers where this payment method is enabled. Derived from LedgerPaymentMethod pivot.',
  })
  ledgers: LedgerEntity[];

  constructor(partial: Partial<PaymentMethodEntity>) {
    Object.assign(this, partial);
  }
}
