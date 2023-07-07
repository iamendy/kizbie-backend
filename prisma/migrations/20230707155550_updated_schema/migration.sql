/*
  Warnings:

  - Added the required column `createdAt` to the `books` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `ratings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "books" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ratings" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;
