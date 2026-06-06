-- Add emailVerified (required by @auth/prisma-adapter)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);
-- Make name nullable (OAuth can send null)
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;
