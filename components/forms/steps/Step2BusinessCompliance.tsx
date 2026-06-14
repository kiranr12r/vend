"use client";

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all duration-150 placeholder:text-gray-300";
const lbl = "block text-xs font-semibold text-gray-500 mb-1.5";

const NATURE_OPTIONS = [
  "Rent",
  "Professional Services",
  "Contract Labour",
  "Supply of Goods",
  "Maintenance & Repair",
  "Consulting",
  "IT Services",
  "Logistics",
  "Others",
];

const FREQUENCY_OPTIONS = [
  "Monthly",
  "Quarterly",
  "Half-Yearly",
  "Annually",
  "One-Time",
  "On Invoice",
];

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
        <p className={`text-xs font-semibold ${checked ? "text-blue-800" : "text-gray-700"}`}>
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
        checked ? "bg-blue-600 border-blue-600" : "border-gray-300"
      }`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
          </svg>
        )}
      </div>
    </div>
  );
}

export default function Step2BusinessCompliance({ data, onChange }: Props) {
  return (
    <div>
      {/* Card Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Business & Compliance</p>
          <p className="text-xs text-gray-400">Help us understand your business better</p>
        </div>
        <span className="ml-auto text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Step 2</span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">

        {/* Nature of Service + Payment Frequency */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block"/>
            Service Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Nature of Service <span className="text-red-400">*</span></label>
              <select
                value={data.natureOfService || ""}
                onChange={(e) => onChange("natureOfService", e.target.value)}
                className={inp}
              >
                <option value="">Select nature of service</option>
                {NATURE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Payment Frequency <span className="text-red-400">*</span></label>
              <select
                value={data.paymentFrequency || ""}
                onChange={(e) => onChange("paymentFrequency", e.target.value)}
                className={inp}
              >
                <option value="">Select payment frequency</option>
                {FREQUENCY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Paygroup <span className="text-gray-300 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={data.paygroup || ""}
                onChange={(e) => onChange("paygroup", e.target.value)}
                placeholder="Enter paygroup"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Group Code <span className="text-gray-300 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={data.groupCode || ""}
                onChange={(e) => onChange("groupCode", e.target.value)}
                placeholder="Enter group code"
                className={inp}
              />
            </div>
          </div>
        </div>

        {/* Compliance Toggles */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block"/>
            Compliance Flags
          </p>
          <div className="space-y-2">
            <ToggleRow
              field="compositeGstScheme"
              label="Composite GST Scheme"
              desc="Is the vendor registered under the composite GST scheme?"
              checked={data.compositeGstScheme || false}
              onChange={onChange}
            />
            <ToggleRow
              field="eInvoiceRequired"
              label="E-Invoice Required"
              desc="Is e-invoicing mandatory for this vendor?"
              checked={data.eInvoiceRequired ?? true}
              onChange={onChange}
            />
            <ToggleRow
              field="registeredMsme"
              label="Registered under MSME"
              desc="Is the vendor a registered Micro, Small, or Medium Enterprise?"
              checked={data.registeredMsme || false}
              onChange={onChange}
            />
          </div>
        </div>

        {/* MSME Number — shows only if MSME is checked */}
        {data.registeredMsme && (
          <div style={{ animation: "slideUp 0.2s ease" }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-0.5 h-3 bg-emerald-500 rounded-full inline-block"/>
              MSME Details
            </p>
            <div>
              <label className={lbl}>MSME Registration Number <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={data.msmeNumber || ""}
                onChange={(e) => onChange("msmeNumber", e.target.value.toUpperCase())}
                placeholder="e.g. UDYAM-KA-03-0012345"
                className={`${inp} font-mono tracking-wider`}
              />
              <p className="text-xs text-gray-400 mt-1">Enter the Udyam Registration Number issued by MSME ministry</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            Ensure all compliance details are accurate. Incorrect information may delay vendor approval or affect payment processing.
          </p>
        </div>

      </div>
    </div>
  );
}