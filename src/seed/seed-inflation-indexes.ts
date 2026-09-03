import { Currency, PrismaClient } from 'prisma/generated/prisma/client';

// CPI base 100 = January 2024.
// Each entry: [period, monthlyRate, cpiIndex]
// monthlyRate is a decimal (e.g., 0.022 = 2.2%)

// ARS: Jan 2025–Jul 2026 confirmed (INDEC IPC, Nivel general, total país).
// Aug 2026 not yet published as of this seed's last update (INDEC releases each
// month's IPC ~10th of the following month) — uses the BCRA REM (market
// expectations survey) consensus estimate of 1.8% instead of confirmed data.
// Sep–Dec 2026 left as a flat 2% projection.
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
  // 2026 — Jan–Jul confirmed (INDEC), Aug–Dec projected at 2%
  ['2026-01-01', 0.029, 253.6558],
  ['2026-02-01', 0.029, 261.0118],
  ['2026-03-01', 0.034, 269.8862],
  ['2026-04-01', 0.026, 276.9032],
  ['2026-05-01', 0.021, 282.7182],
  ['2026-06-01', 0.019, 288.0898],
  ['2026-07-01', 0.021, 294.1397],
  ['2026-08-01', 0.018, 299.4342], // BCRA REM consensus estimate, not yet confirmed
  ['2026-09-01', 0.02, 305.4229],
  ['2026-10-01', 0.02, 311.5314],
  ['2026-11-01', 0.02, 317.762],
  ['2026-12-01', 0.02, 324.1172],
];

// USD: Jan–Sep 2025 confirmed (BLS), Oct–Nov estimated (gov shutdown),
// Dec 2025 confirmed, Jan–Jul 2026 confirmed (BLS CPI-U, SA MoM).
// Aug–Dec 2026 not yet published as of this seed's last update (BLS releases
// each month's CPI ~10th-13th of the following month) — left as a flat 0.2% projection.
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
  // 2026 — Jan–Jul confirmed (BLS), Aug–Dec projected at 0.2%
  ['2026-01-01', 0.002, 105.6449],
  ['2026-02-01', 0.003, 105.9618],
  ['2026-03-01', 0.009, 106.9155],
  ['2026-04-01', 0.006, 107.557],
  ['2026-05-01', 0.005, 108.0948],
  ['2026-06-01', -0.004, 107.6624],
  ['2026-07-01', 0.001, 107.7701],
  ['2026-08-01', 0.002, 107.9856],
  ['2026-09-01', 0.002, 108.2016],
  ['2026-10-01', 0.002, 108.418],
  ['2026-11-01', 0.002, 108.6348],
  ['2026-12-01', 0.002, 108.8521],
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
