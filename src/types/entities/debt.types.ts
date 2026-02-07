import { Prisma } from 'prisma/generated/prisma/client';

export type DebtOwnerWithDebts = Prisma.DebtOwnerGetPayload<{
  include: { transactions: { include: { debt: true; debtOwner: true } } };
}>;

export type DebtWithSplit = Prisma.TransactionDebtOwnerGetPayload<{
  include: { debt: true; debtOwner: true };
}>;
