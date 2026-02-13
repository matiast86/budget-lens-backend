import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DebtDirection } from 'prisma/generated/prisma/client';
import { DebtEntity } from 'src/modules/debts/entities/debt.entity';
import { DebtOwnerEntity } from 'src/modules/debt-owners/entities/debt-owner.entity';

export class TransactionDebtOwnerEntity {
  @ApiProperty({ description: 'ID of the parent transaction.', example: 550 })
  transactionId: number;

  @ApiProperty({ description: 'ID of the debt owner.', example: 15 })
  debtOwnerId: number;

  @ApiProperty({ description: 'Debt amount for this owner.', example: 4800.5 })
  amount: number;

  @ApiProperty({
    enum: DebtDirection,
    description: 'Whether the debt is owed to or by the user.',
    example: DebtDirection.OWED_TO_ME,
  })
  direction: DebtDirection;

  @ApiProperty({ description: 'ID of the linked debt record.', example: 99 })
  debtId: number;

  @ApiPropertyOptional({ type: () => DebtOwnerEntity })
  debtOwner?: DebtOwnerEntity;

  @ApiPropertyOptional({ type: () => DebtEntity })
  debt?: DebtEntity;

  constructor(partial: Partial<TransactionDebtOwnerEntity>) {
    Object.assign(this, partial);
  }
}
