import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { DebtOwnersModule } from '../debt-owners/debt-owners.module';
import { GroupsModule } from '../groups/groups.module';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [
    CategoriesModule,
    PaymentMethodsModule,
    DebtOwnersModule,
    GroupsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
  exports: [TransactionsService],
})
export class TransactionsModule {}
