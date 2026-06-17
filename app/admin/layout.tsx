import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name ?? "Admin";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-52 min-w-52 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-50 border-2 border-purple-600 flex items-center justify-center text-xs font-bold text-purple-600">
            ADMIN
          </div>
          <p className="text-xs font-semibold text-gray-800">Admin Panel</p>
        </div>
        <nav className="px-2 py-3 flex-1">
          <Link href="/vendors/list" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg">
            ← Back to Dashboard
          </Link>
        </nav>
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
