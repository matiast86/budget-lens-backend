// import { PrismaClient } from 'prisma/generated/prisma/client';

// export const seedLedgers = async (prisma: PrismaClient) => {
//   console.log('  ➤ Seeding ledgers...');

//   const user = await prisma.user.findUnique({
//     where: { email: 'matias@mail.com' },
//   });

//   if (!user) {
//     console.warn('  ⚠ User not found for ledger creation.');
//     return;
//   }

//   await prisma.ledger.upsert({
//     where: { id: 1 }, // might be replaced with unique name/owner constraint
//     update: {},
//     create: {
//       name: 'Home Budget',
//       description: 'Primary personal ledger',
//       ownerId: user.id,
//     },
//   });

//   console.log('  ✔ Ledgers seeded');
// };
