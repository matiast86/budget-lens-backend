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
  const ledger = await prisma.ledger.findFirst({
    where: { name: 'Gastos Mati' },
  });

  if (!ledger) {
    console.warn('  ⚠ Ledger not found, skipping payment method assignment.');
    return;
  }

  // General / income
  const generalMethods = [
    { name: 'Sueldo', type: PaymentType.BANK },
    { name: 'Bancos', type: PaymentType.BANK },
    { name: 'Ahorros', type: PaymentType.BANK },
    { name: 'Mercado Pago', type: PaymentType.WALLET },
  ];

  // Cash / credit
  const expenseMethods = [
    { name: 'Efvo./Transf.', type: PaymentType.CASH },
    { name: 'Créditos', type: PaymentType.OTHER },
    {
      name: 'VISA GAL',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.VISA,
      currency: Currency.ARS,
    },
    {
      name: 'VISA CDD',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.VISA,
      currency: Currency.ARS,
    },
    {
      name: 'VISA BBVA',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.VISA,
      currency: Currency.ARS,
    },
    {
      name: 'AMEX GAL',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.AMEX,
      currency: Currency.ARS,
    },
    {
      name: 'MASTER CAR',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.MASTER,
      currency: Currency.ARS,
    },
    {
      name: 'MASTER MELI',
      type: PaymentType.CREDIT_CARD,
      brand: CreditBrand.MASTER,
      currency: Currency.ARS,
    },
  ];

  for (const method of [...generalMethods, ...expenseMethods]) {
    const pm = await prisma.paymentMethod.upsert({
      where: { userId_name: { userId: user.id, name: method.name } },
      update: {},
      create: { userId: user.id, ...method },
    });

    await prisma.ledgerPaymentMethod.upsert({
      where: {
        paymentMethodId_ledgerId: {
          paymentMethodId: pm.id,
          ledgerId: ledger.id,
        },
      },
      update: {},
      create: {
        paymentMethodId: pm.id,
        ledgerId: ledger.id,
        assignedBy: user.id,
      },
    });
  }

  console.log('  ✔ Payment methods seeded');
};
