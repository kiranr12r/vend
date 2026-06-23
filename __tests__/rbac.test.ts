import { describe, it, expect } from "vitest";
import { isAllowed, requireAuth, requireRole, maskPan, maskAccountNumber, maskIfsc, sanitizeVendorForRole, NAV_BY_ROLE } from "@/lib/rbac";
import type { Session } from "next-auth";
import { step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema } from "@/lib/validations/vendor";

const mockSession = (role: string | undefined): Session | null => {
  if (!role) return null;
  return { user: { id: "1", email: "test@test.com", name: "Test", role: role as any } } as Session;
};

describe("RBAC - isAllowed", () => {
  it("allows ADMIN on any path", () => {
    expect(isAllowed("/admin/users", "ADMIN")).toBe(true);
    expect(isAllowed("/vendors/new", "ADMIN")).toBe(true);
    expect(isAllowed("/reports", "ADMIN")).toBe(true);
  });

  it("unauthenticated users are blocked on all protected routes", () => {
    expect(isAllowed("/vendors/new", undefined)).toBe(false);
    expect(isAllowed("/admin/users", undefined)).toBe(false);
  });

  it("allows INITIATOR on /vendors/new and /vendors/list", () => {
    expect(isAllowed("/vendors/new", "INITIATOR")).toBe(true);
    expect(isAllowed("/vendors/list", "INITIATOR")).toBe(true);
    expect(isAllowed("/vendors/approve", "INITIATOR")).toBe(false);
  });

  it("allows ACCOUNTS on /vendors/approve, /vendors/oracle, /reports", () => {
    expect(isAllowed("/vendors/approve", "ACCOUNTS")).toBe(true);
    expect(isAllowed("/vendors/oracle", "ACCOUNTS")).toBe(true);
    expect(isAllowed("/reports", "ACCOUNTS")).toBe(true);
    expect(isAllowed("/admin/users", "ACCOUNTS")).toBe(false);
  });

  it("allows APPROVER on /vendors/approve and /vendors/list", () => {
    expect(isAllowed("/vendors/approve", "APPROVER")).toBe(true);
    expect(isAllowed("/vendors/list", "APPROVER")).toBe(true);
    expect(isAllowed("/vendors/oracle", "APPROVER")).toBe(false);
  });

  it("allows IC_TEAM on /vendors/clarify and /vendors/list", () => {
    expect(isAllowed("/vendors/clarify", "IC_TEAM")).toBe(true);
    expect(isAllowed("/vendors/list", "IC_TEAM")).toBe(true);
    expect(isAllowed("/vendors/approve", "IC_TEAM")).toBe(false);
  });

  it("returns false when no role is provided", () => {
    expect(isAllowed("/login", undefined)).toBe(false);
    expect(isAllowed("/", undefined)).toBe(false);
  });
});

describe("RBAC - requireAuth", () => {
  it("returns null when session exists", () => {
    const result = requireAuth(mockSession("ADMIN"));
    expect(result).toBeNull();
  });

  it("returns 401 response when session is null", () => {
    const result = requireAuth(null);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });
});

