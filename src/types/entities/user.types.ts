import { Prisma } from 'generated/prisma/client';
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
        createdAt: true;
        updatedAt: true;
      };
    };
  };
}>;
