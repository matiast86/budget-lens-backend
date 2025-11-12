/*
  Warnings:

  - You are about to drop the column `assigndBy` on the `LedgerCreditCard` table. All the data in the column will be lost.
  - Added the required column `assignedBy` to the `LedgerCreditCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isActive` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LedgerCreditCard" DROP COLUMN "assigndBy",
ADD COLUMN     "assignedBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL;
