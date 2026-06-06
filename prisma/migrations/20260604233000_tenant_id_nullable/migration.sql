-- AlterTable: make tenantId nullable on users
ALTER TABLE "users" ALTER COLUMN "tenantId" DROP NOT NULL;
