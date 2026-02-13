import { Prisma } from 'prisma/generated/prisma/client';

export type TransactionDebtOwnerWithDebt =
  Prisma.TransactionDebtOwnerGetPayload<{
    include: { debt: true };
  }>;
