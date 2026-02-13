/*
  Warnings:

  - You are about to drop the column `ledgerId` on the `inflation_indexes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[currency,period]` on the table `inflation_indexes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `inflation_indexes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "inflation_indexes" DROP CONSTRAINT "inflation_indexes_ledgerId_fkey";

-- DropIndex
DROP INDEX "inflation_indexes_ledgerId_period_key";

-- AlterTable
ALTER TABLE "inflation_indexes" DROP COLUMN "ledgerId",
ADD COLUMN     "currency" "Currency" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "inflation_indexes_currency_period_key" ON "inflation_indexes"("currency", "period");
