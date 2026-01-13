import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from 'prisma/generated/prisma/enums';
import { CategoryEntity } from 'src/modules/categories/entities/category.entity';
import { CollaborationEntity } from 'src/modules/collaborations/entities/collaboration.entity';
import { GroupEntity } from 'src/modules/groups/entities/group.entity';
import { PaymentMethodEntity } from 'src/modules/payment-methods/entities/payment-method.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class LedgerEntity {
  @ApiProperty({
    description: 'Unique numeric ID for this ledger.',
    example: 101,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the ledger.',
    example: 'Home Budget 2025',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Short description of the ledger.',
  })
  description?: string;

  @ApiProperty({
    enum: Currency,
    description: 'Default currency for this ledger.',
    example: Currency.ARS,
  })
  currency: Currency;

  @ApiProperty({
    description: 'UUID of the user who owns this ledger.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  ownerId: string;

  @ApiProperty({
    type: () => UserEntity,
    description: 'User entity that owns this ledger.',
    required: false,
  })
  owner: UserEntity;

  @ApiProperty({
    type: () => CollaborationEntity,
    isArray: true,
    required: false,
  })
  collaborations: CollaborationEntity[];

  @ApiProperty({
    type: () => GroupEntity,
    isArray: true,
    required: false,
  })
  groups: GroupEntity[];

  @ApiProperty({
    type: () => TransactionEntity,
    isArray: true,
    required: false,
  })
  transactions: TransactionEntity[];

  @ApiProperty({
    type: () => PaymentMethodEntity,
    isArray: true,
    required: false,
  })
  paymentMethods: PaymentMethodEntity[];

  @ApiProperty({
    type: () => CategoryEntity,
    isArray: true,
    required: false,
  })
  categories: CategoryEntity[];

  @ApiProperty({ description: 'Creation timestamp.' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp.' })
  updatedAt: Date;

  constructor(partial: Partial<LedgerEntity>) {
    Object.assign(this, partial);
  }
}
