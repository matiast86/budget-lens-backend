import { ApiProperty } from '@nestjs/swagger';
import { Currency, EntryType, Status, TransactionType } from '@prisma/client';
import { CategoryResponseDto } from 'src/modules/categories/dto/category-response.dto';
import { GroupResponseDto } from 'src/modules/groups/dto/group-response.dto';
import { TransactionBreakDownResponseDto } from 'src/modules/transactions-break-down/dto/transaction-break-down-response.dto';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Unique numeric ID of the transaction.',
    example: 550,
  })
  id: number;

  @ApiProperty({
    description: 'Ledger ID this transaction belongs to.',
    example: 101,
  })
  ledgerId: number;

  @ApiProperty({
    enum: Status,
    description:
      'Current state of the transaction (e.g., CLOSED, CURRENT, FUTURE).',
    example: Status.CURRENT,
  })
  status: Status;

  @ApiProperty({
    enum: EntryType,
    description: 'Type of transaction entry (e.g., EXPENSE, INCOME, TRANSFER).',
    example: EntryType.EXPENSE,
  })
  entryType: EntryType;

  @ApiProperty({
    description: 'ID of the associated category.',
    example: 3,
  })
  categoryId: number;

  @ApiProperty({
    description: 'Optional ID of the group that categorizes this transaction.',
    example: 78,
    required: false,
  })
  groupId?: number;

  @ApiProperty({
    description: 'Date the transaction occurred (ISO 8601).',
    example: '2025-02-01T00:00:00.000Z',
  })
  transactionDate: string;

  @ApiProperty({
    description:
      'Month this transaction belongs to, used for installment payments.',
    example: '2025-02-01T00:00:00.000Z',
    required: false,
  })
  paymentMonth?: string;

  @ApiProperty({
    description: 'Number of total installments.',
    example: 3,
    default: 1,
  })
  installments: number;

  @ApiProperty({
    description: 'Current installment number.',
    example: 1,
    default: 1,
  })
  installment: number;

  @ApiProperty({
    description: 'Optional comment or note related to this transaction.',
    example: 'Shared dinner with family, reimbursed by Ana.',
    required: false,
  })
  comment?: string;

  @ApiProperty({
    enum: Currency,
    description: 'Currency of the transaction amount.',
    example: Currency.ARS,
  })
  currency: Currency;

  @ApiProperty({
    description: 'Total transaction amount.',
    example: 27500.5,
  })
  totalAmount: number;

  type: TransactionType;

  @ApiProperty({
    description: 'Amount due per month or installment.',
    example: 9166.83,
  })
  monthlyAmount: number;

  @ApiProperty({
    description:
      'Optional reference to a debt owner if this transaction involves shared debt.',
    example: 10,
    required: false,
  })
  debtOwnerId?: number;

  @ApiProperty({ type: () => CategoryResponseDto })
  category: CategoryResponseDto;

  @ApiProperty({ type: () => GroupResponseDto, required: false })
  group?: GroupResponseDto;

  @ApiProperty({
    type: () => TransactionBreakDownResponseDto,
    isArray: true,
    description: 'Weekly breakdowns of this transaction, if applicable.',
    required: false,
  })
  transactionsBreakDown: TransactionBreakDownResponseDto[];
  constructor(partial: Partial<TransactionResponseDto>) {
    Object.assign(this, partial);
  }
}
