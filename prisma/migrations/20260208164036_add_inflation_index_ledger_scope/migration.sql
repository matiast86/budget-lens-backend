/*
  Warnings:

  - A unique constraint covering the columns `[ledgerId,period]` on the table `inflation_indexes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ledgerId` to the `inflation_indexes` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "inflation_indexes_period_key";

-- AlterTable
ALTER TABLE "inflation_indexes" ADD COLUMN     "ledgerId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "inflation_indexes_ledgerId_period_key" ON "inflation_indexes"("ledgerId", "period");

-- AddForeignKey
ALTER TABLE "inflation_indexes" ADD CONSTRAINT "inflation_indexes_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
