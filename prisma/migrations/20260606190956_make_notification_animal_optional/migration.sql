-- DropForeignKey
ALTER TABLE "notification_logs" DROP CONSTRAINT "notification_logs_animalId_fkey";

-- AlterTable
ALTER TABLE "notification_logs" ALTER COLUMN "animalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
