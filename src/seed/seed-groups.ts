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
    'Hogar',
    'Transporte',
    'Salud',
    'Entretenimiento',
    'Educacion',
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
