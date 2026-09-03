import { Currency, PrismaClient } from 'prisma/generated/prisma/client';
import { parsePeriod } from 'src/helpers/dates';

export const seedLedgers = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding ledgers...');

  const user = await prisma.user.findUnique({
    where: { email: 'matias@mail.com' },
  });

  if (!user) {
    console.warn('  ⚠ User not found for ledger creation.');
    return;
  }

  const categoryData = [
    {
      name: 'Gastos de la casa',
      description: 'Rent, utilities, maintenance and general household costs',
    },
    {
      name: 'Salidas a comer',
      description: 'Restaurants, cafes, takeaway, delivery',
    },
    {
      name: 'Entretenimiento',
      description: 'Streaming, cinema, hobbies, events',
    },
    {
      name: 'Salud',
      description: 'Doctor visits, pharmacy, medical insurance',
    },
    {
      name: 'Transporte',
      description: 'Taxi, rideshare, subway, bus, fuel',
    },
    {
      name: 'Regalos',
      description: 'Presents, celebrations',
    },
    {
      name: 'Vestimenta',
      description: 'Clothes, shoes, accessories',
    },
    {
      name: 'Chicos',
      description:
        'Kindergarten, school, therapies and children related expenses',
    },
    {
      name: 'Librería',
      description: 'Books, stationery, school supplies',
    },
    {
      name: 'Varios',
      description: 'Uncategorized or one-off expenses',
    },
    {
      name: 'Saldo',
      description: 'Opening/closing balance tracker per payment method',
    },
    {
      name: 'Sueldo',
      description: 'Salary income',
    },
    {
      name: 'Créditos',
      description: 'Loan installment payments',
    },
    {
      name: 'Monotributo',
      description: 'Monotributo (self-employment tax) payments',
    },
  ];

  const currency = Currency.ARS;

  // Ledger is seeded as if created in Jan 2026 — baseCpiIndex must be pinned to
  // that same period (not "today"), so a Jan 2026 expense's realMonthlyAmount
  // comes out equal to its nominal amount (base period = itself).
  const ledgerCreationPeriod = parsePeriod('2026-01');

  const inflationIndex = await prisma.inflationIndex.findUnique({
    where: { currency_period: { currency, period: ledgerCreationPeriod } },
  });
  const baseCpiIndex = inflationIndex ? Number(inflationIndex.cpiIndex) : 100;

  await prisma.ledger.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Gastos Mati',
      createdAt: ledgerCreationPeriod.toISOString(),
      description: 'Planilla de Gastos',
      currency,
      baseCpiIndex,
      ownerId: user.id,
      categories: { createMany: { data: categoryData } },
    },
  });

  console.log('  ✔ Ledgers seeded');
};
