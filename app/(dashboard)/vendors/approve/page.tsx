"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Vendor {
  id: string;
  status: string;
  createdAt: string;
  tradeName: string;
  legalName: string;
  gstNumber: string;
  natureOfService: string;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-50 text-amber-600 border border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  REJECTED: "bg-red-50 text-red-600 border border-red-200",
};

export default function ApproveVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch("/api/vendors");
        const data = await res.json();
        if (data.success) {
          setVendors(data.vendors.filter((v: Vendor) => v.status === "PENDING_APPROVAL"));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  async function handleAction(vendorId: string, action: "APPROVE" | "REJECT") {
    setActionLoading((prev) => ({ ...prev, [vendorId]: true }));
    try {
      const res = await fetch(`/api/vendors/${vendorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "APPROVE" ? "APPROVED" : "REJECTED", changedBy: "admin@vendorlink.com" }),
      });
      if (res.ok) {
        setVendors((prev) => prev.filter((v) => v.id !== vendorId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, [vendorId]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-xs text-gray-400">Loading pending vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Kotak Mahindra Bank</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-gray-400">Vendor Management</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-blue-600 font-semibold">Pending Approvals</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-5xl mx-auto space-y-4">
          {vendors.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-semibold text-gray-500">No pending approvals</p>
              <p className="text-xs text-gray-300 mt-1">All vendors are up to date</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{vendor.tradeName}</p>
                  <p className="text-xs text-gray-400">{vendor.gstNumber} · {vendor.natureOfService}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(vendor.id, "REJECT")} disabled={actionLoading[vendor.id]} className="px-3 py-1.5 bg-white border border-red-200 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-50 transition-all disabled:opacity-50">
                    Reject
                  </button>
                  <button onClick={() => handleAction(vendor.id, "APPROVE")} disabled={actionLoading[vendor.id]} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50">
                    {actionLoading[vendor.id] ? "Saving..." : "Approve"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
