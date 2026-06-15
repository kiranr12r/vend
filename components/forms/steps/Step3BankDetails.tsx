"use client";

import { useState } from "react";
import { BankAccountData } from "@/types/vendor";

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

// ── Shared style tokens — matches Step1 (indigo focus ring) / Step2 (blue)
const inp =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all duration-150 placeholder:text-gray-300";
const lbl = "block text-xs font-semibold text-gray-500 mb-1.5";

// ── Empty account template
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

// ── Per-account verify state
type VerifyStatus = "idle" | "verifying" | "verified" | "failed";

// ── Section label — matches Step2 style
function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
      <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block" />
      {text}
    </p>
  );
}

// ── Radio pill for account type
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
        {selected && (
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        )}
      </div>
      {value === "SAVINGS" ? "Savings" : "Current"}
    </label>
  );
}

// ── Single bank account card
function BankAccountCard({
  account,
  index,
  total,
  onChange,
  onRemove,
}: {
  account: BankAccountData;
  index: number;
  total: number;
  onChange: (index: number, field: keyof BankAccountData, value: any) => void;
  onRemove: (index: number) => void;
}) {
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");

  async function handleVerify() {
    if (!account.accountNumber || !account.ifscCode) return;
    setVerifyStatus("verifying");
    // Mock penny-drop — replace with real API call when ready
    await new Promise((r) => setTimeout(r, 1600));
    // Simulate success: fill beneficiary name from IFSC lookup
    const mockName = "FiniteLoop Technologies Pvt. Ltd.";
    onChange(index, "beneficiaryName", mockName);
    setVerifyStatus("verified");
  }

  const isPrimary = index === 0;

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        isPrimary ? "border-blue-200" : "border-gray-200"
      }`}
      style={{ animation: "slideUp 0.2s ease" }}
    >
      {/* Card header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b ${
          isPrimary
            ? "bg-blue-50 border-blue-100"
            : "bg-gray-50 border-gray-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center ${
              isPrimary ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-gray-700">
            Bank Account {index + 1}
          </span>
          {isPrimary && (
            <span className="text-xs font-semibold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
              Primary
            </span>
          )}
        </div>
        {total > 1 && (
          <button
            onClick={() => onRemove(index)}
            className="text-gray-300 hover:text-red-400 transition-colors duration-150 p-1"
            title="Remove account"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 space-y-4">

        {/* Account number + IFSC + Verify */}
        <div>
          <SectionLabel text="Account & Verification" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={lbl}>
                Account Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={account.accountNumber}
                onChange={(e) =>
                  onChange(index, "accountNumber", e.target.value.replace(/\D/g, ""))
                }
                placeholder="e.g. 0987654321"
                className={`${inp} font-mono tracking-widest ${
                  verifyStatus === "verified"
                    ? "border-emerald-400 bg-emerald-50/50"
                    : ""
                }`}
              />
            </div>
            <div>
              <label className={lbl}>
                IFSC Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={account.ifscCode}
                onChange={(e) => {
                  onChange(index, "ifscCode", e.target.value.toUpperCase());
                  if (verifyStatus === "verified") setVerifyStatus("idle");
                }}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
                className={`${inp} font-mono tracking-widest uppercase`}
              />
            </div>
          </div>

          {/* Verify button + status */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleVerify}
              disabled={
                verifyStatus === "verifying" ||
                !account.accountNumber ||
                !account.ifscCode
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
                verifyStatus === "verified"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 text-white"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-100 text-white"
              }`}
            >
              {verifyStatus === "verifying" ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Verifying…
                </>
              ) : verifyStatus === "verified" ? (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Verified
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Verify Account
                </>
              )}
            </button>
            {verifyStatus === "verified" && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Penny drop successful — name autofilled
              </p>
            )}
            {verifyStatus === "failed" && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Verification failed — check account number and IFSC
              </p>
            )}
          </div>
        </div>

        {/* Bank details grid */}
        <div>
          <SectionLabel text="Bank Details" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>
                Beneficiary Name{" "}
                <span className="text-gray-300 font-normal">(auto-filled)</span>
              </label>
              <input
                type="text"
                value={account.beneficiaryName || ""}
                onChange={(e) =>
                  onChange(index, "beneficiaryName", e.target.value)
                }
                placeholder="Verified account holder name"
                readOnly={verifyStatus === "verified"}
                className={`${inp} ${
                  verifyStatus === "verified"
                    ? "bg-gray-50 text-gray-500 cursor-default"
                    : ""
                }`}
              />
            </div>
            <div>
              <label className={lbl}>
                Bank Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={account.bankName}
                onChange={(e) => onChange(index, "bankName", e.target.value)}
                placeholder="e.g. HDFC Bank"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>
                Branch Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={account.branchName}
                onChange={(e) => onChange(index, "branchName", e.target.value)}
                placeholder="e.g. Indiranagar"
                className={inp}
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
                onChange={(e) => onChange(index, "crn", e.target.value)}
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
              onSelect={() => onChange(index, "accountType", "SAVINGS")}
            />
            <AccountTypeRadio
              value="CURRENT"
              selected={account.accountType === "CURRENT"}
              onSelect={() => onChange(index, "accountType", "CURRENT")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export
export default function Step3BankDetails({ data, onChange }: Props) {
  // bankAccounts lives on formData as an array
  const accounts: BankAccountData[] = data.bankAccounts?.length
    ? data.bankAccounts
    : [emptyAccount()];

  function updateAccounts(updated: BankAccountData[]) {
    onChange("bankAccounts", updated);
  }

  function handleFieldChange(
    index: number,
    field: keyof BankAccountData,
    value: any
  ) {
    const updated = accounts.map((acc, i) =>
      i === index ? { ...acc, [field]: value } : acc
    );
    updateAccounts(updated);
  }

  function handleAddAccount() {
    updateAccounts([...accounts, emptyAccount()]);
  }

  function handleRemove(index: number) {
    const updated = accounts.filter((_, i) => i !== index);
    updateAccounts(updated);
  }

  return (
    <div>
      {/* Card Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <svg
            className="w-3.5 h-3.5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
            />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Bank Details</p>
          <p className="text-xs text-gray-400">
            Provide and verify bank account details for payments. You can add
            multiple accounts.
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
            onChange={handleFieldChange}
            onRemove={handleRemove}
          />
        ))}

        {/* Add another account */}
        <button
          onClick={handleAddAccount}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-xl text-xs font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Another Bank Account
        </button>

        {/* Info box — matches Step2 amber style */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <svg
            className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            The first account added will be marked as the primary account for
            payments. Penny drop verification is mandatory — accounts with a
            name mismatch cannot be saved.
          </p>
        </div>
      </div>
    </div>
  );
}