describe("RBAC - requireRole", () => {
  it("returns null when role is allowed", () => {
    const result = requireRole(mockSession("ADMIN"), ["ADMIN"]);
    expect(result).toBeNull();
  });

  it("returns 401 when no session", () => {
    const result = requireRole(null, ["ADMIN"]);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("returns 403 when role is not allowed", () => {
    const result = requireRole(mockSession("INITIATOR"), ["ADMIN", "ACCOUNTS"]);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});

describe("RBAC - masking functions", () => {
  it("maskPan masks all but last 4 chars", () => {
    expect(maskPan("ABCDE1234F")).toBe("******234F");
    expect(maskPan("ABC")).toBe("****");
    expect(maskPan(undefined)).toBe("—");
    expect(maskPan(null)).toBe("—");
  });

  it("maskAccountNumber masks all but last 4 chars", () => {
    expect(maskAccountNumber("123456789012")).toBe("********9012");
    expect(maskAccountNumber("123")).toBe("****");
    expect(maskAccountNumber(undefined)).toBe("—");
  });

  it("maskIfsc masks chars after first 4", () => {
    expect(maskIfsc("SBIN0001234")).toBe("SBIN*******");
    expect(maskIfsc(null)).toBeNull();
    expect(maskIfsc(undefined)).toBeNull();
  });
});

describe("RBAC - sanitizeVendorForRole", () => {
  const vendor = {
    id: "1",
    pan: "ABCDE1234F",
    bankAccounts: [
      { accountNumber: "123456789012", ifscCode: "SBIN0001234", crn: "CRN123" },
    ],
    documents: [{ fileUrl: "https://example.com/doc.pdf", fileName: "doc.pdf" }],
    name: "Test Vendor",
  };

  it("returns full vendor for ADMIN", () => {
    const result = sanitizeVendorForRole(vendor, "ADMIN");
    expect(result.pan).toBe("ABCDE1234F");
    expect(result.bankAccounts[0].accountNumber).toBe("123456789012");
  });

  it("returns full vendor for ACCOUNTS", () => {
    const result = sanitizeVendorForRole(vendor, "ACCOUNTS");
    expect(result.pan).toBe("ABCDE1234F");
    expect(result.bankAccounts[0].accountNumber).toBe("123456789012");
  });

  it("masks PAN for INITIATOR", () => {
    const result = sanitizeVendorForRole(vendor, "INITIATOR");
    expect(result.pan).toBe("******234F");
  });

  it("masks bank details for INITIATOR", () => {
    const result = sanitizeVendorForRole(vendor, "INITIATOR");
    expect(result.bankAccounts[0].accountNumber).toBe("********9012");
    expect(result.bankAccounts[0].ifscCode).toBe("SBIN*******");
    expect(result.bankAccounts[0].crn).toBeNull();
  });

  it("masks document URLs for non-admin roles", () => {
    const result = sanitizeVendorForRole(vendor, "APPROVER");
    expect(result.documents[0].fileUrl).toBe("");
  });

  it("returns null when vendor is null", () => {
    expect(sanitizeVendorForRole(null, "ADMIN")).toBeNull();
  });
});

describe("RBAC - NAV_BY_ROLE coverage", () => {
  it("has routes for all roles", () => {
    expect(Object.keys(NAV_BY_ROLE)).toContain("ADMIN");
    expect(Object.keys(NAV_BY_ROLE)).toContain("INITIATOR");
    expect(Object.keys(NAV_BY_ROLE)).toContain("APPROVER");
    expect(Object.keys(NAV_BY_ROLE)).toContain("IC_TEAM");
    expect(Object.keys(NAV_BY_ROLE)).toContain("ACCOUNTS");
  });

  it("IC_TEAM does not have approval or oracle routes", () => {
    const icNav = NAV_BY_ROLE.IC_TEAM;
    const hrefs = icNav.map((n) => n.href);
    expect(hrefs).not.toContain("/vendors/approve");
    expect(hrefs).not.toContain("/vendors/oracle");
  });
});

describe("step6Schema", () => {
  it("accepts empty uploads", () => {
    expect(step6Schema.safeParse({}).success).toBe(true);
    expect(step6Schema.safeParse({ uploads: {} }).success).toBe(true);
  });

  it("rejects invalid upload entry missing url", () => {
    expect(step6Schema.safeParse({ uploads: { doc1: { name: "a", size: 1, type: "pdf" } } }).success).toBe(false);
  });

  it("accepts valid upload entry", () => {
    expect(step6Schema.safeParse({
      uploads: { doc1: { name: "doc.pdf", size: 1024, type: "application/pdf", url: "https://blob.vercel.com/file.pdf" } },
    }).success).toBe(true);
  });
});

describe("auth schema validation", () => {
  it("step1Schema requires dateOfRegistration", () => {
    expect(step1Schema.safeParse({}).success).toBe(false);
  });

  it("step2Schema requires natureOfService", () => {
    expect(step2Schema.safeParse({}).success).toBe(false);
  });

  it("step3Schema requires at least one bank account", () => {
    expect(step3Schema.safeParse({ bankAccounts: [] }).success).toBe(false);
  });

  it("step4Schema accepts empty object", () => {
    expect(step4Schema.safeParse({}).success).toBe(true);
  });

  it("step5Schema requires agreement dates", () => {
    expect(step5Schema.safeParse({}).success).toBe(false);
  });
});
