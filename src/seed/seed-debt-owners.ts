// import { PrismaClient } from 'prisma/generated/prisma/client';

// export const seedDebtOwners = async (prisma: PrismaClient) => {
//   console.log('  ➤ Seeding debt owners...');

//   const ledger = await prisma.ledger.findFirst();

//   if (!ledger) {
//     console.warn('  ⚠ No ledger found for DebtOwner creation');
//     return;
//   }

//   await prisma.debtOwner.upsert({
//     where: { id: 1 },
//     update: {},
//     create: {
//       name: 'Sister',
//       ledgerId: ledger.id,
//     },
//   });

//   console.log('  ✔ Debt owners seeded');
// };
