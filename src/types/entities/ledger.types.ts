import { Prisma } from 'prisma/generated/prisma/client';

export const LedgerIncludes = {
  dashboard: {
    select: {
      id: true,
      name: true,
      description: true,
      currency: true,
      baseCpiIndex: true,
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
          group: true,
          transactionsBreakDown: true,
          debtOwners: {
            include: {
              debtOwner: true,
              debt: true,
            },
          },
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
  minimalWithCollaborations: {
    select: { id: true, name: true, ownerId: true, collaborations: true },
  },
  minimal: {
    select: { id: true, currency: true, baseCpiIndex: true, ownerId: true },
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

export type LedgerWithCollaborations = Prisma.LedgerGetPayload<
  typeof LedgerIncludes.minimalWithCollaborations
>;

export type LedgerMinimal = Prisma.LedgerGetPayload<
  typeof LedgerIncludes.minimal
>;
