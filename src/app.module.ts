import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CollaborationsModule } from './modules/collaborations/collaborations.module';
import { DebtOwnersModule } from './modules/debt-owners/debt-owners.module';
import { DebtsModule } from './modules/debts/debts.module';
import { GroupsModule } from './modules/groups/groups.module';
import { LedgersModule } from './modules/ledgers/ledgers.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { SharedModule } from './modules/shared/shared.module';
import { TransactionsBreakDownModule } from './modules/transactions-break-down/transactions-break-down.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    SharedModule,
    UsersModule,
    LedgersModule,
    CollaborationsModule,
    GroupsModule,
    DebtsModule,
    DebtOwnersModule,
    PaymentMethodsModule,
    CategoriesModule,
    TransactionsModule,
    TransactionsBreakDownModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
