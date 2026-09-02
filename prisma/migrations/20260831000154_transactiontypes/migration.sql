/*
  Warnings:

  - You are about to drop the column `type` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "type",
ADD COLUMN     "plannedAmount" DECIMAL(65,30),
ADD COLUMN     "transactionType" "TransactionType" NOT NULL DEFAULT 'VARIABLE';
