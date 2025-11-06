import { Module } from '@nestjs/common';
import { SharedModule } from './modules/shared/shared.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { LedgersModule } from './modules/ledgers/ledgers.module';
import { CollaborationsModule } from './modules/collaborations/collaborations.module';
import { CreditCardsModule } from './modules/credit-cards/credit-cards.module';
import { GroupsModule } from './modules/groups/groups.module';
import { DebtsModule } from './modules/debts/debts.module';
import { DebtOwnersModule } from './modules/debt-owners/debt-owners.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { TransactionsBreakDownModule } from './modules/transactions-break-down/transactions-break-down.module';

@Module({
  imports: [PrismaModule, SharedModule, UsersModule, LedgersModule, CollaborationsModule, CreditCardsModule, GroupsModule, DebtsModule, DebtOwnersModule, PaymentMethodsModule, CategoriesModule, TransactionsModule, TransactionsBreakDownModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
