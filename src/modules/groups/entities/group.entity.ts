import { ApiProperty } from '@nestjs/swagger';
import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { GroupwithRelations } from 'src/types/entities/entities-with-relations';

export class GroupEntity {
  @ApiProperty({
    description: 'Unique numeric ID of the group.',
    example: 78,
  })
  id: number;

  @ApiProperty({
    description: 'Descriptive name of the group.',
    example: 'Groceries',
  })
  name: string;

  @ApiProperty({
    description: 'Optional reference to the ledger this group belongs to.',
    example: 101,
    required: false,
  })
  ledgerId?: number;

  @ApiProperty({
    description: 'UUID of the user who owns or created this group.',
    example: 'c5f5b510-6bbd-4a3d-b4b2-30f67d5c9133',
  })
  userId: string;

  @ApiProperty({
    description:
      'Indicates if this group is global (shared across ledgers) or specific to one ledger.',
    example: false,
    default: false,
  })
  isGlobal: boolean;

  @ApiProperty({
    type: () => LedgerEntity,
    required: false,
    description: 'Ledger associated with this group.',
  })
  ledger?: LedgerEntity;

  @ApiProperty({
    type: () => [TransactionEntity],
    description: 'Transactions categorized under this group.',
    required: false,
  })
  transactions: TransactionEntity[];

  @ApiProperty({
    type: () => UserEntity,
    description: 'User who created or manages this group.',
  })
  user: UserEntity;

  constructor(group: GroupwithRelations | GroupEntity) {
    this.id = group.id;
    this.name = group.name;
    this.ledgerId = group.ledgerId ? group.ledgerId : undefined;
    this.userId = group.userId;
    this.isGlobal = group.isGlobal;
    this.ledger = group.ledger
      ? new LedgerEntity(group.ledger as any)
      : undefined;
    this.user = new UserEntity(group.user as any);
    this.transactions = group.transactions
      ? group.transactions.map((t) => new TransactionEntity(t))
      : [];
  }
}
