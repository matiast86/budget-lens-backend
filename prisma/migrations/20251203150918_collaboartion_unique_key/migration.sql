/*
  Warnings:

  - A unique constraint covering the columns `[userId,ledgerId]` on the table `collaborations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "collaborations_userId_ledgerId_key" ON "collaborations"("userId", "ledgerId");
