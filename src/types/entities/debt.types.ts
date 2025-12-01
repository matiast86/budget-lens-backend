import { Prisma } from '@prisma/client';

export type DebtOwnerWithDebts = Prisma.DebtOwnerGetPayload<{
  include: { debts: { include: { owner: false } } };
}>;
