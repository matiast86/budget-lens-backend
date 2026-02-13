/*
  Warnings:

  - You are about to drop the column `amount` on the `debts` table. All the data in the column will be lost.
  - You are about to drop the column `debtOwnerId` on the `debts` table. All the data in the column will be lost.
  - You are about to drop the column `direction` on the `debts` table. All the data in the column will be lost.
  - You are about to drop the column `debtOwnerId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "debts" DROP CONSTRAINT "debts_debtOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_debtOwnerId_fkey";

-- AlterTable
ALTER TABLE "debts" DROP COLUMN "amount",
DROP COLUMN "debtOwnerId",
DROP COLUMN "direction";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "debtOwnerId";

-- CreateTable
CREATE TABLE "transactions_debt_owners" (
    "transactionId" INTEGER NOT NULL,
    "debtOwnerId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "direction" "DebtDirection" NOT NULL,
    "debtId" INTEGER NOT NULL,

    CONSTRAINT "transactions_debt_owners_pkey" PRIMARY KEY ("transactionId","debtOwnerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "transactions_debt_owners_debtId_key" ON "transactions_debt_owners"("debtId");

-- AddForeignKey
ALTER TABLE "transactions_debt_owners" ADD CONSTRAINT "transactions_debt_owners_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions_debt_owners" ADD CONSTRAINT "transactions_debt_owners_debtOwnerId_fkey" FOREIGN KEY ("debtOwnerId") REFERENCES "debt_owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions_debt_owners" ADD CONSTRAINT "transactions_debt_owners_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "debts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
