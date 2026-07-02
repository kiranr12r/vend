/**
 * lib/rbac.ts
 * Central place for all role-based access logic.
 * Used by middleware.ts (route guards) and API routes (server-side checks).
 */

import { NextResponse } from "next/server";
import { Session } from "next-auth";

export type UserRole = "ADMIN" | "INITIATOR" | "APPROVER" | "IC_TEAM" | "ACCOUNTS" | "VENDOR";

// ─── Route Permission Map ────────────────────────────────────────────────────
// Keys are path prefixes. Values are the roles allowed to access them.
// More specific paths should come before general ones.
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  // Admin-only
  "/admin":              ["ADMIN"],

  // Vendor registration — only Initiators and Admins can create new vendors
  "/vendors/new":        ["ADMIN", "INITIATOR"],

  // Approval dashboard — Approvers, Accounts, and Admins
  "/vendors/approve":    ["ADMIN", "APPROVER", "ACCOUNTS"],

  // Oracle ID management — Accounts team and Admin only
  "/vendors/oracle":     ["ADMIN", "ACCOUNTS"],

  // IC Team clarification page
  "/vendors/clarify":    ["ADMIN", "IC_TEAM"],

  // Vendor list — everyone can view
  "/vendors/list":       ["ADMIN", "INITIATOR", "APPROVER", "IC_TEAM", "ACCOUNTS"],

  // Reports — Admin and Accounts
  "/reports":            ["ADMIN", "ACCOUNTS"],

  // Vendor detail — everyone (filtered by role in the page itself)
  "/vendors":            ["ADMIN", "INITIATOR", "APPROVER", "IC_TEAM", "ACCOUNTS"],

  // Invoice submission/portal — Accounts/Admin review, Vendor submits their own.
  // NOTE: this only guards the page itself; per-vendor scoping (a VENDOR user
  // seeing only their own invoices) is enforced in the API route, not here.
  // Also remember to add "/invoices/:path*" to middleware.ts's matcher.
  "/invoices":           ["ADMIN", "ACCOUNTS", "VENDOR"],
};

// ─── Helper: check if a role is allowed on a given path ─────────────────────
export function isAllowed(pathname: string, role: UserRole | undefined): boolean {
  if (!role) return false;
  if (role === "ADMIN") return true; // Admin bypasses all checks

  // Find the most specific matching route
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0]; // longest match wins

  if (!matchedRoute) return true; // no restriction defined → allow
  return ROUTE_PERMISSIONS[matchedRoute].includes(role);
}

// ─── Sidebar nav items per role ─────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  icon: "plus" | "list" | "check" | "oracle" | "reports" | "clarify" | "admin";
}

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { label: "Add Vendor",       href: "/vendors/new",     badge: "New", icon: "plus"    },
    { label: "Vendor List",      href: "/vendors/list",                  icon: "list"    },
    { label: "Approve Vendors",  href: "/vendors/approve",              icon: "check"   },
    { label: "Update Oracle IDs",href: "/vendors/oracle",               icon: "oracle"  },
    { label: "Reports",          href: "/reports",                       icon: "reports" },
    { label: "Admin Panel",      href: "/admin",                         icon: "admin"   },
  ],
  INITIATOR: [
    { label: "Add Vendor",  href: "/vendors/new",  badge: "New", icon: "plus"   },
    { label: "My Vendors",  href: "/vendors/list",               icon: "list"   },
  ],
  APPROVER: [
    { label: "Pending Approvals", href: "/vendors/approve", icon: "check"   },
    { label: "Vendor List",       href: "/vendors/list",    icon: "list"    },
  ],
  IC_TEAM: [
    { label: "Clarifications", href: "/vendors/clarify", icon: "clarify" },
    { label: "Vendor List",    href: "/vendors/list",    icon: "list"    },
  ],
  ACCOUNTS: [
    { label: "Pending Approvals", href: "/vendors/approve",  icon: "check"   },
    { label: "Vendor List",       href: "/vendors/list",     icon: "list"    },
    { label: "Update Oracle IDs", href: "/vendors/oracle",   icon: "oracle"  },
    { label: "Reports",           href: "/reports",          icon: "reports" },
  ],
  VENDOR: [
    { label: "Submit Invoice", href: "/invoices/new", badge: "New", icon: "plus" },
    { label: "My Invoices",    href: "/invoices",                   icon: "list" },
  ],
};

export function requireAuth(session: Session | null): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  return null;
}

export function maskPan(pan?: string | null): string {
  if (!pan) return "—";
  if (pan.length <= 4) return "****";
  return `${"*".repeat(pan.length - 4)}${pan.slice(-4)}`;
}

export function maskAccountNumber(accountNumber?: string | null): string {
  if (!accountNumber) return "—";
  if (accountNumber.length <= 4) return "****";
  return `${"*".repeat(accountNumber.length - 4)}${accountNumber.slice(-4)}`;
}

export function maskIfsc(ifscCode?: string | null): string | null {
  if (!ifscCode) return null;
  if (ifscCode.length <= 4) return "****";
  return `${ifscCode.slice(0, 4)}${"*".repeat(Math.max(0, ifscCode.length - 4))}`;
}

export function sanitizeVendorForRole(vendor: any, role: UserRole | undefined): any {
  if (!vendor || role === "ADMIN" || role === "ACCOUNTS") return vendor;

  const sanitized = { ...vendor };

  if (sanitized.pan) {
    sanitized.pan = maskPan(sanitized.pan);
  }

  if (Array.isArray(sanitized.bankAccounts)) {
    sanitized.bankAccounts = sanitized.bankAccounts.map((account: any) => ({
      ...account,
      accountNumber: maskAccountNumber(account.accountNumber),
      ifscCode: maskIfsc(account.ifscCode),
      crn: null,
    }));
  }

  if (Array.isArray(sanitized.documents)) {
    sanitized.documents = sanitized.documents.map((document: any) => ({
      ...document,
      fileUrl: "",
    }));
  }

  return sanitized;
}

export function canManageBankDetails(role: UserRole | undefined): boolean {
  return role === "ADMIN" || role === "ACCOUNTS";
}

// ─── Server-side API route guard ─────────────────────────────────────────────
// Usage in any API route:
//   const check = requireRole(session, ["ADMIN", "ACCOUNTS"]);
//   if (check) return check; // returns a 401/403 NextResponse

export function requireRole(
  session: Session | null,
  allowedRoles: UserRole[]
): NextResponse | null {
  const authGuard = requireAuth(session);
  if (authGuard) return authGuard;

  const role = session!.user.role;
  if (!allowedRoles.includes(role)) {
    return NextResponse.json(
      { error: `Access denied. Required role: ${allowedRoles.join(" or ")}` },
      { status: 403 }
    );
  }
  return null;
}