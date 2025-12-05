import { Prisma } from 'prisma/generated/prisma/client';

export type DebtOwnerWithDebts = Prisma.DebtOwnerGetPayload<{
  include: { debts: { include: { owner: false } } };
}>;
