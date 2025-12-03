// test.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function main() {
  console.log(Object.keys(prisma)); // should list models like "user", "ledger", etc.
}

main();
