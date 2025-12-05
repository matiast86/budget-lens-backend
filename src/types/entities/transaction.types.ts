import { Prisma } from 'prisma/generated/prisma/client';

/* ==========================================================================
   INCLUDE BUNDLES
   ========================================================================== */

export const TransactionIncludes = {
  detail: {
    include: {
      category: true,
      paymentMethod: true,
      debtOwner: true,
      transactionsBreakDown: true,
      group: true,
    },
  },
} as const;

/* ==========================================================================
   VIEW TYPES
   ========================================================================== */

export type TransactionDetailView = Prisma.TransactionGetPayload<
  typeof TransactionIncludes.detail
>;
