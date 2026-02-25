/*
  Warnings:

  - Made the column `description` on table `debts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "debts" ALTER COLUMN "description" SET NOT NULL;
