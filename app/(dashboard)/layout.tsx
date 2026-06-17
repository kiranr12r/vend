import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { NAV_BY_ROLE, UserRole, NavItem } from "@/lib/rbac";

// ─── Icon map ────────────────────────────────────────────────────────────────
function NavIcon({ type }: { type: NavItem["icon"] }) {
  const cls = "w-4 h-4 shrink-0 group-hover:text-blue-600";
  switch (type) {
    case "plus":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>;
    case "list":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>;
    case "check":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
    case "oracle":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/></svg>;
    case "reports":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;
    case "clarify":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>;
    case "admin":
      return <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
    default:
      return null;
  }
}

// ─── Role badge colours ───────────────────────────────────────────────────────
const ROLE_BADGE: Record<UserRole, { label: string; colour: string }> = {
  ADMIN:     { label: "Admin",     colour: "bg-purple-100 text-purple-700" },
  INITIATOR: { label: "Initiator", colour: "bg-blue-100 text-blue-700"   },
  APPROVER:  { label: "Approver",  colour: "bg-amber-100 text-amber-700"  },
  IC_TEAM:   { label: "IC Team",   colour: "bg-teal-100 text-teal-700"    },
  ACCOUNTS:  { label: "Accounts",  colour: "bg-green-100 text-green-700"  },
};

// ─── Layout ───────────────────────────────────────────────────────────────────
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const name     = session?.user?.name  ?? "User";
  const email    = session?.user?.email ?? "";
  const role     = (session?.user?.role ?? "ADMIN") as UserRole; // Default to ADMIN for safety
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const navItems = NAV_BY_ROLE[role] ?? [];
  const badge    = ROLE_BADGE[role];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <aside className="w-52 min-w-52 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
            VMS
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 leading-tight">Vendor Management</p>
            <p className="text-xs text-gray-400">System</p>
          </div>
        </div>

        {/* Nav — only items the role is allowed to see */}
        <div className="px-2 py-2 flex-1">
          <p className="px-2 pt-2 pb-1 text-xs font-semibold text-gray-300 uppercase tracking-widest">
            Main Menu
          </p>
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all group"
              >
                <NavIcon type={item.icon} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto shrink-0 animate-pulse" />
          </div>
          {/* Role badge */}
          <div className={`mb-2 px-2 py-0.5 rounded-full text-center text-xs font-semibold ${badge.colour}`}>
            {badge.label}
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
