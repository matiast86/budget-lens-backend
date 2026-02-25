import { ApiProperty } from '@nestjs/swagger';
import { DebtDirection } from 'prisma/generated/prisma/client';
import { DebtResponseDto } from 'src/modules/debts/dto/debt-response.dto';

export class TransactionDebtOwnerResponseDto {
  @ApiProperty({
    description: 'ID of the parent transaction.',
    example: 550,
  })
  transactionId: number;

  @ApiProperty({
    description: 'ID of the debt owner.',
    example: 15,
  })
  debtOwnerId: number;

  @ApiProperty({
    description: 'Name of the debt owner.',
    example: 'Ana Pérez',
  })
  debtOwnerName: string;

  @ApiProperty({
    description: 'Debt amount for this owner.',
    example: 4800.5,
  })
  amount: number;

  @ApiProperty({
    enum: DebtDirection,
    description: 'Whether the debt is owed to or by the user.',
    example: DebtDirection.OWED_TO_ME,
  })
  direction: DebtDirection;

  @ApiProperty({
    type: () => DebtResponseDto,
    description: 'The linked debt record.',
  })
  debt: DebtResponseDto;

  constructor(partial: Partial<TransactionDebtOwnerResponseDto>) {
    Object.assign(this, partial);
  }
}
