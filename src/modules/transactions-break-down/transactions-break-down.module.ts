import { Module } from '@nestjs/common';
import { TransactionsBreakDownService } from './transactions-break-down.service';
import { TransactionsBreakDownController } from './transactions-break-down.controller';

@Module({
  controllers: [TransactionsBreakDownController],
  providers: [TransactionsBreakDownService],
})
export class TransactionsBreakDownModule {}
