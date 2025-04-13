-- AlterTable
ALTER TABLE "RealTimeCarpoolRide" ALTER COLUMN "time" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "CarpoolRequestPost" (
    "id" TEXT NOT NULL,
    "posterId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickLocation" TEXT NOT NULL,
    "dropLocation" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "caption" TEXT NOT NULL,

    CONSTRAINT "CarpoolRequestPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarpoolRequestPost" ADD CONSTRAINT "CarpoolRequestPost_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarpoolRequestPost" ADD CONSTRAINT "CarpoolRequestPost_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
