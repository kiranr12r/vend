"use client";
import { useState, useEffect } from "react";

type Role = "ADMIN" | "INITIATOR" | "APPROVER" | "IC_TEAM" | "ACCOUNTS";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

const ROLES: Role[] = ["ADMIN", "INITIATOR", "APPROVER", "IC_TEAM", "ACCOUNTS"];

const ROLE_STYLES: Record<Role, string> = {
  ADMIN:     "bg-purple-50 text-purple-700 border-purple-200",
  INITIATOR: "bg-blue-50   text-blue-700   border-blue-200",
  APPROVER:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  IC_TEAM:   "bg-amber-50  text-amber-700  border-amber-200",
  ACCOUNTS:  "bg-gray-100  text-gray-700   border-gray-200",
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN:     "Admin",
  INITIATOR: "Initiator",
  APPROVER:  "Approver",
  IC_TEAM:   "IC Team",
  ACCOUNTS:  "Accounts",
};

export default function UsersPage() {
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [saving, setSaving]     = useState<Record<string, boolean>>({});
  const [toast, setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [addForm, setAddForm]   = useState({ name: "", email: "", password: "", role: "INITIATOR" as Role });
  const [addLoading, setAddLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const res  = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleRoleChange(userId: string, newRole: Role) {
    setSaving((p) => ({ ...p, [userId]: true }));
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((p) => p.map((u) => u.id === userId ? { ...u, role: newRole } : u));
        showToast("Role updated successfully", "success");
      } else {
        showToast(data.error ?? "Failed to update role", "error");
      }
    } finally {
      setSaving((p) => ({ ...p, [userId]: false }));
    }
  }

  async function handleDelete(user: User) {
    setSaving((p) => ({ ...p, [user.id]: true }));
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers((p) => p.filter((u) => u.id !== user.id));
        showToast(`${user.name} removed`, "success");
      } else {
        showToast(data.error ?? "Failed to delete user", "error");
      }
    } finally {
      setSaving((p) => ({ ...p, [user.id]: false }));
      setConfirmDelete(null);
    }
  }

  async function handleAddUser() {
    if (!addForm.name || !addForm.email || !addForm.password) {
      showToast("All fields are required", "error"); return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUsers();
        setShowAdd(false);
        setAddForm({ name: "", email: "", password: "", role: "INITIATOR" });
        showToast("User added successfully", "success");
      } else {
        showToast(data.error ?? "Failed to add user", "error");
      }
    } finally {
      setAddLoading(false);
    }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Admin Panel</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-blue-600 font-semibold">User Management</span>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Add User
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-4xl mx-auto space-y-4">

          <div className="grid grid-cols-5 gap-3">
            {ROLES.map((role) => (
              <div key={role} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-800">{users.filter((u) => u.role === role).length}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABELS[role]}</p>
              </div>
            ))}
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"/>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="col-span-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</p>
              <p className="col-span-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
              <p className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</p>
              <p className="col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</p>
              <p className="col-span-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</p>
            </div>

            {loading ? (
              <div className="px-4 py-10 text-center text-xs text-gray-400">Loading users...</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-gray-400">No users found</div>
            ) : (
              filtered.map((user, i) => (
                <div key={user.id} className={`grid grid-cols-12 gap-3 px-4 py-3 items-center ${i !== filtered.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                  </div>
                  <p className="col-span-4 text-xs text-gray-500 truncate">{user.email}</p>
                  <div className="col-span-2">
                    <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      disabled={saving[user.id]}
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white disabled:opacity-50">
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </div>
                  <p className="col-span-2 text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => setConfirmDelete(user)} disabled={saving[user.id]}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-all disabled:opacity-30">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAdd && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowAdd(false)}/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-gray-800">Add New User</h3>
                <button onClick={() => setShowAdd(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
                  <input type="text" value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} placeholder="Rahul Sharma" className={inp}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
                  <input type="email" value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} placeholder="rahul@kotak.com" className={inp}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
                  <input type="password" value={addForm.password} onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))} placeholder="Min. 8 characters" className={inp}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
                  <select value={addForm.role} onChange={(e) => setAddForm((p) => ({ ...p, role: e.target.value as Role }))} className={inp}>
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <button onClick={handleAddUser} disabled={addLoading}
                  className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 mt-2">
                  {addLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40"/>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">Remove {confirmDelete.name}?</p>
              <p className="text-xs text-gray-400 mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600">Remove</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}