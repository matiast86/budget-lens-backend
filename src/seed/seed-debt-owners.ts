import { PrismaClient } from 'prisma/generated/prisma/client';

export const seedDebtOwners = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding debt owners...');

  const ledger = await prisma.ledger.findFirst();

  if (!ledger) {
    console.warn('  ⚠ No ledger found for DebtOwner creation');
    return;
  }

  const debtOwnerNames = ['Pau', 'Sofi', 'Susana', 'Yani', 'Celi', 'Otros'];

  for (const name of debtOwnerNames) {
    await prisma.debtOwner.upsert({
      where: { ledgerId_name: { ledgerId: ledger.id, name } },
      update: {},
      create: {
        name,
        ledgerId: ledger.id,
      },
    });
  }

  console.log('  ✔ Debt owners seeded');
};
