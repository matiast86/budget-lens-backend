import { ApiProperty } from '@nestjs/swagger';
import { CollaborationEntity } from 'src/modules/collaborations/entities/collaboration.entity';
import { CreditCardEntity } from 'src/modules/credit-cards/entities/credit-card.entity';
import { GroupEntity } from 'src/modules/groups/entities/group.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { LedgerWithRelations } from 'src/types/entities/entities-with-relations';

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

  @ApiProperty({
    description: 'Short description of the ledger.',
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
    required: false,
  })
  owner?: UserEntity;

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
    type: () => CreditCardEntity,
    isArray: true,
    required: false,
  })
  creditCards: CreditCardEntity[];

  @ApiProperty({ description: 'Creation timestamp.' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp.' })
  updatedAt: Date;

  constructor(ledger: LedgerWithRelations | LedgerEntity) {
    this.id = ledger.id;
    this.name = ledger.name;
    this.description = ledger.description || undefined;
    this.ownerId = ledger.ownerId;
    this.createdAt = ledger.createdAt;
    this.updatedAt = ledger.updatedAt;

    // Map nested relations safely if present
    this.owner = ledger.owner ? new UserEntity(ledger.owner as any) : undefined;

    this.collaborations = ledger.collaborations
      ? ledger.collaborations.map((c) => new CollaborationEntity(c))
      : [];

    this.groups = ledger.groups
      ? ledger.groups.map((g) => new GroupEntity(g))
      : [];

    this.transactions = ledger.transactions
      ? ledger.transactions.map((t) => new TransactionEntity(t))
      : [];

    this.creditCards = ledger.creditCards
      ? ledger.creditCards.map((c) => new CreditCardEntity(c))
      : [];
  }
}
