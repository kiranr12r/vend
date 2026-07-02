import { prisma } from "@/lib/prisma";

/**
 * Result of checking a (accountNumber, ifscCode) pair against penny_drop_logs.
 * This ONLY confirms the account is real, active, and name-matched — it does
 * NOT carry or check any transaction amount. Penny-drop APIs never return an
 * amount; they exist purely to validate beneficiary identity before a real
 * payment is made.
 */
export type PennyDropVerification =
  | { outcome: "NOT_FOUND" }
  | { outcome: "NAME_MISMATCH"; transactionId: string }
  | { outcome: "ACCOUNT_FROZEN"; transactionId: string }
  | {
      outcome: "VERIFIED";
      transactionId: string;
      beneficiaryName: string | null;
      bankName: string;
      branchName: string;
      accountType: string;
    };

export async function verifyBankAccount(
  accountNumber: string,
  ifscCode: string
): Promise<PennyDropVerification> {
  const log = await prisma.pennyDropLog.findUnique({
    where: {
      accountNumber_ifscCode: { accountNumber, ifscCode },
    },
    include: {
      bankMaster: true,
    },
  });

  if (!log) {
    return { outcome: "NOT_FOUND" };
  }

  if (log.status === "NAME_MISMATCH") {
    return { outcome: "NAME_MISMATCH", transactionId: log.transactionId };
  }

  if (log.status === "ACCOUNT_FROZEN") {
    return { outcome: "ACCOUNT_FROZEN", transactionId: log.transactionId };
  }

  return {
    outcome: "VERIFIED",
    transactionId: log.transactionId,
    beneficiaryName: log.beneficiaryName,
    bankName: log.bankMaster.bankName,
    branchName: log.bankMaster.branchName,
    accountType: log.accountType,
  };
}
