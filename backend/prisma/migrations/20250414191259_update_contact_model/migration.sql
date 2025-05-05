-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "areaOfInterest" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ALTER COLUMN "broker" DROP NOT NULL,
ALTER COLUMN "hasMT5" DROP NOT NULL;
