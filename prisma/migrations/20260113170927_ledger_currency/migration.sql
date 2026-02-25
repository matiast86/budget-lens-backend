/*
  Warnings:

  - Added the required column `currency` to the `ledgers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ledgers" ADD COLUMN     "currency" "Currency" NOT NULL;
