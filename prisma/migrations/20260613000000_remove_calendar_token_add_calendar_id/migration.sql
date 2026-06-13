-- Remove googleCalendarToken and googleCalendarRefresh from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "googleCalendarToken";
ALTER TABLE "users" DROP COLUMN IF EXISTS "googleCalendarRefresh";

-- Add googleCalendarId and googleCalendarShareUrl to tenants
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "googleCalendarId" TEXT;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "googleCalendarShareUrl" TEXT;
