import { PrismaClient } from 'prisma/generated/prisma/client';

export const seedCategories = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding categories...');

  const categories = [
    { name: 'Food', description: 'Groceries, restaurants, etc.' },
    { name: 'Transport', description: 'Taxi, subway, bus, fuel' },
    { name: 'Utilities', description: 'Electricity, water, internet' },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log('  ✔ Categories seeded');
};
