-- CreateTable
CREATE TABLE "gst_master" (
    "id" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "dateOfRegistration" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "businessType" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "natureOfBusiness" TEXT NOT NULL,
    "annualTurnover" TEXT NOT NULL,
    "compositeScheme" BOOLEAN NOT NULL DEFAULT false,
    "eInvoiceApplicable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gst_master_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gst_master_gstin_key" ON "gst_master"("gstin");