"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────
interface BankAccount {
  id: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: string;
  isPrimary: boolean;
  isVerified: boolean;
}

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
  pincode: string;
  addressLine1: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  natureOfService: string;
  paymentFrequency: string;
  registeredMsme: boolean;
  eInvoiceRequired: boolean;
  compositeGstScheme: boolean;
  itrFiledLastYear: boolean;
  taxExemption: boolean;
  tdsRate: string | null;
  oracleVendorId: string | null;
  bankAccounts: BankAccount[];
  documents: any[];
}

// ── Constants ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT:            { label: "Draft",    className: "bg-gray-100 text-gray-500" },
  PENDING_APPROVAL: { label: "Pending",  className: "bg-amber-50 text-amber-600 border border-amber-200" },
  APPROVED:         { label: "Active",   className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  REJECTED:         { label: "Rejected", className: "bg-red-50 text-red-600 border border-red-200" },
  INACTIVE:         { label: "Inactive", className: "bg-gray-100 text-gray-400 border border-gray-200" },
};

const AVATAR_PALETTES = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
];

// ── Helpers ────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function avatarPalette(name: string) {
  return AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).replace(/\//g, "-");
}

// ── Chevron ─────────────────────────────────────────────────────────
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ── Three-dot action menu ─────────────────────────────────────────────
function ActionMenu({ vendor, onView, onApprove, onReject }: {
  vendor: Vendor;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const items = [
    { label: "View details",  icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", action: onView,    color: "text-gray-600" },
    { label: "Approve",       icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                                            action: onApprove, color: "text-emerald-600" },
    { label: "Reject",        icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                   action: onReject,  color: "text-red-500" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all"
      >
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-8 z-30 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 overflow-hidden"
          style={{ animation: "fadeIn 0.1s ease" }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={(e) => { e.stopPropagation(); item.action(); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-all ${item.color}`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Expanded row ──────────────────────────────────────────────────────
function ExpandedDetail({ vendor }: { vendor: Vendor }) {
  return (
    <div className="bg-gray-50/80 border-t border-gray-100 px-6 py-4" style={{ animation: "expandDown 0.15s ease" }}>
      <div className="grid grid-cols-3 gap-6">

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Site — GST</p>
          <span className="text-xs font-mono text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded-lg inline-block mb-1.5">
            {vendor.gstNumber}
          </span>
          <p className="text-xs text-gray-500">{vendor.addressLine1}</p>
          <p className="text-xs text-gray-400">{vendor.city}, {vendor.state} {vendor.pincode}</p>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Bank Accounts ({vendor.bankAccounts?.length || 0})
          </p>
          {!vendor.bankAccounts?.length ? (
            <p className="text-xs text-gray-300 italic">No accounts added</p>
          ) : (
            <div className="space-y-1.5">
              {vendor.bankAccounts.map((acc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1.5 flex-1 min-w-0">
                    <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4"/>
                    </svg>
                    <span className="text-xs text-gray-700 font-medium truncate">{acc.bankName}</span>
                    <span className="text-xs font-mono text-gray-400 shrink-0">·{acc.accountNumber.slice(-4)}</span>
                  </div>
                  {acc.isPrimary && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold shrink-0">Primary</span>
                  )}
                  {acc.isVerified && (
                    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Compliance</p>
          <div className="flex flex-wrap gap-1.5">
            {vendor.registeredMsme   && <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">MSME</span>}
            {vendor.eInvoiceRequired && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">E-Invoice</span>}
            {vendor.itrFiledLastYear && <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">ITR Filed</span>}
            {vendor.taxExemption     && <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-medium">Tax Exempt</span>}
            {!vendor.registeredMsme && !vendor.eInvoiceRequired && !vendor.itrFiledLastYear && !vendor.taxExemption && (
              <span className="text-xs text-gray-300 italic">No flags</span>
            )}
          </div>
          {vendor.tdsRate && (
            <p className="text-xs text-gray-500 mt-2">TDS: <span className="font-semibold text-gray-700">{vendor.tdsRate}%</span></p>
          )}
          {vendor.oracleVendorId && (
            <p className="text-xs text-gray-500 mt-1">Oracle ID: <span className="font-mono font-semibold text-gray-700">{vendor.oracleVendorId}</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────
function DetailDrawer({ vendor, onClose, onApprove, onReject }: {
  vendor: Vendor;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const status = STATUS_CONFIG[vendor.status] ?? { label: vendor.status, className: "bg-gray-100 text-gray-500" };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose}/>
      <div className="w-96 bg-white shadow-2xl flex flex-col overflow-hidden" style={{ animation: "slideIn 0.2s ease" }}>

        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${avatarPalette(vendor.tradeName)}`}>
            {initials(vendor.tradeName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">{vendor.tradeName}</p>
            <p className="text-xs text-gray-400 font-mono truncate">{vendor.pan}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-5 py-2.5 border-b border-gray-50 flex items-center justify-between">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.className}`}>{status.label}</span>
          <span className="text-xs text-gray-400">{fmtDate(vendor.createdAt)}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {[
            { title: "Business Info", rows: [
              { label: "Legal Name",         value: vendor.legalName },
              { label: "GST Number",         value: vendor.gstNumber, mono: true },
              { label: "Nature of Service",  value: vendor.natureOfService },
              { label: "Payment Frequency",  value: vendor.paymentFrequency },
            ]},
            { title: "Address", rows: [
              { label: "Line 1",      value: vendor.addressLine1 },
              { label: "City / State", value: `${vendor.city}, ${vendor.state}` },
              { label: "Pincode",     value: vendor.pincode, mono: true },
            ]},
            { title: "Contact", rows: [
              { label: "Person", value: vendor.contactPerson },
              { label: "Email",  value: vendor.contactEmail },
              { label: "Phone",  value: vendor.contactPhone, mono: true },
            ]},
          ].map((section) => (
            <div key={section.title}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{section.title}</p>
              <div className="space-y-2.5">
                {section.rows.map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between items-start gap-3">
                    <span className="text-xs text-gray-400 shrink-0">{label}</span>
                    <span className={`text-xs font-semibold text-gray-700 text-right truncate ${mono ? "font-mono" : ""}`}>
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Bank Accounts ({vendor.bankAccounts?.length || 0})
            </p>
            {!vendor.bankAccounts?.length ? (
              <p className="text-xs text-gray-300 italic">None added yet</p>
            ) : (
              <div className="space-y-2">
                {vendor.bankAccounts.map((acc, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-gray-700">{acc.bankName}</p>
                      <div className="flex items-center gap-1">
                        {acc.isPrimary && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">Primary</span>}
                        {acc.isVerified && (
                          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-mono text-gray-500">{acc.accountNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{acc.branchName} · {acc.accountType}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => { onApprove(vendor.id); onClose(); }}
            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
            Approve
          </button>
          <button
            onClick={() => { onReject(vendor.id); onClose(); }}
            className="flex-1 py-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [drawer, setDrawer]             = useState<Vendor | null>(null);
  const [toast, setToast]               = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/vendors")
      .then((r) => r.json())
      .then((d) => { if (d.success) setVendors(d.vendors); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleApprove(id: string) {
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: "APPROVED" } : v));
    showToast("Vendor approved successfully");
  }

  function handleReject(id: string) {
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: "REJECTED" } : v));
    showToast("Vendor rejected", "error");
  }

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      v.tradeName.toLowerCase().includes(q) ||
      v.pan.toLowerCase().includes(q) ||
      v.gstNumber.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL:              vendors.length,
    PENDING_APPROVAL: vendors.filter((v) => v.status === "PENDING_APPROVAL").length,
    APPROVED:         vendors.filter((v) => v.status === "APPROVED").length,
    REJECTED:         vendors.filter((v) => v.status === "REJECTED").length,
    INACTIVE:         vendors.filter((v) => v.status === "INACTIVE").length,
  };

  const COLS = "32px 1fr 72px 112px 80px 110px 140px 48px";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Kotak Mahindra Bank</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-gray-400">Vendor Management</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-blue-600 font-semibold">Registered Vendors</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export
          </button>
          <a href="/vendors/new" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-blue-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Add New Vendor
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-5">
        <div className="max-w-6xl mx-auto space-y-4">

          {/* Title */}
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800">Registered Vendors</h1>
              <p className="text-xs text-gray-400 mt-0.5">{vendors.length} total · click any row to expand</p>
            </div>
          </div>

          {/* Search + filter */}
          <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <div className="flex-1 relative">
              <svg className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by vendor name, PAN, GST or contact…"
                className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(["ALL","PENDING_APPROVAL","APPROVED","REJECTED","INACTIVE"] as const).map((s) => {
                const label = s === "ALL" ? "All" : (STATUS_CONFIG[s]?.label ?? s);
                const count = counts[s as keyof typeof counts];
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                      statusFilter === s ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {label} <span className={`ml-0.5 ${statusFilter === s ? "text-blue-200" : "text-gray-300"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">

            {/* Header */}
            <div className="grid items-center px-4 py-2.5 bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: COLS }}>
              {["", "Vendor (Trade Name) / PAN", "Sites", "Date Added", "Bank A/C", "Status", "Actions", ""].map((h) => (
                <div key={h} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</div>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="py-16 text-center">
                <svg className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <p className="text-xs text-gray-400">Loading vendors…</p>
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
                <p className="text-xs text-gray-300 mt-1">{search ? "Try a different search term" : "Add your first vendor to get started"}</p>
                {!search && (
                  <a href="/vendors/new" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    Add First Vendor
                  </a>
                )}
              </div>
            )}

            {/* Rows */}
            {!loading && filtered.map((vendor, idx) => {
              const isExpanded = expandedId === vendor.id;
              const status = STATUS_CONFIG[vendor.status] ?? { label: vendor.status, className: "bg-gray-100 text-gray-500" };
              const isLast = idx === filtered.length - 1;

              return (
                <div key={vendor.id} className={!isLast || isExpanded ? "border-b border-gray-100" : ""}>
                  {/* Row */}
                  <div
                    className={`grid items-center px-4 py-3.5 cursor-pointer transition-all duration-150 ${isExpanded ? "bg-blue-50/30" : "hover:bg-gray-50/70"}`}
                    style={{ gridTemplateColumns: COLS }}
                    onClick={() => setExpandedId(isExpanded ? null : vendor.id)}
                  >
                    {/* Chevron */}
                    <div className="flex justify-center"><Chevron open={isExpanded}/></div>

                    {/* Name + PAN */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${avatarPalette(vendor.tradeName)}`}>
                        {initials(vendor.tradeName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{vendor.tradeName}</p>
                        <p className="text-xs font-mono text-gray-400 truncate">{vendor.pan}</p>
                      </div>
                    </div>

                    {/* Sites */}
                    <div>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600">1</span>
                    </div>

                    {/* Date */}
                    <div><span className="text-xs text-gray-500">{fmtDate(vendor.createdAt)}</span></div>

                    {/* Bank A/C */}
                    <div>
                      <span className={`text-xs font-bold ${vendor.bankAccounts?.length > 0 ? "text-emerald-600" : "text-gray-300"}`}>
                        {vendor.bankAccounts?.length || 0}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.className}`}>{status.label}</span>
                    </div>

                    {/* Add New Site */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Add New Site
                      </button>
                    </div>

                    {/* Three-dot */}
                    <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
                      <ActionMenu
                        vendor={vendor}
                        onView={() => setDrawer(vendor)}
                        onApprove={() => handleApprove(vendor.id)}
                        onReject={() => handleReject(vendor.id)}
                      />
                    </div>
                  </div>

                  {isExpanded && <ExpandedDetail vendor={vendor}/>}
                </div>
              );
            })}
          </div>

          {!loading && filtered.length > 0 && (
            <p className="text-xs text-gray-400 text-center pb-2">
              Showing {filtered.length} of {vendors.length} vendors
            </p>
          )}
        </div>
      </div>

      {/* Drawer */}
      {drawer && (
        <DetailDrawer
          vendor={drawer}
          onClose={() => setDrawer(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
          style={{ animation: "slideUp 0.2s ease" }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={toast.type === "success" ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}/>
          </svg>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp   { from { opacity:0; transform:translateY(6px);  } to { opacity:1; transform:translateY(0);  } }
        @keyframes slideIn   { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0);  } }
        @keyframes expandDown{ from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0);  } }
        @keyframes fadeIn    { from { opacity:0; transform:scale(0.97);      } to { opacity:1; transform:scale(1);       } }
      `}</style>
    </div>
  );
}
