/*
  Warnings:

  - You are about to drop the column `vehiclePic` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('FOURWHEEL', 'TWOWHEEL');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "vehiclePic",
ADD COLUMN     "driver" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL DEFAULT 'FOURWHEEL',
    "name" TEXT NOT NULL,
    "numberPlate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehiclePics" TEXT[],

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealTimeCarpoolRide" (
    "id" TEXT NOT NULL,
    "pickLocation" TEXT NOT NULL,
    "dropLocation" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "cost" INTEGER NOT NULL,
    "isAccpted" BOOLEAN NOT NULL DEFAULT false,
    "passengerId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,

    CONSTRAINT "RealTimeCarpoolRide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_userId_key" ON "Vehicle"("userId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealTimeCarpoolRide" ADD CONSTRAINT "RealTimeCarpoolRide_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealTimeCarpoolRide" ADD CONSTRAINT "RealTimeCarpoolRide_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
