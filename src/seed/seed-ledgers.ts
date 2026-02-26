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

  const categoryData = [
    {
      name: 'Home Expenses',
      description: 'Rent, utilities, maintenance and general household costs',
    },
    {
      name: 'Dining Out',
      description: 'Restaurants, cafes, takeaway, delivery',
    },
    {
      name: 'Entertainment',
      description: 'Streaming, cinema, hobbies, events',
    },
    {
      name: 'Health',
      description: 'Doctor visits, pharmacy, medical insurance',
    },
    {
      name: 'Transport',
      description: 'Taxi, rideshare, subway, bus, fuel',
    },
    {
      name: 'Gifts',
      description: 'Presents, celebrations',
    },
    {
      name: 'Clothing',
      description: 'Clothes, shoes, accessories',
    },
    {
      name: 'Childcare',
      description:
        'Kindergarten, school, therapies and children related expenses',
    },
    {
      name: 'Miscellaneous',
      description: 'Uncategorized or one-off expenses',
    },
  ];

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
