import { CategoryScope, PrismaClient } from 'prisma/generated/prisma/client';

export const seedCategories = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding categories...');

  const categories = [
    {
      name: 'Food',
      description: 'Groceries, restaurants, etc.',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Transport',
      description: 'Taxi, subway, bus, fuel',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Utilities',
      description: 'Electricity, water, internet',
      scope: CategoryScope.GLOBAL,
    },
  ];

  for (const c of categories) {
    await prisma.categoryTemplate.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log('  ✔ Categories seeded');
};
