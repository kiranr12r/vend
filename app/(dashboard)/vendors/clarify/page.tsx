"use client";

import { useState, useEffect } from "react";

interface Vendor {
  id: string;
  tradeName: string;
  gstNumber: string;
  status: string;
  auditLogs: { action: string; oldValue: string; newValue: string; changedAt: string }[];
}

export default function ClarifyVendorsPage() {
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-xs text-gray-400">Loading vendors...</p>
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
          <span className="text-blue-600 font-semibold">IC Clarifications</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-5xl mx-auto space-y-4">
          {vendors.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-semibold text-gray-500">No clarifications needed</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-800">{vendor.tradeName}</p>
                <p className="text-xs text-gray-400 mb-3">{vendor.gstNumber}</p>
                {vendor.auditLogs?.slice(0, 3).map((log, i) => (
                  <div key={i} className="text-xs py-1 border-t border-gray-50">
                    <span className="text-gray-500">{log.action}</span>
                    <span className="text-gray-300 mx-1">·</span>
                    <span className="text-gray-400">{new Date(log.changedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
