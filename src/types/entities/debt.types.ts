import { Prisma } from 'prisma/generated/prisma/client';

export type DebtOwnerWithTransactions = Prisma.DebtOwnerGetPayload<{
  include: {
    transactions: {
      include: {
        debt: true;
      };
    };
  };
}>;
