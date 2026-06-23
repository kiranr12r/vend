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
  panLinkedAadhaar?: boolean;
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
  compositeGstScheme?: boolean;
  eInvoiceRequired?: boolean;
  registeredMsme?: boolean;
  msmeNumber?: string;

  // Step 3
  bankAccounts: BankAccountData[];

  // Step 4
  itrFiledLastYear?: boolean;
  taxExemption?: boolean;
  tdsRate?: number;

  // Step 5
  agreementStartDate?: string;
  agreementEndDate?: string;
  autoRenewal?: boolean;
  noticePeriodDays?: number;
  agreementNotes?: string;

  // Step 6
  uploads?: Record<string, { name: string; size: number; type: string; url: string }>;
}

export interface BankAccountData {
  accountNumber: string;
  ifscCode: string;
  beneficiaryName?: string;
  bankName: string;
  branchName: string;
  crn?: string;
  accountType: "SAVINGS" | "CURRENT";
  isPrimary?: boolean;
}

export interface VendorDocumentData {
  id: string;
  vendorId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
}

export type DocumentType =
  | "REGISTRATION_CERTIFICATE"
  | "PAN_CARD_COPY"
  | "ADDRESS_PROOF"
  | "ITR_PROOF"
  | "MSME_CERTIFICATE"
  | "OTHER";
