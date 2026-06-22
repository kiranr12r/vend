"use client";

type Role = "ADMIN" | "INITIATOR" | "APPROVER" | "IC_TEAM" | "ACCOUNTS";

interface Permission {
  label: string;
  description: string;
}

interface RoleConfig {
  color: string;
  bg: string;
  border: string;
  description: string;
  permissions: string[];
}

const ALL_PERMISSIONS: Permission[] = [
  { label: "Add Vendor",          description: "Submit new vendor registration forms" },
  { label: "View All Vendors",    description: "View all vendors in the system" },
  { label: "Approve / Reject",    description: "Approve or reject pending vendor applications" },
  { label: "Raise Clarification", description: "Raise clarification requests on vendor submissions" },
  { label: "Manage Oracle IDs",   description: "Assign Oracle vendor IDs and site IDs" },
  { label: "View Reports",        description: "Access analytics and export reports" },
  { label: "Manage Users",        description: "Add, edit and remove system users" },
  { label: "Configure Roles",     description: "Change role permissions and access control" },
  { label: "View Audit Logs",     description: "Access full audit trail and system logs" },
  { label: "View Bank Details",   description: "View unmasked bank account information" },
  { label: "View PAN / GST",      description: "View unmasked PAN and GST numbers" },
];

const ROLE_CONFIG: Record<Role, RoleConfig> = {
  ADMIN: {
    color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200",
    description: "Full system access. Can manage users, roles, and all vendor data.",
    permissions: ["Add Vendor","View All Vendors","Approve / Reject","Raise Clarification","Manage Oracle IDs","View Reports","Manage Users","Configure Roles","View Audit Logs","View Bank Details","View PAN / GST"],
  },
  INITIATOR: {
    color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200",
    description: "Creates and submits new vendor registrations.",
    permissions: ["Add Vendor"],
  },
  APPROVER: {
    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",
    description: "Reviews and approves or rejects submitted vendors.",
    permissions: ["View All Vendors","Approve / Reject"],
  },
  IC_TEAM: {
    color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200",
    description: "IC Team reviews vendors and can raise clarification requests.",
    permissions: ["View All Vendors","Raise Clarification"],
  },
  ACCOUNTS: {
    color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-200",
    description: "Accounts team handles final approval, Oracle IDs, and financial reports.",
    permissions: ["View All Vendors","Approve / Reject","Manage Oracle IDs","View Reports","View Bank Details","View PAN / GST"],
  },
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin", INITIATOR: "Initiator", APPROVER: "Approver", IC_TEAM: "IC Team", ACCOUNTS: "Accounts",
};

export default function RolesPage() {
  const roles = Object.keys(ROLE_CONFIG) as Role[];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-100 px-5 h-11 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-gray-700">Admin Panel</span>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-blue-600 font-semibold">Role Permissions</span>
        </div>
        <span className="text-xs bg-amber-50 border border-amber-200 text-amber-600 font-semibold px-2.5 py-1 rounded-full">
          Read-only — edit in lib/rbac.ts
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
        <div className="max-w-5xl mx-auto space-y-4">

          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-700">Permission Matrix</p>
              <p className="text-xs text-gray-400 mt-0.5">Overview of what each role can do</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-52">Permission</th>
                    {roles.map((role) => (
                      <th key={role} className="px-3 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${ROLE_CONFIG[role].bg} ${ROLE_CONFIG[role].color} ${ROLE_CONFIG[role].border}`}>
                          {ROLE_LABELS[role]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_PERMISSIONS.map((perm, i) => (
                    <tr key={perm.label} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-gray-700">{perm.label}</p>
                        <p className="text-xs text-gray-400">{perm.description}</p>
                      </td>
                      {roles.map((role) => (
                        <td key={role} className="px-3 py-2.5 text-center">
                          {ROLE_CONFIG[role].permissions.includes(perm.label) ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
                              <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {roles.map((role) => {
            const config = ROLE_CONFIG[role];
            return (
              <div key={role} className={`border rounded-xl p-4 ${config.bg} ${config.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${config.color}`}>{ROLE_LABELS[role]}</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${config.bg} ${config.color} ${config.border}`}>
                    {config.permissions.length} permissions
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{config.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {config.permissions.map((p) => (
                    <span key={p} className="text-xs font-medium bg-white/70 border border-white px-2 py-0.5 rounded-full text-gray-600">{p}</span>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-xs text-amber-700 leading-relaxed">
              To change permissions, edit <code className="bg-amber-100 px-1 rounded font-mono">lib/rbac.ts</code> and update <code className="bg-amber-100 px-1 rounded font-mono">ROUTE_PERMISSIONS</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}