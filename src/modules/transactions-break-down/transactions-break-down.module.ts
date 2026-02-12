import { Module } from '@nestjs/common';
import { TransactionsBreakDownService } from './transactions-break-down.service';
import { TransactionsBreakDownController } from './transactions-break-down.controller';
import { TransactionsBDRepository } from './transactions-break-down-repository';

@Module({
  controllers: [TransactionsBreakDownController],
  providers: [TransactionsBreakDownService, TransactionsBDRepository],
  exports: [TransactionsBreakDownService],
})
export class TransactionsBreakDownModule {}
