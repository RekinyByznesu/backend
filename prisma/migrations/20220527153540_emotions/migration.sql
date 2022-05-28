-- CreateEnum
CREATE TYPE "EmotionType" AS ENUM ('HAPPY', 'SAD', 'ANGRY', 'GUILT', 'WORRIED', 'ANXIOUS');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "emotions" "EmotionType"[];
