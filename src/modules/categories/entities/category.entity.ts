import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';

export class CategoryEntity {
  @ApiProperty({
    description: 'Unique numeric ID of the category.',
    example: 3,
  })
  id: number;

  @ApiProperty({
    description: 'Unique name of the category.',
    example: 'Utilities',
  })
  name: string;

  @ApiProperty({
    description: 'Optional description providing details about this category.',
    example: 'Includes water, gas, and electricity bills.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: () => TransactionEntity,
    isArray: true,
    description: 'Transactions that belong to this category.',
    required: false,
  })
  transactions: TransactionEntity[];

  constructor(partial: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}
