/*
  Warnings:

  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `lockPeriod` to the `Fund` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAmount` to the `Fund` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roiTarget` to the `Fund` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Fund` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Fund` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "investmentPlan" TEXT;

-- AlterTable
ALTER TABLE "Fund" ADD COLUMN     "lockPeriod" INTEGER NOT NULL,
ADD COLUMN     "minAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "roiTarget" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- DropTable
DROP TABLE "Service";

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
