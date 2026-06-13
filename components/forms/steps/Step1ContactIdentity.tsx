"use client";
import { useState } from "react";

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all duration-150 placeholder:text-gray-300";
const lbl = "block text-xs font-semibold text-gray-500 mb-1.5 tracking-wide";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {children}
    </div>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
      <span className="text-indigo-500">{icon}</span>
      <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{text}</span>
    </div>
  );
}

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir"];

export default function Step1ContactIdentity({ data, onChange }: Props) {
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);

  async function handleFetch() {
    if (!data.gstNumber || data.gstNumber.length < 10) return;
    setFetching(true);
    await new Promise((r) => setTimeout(r, 1400));
    onChange("tradeName", "FiniteLoop Technologies");
    onChange("legalName", "FiniteLoop Technologies Pvt. Ltd.");
    onChange("pan", "FNTLP1234K");
    onChange("dateOfRegistration", "2021-06-15");
    onChange("addressLine1", "123 MG Road, Indiranagar");
    onChange("city", "Bengaluru");
    onChange("state", "Karnataka");
    onChange("pincode", "560038");
    onChange("contactPerson", "Kiran R");
    onChange("contactEmail", "kiran@finiteloop.co.in");
    onChange("contactPhone", "9876543210");
    setFetched(true);
    setFetching(false);
  }

  return (
    <div>
      {/* Card Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/70">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">Contact & Identity Details</p>
          <p className="text-xs text-gray-400 mt-0.5">Enter GST number to autofill vendor details</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">Step 1</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">

        {/* GST Row */}
        <div className="flex gap-2 items-end p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl">
          <div className="flex-1">
            <label className={lbl}>GST Number</label>
            <div className="relative">
              <input
                type="text"
                value={data.gstNumber || ""}
                onChange={(e) => { onChange("gstNumber", e.target.value.toUpperCase()); setFetched(false); }}
                placeholder="e.g. 29ABCDE1234F1Z5"
                maxLength={15}
                className={`${inp} font-mono tracking-widest pr-9 ${fetched ? "border-emerald-400 focus:border-emerald-400 bg-emerald-50/50" : ""}`}
              />
              {fetched && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              )}
            </div>
            {fetched && <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              GST verified — fields autofilled
            </p>}
          </div>
          <button
            onClick={handleFetch}
            disabled={fetching || !data.gstNumber}
            className="mb-0.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-indigo-200"
          >
            {fetching ? (
              <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Fetching…</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/></svg> Fetch</>
            )}
          </button>
        </div>

        {/* Business Info */}
        <div>
          <SectionLabel
            text="Business Information"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Trade Name / Vendor Name">
              <input type="text" value={data.tradeName || ""} onChange={(e) => onChange("tradeName", e.target.value)} placeholder="Trade name" className={inp} />
            </Field>
            <Field label="Legal Name of Business">
              <input type="text" value={data.legalName || ""} onChange={(e) => onChange("legalName", e.target.value)} placeholder="Legal name" className={inp} />
            </Field>
            <Field label="PAN Number">
              <input type="text" value={data.pan || ""} onChange={(e) => onChange("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} className={`${inp} font-mono tracking-widest`} />
            </Field>
            <Field label="Date of Registration">
              <input type="date" value={data.dateOfRegistration || ""} onChange={(e) => onChange("dateOfRegistration", e.target.value)} className={inp} />
            </Field>
          </div>

          {/* PAN Aadhaar */}
          <div
            onClick={() => onChange("panLinkedAadhaar", !data.panLinkedAadhaar)}
            className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer select-none transition-all duration-150 ${
              data.panLinkedAadhaar ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${data.panLinkedAadhaar ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`}>
              {data.panLinkedAadhaar && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
            </div>
            <svg className={`w-4 h-4 shrink-0 ${data.panLinkedAadhaar ? "text-emerald-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span className={`text-xs font-semibold ${data.panLinkedAadhaar ? "text-emerald-700" : "text-gray-600"}`}>
              PAN Linked with Aadhaar
            </span>
            {data.panLinkedAadhaar && (
              <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Verified</span>
            )}
          </div>
        </div>

        {/* Registered Address */}
        <div>
          <SectionLabel
            text="Registered Address"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
          />
          <div className="space-y-3">
            <Field label="Address Line 1">
              <input type="text" value={data.addressLine1 || ""} onChange={(e) => onChange("addressLine1", e.target.value)} placeholder="Building no., street name" className={inp} />
            </Field>
            <Field label="Address Line 2 (Optional)">
              <input type="text" value={data.addressLine2 || ""} onChange={(e) => onChange("addressLine2", e.target.value)} placeholder="Apartment, suite, landmark" className={inp} />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City">
                <input type="text" value={data.city || ""} onChange={(e) => onChange("city", e.target.value)} placeholder="City" className={inp} />
              </Field>
              <Field label="State">
                <select value={data.state || ""} onChange={(e) => onChange("state", e.target.value)} className={inp}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Pincode">
                <input type="text" value={data.pincode || ""} onChange={(e) => onChange("pincode", e.target.value)} placeholder="560001" maxLength={6} className={`${inp} font-mono tracking-widest`} />
              </Field>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <SectionLabel
            text="Contact Details"
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Person">
              <input type="text" value={data.contactPerson || ""} onChange={(e) => onChange("contactPerson", e.target.value)} placeholder="Full name" className={inp} />
            </Field>
            <Field label="Contact Email">
              <input type="email" value={data.contactEmail || ""} onChange={(e) => onChange("contactEmail", e.target.value)} placeholder="email@company.com" className={inp} />
            </Field>
            <Field label="Mobile Number">
              <input type="tel" value={data.contactPhone || ""} onChange={(e) => onChange("contactPhone", e.target.value)} placeholder="9876543210" maxLength={10} className={inp} />
            </Field>
            <Field label="Department (Optional)">
              <input type="text" value={data.departmentName || ""} onChange={(e) => onChange("departmentName", e.target.value)} placeholder="e.g. Finance, Procurement" className={inp} />
            </Field>
          </div>
        </div>

      </div>
    </div>
  );
}