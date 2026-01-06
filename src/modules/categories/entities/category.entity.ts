import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryTemplatesEntity } from 'src/modules/category-templates/entities/category-templates.entity';
import { LedgerEntity } from 'src/modules/ledgers/entities/ledger.entity';
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
    description: 'Reference to the ledger this category belongs to.',
    example: 101,
    required: true,
  })
  ledgerId: number;

  @ApiPropertyOptional({
    description:
      'Reference to the template this category was created from, if any.',
    example: 4,
  })
  templateId?: number;

  @ApiProperty({
    type: () => LedgerEntity,
    required: true,
    description: 'Ledger associated with this category.',
  })
  ledger: LedgerEntity;

  @ApiPropertyOptional({
    type: () => CategoryTemplatesEntity,
    description: 'Template this category is based on, if applicable.',
  })
  template?: CategoryTemplatesEntity;

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
