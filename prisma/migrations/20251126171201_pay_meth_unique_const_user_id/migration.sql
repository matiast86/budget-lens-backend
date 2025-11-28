/*
  Warnings:

  - A unique constraint covering the columns `[id,userId]` on the table `payment_methods` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_id_userId_key" ON "payment_methods"("id", "userId");
