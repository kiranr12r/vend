-- Migration: add_gstin_profiles
-- Adds the gstin_profiles table and unique index on gstin

CREATE TABLE "gstin_profiles" (
    "id" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "tradeName" TEXT,
    "legalName" TEXT,
    "pan" TEXT,
    "dateOfRegistration" TEXT,
    "status" TEXT,
    "businessType" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "natureOfBusiness" TEXT,
    "annualTurnover" TEXT,
    "compositeScheme" BOOLEAN,
    "eInvoiceApplicable" BOOLEAN,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "gstin_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gstin_profiles_gstin_key" ON "gstin_profiles"("gstin");
