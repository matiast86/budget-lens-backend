import { ApiProperty } from '@nestjs/swagger';
import { CollaborationEntity } from 'src/modules/collaborations/entities/collaboration.entity';
import { CreditCardEntity } from 'src/modules/credit-cards/entities/credit-card.entity';
import { GroupEntity } from 'src/modules/groups/entities/group.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class LedgerEntity {
  @ApiProperty({
    description: 'Unique numeric ID for this ledger.',
    example: 101,
  })
  id: number;

  @ApiProperty({
    description:
      'Name of the ledger, usually representing a shared or personal account.',
    example: 'Home Budget 2025',
  })
  name: string;

  @ApiProperty({
    description:
      'Short description to help identify the purpose of this ledger.',
    example: 'Tracks monthly family expenses and shared utilities.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'UUID of the user who owns this ledger.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  ownerId: string;

  @ApiProperty({
    type: () => UserEntity,
    description: 'User entity that owns this ledger.',
  })
  owner: UserEntity;

  @ApiProperty({
    type: () => CollaborationEntity,
    isArray: true,
    description: 'Collaborators granted access to this ledger.',
    required: false,
  })
  collaborations: CollaborationEntity[];

  @ApiProperty({
    type: () => GroupEntity,
    isArray: true,
    description:
      'Custom transaction groups under this ledger (e.g., categories, projects).',
    required: false,
  })
  groups: GroupEntity[];

  @ApiProperty({
    type: () => TransactionEntity,
    isArray: true,
    description: 'Transactions associated with this ledger.',
    required: false,
  })
  transactions: TransactionEntity[];

  @ApiProperty({
    type: () => CreditCardEntity,
    isArray: true,
    description:
      'List of credit cards associated with this ledger. A card can belong to multiple ledgers (many-to-many).',
    required: false,
    example: [
      {
        id: 12,
        name: 'Visa Galicia Classic',
        type: 'VISA',
        userId: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
      },
    ],
  })
  creditCards: CreditCardEntity[];

  @ApiProperty({
    description: 'Timestamp of when the ledger was created.',
    example: '2025-01-15T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp of the most recent update to this ledger.',
    example: '2025-02-02T21:45:00.000Z',
  })
  updatedAt: Date;
}
