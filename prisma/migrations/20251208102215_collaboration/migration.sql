/*
  Warnings:

  - You are about to drop the column `role` on the `collaborations` table. All the data in the column will be lost.
  - Added the required column `name` to the `collaborations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "collaborations" DROP COLUMN "role",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropEnum
DROP TYPE "CollaborationRole";
