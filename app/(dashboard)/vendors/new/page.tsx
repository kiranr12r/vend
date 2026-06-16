"use client";

import { useState } from "react";
import { z } from "zod";
import Step1ContactIdentity from "@/components/forms/steps/Step1ContactIdentity";
import Step2BusinessCompliance from "@/components/forms/steps/Step2BusinessCompliance";
import Step3BankDetails from "@/components/forms/steps/Step3BankDetails";
import Step4TaxInformation from "@/components/forms/steps/Step4TaxInformation";
import Step5AgreementDetails from "@/components/forms/steps/Step5AgreementDetails";
import Step6DocumentUpload from "@/components/forms/steps/Step6DocumentUpload";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
} from "@/lib/validations/vendor";

const STEPS = [
  { id: 1, label: "Contact & Identity" },
  { id: 2, label: "Business & Compliance" },
  { id: 3, label: "Bank Details" },
  { id: 4, label: "Tax Information" },
  { id: 5, label: "Agreement Details" },
  { id: 6, label: "Document Upload" },
];

const STEP_SCHEMAS: Record<number, z.ZodTypeAny> = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
};

export default function NewVendorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
    }
  }

function validateStep(step: number): boolean {
  const schema = STEP_SCHEMAS[step];
  if (!schema) return true;
  const result = schema.safeParse(formData);
  if (result.success) {
    setErrors({});
    return true;
  }
  const newErrors: Record<string, string> = {};
  const errs = result.error?.issues || [];
  errs.forEach((err: any) => {
    const field = err.path?.join(".") || "";
    if (field && !newErrors[field]) newErrors[field] = err.message;
  });
  setErrors(newErrors);
  return false;
}

  function handleNext() {
    const valid = validateStep(currentStep);
    if (!valid) return;
    setCurrentStep((p) => Math.min(p + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePrev() {
    setErrors({});
    setCurrentStep((p) => Math.max(p - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    const valid = validateStep(6);
    if (!valid) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) setSubmitted(true);
      else {
        const data = await res.json();
        alert(data.error || "Something went wrong.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);
  const hasErrors = Object.keys(errors).length > 0;

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-800">Submitted for Approval</p>
          <p className="text-xs text-gray-400 mt-1">Vendor registration submitted successfully.</p>
          <button onClick={() => { setSubmitted(false); setCurrentStep(1); setFormData({}); setErrors({}); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">
            Add Another Vendor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Kotak Mahindra Bank</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-gray-400">Vendor Management</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-blue-600 font-semibold">New Vendor Registration</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasErrors && (
            <span className="flex items-center gap-1 text-xs text-red-500 font-medium px-2.5 py-1 bg-red-50 border border-red-100 rounded-lg">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""}
            </span>
          )}
          <button className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Help
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100 px-5 shrink-0">
        <div className="flex border border-gray-100 rounded-lg overflow-hidden my-2">
          {STEPS.map((step) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <button key={step.id} onClick={() => { if (done) { setErrors({}); setCurrentStep(step.id); } }}
                className={`flex-1 flex flex-col items-center py-2 px-1 border-r border-gray-100 last:border-r-0 transition-all duration-200 ${active ? "bg-blue-50" : done ? "bg-white cursor-pointer hover:bg-gray-50" : "bg-white cursor-default"}`}>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold mb-0.5 transition-all duration-200 ${done ? "bg-blue-600 border-blue-600 text-white" : active ? "border-blue-600 text-blue-600" : "border-gray-300 text-gray-400"}`} style={{ fontSize: "9px" }}>
                  {done ? (
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  ) : step.id}
                </div>
                <span className={`text-center leading-tight transition-colors duration-200 ${active ? "text-blue-600 font-semibold" : done ? "text-gray-500" : "text-gray-400"}`} style={{ fontSize: "9px", maxWidth: "56px" }}>
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-3xl mx-auto">

          {/* Error Summary Banner */}
          {hasErrors && (
            <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5" style={{ animation: "slideUp 0.2s ease" }}>
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <div>
                <p className="text-xs font-bold text-red-700">Please fix the following errors:</p>
                <ul className="mt-1 space-y-0.5">
                  {Object.values(errors).slice(0, 5).map((err, i) => (
                    <li key={i} className="text-xs text-red-600">• {err}</li>
                  ))}
                  {Object.keys(errors).length > 5 && (
                    <li className="text-xs text-red-400">+ {Object.keys(errors).length - 5} more errors</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <div key={currentStep} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm" style={{ animation: "slideUp 0.2s ease" }}>
            {currentStep === 1 && <Step1ContactIdentity data={formData} onChange={handleChange} errors={errors} />}
            {currentStep === 2 && <Step2BusinessCompliance data={formData} onChange={handleChange} />}
            {currentStep === 3 && <Step3BankDetails data={formData} onChange={handleChange} />}
            {currentStep === 4 && <Step4TaxInformation data={formData} onChange={handleChange} />}
            {currentStep === 5 && <Step5AgreementDetails data={formData} onChange={handleChange} />}
            {currentStep === 6 && <Step6DocumentUpload data={formData} onChange={handleChange} />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-5 py-2.5 flex items-center justify-between shrink-0">
        <button onClick={handlePrev} style={{ visibility: currentStep === 1 ? "hidden" : "visible" }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 active:scale-95 transition-all duration-150">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Previous
        </button>

        <div className="flex-1 mx-6 flex flex-col items-center gap-1">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-400">Step {currentStep} of {STEPS.length}</span>
        </div>

        <button onClick={currentStep === 6 ? handleSubmit : handleNext} disabled={submitting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 disabled:opacity-50 shadow-sm shadow-blue-100">
          {submitting ? (
            <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Submitting…</>
          ) : (
            <>{currentStep === 6 ? "Submit" : "Next"}<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentStep === 6 ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"}/></svg></>
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}