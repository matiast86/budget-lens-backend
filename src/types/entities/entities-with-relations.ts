import { Prisma } from '@prisma/client';

export type UserWithRelations = Prisma.UserGetPayload<{
  include: { ledgers: true; collaborations: true };
}>;

export type LedgerWithRelations = Prisma.LedgerGetPayload<{
  include: {
    collaborations: true;
    transactions: true;
    creditCards: true;
    owner: true;
  };
}>;

export type CollaborationWithRelations = Prisma.CollaborationGetPayload<{
  include: { user: true; ledger: true };
}>;

export type CreditCardWithRelations = Prisma.CreditCardGetPayload<{
  include: { ledgers: true; user: true };
}>;

export type DebtWithRelations = Prisma.DebtGetPayload<{
  include: { owner: true };
}>;

export type DebtOwnerWithRelations = Prisma.DebtOwnerGetPayload<{
  include: { debts: true };
}>;

export type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: { transactions: true };
}>;

export type GroupwithRelations = Prisma.GroupGetPayload<{
  include: { transactions: true; ledger: true; user: true };
}>;

export type PaymentMethodWithRelations =
  Prisma.PaymentMethodGetPayload<undefined>;

export type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    transactionsBreakDown: true;
    category: true;
    group: true;
    ledger: true;
  };
}>;

export type TransactionBreakDownWithRelations =
  Prisma.TransactionBreakDownGetPayload<{ include: { transaction: true } }>;
