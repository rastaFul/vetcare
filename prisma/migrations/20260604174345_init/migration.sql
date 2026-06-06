-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'VETERINARIAN', 'ASSISTANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TutorStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('ACTIVE', 'DECEASED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Species" AS ENUM ('DOG', 'CAT', 'BIRD', 'RABBIT', 'REPTILE', 'OTHER');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('EXAM', 'PHOTO', 'REPORT', 'EXTERNAL_PRESCRIPTION', 'OTHER');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VETERINARIAN',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "crmv" TEXT,
    "specialty" TEXT,
    "signatureUrl" TEXT,
    "googleId" TEXT,
    "googleCalendarToken" TEXT,
    "googleCalendarRefresh" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "tutors" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "notes" TEXT,
    "status" "TutorStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" "Species" NOT NULL,
    "breed" TEXT,
    "sex" "Sex" NOT NULL DEFAULT 'UNKNOWN',
    "birthDate" TIMESTAMP(3),
    "weightKg" DECIMAL(5,2),
    "color" TEXT,
    "castrated" BOOLEAN NOT NULL DEFAULT false,
    "microchip" TEXT,
    "photoUrl" TEXT,
    "notes" TEXT,
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "googleCalendarEventId" TEXT,
    "anamnesis" TEXT,
    "diagnosis" TEXT,
    "observations" TEXT,
    "returnDate" TIMESTAMP(3),
    "returnEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccination_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "vaccine" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL,
    "nextDoseAt" TIMESTAMP(3),
    "batchNumber" TEXT,
    "manufacturer" TEXT,
    "observations" TEXT,
    "googleCalendarEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vaccination_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deworming_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL,
    "nextApplicationAt" TIMESTAMP(3),
    "observations" TEXT,
    "googleCalendarEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deworming_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anti_fleas_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL,
    "nextApplicationAt" TIMESTAMP(3),
    "observations" TEXT,
    "googleCalendarEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anti_fleas_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "observations" TEXT,
    "pdfUrl" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "instructions" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "consultationId" TEXT,
    "type" "AttachmentType" NOT NULL DEFAULT 'OTHER',
    "name" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "tutors_tenantId_idx" ON "tutors"("tenantId");

-- CreateIndex
CREATE INDEX "tutors_tenantId_name_idx" ON "tutors"("tenantId", "name");

-- CreateIndex
CREATE INDEX "tutors_tenantId_phone_idx" ON "tutors"("tenantId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "tutors_tenantId_cpf_key" ON "tutors"("tenantId", "cpf");

-- CreateIndex
CREATE INDEX "animals_tenantId_idx" ON "animals"("tenantId");

-- CreateIndex
CREATE INDEX "animals_tenantId_tutorId_idx" ON "animals"("tenantId", "tutorId");

-- CreateIndex
CREATE INDEX "animals_tenantId_species_idx" ON "animals"("tenantId", "species");

-- CreateIndex
CREATE INDEX "consultations_tenantId_idx" ON "consultations"("tenantId");

-- CreateIndex
CREATE INDEX "consultations_tenantId_animalId_idx" ON "consultations"("tenantId", "animalId");

-- CreateIndex
CREATE INDEX "consultations_tenantId_scheduledAt_idx" ON "consultations"("tenantId", "scheduledAt");

-- CreateIndex
CREATE INDEX "consultations_tenantId_status_idx" ON "consultations"("tenantId", "status");

-- CreateIndex
CREATE INDEX "consultations_tenantId_veterinarianId_scheduledAt_idx" ON "consultations"("tenantId", "veterinarianId", "scheduledAt");

-- CreateIndex
CREATE INDEX "vaccination_records_tenantId_idx" ON "vaccination_records"("tenantId");

-- CreateIndex
CREATE INDEX "vaccination_records_animalId_idx" ON "vaccination_records"("animalId");

-- CreateIndex
CREATE INDEX "vaccination_records_tenantId_nextDoseAt_idx" ON "vaccination_records"("tenantId", "nextDoseAt");

-- CreateIndex
CREATE INDEX "deworming_records_tenantId_idx" ON "deworming_records"("tenantId");

-- CreateIndex
CREATE INDEX "deworming_records_animalId_idx" ON "deworming_records"("animalId");

-- CreateIndex
CREATE INDEX "anti_fleas_records_tenantId_idx" ON "anti_fleas_records"("tenantId");

-- CreateIndex
CREATE INDEX "anti_fleas_records_animalId_idx" ON "anti_fleas_records"("animalId");

-- CreateIndex
CREATE INDEX "prescriptions_tenantId_idx" ON "prescriptions"("tenantId");

-- CreateIndex
CREATE INDEX "prescriptions_animalId_idx" ON "prescriptions"("animalId");

-- CreateIndex
CREATE INDEX "prescriptions_consultationId_idx" ON "prescriptions"("consultationId");

-- CreateIndex
CREATE INDEX "prescription_items_prescriptionId_idx" ON "prescription_items"("prescriptionId");

-- CreateIndex
CREATE INDEX "attachments_tenantId_idx" ON "attachments"("tenantId");

-- CreateIndex
CREATE INDEX "attachments_animalId_idx" ON "attachments"("animalId");

-- CreateIndex
CREATE INDEX "attachments_consultationId_idx" ON "attachments"("consultationId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutors" ADD CONSTRAINT "tutors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccination_records" ADD CONSTRAINT "vaccination_records_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deworming_records" ADD CONSTRAINT "deworming_records_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anti_fleas_records" ADD CONSTRAINT "anti_fleas_records_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
