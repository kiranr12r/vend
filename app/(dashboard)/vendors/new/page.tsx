"use client";

import { useState } from "react";
import Stepper from "@/components/ui/stepper";
import Step1ContactIdentity from "@/components/forms/steps/Step1ContactIdentity";

const STEPS = [
  { id: 1, label: "Contact & Identity" },
  { id: 2, label: "Business & Compliance" },
  { id: 3, label: "Bank Details" },
  { id: 4, label: "Tax Information" },
  { id: 5, label: "Agreement Details" },
  { id: 6, label: "Document Upload" },
];

export default function NewVendorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});

  function handleChange(field: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  }

  function handlePrev() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Vendor Registration</h1>
        <p className="text-gray-500 text-sm mt-1">Fill out the form below to become a vendor.</p>
      </div>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {currentStep === 1 && (
          <Step1ContactIdentity data={formData} onChange={handleChange} />
        )}
        {currentStep === 2 && (
          <div className="text-gray-500 text-sm">Step 2: Business & Compliance — coming next</div>
        )}
        {currentStep === 3 && (
          <div className="text-gray-500 text-sm">Step 3: Bank Details — coming next</div>
        )}
        {currentStep === 4 && (
          <div className="text-gray-500 text-sm">Step 4: Tax Information — coming next</div>
        )}
        {currentStep === 5 && (
          <div className="text-gray-500 text-sm">Step 5: Agreement Details — coming next</div>
        )}
        {currentStep === 6 && (
          <div className="text-gray-500 text-sm">Step 6: Document Upload — coming next</div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {currentStep > 1 ? (
          <button
            onClick={handlePrev}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handleNext}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {currentStep === 6 ? "Submit for Approval" : "Next"}
        </button>
      </div>
    </div>
  );
}
