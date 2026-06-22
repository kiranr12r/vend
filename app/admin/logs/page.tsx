"use client";
import { useState, useEffect } from "react";

interface AuditLog {
  id: string;
  vendorId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
  vendor: { tradeName: string; gstNumber: string } | null;
}

const ACTION_STYLES: Record<string, string> = {
  STATUS_CHANGED:    "bg-blue-50 text-blue-700 border-blue-200",
  VENDOR_CREATED:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  VENDOR_UPDATED:    "bg-amber-50 text-amber-700 border-amber-200",
  ORACLE_ID_UPDATED: "bg-purple-50 text-purple-700 border-purple-200",
  DOCUMENT_UPLOADED: "bg-gray-100 text-gray-600 border-gray-200",
};

const ACTION_LABELS: Record<string, string> = {
  STATUS_CHANGED:    "Status Changed",
  VENDOR_CREATED:    "Vendor Created",
  VENDOR_UPDATED:    "Vendor Updated",
  ORACLE_ID_UPDATED: "Oracle ID Updated",
  DOCUMENT_UPLOADED: "Document Uploaded",
};

const ALL_ACTIONS = ["STATUS_CHANGED", "VENDOR_CREATED", "VENDOR_UPDATED", "ORACLE_ID_UPDATED", "DOCUMENT_UPLOADED"];

export default function LogsPage() {
  const [logs, setLogs]         = useState<AuditLog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [action, setAction]     = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");

  useEffect(() => { fetchLogs(); }, [action, dateFrom, dateTo]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (action)   params.set("action",   action);
      if (search)   params.set("search",   search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo)   params.set("dateTo",   dateTo);
      const res  = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } finally {
      setLoading(false);
    }
  }

  const filtered = logs.filter((log) =>
    !search ||
    log.changedBy.toLowerCase().includes(search.toLowerCase()) ||
    log.vendor?.tradeName.toLowerCase().includes(search.toLowerCase()) ||
    log.vendorId.toLowerCase().includes(search.toLowerCase())
  );

  function downloadCSV() {
    const header = ["Date", "Action", "Vendor", "GST", "Old Value", "New Value", "Changed By"];
    const rows = filtered.map((log) => [
      new Date(log.changedAt).toLocaleString("en-IN"),
      log.action,
      log.vendor?.tradeName ?? log.vendorId,
      log.vendor?.gstNumber ?? "",
      log.oldValue ?? "",
      log.newValue ?? "",
      log.changedBy,
    ]);
    const csv  = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Admin Panel</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-blue-600 font-semibold">System Logs</span>
        </div>
        <button onClick={downloadCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Export CSV
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-5xl mx-auto space-y-4">

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by vendor or user..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"/>
              </div>
              <select value={action} onChange={(e) => setAction(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white">
                <option value="">All Actions</option>
                {ALL_ACTIONS.map((a) => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"/>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"/>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{filtered.length} log{filtered.length !== 1 ? "s" : ""} found</span>
            {(action || dateFrom || dateTo || search) && (
              <button onClick={() => { setAction(""); setDateFrom(""); setDateTo(""); setSearch(""); }}
                className="text-blue-500 hover:underline">Clear filters</button>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading logs...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-gray-500">No logs found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 px-4 py-3 hover:bg-gray-50/50 transition-all">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ACTION_STYLES[log.action] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                        {log.vendor && <span className="text-xs font-semibold text-gray-700">{log.vendor.tradeName}</span>}
                        {log.oldValue && log.newValue && (
                          <span className="text-xs text-gray-400">
                            <span className="text-red-400 font-medium">{log.oldValue}</span>
                            <span className="mx-1">→</span>
                            <span className="text-emerald-600 font-medium">{log.newValue}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        by <span className="font-medium text-gray-600">{log.changedBy}</span>
                        {log.vendor && <span className="text-gray-300 ml-2">{log.vendor.gstNumber}</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(log.changedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-gray-300">
                        {new Date(log.changedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}