"use client";

import { useState } from "react";
import Step1ContactIdentity from "@/components/forms/steps/Step1ContactIdentity";
import Step2BusinessCompliance from "@/components/forms/steps/Step2BusinessCompliance";
import Step3BankDetails from "@/components/forms/steps/Step3BankDetails";
import Step4TaxInformation from "@/components/forms/steps/Step4TaxInformation";

const STEPS = [
  { id: 1, label: "Contact & Identity" },
  { id: 2, label: "Business & Compliance" },
  { id: 3, label: "Bank Details" },
  { id: 4, label: "Tax Information" },
  { id: 5, label: "Agreement Details" },
  { id: 6, label: "Document Upload" },
];

function PlaceholderStep({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>
      <div className="p-10 text-center text-xs text-gray-300">Being built by team...</div>
    </div>
  );
}

export default function NewVendorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    if (currentStep < 6) setCurrentStep((p) => p + 1);
  }

  function handlePrev() {
    if (currentStep > 1) setCurrentStep((p) => p - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

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
          <button
            onClick={() => { setSubmitted(false); setCurrentStep(1); setFormData({}); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Add Another Vendor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ── Topbar ── */}
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Kotak Mahindra Bank</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-gray-400">Vendor Management</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-blue-600 font-semibold">New Vendor Registration</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button className="relative px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-all duration-150">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white flex items-center justify-center font-bold" style={{fontSize:"7px"}}>3</span>
          </button>
          <button className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-all duration-150">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Help
          </button>
          <button className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-all duration-150">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="bg-white border-b border-gray-100 px-5 shrink-0">
        <div className="flex border border-gray-100 rounded-lg overflow-hidden my-2">
          {STEPS.map((step) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex-1 flex flex-col items-center py-2 px-1 border-r border-gray-100 last:border-r-0 transition-all duration-200 ${
                  active ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold mb-0.5 transition-all duration-200 ${
                    done
                      ? "bg-blue-600 border-blue-600 text-white"
                      : active
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-300 text-gray-400"
                  }`}
                  style={{ fontSize: "9px" }}
                >
                  {done ? (
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : step.id}
                </div>
                <span
                  className={`text-center leading-tight transition-colors duration-200 ${
                    active ? "text-blue-600 font-semibold" : done ? "text-gray-500" : "text-gray-400"
                  }`}
                  style={{ fontSize: "9px", maxWidth: "56px" }}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable Form Area ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-3xl mx-auto">
          <div
            key={currentStep}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm"
            style={{ animation: "slideUp 0.2s ease" }}
          >
            {currentStep === 1 && <Step1ContactIdentity data={formData} onChange={handleChange} />}
            {currentStep === 2 && <Step2BusinessCompliance data={formData} onChange={handleChange} />}
            {currentStep === 3 && <Step3BankDetails data={formData} onChange={handleChange} />}
            {currentStep === 4 && <Step4TaxInformation data={formData} onChange={handleChange} />}
            {currentStep === 5 && <PlaceholderStep title="Agreement Details" desc="Contract terms, duration & approvals" />}
            {currentStep === 6 && <PlaceholderStep title="Document Upload" desc="Upload required supporting documents" />}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="bg-white border-t border-gray-100 px-5 py-2.5 flex items-center justify-between shrink-0">
        <button
          onClick={handlePrev}
          style={{ visibility: currentStep === 1 ? "hidden" : "visible" }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all duration-150"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Previous
        </button>

        {/* Progress Bar */}
        <div className="flex-1 mx-6 flex flex-col items-center gap-1">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">Step {currentStep} of {STEPS.length}</span>
        </div>

        <button
          onClick={currentStep === 6 ? handleSubmit : handleNext}
          disabled={submitting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 disabled:opacity-50 shadow-sm shadow-blue-100"
        >
          {submitting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Submitting…
            </>
          ) : (
            <>
              {currentStep === 6 ? "Submit" : "Next"}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentStep === 6 ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"}/>
              </svg>
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}