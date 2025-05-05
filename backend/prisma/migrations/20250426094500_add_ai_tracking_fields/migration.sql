-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "aiVersion" TEXT NOT NULL DEFAULT 'InfluenceX AI v1.0',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AI Processing';
