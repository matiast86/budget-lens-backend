import { Currency, PrismaClient } from 'prisma/generated/prisma/client';

// CPI base 100 = January 2024.
// Each entry: [period, monthlyRate, cpiIndex]
// monthlyRate is a decimal (e.g., 0.022 = 2.2%)

// ARS: Jan–Dec 2025 confirmed (INDEC), Jan 2026 confirmed, Feb–Dec 2026 projected at 2%.
const arsData: [string, number, number][] = [
  // 2025 — confirmed
  ['2025-01-01', 0.022, 184.6188],
  ['2025-02-01', 0.024, 189.0497],
  ['2025-03-01', 0.037, 196.0445],
  ['2025-04-01', 0.028, 201.5338],
  ['2025-05-01', 0.025, 206.5721],
  ['2025-06-01', 0.027, 212.1496],
  ['2025-07-01', 0.024, 217.2412],
  ['2025-08-01', 0.025, 222.6722],
  ['2025-09-01', 0.023, 227.7937],
  ['2025-10-01', 0.027, 233.9442],
  ['2025-11-01', 0.025, 239.7928],
  ['2025-12-01', 0.028, 246.5071],
  // 2026 — Jan confirmed, Feb–Dec projected at 2%
  ['2026-01-01', 0.029, 253.6538],
  ['2026-02-01', 0.02, 258.7269],
  ['2026-03-01', 0.02, 263.9014],
  ['2026-04-01', 0.02, 269.1795],
  ['2026-05-01', 0.02, 274.5631],
  ['2026-06-01', 0.02, 280.0543],
  ['2026-07-01', 0.02, 285.6554],
  ['2026-08-01', 0.02, 291.3685],
  ['2026-09-01', 0.02, 297.1959],
  ['2026-10-01', 0.02, 303.1398],
  ['2026-11-01', 0.02, 309.2026],
  ['2026-12-01', 0.02, 315.3867],
];

// USD: Jan–Sep 2025 confirmed (BLS), Oct–Nov estimated (gov shutdown),
// Dec 2025 confirmed, Jan–Dec 2026 projected at 0.2%.
const usdData: [string, number, number][] = [
  // 2025 — confirmed (seasonally adjusted MoM)
  ['2025-01-01', 0.005, 103.0399],
  ['2025-02-01', 0.002, 103.246],
  ['2025-03-01', -0.001, 103.1428],
  ['2025-04-01', 0.002, 103.3491],
  ['2025-05-01', 0.001, 103.4525],
  ['2025-06-01', 0.003, 103.7628],
  ['2025-07-01', 0.002, 103.9704],
  ['2025-08-01', 0.004, 104.3863],
  ['2025-09-01', 0.003, 104.6994],
  ['2025-10-01', 0.002, 104.9088], // estimated (gov shutdown)
  ['2025-11-01', 0.002, 105.1186], // estimated (gov shutdown)
  ['2025-12-01', 0.003, 105.434],
  // 2026 — projected at ~0.2% monthly (~2.4% annual)
  ['2026-01-01', 0.002, 105.6449],
  ['2026-02-01', 0.002, 105.8562],
  ['2026-03-01', 0.002, 106.068],
  ['2026-04-01', 0.002, 106.2801],
  ['2026-05-01', 0.002, 106.4927],
  ['2026-06-01', 0.002, 106.7057],
  ['2026-07-01', 0.002, 106.9191],
  ['2026-08-01', 0.002, 107.1329],
  ['2026-09-01', 0.002, 107.3472],
  ['2026-10-01', 0.002, 107.5619],
  ['2026-11-01', 0.002, 107.777],
  ['2026-12-01', 0.002, 107.9926],
];

export const seedInflationIndexes = async (prisma: PrismaClient) => {
  console.log('  ➤ Seeding inflation indexes...');

  const allData = [
    ...arsData.map(([period, monthlyRate, cpiIndex]) => ({
      currency: Currency.ARS,
      period,
      monthlyRate,
      cpiIndex,
    })),
    ...usdData.map(([period, monthlyRate, cpiIndex]) => ({
      currency: Currency.USD,
      period,
      monthlyRate,
      cpiIndex,
    })),
  ];

  for (const entry of allData) {
    const period = new Date(entry.period);
    await prisma.inflationIndex.upsert({
      where: {
        currency_period: {
          currency: entry.currency,
          period,
        },
      },
      update: {},
      create: {
        currency: entry.currency,
        period,
        monthlyRate: entry.monthlyRate,
        cpiIndex: entry.cpiIndex,
      },
    });
  }

  console.log('  ✔ Inflation indexes seeded');
};
