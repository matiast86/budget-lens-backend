import { CategoryScope, PrismaClient } from 'prisma/generated/prisma/client';

export const seedCategories = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding categories...');

  const categories = [
    {
      name: 'Food',
      description: 'Groceries, supermarket, convenience stores',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Dining Out',
      description: 'Restaurants, cafes, takeaway, delivery',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Transport',
      description: 'Taxi, subway, bus, fuel, parking',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Utilities',
      description: 'Electricity, water, gas, internet, phone',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Housing',
      description: 'Rent, mortgage, maintenance, repairs',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Health',
      description: 'Doctor visits, pharmacy, medical insurance',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Personal Care',
      description: 'Haircuts, toiletries, cosmetics',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Clothing',
      description: 'Clothes, shoes, accessories',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Entertainment',
      description: 'Streaming, cinema, hobbies, events',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Education',
      description: 'Courses, books, tuition, supplies',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Savings',
      description: 'Savings deposits, investments, emergency fund',
      scope: CategoryScope.GLOBAL,
    },
    {
      name: 'Balance',
      description: 'Weekly balances of the account',
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
