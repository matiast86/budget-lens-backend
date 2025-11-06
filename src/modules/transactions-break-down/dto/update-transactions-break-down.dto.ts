import { PartialType } from '@nestjs/swagger';
import { CreateTransactionsBreakDownDto } from './create-transactions-break-down.dto';

export class UpdateTransactionsBreakDownDto extends PartialType(CreateTransactionsBreakDownDto) {}
