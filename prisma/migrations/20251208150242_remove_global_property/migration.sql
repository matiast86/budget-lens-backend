/*
  Warnings:

  - You are about to drop the column `isGlobal` on the `groups` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "groups_userId_name_key";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "isGlobal";
