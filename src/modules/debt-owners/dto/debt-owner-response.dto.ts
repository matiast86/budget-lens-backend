import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionDebtOwnerResponseDto } from 'src/modules/transactions/dto/transaction-debt-owner-response.dto';

export class DebtOwnerResponseDto {
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
    description: 'Numeric ID of the ledger this debt owner belongs to.',
    example: 3,
    readOnly: true,
  })
  ledgerId: number;

  @ApiPropertyOptional({
    type: () => TransactionDebtOwnerResponseDto,
    isArray: true,
    description:
      'Transaction-debt assignments linked to this owner; empty when none exist.',
  })
  transactions?: TransactionDebtOwnerResponseDto[];

  constructor(partial: Partial<DebtOwnerResponseDto>) {
    Object.assign(this, partial);
  }
}
