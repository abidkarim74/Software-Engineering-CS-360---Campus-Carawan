/*
  Warnings:

  - Added the required column `notifierId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "notifierId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "rating" SET DEFAULT 0.0,
ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
