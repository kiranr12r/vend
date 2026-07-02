-- Migration: add_user_profile_fields
-- Adds profile and vendor linkage fields to the users table

ALTER TABLE "users" ADD COLUMN     "address" TEXT;
ALTER TABLE "users" ADD COLUMN     "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN     "gstNumber" TEXT;
ALTER TABLE "users" ADD COLUMN     "panCard" TEXT;
ALTER TABLE "users" ADD COLUMN     "phoneNumber" TEXT;
ALTER TABLE "users" ADD COLUMN     "vendorId" TEXT;

ALTER TABLE "users" ADD CONSTRAINT "users_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "users_vendorId_idx" ON "users"("vendorId");
