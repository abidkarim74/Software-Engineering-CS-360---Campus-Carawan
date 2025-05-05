/*
  Warnings:

  - The `departureTime` column on the `CarpoolRequestPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CarpoolRequestPost" DROP COLUMN "departureTime",
ADD COLUMN     "departureTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "RealTimeCarpoolRide" (
    "id" TEXT NOT NULL,
    "pickLocation" TEXT NOT NULL,
    "dropLocation" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cost" INTEGER NOT NULL,
    "isAccpted" BOOLEAN NOT NULL DEFAULT false,
    "passengerId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,

    CONSTRAINT "RealTimeCarpoolRide_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RealTimeCarpoolRide" ADD CONSTRAINT "RealTimeCarpoolRide_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealTimeCarpoolRide" ADD CONSTRAINT "RealTimeCarpoolRide_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
