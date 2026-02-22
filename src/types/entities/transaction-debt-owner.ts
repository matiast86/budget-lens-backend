import { Prisma } from 'prisma/generated/prisma/client';

export const TransactionDebtOwnerWithMinimalDebt = {
  detail: {
    select: {
      amount: true,
      direction: true,
      debt: {
        select: {
          period: true,
          description: true,
        },
      },
    },
  },
};

export type TransactionDebtOwnerWithDebt =
  Prisma.TransactionDebtOwnerGetPayload<{
    include: { debt: true };
  }>;

export type TransactionDebtOwnerWithBasicDebt =
  Prisma.TransactionDebtOwnerGetPayload<
    typeof TransactionDebtOwnerWithMinimalDebt.detail
  >;
