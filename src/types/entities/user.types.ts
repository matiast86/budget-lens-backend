import { Prisma } from 'prisma/generated/prisma/client';

/* ==========================================================================
   USER TYPES
   ========================================================================== */

export type UserDashboardView = Prisma.UserGetPayload<{
  include: {
    ledgers: {
      select: {
        id: true;
        name: true;
        description: true;
        currency: true;
        createdAt: true;
        updatedAt: true;
      };
    };
  };
}>;
