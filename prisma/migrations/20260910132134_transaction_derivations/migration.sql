-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "derivationRate" DECIMAL(10,6);

-- CreateTable
CREATE TABLE "transaction_derivations" (
    "id" SERIAL NOT NULL,
    "derivedId" INTEGER NOT NULL,
    "sourceId" INTEGER NOT NULL,

    CONSTRAINT "transaction_derivations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transaction_derivations_sourceId_idx" ON "transaction_derivations"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_derivations_derivedId_sourceId_key" ON "transaction_derivations"("derivedId", "sourceId");

-- AddForeignKey
ALTER TABLE "transaction_derivations" ADD CONSTRAINT "transaction_derivations_derivedId_fkey" FOREIGN KEY ("derivedId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_derivations" ADD CONSTRAINT "transaction_derivations_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
