import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { TransactionEntity } from './transaction.entity';

export class TransactionDerivationEntity {
  @ApiProperty({
    description:
      'ID of the derived transaction — the one whose amount is computed ' +
      'from `source`.',
    example: 1042,
  })
  derivedId: number;

  @ApiProperty({
    description:
      'ID of the source transaction this derivation draws its amount from.',
    example: 1024,
  })
  sourceId: number;

  @ApiPropertyOptional({
    type: () => TransactionEntity,
    description: 'The derived transaction, when loaded.',
  })
  derived?: TransactionEntity;

  @ApiPropertyOptional({
    type: () => TransactionEntity,
    description: 'The source transaction, when loaded.',
  })
  source?: TransactionEntity;

  constructor(partial: Partial<TransactionDerivationEntity>) {
    Object.assign(this, partial);
  }
}
