/*
  Warnings:

  - Added the required column `targetId` to the `Complain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Complain" ADD COLUMN     "targetId" TEXT NOT NULL;
