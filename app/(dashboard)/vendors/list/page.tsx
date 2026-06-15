"use client";

import { useState, useEffect } from "react";

interface Vendor {
  id: string;
  status: string;
  createdAt: string;
  gstNumber: string;
  tradeName: string;
  legalName: string;
  pan: string;
  city: string;
  state: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  natureOfService: string;
  paymentFrequency: string;
  registeredMsme: boolean;
  eInvoiceRequired: boolean;
  bankAccounts: any[];
  documents: any[];
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-500",
  PENDING_APPROVAL: "bg-amber-50 text-amber-600 border border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  REJECTED: "bg-red-50 text-red-600 border border-red-200",
  INACTIVE: "bg-gray-100 text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  INACTIVE: "Inactive",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

function getAvatarColor(name: string) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<Vendor | null>(null);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch("/api/vendors");
        const data = await res.json();
        if (data.success) setVendors(data.vendors);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const filtered = vendors.filter((v) => {
    const matchSearch =
      v.tradeName.toLowerCase().includes(search.toLowerCase()) ||
      v.gstNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: vendors.length,
    PENDING_APPROVAL: vendors.filter((v) => v.status === "PENDING_APPROVAL").length,
    APPROVED: vendors.filter((v) => v.status === "APPROVED").length,
    REJECTED: vendors.filter((v) => v.status === "REJECTED").length,
    DRAFT: vendors.filter((v) => v.status === "DRAFT").length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Kotak Mahindra Bank</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-gray-400">Vendor Management</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-blue-600 font-semibold">Vendor List</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export
          </button>
          
            <a href="/vendors/new" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all">
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
  </svg>
  Add Vendor
</a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-6xl mx-auto space-y-4">

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Vendors", value: counts.ALL, color: "text-blue-600", bg: "bg-blue-50", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "Pending Approval", value: counts.PENDING_APPROVAL, color: "text-amber-600", bg: "bg-amber-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Approved", value: counts.APPROVED, color: "text-emerald-600", bg: "bg-emerald-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Rejected", value: counts.REJECTED, color: "text-red-600", bg: "bg-red-50", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
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

          {/* Search + Filter */}
          <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <div className="flex-1 relative">
              <svg className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by vendor name, GST or contact person..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {["ALL", "PENDING_APPROVAL", "APPROVED", "REJECTED", "DRAFT"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    statusFilter === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {s === "ALL" ? "All" : STATUS_LABELS[s]}
                  <span className={`ml-1 ${statusFilter === s ? "text-blue-200" : "text-gray-400"}`}>
                    {counts[s as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              {["Vendor", "GST Number", "Service", "Contact", "Bank A/C", "Status", "Action"].map((h, i) => (
                <div
                  key={h}
                  className={`text-xs font-bold text-gray-400 uppercase tracking-wider ${
                    i === 0 ? "col-span-3" :
                    i === 1 ? "col-span-2" :
                    i === 2 ? "col-span-2" :
                    i === 3 ? "col-span-2" :
                    i === 4 ? "col-span-1" :
                    i === 5 ? "col-span-1" :
                    "col-span-1"
                  }`}
                >
                  {h}
                </div>
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
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-500">No vendors found</p>
                <p className="text-xs text-gray-300 mt-1">Try changing your search or filter</p>
              </div>
            )}

            {/* Rows */}
            {!loading && filtered.map((vendor, index) => (
              <div
                key={vendor.id}
                className={`grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-50 hover:bg-blue-50/30 transition-all duration-150 cursor-pointer ${
                  index === filtered.length - 1 ? "border-b-0" : ""
                }`}
                onClick={() => setSelected(vendor)}
                style={{ animation: `slideUp 0.${index + 1}s ease` }}
              >
                {/* Vendor */}
                <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(vendor.tradeName)}`}>
                    {getInitials(vendor.tradeName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{vendor.tradeName}</p>
                    <p className="text-xs text-gray-400 truncate">{vendor.legalName}</p>
                  </div>
                </div>

                {/* GST */}
                <div className="col-span-2 flex items-center">
                  <span className="text-xs font-mono text-gray-600 truncate">{vendor.gstNumber}</span>
                </div>

                {/* Service */}
                <div className="col-span-2 flex items-center">
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium truncate">
                    {vendor.natureOfService || "—"}
                  </span>
                </div>

                {/* Contact */}
                <div className="col-span-2 flex items-center min-w-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{vendor.contactPerson}</p>
                    <p className="text-xs text-gray-400 truncate">{vendor.contactPhone}</p>
                  </div>
                </div>

                {/* Bank A/C */}
                <div className="col-span-1 flex items-center">
                  <span className={`text-xs font-semibold ${vendor.bankAccounts?.length > 0 ? "text-emerald-600" : "text-gray-300"}`}>
                    {vendor.bankAccounts?.length || 0}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 flex items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[vendor.status] || "bg-gray-100 text-gray-500"}`}>
                    {STATUS_LABELS[vendor.status] || vendor.status}
                  </span>
                </div>

                {/* Action */}
                <div className="col-span-1 flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(vendor); }}
                    className="p-1.5 hover:bg-blue-100 rounded-lg transition-all"
                  >
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer count */}
          {!loading && (
            <p className="text-xs text-gray-400 text-center">
              Showing {filtered.length} of {vendors.length} vendors
            </p>
          )}
        </div>
      </div>

      {/* ── Vendor Detail Drawer ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          {/* Drawer */}
          <div
            className="w-96 bg-white shadow-2xl flex flex-col overflow-hidden"
            style={{ animation: "slideIn 0.2s ease" }}
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${getAvatarColor(selected.tradeName)}`}>
                {getInitials(selected.tradeName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{selected.tradeName}</p>
                <p className="text-xs text-gray-400 truncate">{selected.gstNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Status Badge */}
            <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[selected.status]}`}>
                {STATUS_LABELS[selected.status]}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Business Info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Business Info</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Legal Name", value: selected.legalName },
                    { label: "PAN", value: selected.pan },
                    { label: "Nature of Service", value: selected.natureOfService },
                    { label: "Payment Frequency", value: selected.paymentFrequency },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-2">
                      <span className="text-xs text-gray-400 shrink-0">{label}</span>
                      <span className="text-xs font-semibold text-gray-700 text-right">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Address</p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {selected.city}, {selected.state}
                </p>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contact</p>
                <div className="space-y-2.5">
                  {[
                    { label: "Person", value: selected.contactPerson },
                    { label: "Email", value: selected.contactEmail },
                    { label: "Phone", value: selected.contactPhone },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-2">
                      <span className="text-xs text-gray-400 shrink-0">{label}</span>
                      <span className="text-xs font-semibold text-gray-700 text-right truncate">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Compliance</p>
                <div className="flex flex-wrap gap-2">
                  {selected.registeredMsme && (
                    <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">MSME Registered</span>
                  )}
                  {selected.eInvoiceRequired && (
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">E-Invoice Required</span>
                  )}
                  {!selected.registeredMsme && !selected.eInvoiceRequired && (
                    <span className="text-xs text-gray-300">No flags</span>
                  )}
                </div>
              </div>

              {/* Bank Accounts */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Bank Accounts ({selected.bankAccounts?.length || 0})
                </p>
                {selected.bankAccounts?.length === 0 ? (
                  <p className="text-xs text-gray-300">No bank accounts added yet</p>
                ) : (
                  selected.bankAccounts?.map((acc: any, i: number) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                      <p className="font-semibold text-gray-700">{acc.bankName}</p>
                      <p className="text-gray-400 font-mono mt-0.5">{acc.accountNumber}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Drawer Footer — Approve / Reject */}
            <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
              <button className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all active:scale-95">
                Approve
              </button>
              <button className="flex-1 py-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-lg transition-all active:scale-95">
                Reject
              </button>
              <button className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 text-xs font-bold rounded-lg transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}