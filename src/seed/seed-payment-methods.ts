import {
  CreditBrand,
  Currency,
  PaymentType,
  PrismaClient,
} from 'prisma/generated/prisma/client';

export const seedPaymentMethods = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding payment methods...');

  const user = await prisma.user.findUnique({
    where: { email: 'matias@mail.com' },
  });

  if (!user) return;

  // Income only
  const incomeMethods = [
    { name: 'Salary', type: PaymentType.BANK },
    { name: 'Banks', type: PaymentType.BANK },
    { name: 'Savings', type: PaymentType.BANK },
    { name: 'Mercado Pago', type: PaymentType.WALLET },
  ];

  // Expense
  const expenseMethods = [
    { name: 'Cash / Transfer', type: PaymentType.CASH },
    {
      name: 'Visa Galicia',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.VISA,
      currency: Currency.ARS,
    },
    {
      name: 'Visa Ciudad',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.VISA,
      currency: Currency.ARS,
    },
    {
      name: 'Mastercard',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.MASTER,
      currency: Currency.ARS,
    },
    {
      name: 'Amex Galicia',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.AMEX,
      currency: Currency.ARS,
    },
  ];

  for (const method of [...incomeMethods, ...expenseMethods]) {
    await prisma.paymentMethod.upsert({
      where: { userId_name: { userId: user.id, name: method.name } },
      update: {},
      create: { userId: user.id, ...method },
    });
  }

  console.log('  ✔ Payment methods seeded');
};
