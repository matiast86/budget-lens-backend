import { ApiProperty } from '@nestjs/swagger';

export class TransactionBreakDownResponseDto {
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

  constructor(partial: Partial<TransactionBreakDownResponseDto>) {
    Object.assign(this, partial);
  }
}
