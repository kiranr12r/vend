"use client";
import { useState } from "react";
import FieldError from "@/components/ui/FieldError";

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const inp = (hasError?: string) =>
  `w-full px-3 py-2 border ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-50"
      : "border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-50"
  } rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 transition-all duration-150 placeholder:text-gray-300`;

const lbl = "block text-xs font-semibold text-gray-500 mb-1.5";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Chandigarh", "Puducherry",
  "Andaman & Nicobar Islands", "Dadra & Nagar Haveli", "Lakshadweep",
];

type FetchStatus = "idle" | "loading" | "success" | "error" | "not_found" | "invalid";

export default function Step1ContactIdentity({ data, onChange, errors }: Props) {
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchError, setFetchError] = useState("");
  const [gstDetails, setGstDetails] = useState<any>(null);

  async function handleFetch() {
    const gstin = data.gstNumber?.trim();

    if (!gstin) {
      setFetchError("Please enter a GST number");
      setFetchStatus("error");
      return;
    }

    if (gstin.length !== 15) {
      setFetchError("GST number must be exactly 15 characters");
      setFetchStatus("invalid");
      return;
    }

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstin)) {
      setFetchError("Invalid GST format. Expected: 22AAAAA0000A1Z5");
      setFetchStatus("invalid");
      return;
    }

    setFetchStatus("loading");
    setFetchError("");

    try {
      const res = await fetch(`/api/gst?gstin=${gstin}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setFetchError(json.error || "Verification failed. Please try again.");
        setFetchStatus(res.status === 404 ? "not_found" : "error");
        return;
      }

      const d = json.data;
      setGstDetails(d);

      // Autofill all fields
      onChange("tradeName", d.tradeName || "");
      onChange("legalName", d.legalName || "");
      onChange("pan", d.pan || "");
      onChange("dateOfRegistration", d.dateOfRegistration || "");
      onChange("addressLine1", d.addressLine1 || "");
      onChange("addressLine2", d.addressLine2 || "");
      onChange("city", d.city || "");
      onChange("state", d.state || "");
      onChange("pincode", d.pincode || "");

      // Auto-set compliance flags from GST data
      if (d.compositeScheme !== undefined) onChange("compositeGstScheme", d.compositeScheme);
      if (d.eInvoiceApplicable !== undefined) onChange("eInvoiceRequired", d.eInvoiceApplicable);

      setFetchStatus("success");
    } catch (e) {
      setFetchError("Network error. Please check your connection and try again.");
      setFetchStatus("error");
    }
  }

  const fetched = fetchStatus === "success";
  const fetching = fetchStatus === "loading";
  const hasError = fetchStatus === "error" || fetchStatus === "not_found" || fetchStatus === "invalid";

  return (
    <div>
      {/* Card Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Contact & Identity Details</p>
          <p className="text-xs text-gray-400">Enter GST number to autofill vendor details</p>
        </div>
        <span className="ml-auto text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Step 1</span>
      </div>

      <div className="p-5 space-y-5">

        {/* GST Verification Box */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block"/>
            GST Verification
          </p>

          <div className={`p-4 rounded-xl border transition-all duration-200 ${
            fetched ? "bg-emerald-50 border-emerald-200" :
            hasError ? "bg-red-50 border-red-200" :
            "bg-indigo-50/60 border-indigo-100"
          }`}>
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <label className={lbl}>
                  GSTIN <span className="text-red-400">*</span>
                  <span className="ml-2 text-gray-300 font-normal">(15 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={data.gstNumber || ""}
                    onChange={(e) => {
                      onChange("gstNumber", e.target.value.toUpperCase());
                      setFetchStatus("idle");
                      setFetchError("");
                      setGstDetails(null);
                    }}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    maxLength={15}
                    className={`${inp(errors?.gstNumber || (hasError ? "err" : ""))} font-mono tracking-widest pr-9`}
                  />
                  {fetched && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  )}
                  {hasError && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </div>
                  )}
                </div>
                <FieldError message={errors?.gstNumber} />

                {fetched && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    GSTIN verified — all fields autofilled successfully
                  </p>
                )}
                {fetchError && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {fetchError}
                  </p>
                )}
                {fetchStatus === "idle" && (
                  <p className="text-xs text-indigo-400 mt-1.5">
                    Enter the 15-character GSTIN and click Verify to autofill business details.
                  </p>
                )}
              </div>

              <div className="mt-5">
                <button
                  onClick={handleFetch}
                  disabled={fetching || !data.gstNumber}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                >
                  {fetching ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Verifying…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                      Verify GST
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* GST Details Card — shown after successful fetch */}
            {fetched && gstDetails && (
              <div className="mt-4 pt-4 border-t border-emerald-200 grid grid-cols-3 gap-3">
                {[
                  { label: "Business Type", value: gstDetails.businessType },
                  { label: "Nature of Business", value: gstDetails.natureOfBusiness },
                  { label: "Annual Turnover", value: gstDetails.annualTurnover },
                  { label: "GST Status", value: gstDetails.status },
                  { label: "Composite Scheme", value: gstDetails.compositeScheme ? "Yes" : "No" },
                  { label: "E-Invoice Applicable", value: gstDetails.eInvoiceApplicable ? "Yes" : "No" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white border border-emerald-100 rounded-lg p-2.5">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Business Info */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block"/>
            Business Information
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Trade Name / Vendor Name <span className="text-red-400">*</span></label>
              <input type="text" value={data.tradeName || ""} onChange={(e) => onChange("tradeName", e.target.value)} placeholder="Trade name" className={inp(errors?.tradeName)} />
              <FieldError message={errors?.tradeName} />
            </div>
            <div>
              <label className={lbl}>Legal Name of Business <span className="text-red-400">*</span></label>
              <input type="text" value={data.legalName || ""} onChange={(e) => onChange("legalName", e.target.value)} placeholder="Legal name" className={inp(errors?.legalName)} />
              <FieldError message={errors?.legalName} />
            </div>
            <div>
              <label className={lbl}>PAN Number <span className="text-red-400">*</span></label>
              <input type="text" value={data.pan || ""} onChange={(e) => onChange("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} className={`${inp(errors?.pan)} font-mono tracking-widest`} />
              <FieldError message={errors?.pan} />
            </div>
            <div>
              <label className={lbl}>Date of Registration <span className="text-red-400">*</span></label>
              <input type="date" value={data.dateOfRegistration || ""} onChange={(e) => onChange("dateOfRegistration", e.target.value)} className={inp(errors?.dateOfRegistration)} />
              <FieldError message={errors?.dateOfRegistration} />
            </div>
          </div>

          {/* PAN Aadhaar Toggle */}
          <div
            onClick={() => onChange("panLinkedAadhaar", !data.panLinkedAadhaar)}
            className={`mt-4 flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer select-none transition-all duration-150 ${
              data.panLinkedAadhaar ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${data.panLinkedAadhaar ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`}>
                {data.panLinkedAadhaar && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
              <div>
                <p className={`text-xs font-semibold ${data.panLinkedAadhaar ? "text-emerald-700" : "text-gray-600"}`}>
                  PAN Linked with Aadhaar
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Confirm if PAN is linked with Aadhaar card</p>
              </div>
            </div>
            {data.panLinkedAadhaar && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium shrink-0">Verified</span>
            )}
          </div>
        </div>

        {/* Registered Address */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block"/>
            Registered Address
          </p>
          <div className="space-y-3">
            <div>
              <label className={lbl}>Address Line 1 <span className="text-red-400">*</span></label>
              <input type="text" value={data.addressLine1 || ""} onChange={(e) => onChange("addressLine1", e.target.value)} placeholder="Building no., street name" className={inp(errors?.addressLine1)} />
              <FieldError message={errors?.addressLine1} />
            </div>
            <div>
              <label className={lbl}>Address Line 2 <span className="text-gray-300 font-normal">(Optional)</span></label>
              <input type="text" value={data.addressLine2 || ""} onChange={(e) => onChange("addressLine2", e.target.value)} placeholder="Apartment, suite, landmark" className={inp()} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={lbl}>City <span className="text-red-400">*</span></label>
                <input type="text" value={data.city || ""} onChange={(e) => onChange("city", e.target.value)} placeholder="City" className={inp(errors?.city)} />
                <FieldError message={errors?.city} />
              </div>
              <div>
                <label className={lbl}>State <span className="text-red-400">*</span></label>
                <select value={data.state || ""} onChange={(e) => onChange("state", e.target.value)} className={inp(errors?.state)}>
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <FieldError message={errors?.state} />
              </div>
              <div>
                <label className={lbl}>Pincode <span className="text-red-400">*</span></label>
                <input type="text" value={data.pincode || ""} onChange={(e) => onChange("pincode", e.target.value)} placeholder="560001" maxLength={6} className={`${inp(errors?.pincode)} font-mono tracking-widest`} />
                <FieldError message={errors?.pincode} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block"/>
            Contact Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Contact Person <span className="text-red-400">*</span></label>
              <input type="text" value={data.contactPerson || ""} onChange={(e) => onChange("contactPerson", e.target.value)} placeholder="Full name" className={inp(errors?.contactPerson)} />
              <FieldError message={errors?.contactPerson} />
            </div>
            <div>
              <label className={lbl}>Contact Email <span className="text-red-400">*</span></label>
              <input type="email" value={data.contactEmail || ""} onChange={(e) => onChange("contactEmail", e.target.value)} placeholder="email@company.com" className={inp(errors?.contactEmail)} />
              <FieldError message={errors?.contactEmail} />
            </div>
            <div>
              <label className={lbl}>Mobile Number <span className="text-red-400">*</span></label>
              <input type="tel" value={data.contactPhone || ""} onChange={(e) => onChange("contactPhone", e.target.value)} placeholder="9876543210" maxLength={10} className={inp(errors?.contactPhone)} />
              <FieldError message={errors?.contactPhone} />
            </div>
            <div>
              <label className={lbl}>Department <span className="text-gray-300 font-normal">(Optional)</span></label>
              <input type="text" value={data.departmentName || ""} onChange={(e) => onChange("departmentName", e.target.value)} placeholder="e.g. Finance, Procurement" className={inp()} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}