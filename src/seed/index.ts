import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'prisma/generated/prisma/client';
import { seedCategories } from './seed-categories';
import { seedDebtOwners } from './seed-debt-owners';
import { seedGroups } from './seed-groups';
import { seedInflationIndexes } from './seed-inflation-indexes';
import { seedLedgers } from './seed-ledgers';
import { seedPaymentMethods } from './seed-payment-methods';
import { seedUsers } from './seed-users';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  console.log('🌱 Starting database seeding...');
  await seedUsers(prisma);
  await seedCategories(prisma);
  await seedInflationIndexes(prisma);
  await seedLedgers(prisma);
  await seedPaymentMethods(prisma);
  await seedGroups(prisma);
  await seedDebtOwners(prisma);
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
