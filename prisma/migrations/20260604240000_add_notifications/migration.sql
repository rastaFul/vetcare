-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONSULTATION_REMINDER', 'VACCINATION_REMINDER', 'RETURN_REMINDER', 'CUSTOM');
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP', 'EMAIL');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED');

-- AlterTable: Tutor notification preferences
ALTER TABLE "tutors"
  ADD COLUMN "notifyWhatsApp" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notifyEmail" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "notifyConsultation" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notifyVaccination" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notifyReturn" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Tenant notification config
ALTER TABLE "tenants"
  ADD COLUMN "evolutionApiUrl" TEXT,
  ADD COLUMN "evolutionApiKey" TEXT,
  ADD COLUMN "evolutionInstanceName" TEXT,
  ADD COLUMN "resendApiKey" TEXT,
  ADD COLUMN "resendFromEmail" TEXT;

-- CreateTable: NotificationLog
CREATE TABLE "notification_logs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "tutorId" TEXT NOT NULL,
  "animalId" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "recipientPhone" TEXT,
  "recipientEmail" TEXT,
  "message" TEXT NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "errorMessage" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_logs_tenantId_idx" ON "notification_logs"("tenantId");
CREATE INDEX "notification_logs_tutorId_idx" ON "notification_logs"("tutorId");
CREATE INDEX "notification_logs_animalId_idx" ON "notification_logs"("animalId");
CREATE INDEX "notification_logs_tenantId_status_idx" ON "notification_logs"("tenantId", "status");
CREATE INDEX "notification_logs_tenantId_createdAt_idx" ON "notification_logs"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
