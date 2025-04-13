/*
  Warnings:

  - Added the required column `cost` to the `CarpoolRequestPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CarpoolRequestPost" ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL;
