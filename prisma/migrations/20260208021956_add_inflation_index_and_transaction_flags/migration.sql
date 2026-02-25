-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "cpiIndex" DECIMAL(65,30),
ADD COLUMN     "impactsCashflow" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "realMonthlyAmount" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "inflation_indexes" (
    "id" SERIAL NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "monthlyRate" DECIMAL(10,6) NOT NULL,
    "cpiIndex" DECIMAL(10,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inflation_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inflation_indexes_period_key" ON "inflation_indexes"("period");
