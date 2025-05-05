-- CreateEnum
CREATE TYPE "Type" AS ENUM ('STUDENT', 'FACULTY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('FOUR_WHEEL', 'TWO_WHEEL', 'THREE_WHEEL', 'HEAVY');

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complain" (
    "id" TEXT NOT NULL,
    "complainerId" TEXT NOT NULL,
    "complain" TEXT NOT NULL,

    CONSTRAINT "Complain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "driver" BOOLEAN NOT NULL DEFAULT false,
    "profilePic" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "type" "Type" NOT NULL DEFAULT 'STUDENT',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationTokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL DEFAULT 'FOUR_WHEEL',
    "name" TEXT NOT NULL,
    "numberPlate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehiclePics" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "CarpoolRequestPost" (
    "id" TEXT NOT NULL,
    "posterId" TEXT NOT NULL,
    "otherId" TEXT,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickLocation" TEXT NOT NULL,
    "pickCordinate" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "dropCordinate" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "dropLocation" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "isSuccessful" BOOLEAN NOT NULL DEFAULT false,
    "caption" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seats" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CarpoolRequestPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "notifierId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConversationToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConversationToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_userId_key" ON "Vehicle"("userId");

-- CreateIndex
CREATE INDEX "_ConversationToUser_B_index" ON "_ConversationToUser"("B");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complain" ADD CONSTRAINT "Complain_complainerId_fkey" FOREIGN KEY ("complainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealTimeCarpoolRide" ADD CONSTRAINT "RealTimeCarpoolRide_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealTimeCarpoolRide" ADD CONSTRAINT "RealTimeCarpoolRide_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarpoolRequestPost" ADD CONSTRAINT "CarpoolRequestPost_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarpoolRequestPost" ADD CONSTRAINT "CarpoolRequestPost_otherId_fkey" FOREIGN KEY ("otherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConversationToUser" ADD CONSTRAINT "_ConversationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConversationToUser" ADD CONSTRAINT "_ConversationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
