import { Prisma } from 'prisma/generated/prisma/client';

export const LedgerIncludes = {
  dashboard: {
    select: {
      id: true,
      name: true,
      description: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
    },
  },

  detail: {
    include: {
      transactions: {
        include: {
          category: true,
          paymentMethod: true,
          debtOwners: {
            include: {
              debt: true,
              debtOwner: true,
            },
          },
          group: true,
          transactionsBreakDown: true,
        },
        orderBy: { transactionDate: 'desc' },
      },
      paymentMethods: { include: { paymentMethod: true } },
      collaborations: true,
      groups: true,
      debtOwners: true,
      categories: true,
    },
  },
} as const;

/* ==========================================================================
   VIEW TYPES
   ========================================================================== */

export type LedgerDashboardView = Prisma.LedgerGetPayload<
  typeof LedgerIncludes.dashboard
>;

export type LedgerDetailView = Prisma.LedgerGetPayload<
  typeof LedgerIncludes.detail
>;
