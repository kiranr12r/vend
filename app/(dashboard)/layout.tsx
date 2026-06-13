import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-52 min-w-52 bg-white border-r border-gray-200 flex flex-col">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
            VMS
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 leading-tight">Vendor Management</p>
            <p className="text-xs text-gray-400">System</p>
          </div>
        </div>

        {/* Nav */}
        <div className="px-2 py-2 flex-1">
          <p className="px-2 pt-2 pb-1 text-xs font-semibold text-gray-300 uppercase tracking-widest">Main Menu</p>
          <nav className="space-y-0.5">
            <Link href="/vendors/new" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all group">
              <svg className="w-4 h-4 shrink-0 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add Vendor
              <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-medium">New</span>
            </Link>
            <Link href="/vendors/list" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all group">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              Vendor List
              <span className="ml-auto text-xs text-gray-400">12</span>
            </Link>
            <Link href="/vendors/oracle" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all group">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
              </svg>
              Update Oracle IDs
            </Link>
            <Link href="/reports" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all group">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Reports
            </Link>
          </nav>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">AD</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@vendorlink.com</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto shrink-0 animate-pulse" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}