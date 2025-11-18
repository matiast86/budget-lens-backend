import { ApiProperty } from '@nestjs/swagger';
import { DebtEntity } from 'src/modules/debts/entities/debt.entity';

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

  constructor(partial: Partial<DebtOwnerEntity>) {
    Object.assign(this, partial);
  }
}
