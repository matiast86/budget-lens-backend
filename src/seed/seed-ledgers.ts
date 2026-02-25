import { Currency, PrismaClient } from 'prisma/generated/prisma/client';

export const seedLedgers = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding ledgers...');

  const user = await prisma.user.findUnique({
    where: { email: 'matias@mail.com' },
  });

  if (!user) {
    console.warn('  ⚠ User not found for ledger creation.');
    return;
  }

  const templates = await prisma.categoryTemplate.findMany();

  const categoryData = templates.map((t) => ({
    name: t.name,
    description: t.description ?? undefined,
    templateId: t.id,
  }));

  // Look up current month's CPI for the ledger's currency.
  const now = new Date();
  const currentPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
  const currency = Currency.ARS;

  const inflationIndex = await prisma.inflationIndex.findUnique({
    where: { currency_period: { currency, period: currentPeriod } },
  });
  const baseCpiIndex = inflationIndex ? Number(inflationIndex.cpiIndex) : 100;

  await prisma.ledger.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Home Budget',
      description: 'Primary personal ledger',
      currency,
      baseCpiIndex,
      ownerId: user.id,
      categories: { createMany: { data: categoryData } },
    },
  });

  console.log('  ✔ Ledgers seeded');
};
