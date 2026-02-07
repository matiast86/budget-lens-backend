import { Prisma } from 'prisma/generated/prisma/client';

/* ==========================================================================
   INCLUDE BUNDLES
   ========================================================================== */

export const TransactionIncludes = {
  detail: {
    include: {
      category: true,
      paymentMethod: true,
      debtOwners: {
        include: {
          debt: true,
          debtOwner: true,
        },
      },
      transactionsBreakDown: true,
      group: true,
    },
  },
} as const;

export const PartialIncludes = {
  detail: {
    include: {
      transactionsBreakDown: true,
      group: true,
    },
  },
};

/* ==========================================================================
   VIEW TYPES
   ========================================================================== */

export type TransactionDetailView = Prisma.TransactionGetPayload<
  typeof TransactionIncludes.detail
>;

export type TransactionBreakDownsAndGroups = Prisma.TransactionGetPayload<
  typeof PartialIncludes.detail
>;

export type TransactionRelation = 'category' | 'group' | 'paymentMethod';
