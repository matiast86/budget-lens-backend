import { Prisma } from '@prisma/client';

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    ledgers: true;
    collaborations: true;
    creditCards: true;
    groups: true;
  };
}>;

export type LedgerWithRelations = Prisma.LedgerGetPayload<{
  include: {
    collaborations: true;
    transactions: true;
    creditCards: { include: { creditCard: true } };
    groups: true;
    owner: true;
  };
}>;

export type CollaborationWithRelations = Prisma.CollaborationGetPayload<{
  include: { user: true; ledger: true };
}>;

export type CreditCardMinimal = Prisma.CreditCardGetPayload<{
  include: { ledgers: false; user: false };
}>;

export type DebtWithRelations = Prisma.DebtGetPayload<{
  include: { owner: true };
}>;

export type DebtOwnerWithRelations = Prisma.DebtOwnerGetPayload<{
  include: { debts: true };
}>;

export type CategoryMinimal = Prisma.CategoryGetPayload<{
  include: { transactions: false };
}>;

export type GroupMinimal = Prisma.GroupGetPayload<{
  include: { transactions: false; ledger: false; user: false };
}>;

export type PaymentMethodWithRelations =
  Prisma.PaymentMethodGetPayload<undefined>;

export type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    transactionsBreakDown: true;
    category: true;
    group: true;
    ledger: false;
  };
}>;

export type TransactionBreakDownMinimal =
  Prisma.TransactionBreakDownGetPayload<{ include: { transaction: false } }>;
