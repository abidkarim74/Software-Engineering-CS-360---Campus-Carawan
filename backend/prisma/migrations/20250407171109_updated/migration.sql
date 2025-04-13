/*
  Warnings:

  - The values [FOURWHEEL,TWOWHEEL] on the enum `VehicleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VehicleType_new" AS ENUM ('FOUR_WHEEL', 'TWO_WHEEL', 'THREE_WHEEL', 'HEAVY');
ALTER TABLE "Vehicle" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Vehicle" ALTER COLUMN "type" TYPE "VehicleType_new" USING ("type"::text::"VehicleType_new");
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "VehicleType_old";
ALTER TABLE "Vehicle" ALTER COLUMN "type" SET DEFAULT 'FOUR_WHEEL';
COMMIT;

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "type" SET DEFAULT 'FOUR_WHEEL';
