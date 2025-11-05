/*
  Warnings:

  - You are about to drop the column `directio` on the `Debt` table. All the data in the column will be lost.
  - Added the required column `direction` to the `Debt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('ARS', 'USD');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CLOSED', 'CURRENT', 'FUTURE');

-- AlterTable
ALTER TABLE "Debt" DROP COLUMN "directio",
ADD COLUMN     "direction" "DebtDirection" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" VARCHAR(64) NOT NULL;

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ledgerId" INTEGER NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "ledgerId" INTEGER NOT NULL,
    "status" "Status" NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "groupId" INTEGER,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "paymentMonth" TIMESTAMP(3),
    "installments" INTEGER NOT NULL DEFAULT 1,
    "installment" INTEGER NOT NULL DEFAULT 1,
    "comment" TEXT,
    "currency" "Currency" NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "monthlyAmount" DECIMAL(65,30) NOT NULL,
    "debtOwnerId" INTEGER,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionBreakDown" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "TransactionBreakDown_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionBreakDown" ADD CONSTRAINT "TransactionBreakDown_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
