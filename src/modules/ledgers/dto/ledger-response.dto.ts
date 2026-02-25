import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from 'prisma/generated/prisma/enums';
import { CategoryResponseDto } from 'src/modules/categories/dto/category-response.dto';
import { CollaborationResponseDto } from 'src/modules/collaborations/dto/collaboration-response.dto';
import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';
import { PaymentMethodResponseDto } from 'src/modules/payment-methods/dto/payment-method-response.dto';
import { TransactionResponseDto } from 'src/modules/transactions/dto/transaction-response.dto';

export class LedgerResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Home Budget 2025' })
  name: string;

  @ApiPropertyOptional({
    example: 'Tracks monthly family expenses and shared utilities.',
  })
  description?: string;

  @ApiProperty({
    enum: Currency,
    description: 'Default currency for this ledger.',
    example: Currency.ARS,
  })
  currency: Currency;

  @ApiProperty({
    description:
      'CPI index at ledger creation, used as base for inflation-adjusted amounts.',
    example: 253.6538,
  })
  baseCpiIndex: number;

  @ApiProperty({
    description: 'User id of the ledger owner',
    example: 'user-123',
  })
  ownerId: string;

  @ApiProperty({ type: () => [CollaborationResponseDto] })
  collaborations: CollaborationResponseDto[];

  @ApiProperty({ type: () => [GroupResponseDto] })
  groups: GroupResponseDto[];

  @ApiProperty({ type: () => [TransactionResponseDto] })
  transactions: TransactionResponseDto[];

  @ApiProperty({ type: () => [PaymentMethodResponseDto] })
  paymentMethods: PaymentMethodResponseDto[];

  @ApiProperty({ type: () => [CategoryResponseDto] })
  categories: CategoryResponseDto[];

  @ApiProperty({
    description: 'ISO date string when the ledger was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'ISO date string when the ledger was last updated',
    example: '2024-01-02T00:00:00.000Z',
  })
  updatedAt: string;

  constructor(partial: Partial<LedgerResponseDto>) {
    Object.assign(this, partial);
  }
}
