/*
  Warnings:

  - Added the required column `ledgerId` to the `debt_owners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "debt_owners" ADD COLUMN     "ledgerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "debt_owners" ADD CONSTRAINT "debt_owners_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
