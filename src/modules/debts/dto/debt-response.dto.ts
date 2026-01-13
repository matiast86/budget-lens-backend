import { ApiProperty } from '@nestjs/swagger';
import { DebtDirection } from 'prisma/generated/prisma/client';

export class DebtResponseDto {
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
  period: string;

  description?: string;

  constructor(partial: Partial<DebtResponseDto>) {
    Object.assign(this, partial);
  }
}
