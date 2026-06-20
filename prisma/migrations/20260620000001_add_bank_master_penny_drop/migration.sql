-- CreateTable
CREATE TABLE "bank_master" (
    "id" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penny_drop_logs" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "beneficiaryName" TEXT,
    "accountType" "AccountType" NOT NULL DEFAULT 'CURRENT',
    "status" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penny_drop_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_master_ifscCode_key" ON "bank_master"("ifscCode");

-- CreateIndex
CREATE UNIQUE INDEX "penny_drop_logs_transactionId_key" ON "penny_drop_logs"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "penny_drop_logs_accountNumber_ifscCode_key" ON "penny_drop_logs"("accountNumber", "ifscCode");

-- AddForeignKey
ALTER TABLE "penny_drop_logs" ADD CONSTRAINT "penny_drop_logs_ifscCode_fkey"
    FOREIGN KEY ("ifscCode") REFERENCES "bank_master"("ifscCode") ON DELETE RESTRICT ON UPDATE CASCADE;