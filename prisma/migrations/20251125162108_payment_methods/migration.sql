/*
  Warnings:

  - You are about to drop the column `paymentType` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the `credit_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ledgers_credit_cards` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentMethodId` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "credit_cards" DROP CONSTRAINT "credit_cards_userId_fkey";

-- DropForeignKey
ALTER TABLE "ledgers_credit_cards" DROP CONSTRAINT "ledgers_credit_cards_creditCardId_fkey";

-- DropForeignKey
ALTER TABLE "ledgers_credit_cards" DROP CONSTRAINT "ledgers_credit_cards_ledgerId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "paymentType",
ADD COLUMN     "paymentMethodId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "credit_cards";

-- DropTable
DROP TABLE "ledgers_credit_cards";

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "brand" "CreditBrand",
    "color" TEXT,
    "icon" TEXT,
    "currency" "Currency",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" UUID NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledgers_payment_methods" (
    "paymentMethodId" INTEGER NOT NULL,
    "ledgerId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "ledgers_payment_methods_pkey" PRIMARY KEY ("paymentMethodId","ledgerId")
);

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledgers_payment_methods" ADD CONSTRAINT "ledgers_payment_methods_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledgers_payment_methods" ADD CONSTRAINT "ledgers_payment_methods_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "ledgers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
