import { Prisma } from 'prisma/generated/prisma/client';

export const DebtOwnerReport = {
  detail: {
    select: {
      id: true,
      name: true,
      transactions: {
        select: {
          amount: true,
          direction: true,
          debt: { select: { period: true, description: true } },
        },
      },
    },
  },
};

export type DebtOwnerWithTransactions = Prisma.DebtOwnerGetPayload<{
  include: {
    transactions: {
      include: {
        debt: true;
      };
    };
  };
}>;

export type DebtWithOwner = Prisma.DebtGetPayload<{
  include: { transactionDebtOwner: true };
}>;

export type DebtOwnersReport = Prisma.DebtOwnerGetPayload<
  typeof DebtOwnerReport.detail
>;
