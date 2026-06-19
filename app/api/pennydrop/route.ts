import { NextRequest, NextResponse } from "next/server";

const PENNY_DROP_DATABASE: Record<string, any> = {
  "0987654321_HDFC0001234": {
    accountNumber: "0987654321",
    ifscCode: "HDFC0001234",
    beneficiaryName: "FiniteLoop Technologies Pvt. Ltd.",
    bankName: "HDFC Bank",
    branchName: "Indiranagar, Bengaluru",
    accountType: "CURRENT",
    status: "SUCCESS",
    transactionId: "PD20260617001",
  },
  "1234567890_ICIC0002345": {
    accountNumber: "1234567890",
    ifscCode: "ICIC0002345",
    beneficiaryName: "Kotak Mahindra Bank Limited",
    bankName: "ICICI Bank",
    branchName: "Bandra Kurla Complex, Mumbai",
    accountType: "CURRENT",
    status: "SUCCESS",
    transactionId: "PD20260617002",
  },
  "9876543210_SBIN0003456": {
    accountNumber: "9876543210",
    ifscCode: "SBIN0003456",
    beneficiaryName: "Tata Consultancy Services Limited",
    bankName: "State Bank of India",
    branchName: "Sholinganallur, Chennai",
    accountType: "CURRENT",
    status: "SUCCESS",
    transactionId: "PD20260617003",
  },
  "1122334455_PUNB0004567": {
    accountNumber: "1122334455",
    ifscCode: "PUNB0004567",
    beneficiaryName: "Punjab National Bank Corporate",
    bankName: "Punjab National Bank",
    branchName: "Sector 10, Chandigarh",
    accountType: "SAVINGS",
    status: "SUCCESS",
    transactionId: "PD20260617004",
  },
  "5544332211_UTIB0005678": {
    accountNumber: "5544332211",
    ifscCode: "UTIB0005678",
    beneficiaryName: "Wipro Limited",
    bankName: "Axis Bank",
    branchName: "Salt Lake, Kolkata",
    accountType: "CURRENT",
    status: "SUCCESS",
    transactionId: "PD20260617005",
  },
  "6677889900_KKBK0006789": {
    accountNumber: "6677889900",
    ifscCode: "KKBK0006789",
    beneficiaryName: "Muthoot Finance Limited",
    bankName: "Kotak Mahindra Bank",
    branchName: "Banerji Road, Kochi",
    accountType: "SAVINGS",
    status: "SUCCESS",
    transactionId: "PD20260617006",
  },
  "1029384756_BARB0007890": {
    accountNumber: "1029384756",
    ifscCode: "BARB0007890",
    beneficiaryName: "Sun Pharmaceutical Industries Ltd.",
    bankName: "Bank of Baroda",
    branchName: "Tandalja Road, Ahmedabad",
    accountType: "CURRENT",
    status: "SUCCESS",
    transactionId: "PD20260617007",
  },
  "9081726354_CNRB0008901": {
    accountNumber: "9081726354",
    ifscCode: "CNRB0008901",
    beneficiaryName: "Infosys Limited",
    bankName: "Canara Bank",
    branchName: "HITEC City, Hyderabad",
    accountType: "CURRENT",
    status: "SUCCESS",
    transactionId: "PD20260617008",
  },
  "1111111111_HDFC0001234": {
    status: "NAME_MISMATCH",
    transactionId: "PD20260617009",
  },
  "2222222222_SBIN0003456": {
    status: "ACCOUNT_FROZEN",
    transactionId: "PD20260617010",
  },
};

function validateIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}

function validateAccountNumber(acc: string): boolean {
  return /^[0-9]{9,18}$/.test(acc);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accountNumber = body.accountNumber?.trim();
    const ifscCode = body.ifscCode?.trim().toUpperCase();

    if (!accountNumber || !ifscCode) {
      return NextResponse.json(
        { success: false, error: "Account number and IFSC code are required" },
        { status: 400 }
      );
    }

    if (!validateAccountNumber(accountNumber)) {
      return NextResponse.json(
        { success: false, error: "Account number must be 9–18 digits" },
        { status: 400 }
      );
    }

    if (!validateIFSC(ifscCode)) {
      return NextResponse.json(
        { success: false, error: "Invalid IFSC code format (e.g. HDFC0001234)" },
        { status: 400 }
      );
    }

    // Simulate real API delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

    const key = `${accountNumber}_${ifscCode}`;
    const result = PENNY_DROP_DATABASE[key];

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Account not found. Please verify account number and IFSC code.",
          code: "ACCOUNT_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (result.status === "NAME_MISMATCH") {
      return NextResponse.json(
        {
          success: false,
          error: "Account holder name does not match vendor name.",
          code: "NAME_MISMATCH",
          transactionId: result.transactionId,
        },
        { status: 422 }
      );
    }

    if (result.status === "ACCOUNT_FROZEN") {
      return NextResponse.json(
        {
          success: false,
          error: "This account is frozen or inactive.",
          code: "ACCOUNT_FROZEN",
          transactionId: result.transactionId,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Penny drop successful — account verified",
      transactionId: result.transactionId,
      data: {
        accountNumber: result.accountNumber,
        ifscCode: result.ifscCode,
        beneficiaryName: result.beneficiaryName,
        bankName: result.bankName,
        branchName: result.branchName,
        accountType: result.accountType,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}