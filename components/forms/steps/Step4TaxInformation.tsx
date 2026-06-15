"use client";

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

// ── Style tokens — same as Step2
const inp =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all duration-150 placeholder:text-gray-300";
const lbl = "block text-xs font-semibold text-gray-500 mb-1.5";

// ── Toggle row — identical shape to Step2's ToggleRow
interface ToggleRowProps {
  field: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (field: string, value: boolean) => void;
}

function ToggleRow({ field, label, desc, checked, onChange }: ToggleRowProps) {
  return (
    <div
      onClick={() => onChange(field, !checked)}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer select-none transition-all duration-150 ${
        checked
          ? "border-blue-200 bg-blue-50"
          : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
      }`}
    >
      <div>
        <p
          className={`text-xs font-semibold ${
            checked ? "text-blue-800" : "text-gray-700"
          }`}
        >
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
          checked ? "bg-blue-600 border-blue-600" : "border-gray-300"
        }`}
      >
        {checked && (
          <svg
            className="w-2.5 h-2.5 text-white"
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
        )}
      </div>
    </div>
  );
}

// Common TDS rates used in India (vendor payments)
const TDS_RATES = [
  { label: "1% — Contractors (194C)", value: "1" },
  { label: "2% — Contractors (194C, company)", value: "2" },
  { label: "5% — Insurance commission (194D)", value: "5" },
  { label: "10% — Professional fees (194J)", value: "10" },
  { label: "20% — Royalty (194Q)", value: "20" },
  { label: "30% — Non-resident (195)", value: "30" },
];

export default function Step4TaxInformation({ data, onChange }: Props) {
  // When taxExemption is toggled ON → clear TDS rate
  function handleExemptionToggle(field: string, value: boolean) {
    onChange(field, value);
    if (value) onChange("tdsRate", undefined);
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
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Tax Information</p>
          <p className="text-xs text-gray-400">
            Provide details about your tax status and exemptions
          </p>
        </div>
        <span className="ml-auto text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
          Step 4
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">

        {/* Tax Status Toggles */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block" />
            Tax Status
          </p>
          <div className="space-y-2">
            <ToggleRow
              field="itrFiledLastYear"
              label="ITR Filed for Last Financial Year"
              desc="Has the vendor filed Income Tax Return for the previous financial year?"
              checked={data.itrFiledLastYear || false}
              onChange={onChange}
            />
            <ToggleRow
              field="taxExemption"
              label="Tax Exemption"
              desc="Is the vendor exempt from tax deductions? (e.g. 15G/15H certificate holder)"
              checked={data.taxExemption || false}
              onChange={handleExemptionToggle}
            />
          </div>
        </div>

        {/* TDS Rate — hidden when exempt */}
        {!data.taxExemption && (
          <div style={{ animation: "slideUp 0.2s ease" }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block" />
              TDS Rate
            </p>

            <div className="space-y-3">
              {/* Quick-select common rates */}
              <div>
                <label className={lbl}>
                  Select Standard Rate{" "}
                  <span className="text-gray-300 font-normal">(or enter custom below)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TDS_RATES.map((rate) => (
                    <button
                      key={rate.value}
                      type="button"
                      onClick={() => onChange("tdsRate", rate.value)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 text-left ${
                        String(data.tdsRate) === rate.value
                          ? "border-blue-300 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <span>{rate.label}</span>
                      {String(data.tdsRate) === rate.value && (
                        <svg
                          className="w-3 h-3 text-blue-600 shrink-0 ml-2"
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
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom rate input */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className={lbl}>
                    Custom TDS Rate (%){" "}
                    <span className="text-gray-300 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={data.tdsRate ?? ""}
                      onChange={(e) =>
                        onChange(
                          "tdsRate",
                          e.target.value === "" ? undefined : e.target.value
                        )
                      }
                      placeholder="Enter TDS rate"
                      className={`${inp} pr-8`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
                {data.tdsRate !== undefined && data.tdsRate !== "" && (
                  <button
                    onClick={() => onChange("tdsRate", undefined)}
                    className="mb-0.5 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Live preview */}
              {data.tdsRate !== undefined && data.tdsRate !== "" && (
                <div
                  className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg"
                  style={{ animation: "slideUp 0.15s ease" }}
                >
                  <svg
                    className="w-3.5 h-3.5 text-indigo-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-xs text-indigo-700 font-medium">
                    On a ₹1,00,000 payment, TDS deducted = ₹
                    {(1000 * Number(data.tdsRate)).toLocaleString("en-IN")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exemption confirmation — shows only when exempt is ON */}
        {data.taxExemption && (
          <div
            className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg"
            style={{ animation: "slideUp 0.2s ease" }}
          >
            <svg
              className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Tax exemption marked — TDS will not be deducted for this vendor.
              Ensure a valid Form 15G / 15H / exemption certificate is uploaded
              in Step 6 (Document Upload).
            </p>
          </div>
        )}

        {/* Info box */}
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
            TDS rates are governed by the Income Tax Act, 1961. Incorrect rates
            may lead to short deduction and associated penalties. Consult the
            accounts team if you are unsure.
          </p>
        </div>
      </div>
    </div>
  );
}
