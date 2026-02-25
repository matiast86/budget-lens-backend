import { ApiProperty } from '@nestjs/swagger';
import { TransactionDebtOwnerEntity } from 'src/modules/transactions/entities/transaction-debt-owner.entity';

export class DebtOwnerEntity {
  @ApiProperty({
    description: 'Unique numeric ID of the debt owner.',
    example: 15,
  })
  id: number;

  @ApiProperty({
    description: 'Name identifying the person or entity associated with debts.',
    example: 'Ana Pérez',
  })
  name: string;

  @ApiProperty({
    description: 'Ledger ID this debt owner belongs to.',
    example: 3,
  })
  ledgerId: number;

  @ApiProperty({
    type: () => TransactionDebtOwnerEntity,
    isArray: true,
    description: 'Transaction-debt assignments linked to this owner.',
    required: false,
  })
  transactions: TransactionDebtOwnerEntity[];

  constructor(partial: Partial<DebtOwnerEntity>) {
    Object.assign(this, partial);
  }
}
