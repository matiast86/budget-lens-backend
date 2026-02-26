import { PrismaClient } from 'prisma/generated/prisma/client';

export const seedGroups = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding groups...');

  const user = await prisma.user.findUnique({
    where: { email: 'matias@mail.com' },
  });

  if (!user) {
    console.warn('  ⚠ User not found for group creation.');
    return;
  }

  const ledger = await prisma.ledger.findFirst();

  if (!ledger) {
    console.warn('  ⚠ No ledger found for group creation.');
    return;
  }

  const groupNames = [
    'Rent & Building Fees',
    'Utilities Lavalle',
    'Utilities',
    'Streaming Services',
    'Subscriptions',
    'Childcare',
    'Liam Kindergarten',
    'Noah Kindergarten',
    'Noah School',
    'Noah Therapies',
    'Health Insurance',
    'Therapy',
    'Supermarket',
    'Delivery',
    'Lunches & Coffee',
    'Taxis & Rideshare',
    'Dining with Friends',
    'Kids Outings',
    'Family Outings',
    'Outing with Sofi',
    'Birthday',
    'Gifts',
    'Clothing',
    'Footwear',
    'Pharmacy',
    'Bank Fees',
    'Miscellaneous',
    'Moving',
    'Inflatable Mattress',
    'Bedding',
    'Bazaar',
    'Hardware Store',
    'Bookstore',
    'Hairdresser',
    'Car',
    'Sofi Car',
    'Etios',
    'Pool',
    'Farm',
    'Córdoba',
    'Uruguay',
    'Summer Vacation',
    'Family Snack Outing',
    'Noah & Liam Supermarket',
  ];

  for (const name of groupNames) {
    await prisma.group.upsert({
      where: {
        ledgerId_name: {
          ledgerId: ledger.id,
          name,
        },
      },
      update: {},
      create: {
        name,
        ledgerId: ledger.id,
        userId: user.id,
      },
    });
  }

  console.log('  ✔ Groups seeded');
};
