import { Prisma } from '@prisma/client';

export const LedgerIncludes = {
  dashboard: {
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  },

  detail: {
    include: {
      transactions: {
        include: { category: true, paymentMethod: true, debtOwner: true },
        orderBy: { date: ' desc' },
      },
      paymentMethods: { include: { paymentMethod: true } },
      collaborations: true,
      groups: true,
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
