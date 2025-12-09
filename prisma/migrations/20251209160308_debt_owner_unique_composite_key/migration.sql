/*
  Warnings:

  - A unique constraint covering the columns `[ledgerId,name]` on the table `debt_owners` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "debt_owners_ledgerId_name_key" ON "debt_owners"("ledgerId", "name");
