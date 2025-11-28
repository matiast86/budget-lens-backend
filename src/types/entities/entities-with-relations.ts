import { Prisma } from '@prisma/client';

/* ==========================================================================
   USER TYPES
   ========================================================================== */

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    ledgers: true;
    collaborations: true;
    paymentMethods: true;
    groups: true;
  };
}>;

/* ==========================================================================
   LEDGER TYPES
   ========================================================================== */

export type LedgerWithRelations = Prisma.LedgerGetPayload<{
  include: {
    collaborations: true;
    transactions: true;
    paymentMethods: {
      include: {
        paymentMethod: {
          include: {
            transactions: {
              include: {
                transactionsBreakDown: true;
                category: true;
                group: true;
                paymentMethod: true;
              };
            };
          };
        };
      };
    };
    groups: true;
  };
}>;

/* ==========================================================================
   COLLABORATION TYPES
   ========================================================================== */

export type CollaborationWithRelations = Prisma.CollaborationGetPayload<{
  include: {
    user: true;
    ledger: true;
  };
}>;

/* ==========================================================================
   CREDIT CARD TYPES
   ========================================================================== */

// Credit card used inside Ledger context (minimal)
export type PaymentMethodMinimal = Prisma.PaymentMethodGetPayload<{
  include: {
    user: false;
    ledgers: false;
    transactions: false;
  };
}>;

// Full credit card (if needed in credits module later)
export type PaymentMethodWithRelations = Prisma.PaymentMethodGetPayload<{
  include: {
    user: true;
    ledgers: true;
    transactions: true;
  };
}>;

/* ==========================================================================
   DEBT & DEBT OWNER TYPES
   ========================================================================== */

// Minimal owner inside Debt — prevents recursion
export type DebtOwnerMinimal = Prisma.DebtOwnerGetPayload<{
  include: { debts: false };
}>;

export type DebtWithRelations = Prisma.DebtGetPayload<{
  include: {
    owner: { include: { debts: false } }; // prevents recursion
  };
}>;

// Full owner with debt list (use only on owner endpoints)
export type DebtOwnerWithRelations = Prisma.DebtOwnerGetPayload<{
  include: {
    debts: {
      include: {
        owner: false; // no back-reference
      };
    };
  };
}>;

/* ==========================================================================
   CATEGORY TYPES
   ========================================================================== */

export type CategoryMinimal = Prisma.CategoryGetPayload<{
  include: { transactions: false };
}>;

/* ==========================================================================
   GROUP TYPES
   ========================================================================== */

export type GroupMinimal = Prisma.GroupGetPayload<{
  include: {
    ledger: false;
    user: false;
    transactions: false;
  };
}>;

/* ==========================================================================
   TRANSACTION TYPES
   ========================================================================== */

export type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    transactionsBreakDown: true;
    category: true;
    group: true;
    ledger: false; // do not include ledger (cycle)
    paymentMethod: true;
    debtOWner: true;
  };
}>;

export type TransactionBreakDownMinimal =
  Prisma.TransactionBreakDownGetPayload<{
    include: { transaction: false };
  }>;

/* ==========================================================================
   END
   ========================================================================== */
