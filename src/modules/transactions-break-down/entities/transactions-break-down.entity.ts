import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { TransactionBreakDownWithRelationships } from 'src/types/entities/entities-with-relations';

export class TransactionsBreakDownEntity {
  @ApiProperty({
    description: 'Unique numeric ID of the breakdown record.',
    example: 201,
  })
  id: number;

  @ApiProperty({
    description: 'Reference to the parent transaction ID.',
    example: 550,
  })
  transactionId: number;

  @ApiProperty({
    description: 'Week number of the breakdown (1–52).',
    example: 3,
  })
  weekNumber: number;

  @ApiProperty({
    description: 'Amount assigned to this week.',
    example: 2300.75,
  })
  amount: number;

  @ApiProperty({ type: () => TransactionEntity })
  transaction: TransactionEntity;

  constructor(
    tb: TransactionBreakDownWithRelationships | TransactionsBreakDownEntity,
  ) {
    this.id = tb.id;
    this.transactionId = tb.transactionId;
    this.weekNumber = tb.weekNumber;
    this.amount = tb.amount as number;
    this.transaction = new TransactionEntity(tb.transaction as any);
  }
}
