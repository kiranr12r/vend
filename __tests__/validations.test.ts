import { describe, it, expect } from "vitest";
import {
  step1Schema,
  step2Schema,
  step5Schema,
  bankAccountSchema,
  step3Schema,
  step4Schema,
  step6Schema,
} from "@/lib/validations/vendor";

const validStep1 = (overrides?: Partial<any>) => ({
  gstNumber: "29ABCDE1234F1Z5",
  tradeName: "Test Vendor",
  legalName: "Test Vendor Pvt Ltd",
  pan: "ABCDE1234F",
  dateOfRegistration: "2022-01-01",
  addressLine1: "123 MG Road",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
  contactPerson: "John Doe",
  contactEmail: "john@test.com",
  contactPhone: "9876543210",
  ...overrides,
});

describe("step1Schema", () => {
  it("rejects invalid GST format", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      gstNumber: "INVALID123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid vendor data", () => {
    const result = step1Schema.safeParse(validStep1());
    expect(result.success).toBe(true);
  });

  it("rejects invalid PAN format", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      pan: "12345ABCDE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects GST with wrong length", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      gstNumber: "29ABCDE1234F1Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects GST that is too long", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      gstNumber: "29ABCDE1234F1Z55",
    });
    expect(result.success).toBe(false);
  });

  it("rejects PAN with wrong length", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      pan: "ABCDE1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects PAN that is too long", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      pan: "ABCDE1234FF",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required tradeName", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      tradeName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required legalName", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      legalName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pincode (non-numeric)", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      pincode: "ABCDEF",
    });
    expect(result.success).toBe(false);
  });

  it("rejects pincode with wrong length", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      pincode: "56000",
    });
    expect(result.success).toBe(false);
  });

  it("rejects pincode that is too long", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      pincode: "5600011",
    });
    expect(result.success).toBe(false);
  });

  it("rejects contact phone starting with 1-5", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      contactPhone: "1876543210",
    });
    expect(result.success).toBe(false);
  });

  it("rejects contact phone with wrong length", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      contactPhone: "987654321",
    });
    expect(result.success).toBe(false);
  });

  it("rejects contact phone that is too long", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      contactPhone: "98765432100",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      contactEmail: "john@test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects email without @ symbol", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      contactEmail: "johntest.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required contactPerson", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      contactPerson: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional panLinkedAadhaar as true", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      panLinkedAadhaar: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional addressLine2", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      addressLine2: "Near Park",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional departmentName", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      departmentName: "Finance",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required contactEmail", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      contactEmail: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required contactPhone", () => {
    const result = step1Schema.safeParse({
      ...validStep1(),
      contactPhone: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("step2Schema", () => {
  it("requires MSME number when registeredMsme is true", () => {
    const result = step2Schema.safeParse({
      natureOfService: "IT Services",
      paymentFrequency: "Monthly",
      registeredMsme: true,
      msmeNumber: "",
    });
    expect(result.success).toBe(false);
  });

  it("passes when registeredMsme is false", () => {
    const result = step2Schema.safeParse({
      natureOfService: "IT Services",
      paymentFrequency: "Monthly",
      registeredMsme: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing natureOfService", () => {
    const result = step2Schema.safeParse({
      natureOfService: "",
      paymentFrequency: "Monthly",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing paymentFrequency", () => {
    const result = step2Schema.safeParse({
      natureOfService: "IT Services",
      paymentFrequency: "",
    });
    expect(result.success).toBe(false);
  });

  it("passes with all fields present and valid", () => {
    const result = step2Schema.safeParse({
      natureOfService: "IT Services",
      paymentFrequency: "Monthly",
      paygroup: "IT",
      groupCode: "GRP001",
      compositeGstScheme: true,
      eInvoiceRequired: true,
      registeredMsme: true,
      msmeNumber: "UDYAM-KL-01-0001234",
    });
    expect(result.success).toBe(true);
  });

  it("allows msmeNumber to be omitted when registeredMsme is false", () => {
    const result = step2Schema.safeParse({
      natureOfService: "IT Services",
      paymentFrequency: "Monthly",
      registeredMsme: false,
    });
    expect(result.success).toBe(true);
  });
});

describe("bankAccountSchema", () => {
  it("rejects invalid IFSC format", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "INVALID123",
      bankName: "SBI",
      branchName: "MG Road",
      accountType: "SAVINGS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects IFSC with lowercase letters", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "abcd0123456",
      bankName: "SBI",
      branchName: "MG Road",
      accountType: "SAVINGS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects IFSC without leading zero", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "SBIN1234567",
      bankName: "SBI",
      branchName: "MG Road",
      accountType: "SAVINGS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid accountType value", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      bankName: "SBI",
      branchName: "MG Road",
      accountType: "FIXED",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required accountNumber", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "",
      ifscCode: "SBIN0001234",
      bankName: "SBI",
      branchName: "MG Road",
      accountType: "SAVINGS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required bankName", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      bankName: "",
      branchName: "MG Road",
      accountType: "SAVINGS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required branchName", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      bankName: "SBI",
      branchName: "",
      accountType: "SAVINGS",
    });
    expect(result.success).toBe(false);
  });

  it("accepts CURRENT account type", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      bankName: "SBI",
      branchName: "MG Road",
      accountType: "CURRENT",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional beneficiaryName", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      bankName: "SBI",
      branchName: "MG Road",
      accountType: "SAVINGS",
      beneficiaryName: "John Doe",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional crn", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      bankName: "SBI",
      branchName: "MG Road",
      accountType: "SAVINGS",
      crn: "ABC123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional isPrimary", () => {
    const result = bankAccountSchema.safeParse({
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      bankName: "SBI",
      branchName: "MG Road",
      accountType: "SAVINGS",
      isPrimary: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("step3Schema", () => {
  it("rejects empty bankAccounts array", () => {
    const result = step3Schema.safeParse({
      bankAccounts: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts single valid bank account", () => {
    const result = step3Schema.safeParse({
      bankAccounts: [
        {
          accountNumber: "123456789012",
          ifscCode: "SBIN0001234",
          bankName: "SBI",
          branchName: "MG Road",
          accountType: "SAVINGS",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects array with invalid bank account", () => {
    const result = step3Schema.safeParse({
      bankAccounts: [
        {
          accountNumber: "",
          ifscCode: "SBIN0001234",
          bankName: "SBI",
          branchName: "MG Road",
          accountType: "SAVINGS",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts multiple valid bank accounts", () => {
    const result = step3Schema.safeParse({
      bankAccounts: [
        {
          accountNumber: "123456789012",
          ifscCode: "SBIN0001234",
          bankName: "SBI",
          branchName: "MG Road",
          accountType: "SAVINGS",
          isPrimary: true,
        },
        {
          accountNumber: "987654321098",
          ifscCode: "HDFC0000456",
          bankName: "HDFC",
          branchName: "Brigade Road",
          accountType: "CURRENT",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("step4Schema", () => {
  it("accepts valid data with all fields undefined", () => {
    const result = step4Schema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts itrFiledLastYear true", () => {
    const result = step4Schema.safeParse({
      itrFiledLastYear: true,
      taxExemption: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts tdsRate value", () => {
    const result = step4Schema.safeParse({
      itrFiledLastYear: true,
      tdsRate: 10,
    });
    expect(result.success).toBe(true);
  });
});

describe("step5Schema", () => {
  it("rejects end date before start date", () => {
    const result = step5Schema.safeParse({
      agreementStartDate: "2024-06-01",
      agreementEndDate: "2024-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid date range", () => {
    const result = step5Schema.safeParse({
      agreementStartDate: "2024-01-01",
      agreementEndDate: "2024-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejects same start and end date", () => {
    const result = step5Schema.safeParse({
      agreementStartDate: "2024-06-01",
      agreementEndDate: "2024-06-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing agreementEndDate", () => {
    const result = step5Schema.safeParse({
      agreementStartDate: "2024-06-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing agreementStartDate", () => {
    const result = step5Schema.safeParse({
      agreementEndDate: "2024-12-31",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional autoRenewal", () => {
    const result = step5Schema.safeParse({
      agreementStartDate: "2024-01-01",
      agreementEndDate: "2024-12-31",
      autoRenewal: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional noticePeriodDays and agreementNotes", () => {
    const result = step5Schema.safeParse({
      agreementStartDate: "2024-01-01",
      agreementEndDate: "2024-12-31",
      noticePeriodDays: 30,
      agreementNotes: "Standard terms",
    });
    expect(result.success).toBe(true);
  });
});

describe("step6Schema", () => {
  it("accepts empty uploads object", () => {
    const result = step6Schema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts valid upload records with url", () => {
    const result = step6Schema.safeParse({
      uploads: {
        gstCertificate: { name: "gst.pdf", size: 1024, type: "application/pdf", url: "https://blob.vercel.com/file.pdf" },
        panCard: { name: "pan.pdf", size: 512, type: "application/pdf", url: "https://blob.vercel.com/pan.pdf" },
      },
    });
    expect(result.success).toBe(true);
  });
});
