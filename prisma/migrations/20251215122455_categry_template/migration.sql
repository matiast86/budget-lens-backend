/*
  Warnings:

  - A unique constraint covering the columns `[ledgerId,name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CategoryScope" AS ENUM ('GLOBAL');

-- DropIndex
DROP INDEX "categories_name_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "templateId" INTEGER;

-- CreateTable
CREATE TABLE "categories_template" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "CategoryScope" NOT NULL,

    CONSTRAINT "categories_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_template_name_key" ON "categories_template"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_ledgerId_name_key" ON "categories"("ledgerId", "name");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "categories_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
