/*
  Warnings:

  - A unique constraint covering the columns `[ledgerId,name]` on the table `groups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "groups_ledgerId_name_key" ON "groups"("ledgerId", "name");
