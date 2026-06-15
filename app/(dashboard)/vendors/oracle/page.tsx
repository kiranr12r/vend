"use client";

import { useState, useEffect } from "react";

interface Vendor {
  id: string;
  tradeName: string;
  legalName: string;
  gstNumber: string;
  status: string;
  oracleVendorId: string | null;
  oracleSiteId: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-500",
  PENDING_APPROVAL: "bg-amber-50 text-amber-600 border border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  REJECTED: "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function UpdateOracleIdsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, { oracleVendorId: string; oracleSiteId: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch("/api/vendors");
        const data = await res.json();
        if (data.success) {
          setVendors(data.vendors);
          const initial: Record<string, { oracleVendorId: string; oracleSiteId: string }> = {};
          data.vendors.forEach((v: Vendor) => {
            initial[v.id] = {
              oracleVendorId: v.oracleVendorId || "",
              oracleSiteId: v.oracleSiteId || "",
            };
          });
          setEdits(initial);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  function handleEdit(vendorId: string, field: string, value: string) {
    setEdits((prev) => ({
      ...prev,
      [vendorId]: { ...prev[vendorId], [field]: value },
    }));
    setSaved((prev) => ({ ...prev, [vendorId]: false }));
  }

  async function handleSave(vendorId: string) {
    setSaving((prev) => ({ ...prev, [vendorId]: true }));
    try {
      const res = await fetch(`/api/vendors/${vendorId}/oracle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edits[vendorId]),
      });
      if (res.ok) {
        setSaved((prev) => ({ ...prev, [vendorId]: true }));
        setVendors((prev) =>
          prev.map((v) =>
            v.id === vendorId
              ? { ...v, oracleVendorId: edits[vendorId].oracleVendorId, oracleSiteId: edits[vendorId].oracleSiteId }
              : v
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving((prev) => ({ ...prev, [vendorId]: false }));
    }
  }

  async function handleSaveAll() {
    const unsaved = vendors.filter((v) => {
      const edit = edits[v.id];
      return edit && (edit.oracleVendorId !== (v.oracleVendorId || "") || edit.oracleSiteId !== (v.oracleSiteId || ""));
    });
    for (const v of unsaved) {
      await handleSave(v.id);
    }
  }

  const filtered = vendors.filter((v) =>
    v.tradeName.toLowerCase().includes(search.toLowerCase()) ||
    v.gstNumber.toLowerCase().includes(search.toLowerCase())
  );

  const syncedCount = vendors.filter((v) => v.oracleVendorId).length;
  const unsyncedCount = vendors.length - syncedCount;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Kotak Mahindra Bank</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-gray-400">Vendor Management</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-blue-600 font-semibold">Update Oracle IDs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleSaveAll} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all active:scale-95">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
            Save All
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Vendors", value: vendors.length, color: "text-blue-600", bg: "bg-blue-50", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "Synced with Oracle", value: syncedCount, color: "text-emerald-600", bg: "bg-emerald-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Not Synced", value: unsyncedCount, color: "text-amber-600", bg: "bg-amber-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <svg className={`w-4 h-4 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon}/>
                  </svg>
                </div>
                <div>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-xs text-blue-700 leading-relaxed">
              Enter or update Oracle Vendor IDs and Site IDs for each registered vendor. Click <strong>Save</strong> on each row or use <strong>Save All</strong> to sync all changes at once. Blank fields indicate the vendor is not yet synced with Oracle ERP.
            </p>
          </div>

          {/* Search */}
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="relative">
              <svg className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendor name or GST number..." className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              {[
                { label: "Vendor", span: "col-span-3" },
                { label: "GST Number", span: "col-span-2" },
                { label: "Status", span: "col-span-1" },
                { label: "Oracle Vendor ID", span: "col-span-2" },
                { label: "Oracle Site ID", span: "col-span-2" },
                { label: "Sync Status", span: "col-span-1" },
                { label: "Action", span: "col-span-1" },
              ].map((h) => (
                <div key={h.label} className={`${h.span} text-xs font-bold text-gray-400 uppercase tracking-wider`}>{h.label}</div>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="py-16 text-center">
                <svg className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-xs text-gray-400">Loading vendors...</p>
              </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-xs font-semibold text-gray-500">No vendors found</p>
              </div>
            )}

            {/* Rows */}
            {!loading && filtered.map((vendor, index) => {
              const edit = edits[vendor.id] || { oracleVendorId: "", oracleSiteId: "" };
              const isSynced = !!vendor.oracleVendorId;
              const isDirty = edit.oracleVendorId !== (vendor.oracleVendorId || "") || edit.oracleSiteId !== (vendor.oracleSiteId || "");
              const isSaving = saving[vendor.id];
              const isSaved = saved[vendor.id];

              return (
                <div key={vendor.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-all items-center" style={{ animation: `slideUp 0.${Math.min(index + 1, 9)}s ease` }}>

                  {/* Vendor */}
                  <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                      {vendor.tradeName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{vendor.tradeName}</p>
                      <p className="text-xs text-gray-400 truncate">{vendor.legalName}</p>
                    </div>
                  </div>

                  {/* GST */}
                  <div className="col-span-2">
                    <span className="text-xs font-mono text-gray-600">{vendor.gstNumber}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[vendor.status] || "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABELS[vendor.status] || vendor.status}
                    </span>
                  </div>

                  {/* Oracle Vendor ID */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={edit.oracleVendorId}
                      onChange={(e) => handleEdit(vendor.id, "oracleVendorId", e.target.value)}
                      placeholder="e.g. VND-ORC-10045"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-200"
                    />
                  </div>

                  {/* Oracle Site ID */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={edit.oracleSiteId}
                      onChange={(e) => handleEdit(vendor.id, "oracleSiteId", e.target.value)}
                      placeholder="e.g. SITE-001"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-200"
                    />
                  </div>

                  {/* Sync Status */}
                  <div className="col-span-1">
                    {isSaved ? (
                      <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">Saved</span>
                    ) : isSynced ? (
                      <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">Synced</span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-semibold">Pending</span>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSave(vendor.id)}
                      disabled={isSaving || !isDirty}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                        </svg>
                      )}
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && (
            <p className="text-xs text-gray-400 text-center">{syncedCount} of {vendors.length} vendors synced with Oracle ERP</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}