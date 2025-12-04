import { Module } from '@nestjs/common';
import { DebtOwnersModule } from '../debt-owners/debt-owners.module';
import { DebtsController } from './debts.controller';
import { DebtsRepository } from './debts.repository';
import { DebtsService } from './debts.service';

@Module({
  imports: [DebtOwnersModule],
  controllers: [DebtsController],
  providers: [DebtsService, DebtsRepository],
})
export class DebtsModule {}
