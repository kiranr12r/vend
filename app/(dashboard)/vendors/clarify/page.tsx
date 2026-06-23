"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Vendor {
  id: string;
  tradeName: string;
  legalName: string;
  gstNumber: string;
  status: string;
  natureOfService: string;
  createdAt: string;
  clarificationNote: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING_APPROVAL:          "bg-amber-50 text-amber-700 border-amber-200",
  CLARIFICATION_NEEDED:      "bg-orange-50 text-orange-700 border-orange-200",
  CLARIFICATION_RESUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVER_APPROVED:         "bg-teal-50 text-teal-700 border-teal-200",
  APPROVED:                  "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED:                  "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL:          "Pending Approval",
  CLARIFICATION_NEEDED:      "Clarification Needed",
  CLARIFICATION_RESUBMITTED: "Clarification Resubmitted",
  APPROVER_APPROVED:         "Approver Approved",
  APPROVED:                  "Approved",
  REJECTED:                  "Rejected",
};

export default function ClarifyPage() {
  const { data: session }               = useSession();
  const [vendors, setVendors]           = useState<Vendor[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState<Vendor | null>(null);
  const [note, setNote]                 = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { fetchVendors(); }, []);

  async function fetchVendors() {
    setLoading(true);
    try {
      const res  = await fetch("/api/vendors");
      const data = await res.json();
      if (data.success) {
        // IC Team sees only PENDING_APPROVAL and CLARIFICATION_RESUBMITTED
        setVendors(
          data.vendors.filter((v: Vendor) =>
            ["PENDING_APPROVAL", "CLARIFICATION_RESUBMITTED"].includes(v.status)
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleClarify() {
    if (!selected) return;
    if (!note.trim()) {
      showToast("Please enter a clarification reason", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/vendors/${selected.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status:            "CLARIFICATION_NEEDED",
          clarificationNote: note.trim(),
          changedBy:         session?.user?.email ?? "SYSTEM",
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast(`Clarification raised for ${selected.tradeName}`, "success");
        setVendors((prev) => prev.filter((v) => v.id !== selected.id));
        setSelected(null);
        setNote("");
      } else {
        showToast(data.error ?? "Failed to raise clarification", "error");
      }
    } catch {
      showToast("Network error — please try again", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold transition-all ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Kotak Mahindra AMC</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-blue-600 font-semibold">IC Team — Clarifications</span>
        </div>
        <span className="text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full">
          {vendors.length} pending review
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-3xl mx-auto space-y-3">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-500">No vendors pending IC review</p>
              <p className="text-xs text-gray-300 mt-1">All caught up!</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">

                    {/* Name + status */}
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-800 truncate">{vendor.tradeName}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[vendor.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {STATUS_LABELS[vendor.status] ?? vendor.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400">{vendor.gstNumber} · {vendor.natureOfService}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted {new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>

                    {/* Show previous clarification note if resubmitted */}
                    {vendor.clarificationNote && (
                      <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg">
                        <p className="text-xs font-semibold text-orange-600 mb-0.5">Previous clarification note:</p>
                        <p className="text-xs text-orange-500">{vendor.clarificationNote}</p>
                      </div>
                    )}
                  </div>

                  {/* Raise clarification button */}
                  <button
                    onClick={() => { setSelected(vendor); setNote(""); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-all shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                    Raise Clarification
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clarification Modal */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelected(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">

              {/* Modal header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Raise Clarification</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selected.tradeName} · {selected.gstNumber}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Info box */}
              <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-xs font-semibold text-orange-700 mb-1">What happens next</p>
                <p className="text-xs text-orange-600 leading-relaxed">
                  This vendor will be sent back to the Initiator with your note.
                  The status will change to <strong>Clarification Needed</strong> and
                  the Initiator must correct and resubmit.
                </p>
              </div>

              {/* Note textarea */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Clarification Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. PAN card copy is unclear, please reupload a clearer version. Bank account details need penny drop verification..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all resize-none"
                />
                <p className="text-xs text-gray-300 mt-1 text-right">{note.length}/500</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClarify}
                  disabled={submitting || !note.trim()}
                  className="flex-1 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                      </svg>
                      Send to Initiator
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}