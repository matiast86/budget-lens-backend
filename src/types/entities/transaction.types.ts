import { Prisma } from 'prisma/generated/prisma/client';

/* ==========================================================================
   INCLUDE BUNDLES
   ========================================================================== */

export const TransactionIncludes = {
  detail: {
    include: {
      category: true,
      paymentMethod: true,
      transactionsBreakDown: true,
      group: true,
      debtOwners: {
        include: {
          debtOwner: true,
          debt: true,
        },
      },
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

export const TransactionReportIncludes = {
  detail: {
    select: {
      paymentMethod: { select: { name: true } },
      paymentMethodId: true,
      group: { select: { name: true } },
      groupId: true,
      category: { select: { name: true } },
      categoryId: true,
      paymentMonth: true,
      entryType: true,
      monthlyAmount: true,
      status: true,
      ledger: { select: { currency: true } },
      transactionsBreakDown: {
        select: { weekNumber: true, amount: true },
      },
      debtOwners: {
        select: { amount: true, direction: true }, // only what's needed for adjustment
      },
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

export type TransactionReport = Prisma.TransactionGetPayload<
  typeof TransactionReportIncludes.detail
>;

export type TransactionRelation = 'category' | 'group' | 'paymentMethod';
