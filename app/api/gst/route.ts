import { NextRequest, NextResponse } from "next/server";

const GST_DATABASE: Record<string, any> = {
  "29ABCDE1234F1Z5": {
    gstin: "29ABCDE1234F1Z5",
    tradeName: "FiniteLoop Technologies",
    legalName: "FiniteLoop Technologies Pvt. Ltd.",
    pan: "ABCDE1234F",
    dateOfRegistration: "2021-06-15",
    status: "ACTIVE",
    businessType: "Private Limited Company",
    addressLine1: "123 MG Road, Indiranagar",
    addressLine2: "2nd Floor",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    natureOfBusiness: "IT Services",
    annualTurnover: "Above 5 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
  "27AABCU9603R1ZX": {
    gstin: "27AABCU9603R1ZX",
    tradeName: "Kotak Mahindra Bank",
    legalName: "Kotak Mahindra Bank Limited",
    pan: "AABCU9603R",
    dateOfRegistration: "2003-03-22",
    status: "ACTIVE",
    businessType: "Public Limited Company",
    addressLine1: "27BKC, C27, G Block",
    addressLine2: "Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    natureOfBusiness: "Banking & Financial Services",
    annualTurnover: "Above 500 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
  "33AABCT1332L1ZS": {
    gstin: "33AABCT1332L1ZS",
    tradeName: "TCS Chennai",
    legalName: "Tata Consultancy Services Limited",
    pan: "AABCT1332L",
    dateOfRegistration: "2000-07-01",
    status: "ACTIVE",
    businessType: "Public Limited Company",
    addressLine1: "No.1 Software Units Layout",
    addressLine2: "Sholinganallur",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600119",
    natureOfBusiness: "IT Services",
    annualTurnover: "Above 500 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
  "07AAACR4849R1ZE": {
    gstin: "07AAACR4849R1ZE",
    tradeName: "Reliance Delhi",
    legalName: "Reliance Industries Limited",
    pan: "AAACR4849R",
    dateOfRegistration: "1999-04-01",
    status: "ACTIVE",
    businessType: "Public Limited Company",
    addressLine1: "3A, Ring Road",
    addressLine2: "Lajpat Nagar",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110024",
    natureOfBusiness: "Petroleum & Energy",
    annualTurnover: "Above 500 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
  "36AABCI1682H1ZL": {
    gstin: "36AABCI1682H1ZL",
    tradeName: "Infosys Hyderabad",
    legalName: "Infosys Limited",
    pan: "AABCI1682H",
    dateOfRegistration: "1993-06-02",
    status: "ACTIVE",
    businessType: "Public Limited Company",
    addressLine1: "Plot No. 76, HITEC City",
    addressLine2: "Madhapur",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
    natureOfBusiness: "IT Services",
    annualTurnover: "Above 500 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
  "24AAGCS7192C1Z3": {
    gstin: "24AAGCS7192C1Z3",
    tradeName: "Sun Pharma Ahmedabad",
    legalName: "Sun Pharmaceutical Industries Limited",
    pan: "AAGCS7192C",
    dateOfRegistration: "1994-10-01",
    status: "ACTIVE",
    businessType: "Public Limited Company",
    addressLine1: "SPARC, Tandalja Road",
    addressLine2: "Off Akota Road",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "390012",
    natureOfBusiness: "Pharmaceuticals",
    annualTurnover: "Above 500 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
  "03AADCB2230M1ZV": {
    gstin: "03AADCB2230M1ZV",
    tradeName: "Punjab National Bank",
    legalName: "Punjab National Bank",
    pan: "AADCB2230M",
    dateOfRegistration: "1997-07-01",
    status: "ACTIVE",
    businessType: "Public Sector Bank",
    addressLine1: "Plot No. 4, Sector 10",
    addressLine2: "Chandigarh",
    city: "Chandigarh",
    state: "Punjab",
    pincode: "160010",
    natureOfBusiness: "Banking & Financial Services",
    annualTurnover: "Above 500 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
  "19AABCW4234C1ZN": {
    gstin: "19AABCW4234C1ZN",
    tradeName: "Wipro Kolkata",
    legalName: "Wipro Limited",
    pan: "AABCW4234C",
    dateOfRegistration: "1999-01-01",
    status: "ACTIVE",
    businessType: "Public Limited Company",
    addressLine1: "Block EP & GP, Sector V",
    addressLine2: "Salt Lake Electronics Complex",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700091",
    natureOfBusiness: "IT Services",
    annualTurnover: "Above 500 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
  "09AAACL1234A1ZK": {
    gstin: "09AAACL1234A1ZK",
    tradeName: "LIC Lucknow",
    legalName: "Life Insurance Corporation of India",
    pan: "AAACL1234A",
    dateOfRegistration: "2017-07-01",
    status: "ACTIVE",
    businessType: "Government Company",
    addressLine1: "Jeevan Bhawan, Hazratganj",
    addressLine2: "",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226001",
    natureOfBusiness: "Insurance",
    annualTurnover: "Above 500 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
  "32AABCM1234F1Z8": {
    gstin: "32AABCM1234F1Z8",
    tradeName: "Muthoot Finance Kerala",
    legalName: "Muthoot Finance Limited",
    pan: "AABCM1234F",
    dateOfRegistration: "2011-06-01",
    status: "ACTIVE",
    businessType: "Non-Banking Financial Company",
    addressLine1: "Muthoot Chambers, Opposite Saritha Theatre",
    addressLine2: "Banerji Road",
    city: "Kochi",
    state: "Kerala",
    pincode: "682018",
    natureOfBusiness: "Financial Services",
    annualTurnover: "Above 100 Crore",
    compositeScheme: false,
    eInvoiceApplicable: true,
  },
};

function validateGSTFormat(gst: string): boolean {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gst);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gstin = searchParams.get("gstin")?.toUpperCase().trim();

  if (!gstin) {
    return NextResponse.json(
      { success: false, error: "GSTIN is required" },
      { status: 400 }
    );
  }

  if (gstin.length !== 15) {
    return NextResponse.json(
      { success: false, error: "GSTIN must be exactly 15 characters" },
      { status: 400 }
    );
  }

  if (!validateGSTFormat(gstin)) {
    return NextResponse.json(
      { success: false, error: "Invalid GSTIN format" },
      { status: 400 }
    );
  }

  await new Promise((r) => setTimeout(r, 600));

  const vendor = GST_DATABASE[gstin];

  if (!vendor) {
    return NextResponse.json(
      { success: false, error: "GSTIN not found. Please verify the number and try again." },
      { status: 404 }
    );
  }

  if (vendor.status !== "ACTIVE") {
    return NextResponse.json(
      { success: false, error: "This GSTIN is inactive or cancelled." },
      { status: 422 }
    );
  }

  return NextResponse.json({
    success: true,
    data: vendor,
    message: "GSTIN verified successfully",
  });
}