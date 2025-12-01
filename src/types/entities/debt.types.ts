import { Prisma } from '@prisma/client';

export type DebtDetailView = Prisma.DebtGetPayload<{
  include: { owner: true };
}>;

export type DebtOwnerWithDebts = Prisma.DebtOwnerGetPayload<{
  include: { debts: { include: { onwer: false } } };
}>;
