import { z } from "zod";

export const step1Schema = z.object({
  gstNumber: z.string().min(1, "GST number is required").length(15, "Must be 15 characters").regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format"),
  tradeName: z.string().min(1, "Trade name is required"),
  legalName: z.string().min(1, "Legal name is required"),
  pan: z.string().min(1, "PAN is required").length(10, "PAN must be 10 characters").regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  dateOfRegistration: z.string().min(1, "Date of registration is required"),
  panLinkedAadhaar: z.boolean().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required").length(6, "Must be 6 digits").regex(/^[0-9]{6}$/, "Must be numeric"),
  contactPerson: z.string().min(1, "Contact person is required"),
  contactEmail: z.string().min(1, "Email is required").email("Invalid email"),
  contactPhone: z.string().min(1, "Phone is required").length(10, "Must be 10 digits").regex(/^[6-9][0-9]{9}$/, "Invalid mobile number"),
  departmentName: z.string().optional(),
});

export const step2Schema = z.object({
  natureOfService: z.string().min(1, "Nature of service is required"),
  paymentFrequency: z.string().min(1, "Payment frequency is required"),
  paygroup: z.string().optional(),
  groupCode: z.string().optional(),
  compositeGstScheme: z.boolean().optional(),
  eInvoiceRequired: z.boolean().optional(),
  registeredMsme: z.boolean().optional(),
  msmeNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.registeredMsme && (!data.msmeNumber || data.msmeNumber.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "MSME number is required", path: ["msmeNumber"] });
  }
});

export const bankAccountSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required").regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format"),
  beneficiaryName: z.string().optional(),
  bankName: z.string().min(1, "Bank name is required"),
  branchName: z.string().min(1, "Branch name is required"),
  crn: z.string().optional(),
  accountType: z.enum(["SAVINGS", "CURRENT"]),
  isPrimary: z.boolean().optional(),
});

export const step3Schema = z.object({
  bankAccounts: z.array(bankAccountSchema).min(1, "At least one bank account is required"),
});

export const step4Schema = z.object({
  itrFiledLastYear: z.boolean().optional(),
  taxExemption: z.boolean().optional(),
  tdsRate: z.any().optional(),
});

export const step5Schema = z.object({
  agreementStartDate: z.string().min(1, "Start date is required"),
  agreementEndDate: z.string().min(1, "End date is required"),
  autoRenewal: z.boolean().optional(),
  noticePeriodDays: z.any().optional(),
  agreementNotes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.agreementStartDate && data.agreementEndDate) {
    if (new Date(data.agreementEndDate) <= new Date(data.agreementStartDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date", path: ["agreementEndDate"] });
    }
  }
});

export const step6Schema = z.object({
  uploads: z.any().optional(),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
