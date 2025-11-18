import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';

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

  constructor(partial: Partial<TransactionsBreakDownEntity>) {
    Object.assign(this, partial);
  }
}
