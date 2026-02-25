/*
  Warnings:

  - Made the column `ledgerId` on table `groups` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_ledgerId_fkey";

-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "ledgerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
