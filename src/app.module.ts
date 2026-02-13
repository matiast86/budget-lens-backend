import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth/auth.guard';
import { LedgerAccessGuard } from './guards/ledger-access/ledger-access.guard';
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
import { CategoryTemplatesModule } from './modules/category-templates/category-templates.module';
import { DataCollectionService } from './services/data-collection/data-collection.service';
import { InflationIndexesModule } from './modules/inflation-indexes/inflation-indexes.module';

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
    CategoryTemplatesModule,
    InflationIndexesModule,
  ],
  controllers: [],
  providers: [
    DataCollectionService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: LedgerAccessGuard },
  ],
})
export class AppModule {}
