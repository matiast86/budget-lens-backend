/*
  Warnings:

  - The primary key for the `transaction_derivations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `transaction_derivations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "transaction_derivations_derivedId_sourceId_key";

-- AlterTable
ALTER TABLE "transaction_derivations" DROP CONSTRAINT "transaction_derivations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "transaction_derivations_pkey" PRIMARY KEY ("derivedId", "sourceId");
