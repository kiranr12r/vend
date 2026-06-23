"use client";
import { useState } from "react";

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

interface DocConfig {
  key: string;
  label: string;
  desc: string;
  required: boolean;
  accept: string;
}

const DOCUMENTS: DocConfig[] = [
  { key: "registrationCertificate", label: "Registration Certificate", desc: "Company/firm registration document", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "panCardCopy", label: "PAN Card Copy", desc: "Self-attested copy of PAN card", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "addressProof", label: "Address Proof", desc: "Utility bill, rent agreement or bank statement", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
  { key: "itrProof", label: "ITR Proof", desc: "Income Tax Return for last financial year", required: true, accept: ".pdf" },
  { key: "msmeCertificate", label: "MSME Certificate", desc: "Udyam registration certificate (if applicable)", required: false, accept: ".pdf,.jpg,.jpeg,.png" },
];

const MAX_SIZE_MB = 5;

export default function Step6DocumentUpload({ data, onChange }: Props) {
  const uploads: Record<string, { name: string; size: number; type: string; url?: string }> = data.uploads || {};
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  async function handleFile(key: string, file: File | null) {
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [key]: `File too large. Max size is ${MAX_SIZE_MB}MB.` }));
      return;
    }

    setErrors((prev) => ({ ...prev, [key]: "" }));
    setUploading((prev) => ({ ...prev, [key]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!json.success) {
        setErrors((prev) => ({ ...prev, [key]: json.error || "Upload failed" }));
        return;
      }

      onChange("uploads", {
        ...uploads,
        [key]: { name: json.fileName, size: json.fileSize, type: json.mimeType, url: json.url },
      });
    } catch (e) {
      setErrors((prev) => ({ ...prev, [key]: "Network error. Please try again." }));
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  }

  function handleRemove(key: string) {
    const updated = { ...uploads };
    delete updated[key];
    onChange("uploads", updated);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const uploadedCount = Object.keys(uploads).length;
  const requiredCount = DOCUMENTS.filter((d) => d.required).length;
  const requiredUploaded = DOCUMENTS.filter((d) => d.required && uploads[d.key]).length;

  return (
    <div>
      {/* Card Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Document Upload</p>
          <p className="text-xs text-gray-400">Upload required business documents (Max {MAX_SIZE_MB}MB each)</p>
        </div>
        <span className="ml-auto text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Step 6</span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">

        {/* Progress Bar */}
        <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">Upload Progress</span>
            <span className="text-xs font-bold text-blue-600">{uploadedCount}/{DOCUMENTS.length} files</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(uploadedCount / DOCUMENTS.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{requiredUploaded}/{requiredCount} required documents uploaded</span>
            {uploadedCount === DOCUMENTS.length && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                All uploaded
              </span>
            )}
          </div>
        </div>

        {/* Document List */}
        <div className="space-y-2">
          {DOCUMENTS.map((doc) => {
            const uploaded = uploads[doc.key];
            const error = errors[doc.key];
            const isUploading = uploading[doc.key];

            return (
              <div key={doc.key} className={`border rounded-xl transition-all duration-200 ${uploaded ? "border-emerald-200 bg-emerald-50/40" : error ? "border-red-200 bg-red-50/40" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                <div className="flex items-center gap-3 p-3.5">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${uploaded ? "bg-emerald-100" : "bg-gray-100"}`}>
                    {isUploading ? (
                      <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : uploaded ? (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-800">{doc.label}</p>
                      {doc.required && <span className="text-red-400 text-xs">*</span>}
                      {!doc.required && <span className="text-xs text-gray-300 font-normal">(Optional)</span>}
                    </div>
                    {isUploading ? (
                      <p className="text-xs text-blue-500 mt-0.5">Uploading…</p>
                    ) : uploaded ? (
                      <p className="text-xs text-emerald-600 mt-0.5 truncate">
                        {uploaded.name} — {formatSize(uploaded.size)}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
                    )}
                    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {uploaded && !isUploading && (
                      <button onClick={() => handleRemove(doc.key)} className="p-1.5 hover:bg-red-50 rounded-lg transition-all group">
                        <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    )}
                    <label className={`cursor-pointer ${isUploading ? "pointer-events-none opacity-50" : ""}`}>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        uploaded
                          ? "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-100"
                      }`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        {uploaded ? "Replace" : "Upload"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept={doc.accept}
                        disabled={isUploading}
                        onChange={(e) => handleFile(doc.key, e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Accepted formats */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-100 rounded-lg">
          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-xs text-gray-400 leading-relaxed">
            Accepted formats: <strong className="text-gray-600">PDF, JPG, JPEG, PNG</strong> — Max file size: <strong className="text-gray-600">{MAX_SIZE_MB}MB</strong> per document. Fields marked with <span className="text-red-400">*</span> are mandatory.
          </p>
        </div>

      </div>
    </div>
  );
}