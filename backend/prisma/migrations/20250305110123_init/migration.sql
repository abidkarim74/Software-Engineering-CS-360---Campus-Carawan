/*
  Warnings:

  - You are about to drop the column `driverId` on the `CarpoolRequestPost` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CarpoolRequestPost" DROP CONSTRAINT "CarpoolRequestPost_driverId_fkey";

-- AlterTable
ALTER TABLE "CarpoolRequestPost" DROP COLUMN "driverId",
ADD COLUMN     "otherId" TEXT;

-- AddForeignKey
ALTER TABLE "CarpoolRequestPost" ADD CONSTRAINT "CarpoolRequestPost_otherId_fkey" FOREIGN KEY ("otherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
