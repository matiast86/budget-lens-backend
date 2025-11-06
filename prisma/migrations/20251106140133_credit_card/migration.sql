/*
  Warnings:

  - Added the required column `userId` to the `CreditCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Group" DROP CONSTRAINT "Group_ledgerId_fkey";

-- AlterTable
ALTER TABLE "CreditCard" ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" UUID NOT NULL,
ALTER COLUMN "ledgerId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LedgerCreditCard" (
    "creditCardId" INTEGER NOT NULL,
    "ledgerId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigndBy" TEXT NOT NULL,

    CONSTRAINT "LedgerCreditCard_pkey" PRIMARY KEY ("creditCardId","ledgerId")
);

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerCreditCard" ADD CONSTRAINT "LedgerCreditCard_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "CreditCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerCreditCard" ADD CONSTRAINT "LedgerCreditCard_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "Ledger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
