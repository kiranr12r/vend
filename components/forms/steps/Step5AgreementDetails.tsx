"use client";

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all duration-150 placeholder:text-gray-300";
const lbl = "block text-xs font-semibold text-gray-500 mb-1.5";

export default function Step5AgreementDetails({ data, onChange }: Props) {
  const start = data.agreementStartDate || "";
  const end = data.agreementEndDate || "";

  let duration = "";
  if (start && end) {
    const days = Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days > 0) {
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
      if (years > 0) duration = `${years} year${years > 1 ? "s" : ""} ${months % 12 > 0 ? `${months % 12} month${months % 12 > 1 ? "s" : ""}` : ""}`;
      else if (months > 0) duration = `${months} month${months > 1 ? "s" : ""}`;
      else duration = `${days} day${days > 1 ? "s" : ""}`;
    }
  }

  return (
    <div>
      {/* Card Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">Agreement Details</p>
          <p className="text-xs text-gray-400">Provide the start and end dates for the vendor agreement</p>
        </div>
        <span className="ml-auto text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Step 5</span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">

        {/* Date Fields */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block"/>
            Agreement Period
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Agreement start Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={start}
                onChange={(e) => onChange("agreementStartDate", e.target.value)}
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Agreement End Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={end}
                min={start}
                onChange={(e) => onChange("agreementEndDate", e.target.value)}
                className={inp}
              />
            </div>
          </div>
        </div>

        {/* Duration Card */}
        {duration && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl" style={{ animation: "slideUp 0.2s ease" }}>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-blue-500 font-medium">Agreement Duration</p>
              <p className="text-sm font-bold text-blue-700 mt-0.5">{duration}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-blue-400">From</p>
              <p className="text-xs font-semibold text-blue-700">{new Date(start).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              <p className="text-xs text-blue-400 mt-1">To</p>
              <p className="text-xs font-semibold text-blue-700">{new Date(end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          </div>
        )}

        {/* Renewal Info */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-0.5 h-3 bg-blue-500 rounded-full inline-block"/>
            Renewal & Notes
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Auto Renewal</label>
              <div className="flex gap-2">
                {["Yes", "No"].map((opt) => (
                  <div
                    key={opt}
                    onClick={() => onChange("autoRenewal", opt === "Yes")}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold text-center cursor-pointer transition-all duration-150 ${
                      (opt === "Yes" && data.autoRenewal === true) || (opt === "No" && data.autoRenewal === false)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={lbl}>Notice Period (days)</label>
              <input
                type="number"
                value={data.noticePeriodDays || ""}
                onChange={(e) => onChange("noticePeriodDays", e.target.value)}
                placeholder="e.g. 30"
                min="0"
                className={inp}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={lbl}>Agreement Notes <span className="text-gray-300 font-normal">(Optional)</span></label>
          <textarea
            value={data.agreementNotes || ""}
            onChange={(e) => onChange("agreementNotes", e.target.value)}
            placeholder="Any special terms, conditions or notes about this agreement..."
            rows={3}
            className={`${inp} resize-none`}
          />
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            Ensure agreement dates are accurate. The system will alert you 30 days before the agreement expires if auto-renewal is disabled.
          </p>
        </div>

      </div>

      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}