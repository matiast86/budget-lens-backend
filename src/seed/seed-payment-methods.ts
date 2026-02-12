// import { PaymentType, PrismaClient } from 'prisma/generated/prisma/client';

// export const seedPaymentMethods = async (prisma: PrismaClient) => {
//   console.log('  ➤ Seeding payment methods...');

//   const user = await prisma.user.findUnique({
//     where: { email: 'matias@mail.com' },
//   });

//   if (!user) return;

//   await prisma.paymentMethod.upsert({
//     where: {
//       userId_name: {
//         userId: user.id,
//         name: 'Cash Wallet',
//       },
//     },
//     update: {},
//     create: {
//       name: 'Cash Wallet',
//       type: PaymentType.CASH,
//       userId: user.id,
//     },
//   });

//   console.log('  ✔ Payment methods seeded');
// };
