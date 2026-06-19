"use client";

import { useState } from "react";
import { BankAccountData } from "@/types/vendor";

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

const inp =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all duration-150 placeholder:text-gray-300";
const lbl = "block text-xs font-semibold text-gray-500 mb-1.5";

function emptyAccount(): BankAccountData {
  return {
    accountNumber: "",
    ifscCode: "",
    beneficiaryName: "",
    bankName: "",
    branchName: "",
    crn: "",
    accountType: "CURRENT",
    isPrimary: false,
  };
}

type VerifyStatus = "idle" | "verifying" | "verified" | "failed" | "mismatch" | "frozen";

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
      <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block" />
      {text}
    </p>
  );
}

function AccountTypeRadio({
  value,
  selected,
  onSelect,
}: {
  value: "SAVINGS" | "CURRENT";
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-all duration-150 text-xs font-semibold ${
        selected
          ? "border-blue-300 bg-blue-50 text-blue-700"
          : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
      }`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          selected ? "border-blue-600" : "border-gray-300"
        }`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
      </div>
      {value === "SAVINGS" ? "Savings" : "Current"}
    </label>
  );
}

function BankAccountCard({
  account,
  index,
  total,
  allAccounts,
  onChange,
  onRemove,
}: {
  account: BankAccountData;
  index: number;
  total: number;
  allAccounts: BankAccountData[]; 
  onChange: (field: string, value: any) => void; 
  onRemove: (index: number) => void;
}) {
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // ── Single verify click → fetches IFSC + penny drop together
  async function handleVerify() {
  if (!account.accountNumber || !account.ifscCode) return;

  setVerifyStatus("verifying");
  setVerifyMessage("");
  setTransactionId("");

  try {
    const [ifscRes, pennyRes] = await Promise.all([
      fetch(`/api/ifsc?ifsc=${account.ifscCode.trim().toUpperCase()}`),
      fetch("/api/pennydrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: account.accountNumber.trim(),
          ifscCode: account.ifscCode.trim().toUpperCase(),
        }),
      }),
    ]);

    const ifscData = await ifscRes.json();
    const pennyData = await pennyRes.json();

    if (pennyData.success) {
      // ONE atomic update — replaces entire bankAccounts array at once
      const updatedAccounts = allAccounts.map((acc, i) =>
        i === index
          ? {
              ...acc,
              bankName:        pennyData.data.bankName        || ifscData.data?.bankName   || acc.bankName,
              branchName:      pennyData.data.branchName      || ifscData.data?.branchName || acc.branchName,
              beneficiaryName: pennyData.data.beneficiaryName || acc.beneficiaryName,
            }
          : acc
      );

      onChange("bankAccounts", updatedAccounts);

      setVerifyStatus("verified");
      setTransactionId(pennyData.transactionId ?? "");
      setVerifyMessage("Penny drop successful — account verified");
    } else {
      if (pennyData.code === "NAME_MISMATCH") {
        setVerifyStatus("mismatch");
        setVerifyMessage(pennyData.error);
      } else if (pennyData.code === "ACCOUNT_FROZEN") {
        setVerifyStatus("frozen");
        setVerifyMessage(pennyData.error);
      } else {
        setVerifyStatus("failed");
        setVerifyMessage(pennyData.error ?? "Verification failed");
      }
    }
  } catch {
    setVerifyStatus("failed");
    setVerifyMessage("Network error — please try again");
  }
}

  const isPrimary = index === 0;
  const isVerified = verifyStatus === "verified";

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        isPrimary ? "border-blue-200" : "border-gray-200"
      }`}
    >
      {/* Card header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${
          isPrimary ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center ${
              isPrimary ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-gray-700">Bank Account {index + 1}</span>
          {isPrimary && (
            <span className="text-xs font-semibold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
              Primary
            </span>
          )}
          {isVerified && (
            <span className="text-xs font-semibold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </span>
          )}
        </div>
        {total > 1 && (
          <button
            onClick={() => onRemove(index)}
            className="text-gray-300 hover:text-red-400 transition-colors p-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-4">

        {/* Account Number + IFSC — no fetch button */}
        <div>
          <SectionLabel text="Account & Verification" />
          <div className="grid grid-cols-2 gap-3 mb-3">

            {/* Account Number */}
            <div>
              <label className={lbl}>
                Account Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={account.accountNumber}
                onChange={(e) => {
                  onChange("bankAccounts", allAccounts.map((acc, i) =>
                     i === index ? { ...acc, accountNumber: e.target.value.replace(/\D/g, "") } : acc
                    ));
                    if (verifyStatus !== "idle") setVerifyStatus("idle");
                  }}
                placeholder="e.g. 1234567890"
                className={`${inp} font-mono tracking-widest ${
                  isVerified ? "border-emerald-400 bg-emerald-50/50" : ""
                }`}
              />
            </div>

            {/* IFSC Code — plain input, no fetch button */}
            <div>
              <label className={lbl}>
                IFSC Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={account.ifscCode}
                onChange={(e) => {
                  onChange("bankAccounts", allAccounts.map((acc, i) =>
                   i === index ? { ...acc, ifscCode: e.target.value.toUpperCase() } : acc
                 ));
                  if (verifyStatus !== "idle") setVerifyStatus("idle");
                }}
                placeholder="e.g. ICIC0002345"
                maxLength={11}
                className={`${inp} font-mono tracking-widest uppercase w-full`}
              />
            </div>
          </div>

          {/* Verify button + status */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleVerify}
                disabled={
                  verifyStatus === "verifying" ||
                  !account.accountNumber ||
                  !account.ifscCode
                }
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
                  isVerified
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 text-white"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white"
                }`}
              >
                {verifyStatus === "verifying" ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying…
                  </>
                ) : isVerified ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Verify Account (Penny Drop)
                  </>
                )}
              </button>

              {isVerified && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {verifyMessage}
                </p>
              )}

              {(verifyStatus === "failed" || verifyStatus === "mismatch" || verifyStatus === "frozen") && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {verifyMessage}
                </p>
              )}
            </div>

            {transactionId && (
              <p className="text-xs text-gray-400 font-mono">Txn ID: {transactionId}</p>
            )}
          </div>
        </div>

        {/* Bank details — auto filled after verify */}
        <div>
          <SectionLabel text="Bank Details (auto-filled)" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>
                Beneficiary Name{" "}
                <span className="text-gray-300 font-normal">(from penny drop)</span>
              </label>
              <input
                type="text"
                value={account.beneficiaryName || ""}
                onChange={(e) => onChange("bankAccounts", allAccounts.map((acc, i) =>
                  i === index ? { ...acc, beneficiaryName: e.target.value } : acc
                ))}
                placeholder="Auto-filled after verification"
                readOnly={isVerified}
                className={`${inp} ${
                  isVerified
                    ? "bg-emerald-50/60 text-emerald-700 cursor-default border-emerald-200"
                    : ""
                }`}
              />
            </div>
            <div>
              <label className={lbl}>
                Bank Name{" "}
                <span className="text-gray-300 font-normal">(from penny drop)</span>
              </label>
              <input
                type="text"
                value={account.bankName}
                onChange={(e) => onChange("bankAccounts", allAccounts.map((acc, i) =>
                  i === index ? { ...acc, bankName: e.target.value } : acc
                ))}
                placeholder="Auto-filled after verification"
                readOnly={isVerified}
                className={`${inp} ${
                  isVerified
                    ? "bg-emerald-50/60 text-emerald-700 cursor-default border-emerald-200"
                    : ""
                }`}
              />
            </div>
            <div>
              <label className={lbl}>
                Branch Name{" "}
                <span className="text-gray-300 font-normal">(from IFSC)</span>
              </label>
              <input
                type="text"
                value={account.branchName}
                onChange={(e) => onChange("bankAccounts", allAccounts.map((acc, i) =>
                  i === index ? { ...acc, branchName: e.target.value } : acc
                ))}
                placeholder="Auto-filled after verification"
                readOnly={isVerified}
                className={`${inp} ${
                  isVerified
                    ? "bg-emerald-50/60 text-emerald-700 cursor-default border-emerald-200"
                    : ""
                }`}
              />
            </div>
            <div>
              <label className={lbl}>
                CRN{" "}
                <span className="text-gray-300 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={account.crn || ""}
                onChange={(e) => onChange("bankAccounts", allAccounts.map((acc, i) =>
                  i === index ? { ...acc, crn: e.target.value } : acc
                ))}
                placeholder="Customer Relationship Number"
                className={inp}
              />
            </div>
          </div>
        </div>

        {/* Account type */}
        <div>
          <SectionLabel text="Account Type" />
          <div className="flex items-center gap-3">
            <AccountTypeRadio
              value="SAVINGS"
              selected={account.accountType === "SAVINGS"}
              onSelect={() => onChange("bankAccounts", allAccounts.map((acc, i) =>
                i === index ? { ...acc, accountType: "SAVINGS" } : acc
              ))}
            />
            <AccountTypeRadio
              value="CURRENT"
              selected={account.accountType === "CURRENT"}
              onSelect={() => onChange("bankAccounts", allAccounts.map((acc, i) =>
                i === index ? { ...acc, accountType: "CURRENT" } : acc
              ))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}



export default function Step3BankDetails({ data, onChange }: Props) {
  const accounts: BankAccountData[] = data.bankAccounts?.length
    ? data.bankAccounts
    : [emptyAccount()];

  function updateAccounts(updated: BankAccountData[]) {
    onChange("bankAccounts", updated);
  }

  function handleAddAccount() {
    updateAccounts([...accounts, emptyAccount()]);
  }

  function handleRemove(index: number) {
    updateAccounts(accounts.filter((_, i) => i !== index));
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Bank Details</p>
          <p className="text-xs text-gray-400">
            Enter account number + IFSC — bank details auto-fill. Click Verify Account for penny drop.
          </p>
        </div>
        <span className="ml-auto text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
          Step 3
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {accounts.map((account, index) => (
          <BankAccountCard
            key={index}
            account={account}
            index={index}
            total={accounts.length}
            allAccounts={accounts}      
            onChange={onChange}
            onRemove={handleRemove}
          />
        ))}

        <button
          onClick={handleAddAccount}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-xl text-xs font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Another Bank Account
        </button>
         </div>
    </div>
  );
}
        

        
