"use client";

import Link from "next/link";

interface AdminCard {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export default function AdminPage() {
  const cards: AdminCard[] = [
    { title: "User Management", description: "Add, edit, or remove users and their roles", href: "/admin/users", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 2 0 016 0z" },
    { title: "Role Permissions", description: "Configure access control for each role", href: "/admin/roles", icon: "M12 15l-3-3m0 0l3-3m-3 3h12m6 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "System Logs", description: "View all audit logs and activity", href: "/admin/logs", icon: "M9 5h6m-6 4h6m-6 4h6m5 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h9" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Kotak Mahindra Bank</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-gray-400">Admin Panel</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Admin Panel</h2>
          <div className="grid grid-cols-2 gap-4">
            {cards.map((card) => (
              <Link key={card.href} href={card.href} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all">
                <svg className="w-6 h-6 text-purple-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
                <p className="text-sm font-semibold text-gray-800">{card.title}</p>
                <p className="text-xs text-gray-400 mt-1">{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
