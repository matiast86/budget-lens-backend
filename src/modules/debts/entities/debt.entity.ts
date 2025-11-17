import { ApiProperty } from '@nestjs/swagger';
import { DebtDirection } from 'generated/prisma/enums';
import { DebtOwnerEntity } from 'src/modules/debt-owners/entities/debt-owner.entity';
import { DebtWithRelations } from 'src/types/entities/entities-with-relations';

export class DebtEntity {
  @ApiProperty({
    description: 'Unique numeric ID of the debt record.',
    example: 99,
  })
  id: number;

  @ApiProperty({ description: 'Reference ID of the debt owner.', example: 15 })
  debtOwnerId: number;

  @ApiProperty({
    enum: DebtDirection,
    description: 'Indicates if the user owes or is owed money.',
    example: DebtDirection.OWED_TO_ME,
  })
  direction: DebtDirection;

  @ApiProperty({ description: 'Debt amount.', example: 4800.5 })
  amount: number;

  @ApiProperty({
    description:
      'Month the debt corresponds to (used for monthly reconciliation).',
    example: '2025-03-01T00:00:00.000Z',
  })
  month: Date;

  @ApiProperty({ type: () => DebtOwnerEntity })
  owner: DebtOwnerEntity;

  constructor(debt: DebtWithRelations | DebtEntity) {
    this.id = debt.id;
    this.debtOwnerId = debt.debtOwnerId;
    this.direction = debt.direction;
    this.amount = debt.amount;
    this.month = debt.month;
    this.owner = new DebtOwnerEntity(debt.owner as any);
  }
}
