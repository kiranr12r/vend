"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Vendor {
  id: string;
  status: string;
  createdAt: string;
  tradeName: string;
  natureOfService: string;
  paymentFrequency: string;
  city: string;
  state: string;
  registeredMsme: boolean;
  eInvoiceRequired: boolean;
  oracleVendorId: string | null;
  bankAccounts: any[];
}

export default function ReportsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

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

  // ── Computed Stats ──
  const total = vendors.length;
  const approved = vendors.filter((v) => v.status === "APPROVED").length;
  const pending = vendors.filter((v) => v.status === "PENDING_APPROVAL").length;
  const rejected = vendors.filter((v) => v.status === "REJECTED").length;
  const draft = vendors.filter((v) => v.status === "DRAFT").length;
  const synced = vendors.filter((v) => v.oracleVendorId).length;
  const msme = vendors.filter((v) => v.registeredMsme).length;
  const withBank = vendors.filter((v) => v.bankAccounts?.length > 0).length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // ── Service breakdown ──
  const serviceMap: Record<string, number> = {};
  vendors.forEach((v) => {
    if (v.natureOfService) {
      serviceMap[v.natureOfService] = (serviceMap[v.natureOfService] || 0) + 1;
    }
  });
  const topServices = Object.entries(serviceMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // ── State breakdown ──
  const stateMap: Record<string, number> = {};
  vendors.forEach((v) => {
    if (v.state) stateMap[v.state] = (stateMap[v.state] || 0) + 1;
  });
  const topStates = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // ── Monthly registrations ──
  const monthMap: Record<string, number> = {};
  vendors.forEach((v) => {
    const month = new Date(v.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    monthMap[month] = (monthMap[month] || 0) + 1;
  });
  const months = Object.entries(monthMap).slice(-6);
  const maxMonth = Math.max(...months.map(([, v]) => v), 1);

  // ── Status colors ──
  const STATUS_COLORS: Record<string, string> = {
    APPROVED: "bg-emerald-500",
    PENDING_APPROVAL: "bg-amber-400",
    REJECTED: "bg-red-400",
    DRAFT: "bg-gray-300",
  };

  const statusBreakdown = [
    { label: "Approved", value: approved, color: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50" },
    { label: "Pending", value: pending, color: "bg-amber-400", text: "text-amber-600", light: "bg-amber-50" },
    { label: "Rejected", value: rejected, color: "bg-red-400", text: "text-red-600", light: "bg-red-50" },
    { label: "Draft", value: draft, color: "bg-gray-300", text: "text-gray-500", light: "bg-gray-50" },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-xs text-gray-400">Loading reports...</p>
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
          <span className="text-blue-600 font-semibold">Reports & Analytics</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-6xl mx-auto space-y-4">

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Vendors", value: total, sub: "All registered", color: "text-blue-600", bg: "bg-blue-50", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { label: "Approval Rate", value: `${approvalRate}%`, sub: `${approved} approved`, color: "text-emerald-600", bg: "bg-emerald-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Oracle Synced", value: synced, sub: `${total - synced} pending sync`, color: "text-violet-600", bg: "bg-violet-50", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
              { label: "MSME Vendors", value: msme, sub: `${Math.round((msme / (total || 1)) * 100)}% of total`, color: "text-amber-600", bg: "bg-amber-50", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
            ].map((stat, i) => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm" style={{ animation: `slideUp 0.${i + 1}s ease` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">{stat.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                  </div>
                  <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <svg className={`w-4 h-4 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon}/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">

            {/* Status Breakdown */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-700 mb-4">Vendor Status Breakdown</p>

              {/* Stacked Bar */}
              <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
                {statusBreakdown.filter((s) => s.value > 0).map((s) => (
                  <div
                    key={s.label}
                    className={`${s.color} transition-all duration-700 rounded-full`}
                    style={{ width: `${(s.value / (total || 1)) * 100}%` }}
                  />
                ))}
              </div>

              <div className="space-y-3">
                {statusBreakdown.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                      <span className="text-xs text-gray-600">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${(s.value / (total || 1)) * 100}%` }} />
                      </div>
                      <span className={`text-xs font-bold w-4 text-right ${s.text}`}>{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-4 p-2.5 ${approved > 0 ? "bg-emerald-50" : "bg-amber-50"} rounded-lg`}>
                <p className={`text-xs font-semibold ${approved > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                  {approvalRate}% approval rate
                </p>
                <p className={`text-xs mt-0.5 ${approved > 0 ? "text-emerald-500" : "text-amber-500"}`}>
                  {pending} vendor{pending !== 1 ? "s" : ""} awaiting review
                </p>
              </div>
            </div>

            {/* Monthly Registrations */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-700 mb-4">Monthly Registrations</p>
              {months.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-xs text-gray-300">No data yet</div>
              ) : (
                <div className="flex items-end gap-2 h-32">
                  {months.map(([month, count]) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-blue-600">{count}</span>
                      <div className="w-full bg-blue-100 rounded-t-md transition-all duration-700 relative group" style={{ height: `${(count / maxMonth) * 80}px` }}>
                        <div className="absolute inset-0 bg-blue-500 rounded-t-md opacity-80" />
                      </div>
                      <span className="text-xs text-gray-400 truncate w-full text-center" style={{ fontSize: "9px" }}>{month}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Total this period</span>
                <span className="text-xs font-bold text-blue-600">{months.reduce((a, [, v]) => a + v, 0)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-700 mb-4">Quick Actions</p>
              <div className="space-y-2">
                {[
                  { label: "Register New Vendor", desc: "Start 6-step onboarding", href: "/vendors/new", color: "bg-blue-50 text-blue-600 border-blue-100", icon: "M12 4v16m8-8H4" },
                  { label: "View Vendor List", desc: `${pending} pending approval`, href: "/vendors/list", color: "bg-amber-50 text-amber-600 border-amber-100", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
                  { label: "Update Oracle IDs", desc: `${total - synced} not synced`, href: "/vendors/oracle", color: "bg-violet-50 text-violet-600 border-violet-100", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
                ].map((action) => (
                  <Link key={action.label} href={action.href} className={`flex items-center gap-3 p-3 border rounded-xl hover:shadow-sm transition-all duration-150 ${action.color}`}>
                    <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon}/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{action.label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{action.desc}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 ml-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                ))}
              </div>

              {/* Additional stats */}
              <div className="mt-4 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <p className="text-xs font-bold text-gray-700">{withBank}</p>
                  <p className="text-xs text-gray-400">With Bank A/C</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <p className="text-xs font-bold text-gray-700">{msme}</p>
                  <p className="text-xs text-gray-400">MSME Vendors</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Top Services */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-700 mb-4">Top Services</p>
              {topServices.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {topServices.map(([service, count], i) => {
                    const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
                    return (
                      <div key={service} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 truncate">{service}</span>
                            <span className="text-xs font-bold text-gray-600 ml-2">{count}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[i]} rounded-full transition-all duration-700`} style={{ width: `${(count / (total || 1)) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top States */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-700 mb-4">Vendors by State</p>
              {topStates.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {topStates.map(([state, count], i) => {
                    const colors = ["bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"];
                    return (
                      <div key={state} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 truncate">{state}</span>
                            <span className="text-xs font-bold text-gray-600 ml-2">{count}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[i]} rounded-full transition-all duration-700`} style={{ width: `${(count / (total || 1)) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Vendors Table */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-700">Recent Registrations</p>
              <Link href="/vendors/list" className="text-xs text-blue-600 hover:underline font-medium">View all</Link>
            </div>
            {vendors.slice(0, 5).map((vendor, index) => (
              <div key={vendor.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-all" style={{ animation: `slideUp 0.${index + 1}s ease` }}>
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                  {vendor.tradeName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{vendor.tradeName}</p>
                  <p className="text-xs text-gray-400">{vendor.natureOfService || "—"} · {vendor.city}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  vendor.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" :
                  vendor.status === "PENDING_APPROVAL" ? "bg-amber-50 text-amber-600" :
                  vendor.status === "REJECTED" ? "bg-red-50 text-red-600" :
                  "bg-gray-100 text-gray-500"
                }`}>
                  {vendor.status === "PENDING_APPROVAL" ? "Pending" : vendor.status.charAt(0) + vendor.status.slice(1).toLowerCase()}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(vendor.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}