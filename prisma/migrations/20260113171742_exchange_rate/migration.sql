/*
  Warnings:

  - Made the column `groupId` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_groupId_fkey";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "exchangeRate" DECIMAL(65,30),
ALTER COLUMN "groupId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
