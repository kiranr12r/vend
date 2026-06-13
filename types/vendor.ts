export type VendorStatus = 
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "INACTIVE";

export interface VendorFormData {
  // Step 1
  gstNumber: string;
  tradeName: string;
  legalName: string;
  pan: string;
  dateOfRegistration: string;
  panLinkedAadhaar: boolean;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  departmentName?: string;

  // Step 2
  natureOfService: string;
  paymentFrequency: string;
  paygroup?: string;
  groupCode?: string;
  compositeGstScheme: boolean;
  eInvoiceRequired: boolean;
  registeredMsme: boolean;
  msmeNumber?: string;

  // Step 3
  bankAccounts: BankAccountData[];

  // Step 4
  itrFiledLastYear: boolean;
  taxExemption: boolean;
  tdsRate?: number;

  // Step 5
  agreementStartDate?: string;
  agreementEndDate?: string;
}

export interface BankAccountData {
  accountNumber: string;
  ifscCode: string;
  beneficiaryName?: string;
  bankName: string;
  branchName: string;
  crn?: string;
  accountType: "SAVINGS" | "CURRENT";
  isPrimary: boolean;
}
