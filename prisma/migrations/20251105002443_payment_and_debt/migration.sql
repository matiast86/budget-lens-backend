-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "CreditBrand" AS ENUM ('VISA', 'AMEX', 'MASTER', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'BANK', 'WALLET', 'CREDIT_CARD', 'DEBT', 'OTHER');

-- CreateEnum
CREATE TYPE "DebtDirection" AS ENUM ('OWED_TO_ME', 'OWED_BY_ME');

-- CreateTable
CREATE TABLE "CreditCard" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CreditBrand" NOT NULL,

    CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" SERIAL NOT NULL,
    "debtOwnerId" INTEGER NOT NULL,
    "directio" "DebtDirection" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtOwner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DebtOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_debtOwnerId_fkey" FOREIGN KEY ("debtOwnerId") REFERENCES "DebtOwner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
