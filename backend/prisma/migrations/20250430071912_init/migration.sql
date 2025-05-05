/*
  Warnings:

  - You are about to drop the `RealTimeCarpoolRide` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RealTimeCarpoolRide" DROP CONSTRAINT "RealTimeCarpoolRide_driverId_fkey";

-- DropForeignKey
ALTER TABLE "RealTimeCarpoolRide" DROP CONSTRAINT "RealTimeCarpoolRide_passengerId_fkey";

-- AlterTable
ALTER TABLE "CarpoolRequestPost" ALTER COLUMN "departureTime" DROP DEFAULT,
ALTER COLUMN "departureTime" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "RealTimeCarpoolRide";
