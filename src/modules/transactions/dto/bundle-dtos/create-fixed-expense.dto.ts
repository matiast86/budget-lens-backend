import { IntersectionType } from '@nestjs/swagger';
import { CreateTransactionDto } from '../create-transaction.dto';
import { FixedBundleDto } from './fixed-bundle.dto';

export class CreateFixedExpenseDto extends IntersectionType(
  CreateTransactionDto,
  FixedBundleDto,
) {}
