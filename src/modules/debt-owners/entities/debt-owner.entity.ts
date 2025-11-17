import { ApiProperty } from '@nestjs/swagger';
import { DebtEntity } from 'src/modules/debts/entities/debt.entity';
import { DebtOwnerWithRelations } from 'src/types/entities/entities-with-relations';

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
    type: () => DebtEntity,
    isArray: true,
    description: 'List of debts linked to this owner.',
    required: false,
  })
  debts: DebtEntity[];

  constructor(debtOwner: DebtOwnerWithRelations | DebtOwnerEntity) {
    this.id = debtOwner.id;
    this.name = debtOwner.name;
    this.debts = debtOwner.debts
      ? debtOwner.debts.map((d) => new DebtEntity(d))
      : [];
  }
}
