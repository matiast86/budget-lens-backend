/*
  Warnings:

  - You are about to drop the column `month` on the `debts` table. All the data in the column will be lost.
  - Added the required column `period` to the `debts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "debts" DROP COLUMN "month",
ADD COLUMN     "period" TIMESTAMP(3) NOT NULL;
