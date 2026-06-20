import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg }     = require("@prisma/adapter-pg");
const { Pool }         = require("pg");

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

async function main() {

  // ── 1. Admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where:  { email: "admin@vendorlink.com" },
    update: {},
    create: {
      email:    "admin@vendorlink.com",
      name:     "Admin User",
      password: hashedPassword,
      role:     "ADMIN",
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ── 2. GST Master
  const gstMasterData = [
    {
      gstin: "29ABCDE1234F1Z5", tradeName: "FiniteLoop Technologies",
      legalName: "FiniteLoop Technologies Pvt. Ltd.", pan: "ABCDE1234F",
      dateOfRegistration: "2021-06-15", status: "ACTIVE",
      businessType: "Private Limited Company",
      addressLine1: "123 MG Road, Indiranagar", addressLine2: "2nd Floor",
      city: "Bengaluru", state: "Karnataka", pincode: "560038",
      natureOfBusiness: "IT Services", annualTurnover: "Above 5 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
    {
      gstin: "27AABCU9603R1ZX", tradeName: "Kotak Mahindra Bank",
      legalName: "Kotak Mahindra Bank Limited", pan: "AABCU9603R",
      dateOfRegistration: "2003-03-22", status: "ACTIVE",
      businessType: "Public Limited Company",
      addressLine1: "27BKC, C27, G Block", addressLine2: "Bandra Kurla Complex",
      city: "Mumbai", state: "Maharashtra", pincode: "400051",
      natureOfBusiness: "Banking & Financial Services", annualTurnover: "Above 500 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
    {
      gstin: "33AABCT1332L1ZS", tradeName: "TCS Chennai",
      legalName: "Tata Consultancy Services Limited", pan: "AABCT1332L",
      dateOfRegistration: "2000-07-01", status: "ACTIVE",
      businessType: "Public Limited Company",
      addressLine1: "No.1 Software Units Layout", addressLine2: "Sholinganallur",
      city: "Chennai", state: "Tamil Nadu", pincode: "600119",
      natureOfBusiness: "IT Services", annualTurnover: "Above 500 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
    {
      gstin: "07AAACR4849R1ZE", tradeName: "Reliance Delhi",
      legalName: "Reliance Industries Limited", pan: "AAACR4849R",
      dateOfRegistration: "1999-04-01", status: "ACTIVE",
      businessType: "Public Limited Company",
      addressLine1: "3A, Ring Road", addressLine2: "Lajpat Nagar",
      city: "New Delhi", state: "Delhi", pincode: "110024",
      natureOfBusiness: "Petroleum & Energy", annualTurnover: "Above 500 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
    {
      gstin: "36AABCI1682H1ZL", tradeName: "Infosys Hyderabad",
      legalName: "Infosys Limited", pan: "AABCI1682H",
      dateOfRegistration: "1993-06-02", status: "ACTIVE",
      businessType: "Public Limited Company",
      addressLine1: "Plot No. 76, HITEC City", addressLine2: "Madhapur",
      city: "Hyderabad", state: "Telangana", pincode: "500081",
      natureOfBusiness: "IT Services", annualTurnover: "Above 500 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
    {
      gstin: "24AAGCS7192C1Z3", tradeName: "Sun Pharma Ahmedabad",
      legalName: "Sun Pharmaceutical Industries Limited", pan: "AAGCS7192C",
      dateOfRegistration: "1994-10-01", status: "ACTIVE",
      businessType: "Public Limited Company",
      addressLine1: "SPARC, Tandalja Road", addressLine2: "Off Akota Road",
      city: "Ahmedabad", state: "Gujarat", pincode: "390012",
      natureOfBusiness: "Pharmaceuticals", annualTurnover: "Above 500 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
    {
      gstin: "03AADCB2230M1ZV", tradeName: "Punjab National Bank",
      legalName: "Punjab National Bank", pan: "AADCB2230M",
      dateOfRegistration: "1997-07-01", status: "ACTIVE",
      businessType: "Public Sector Bank",
      addressLine1: "Plot No. 4, Sector 10", addressLine2: "Chandigarh",
      city: "Chandigarh", state: "Punjab", pincode: "160010",
      natureOfBusiness: "Banking & Financial Services", annualTurnover: "Above 500 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
    {
      gstin: "19AABCW4234C1ZN", tradeName: "Wipro Kolkata",
      legalName: "Wipro Limited", pan: "AABCW4234C",
      dateOfRegistration: "1999-01-01", status: "ACTIVE",
      businessType: "Public Limited Company",
      addressLine1: "Block EP & GP, Sector V", addressLine2: "Salt Lake Electronics Complex",
      city: "Kolkata", state: "West Bengal", pincode: "700091",
      natureOfBusiness: "IT Services", annualTurnover: "Above 500 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
    {
      gstin: "09AAACL1234A1ZK", tradeName: "LIC Lucknow",
      legalName: "Life Insurance Corporation of India", pan: "AAACL1234A",
      dateOfRegistration: "2017-07-01", status: "ACTIVE",
      businessType: "Government Company",
      addressLine1: "Jeevan Bhawan, Hazratganj", addressLine2: "",
      city: "Lucknow", state: "Uttar Pradesh", pincode: "226001",
      natureOfBusiness: "Insurance", annualTurnover: "Above 500 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
    {
      gstin: "32AABCM1234F1Z8", tradeName: "Muthoot Finance Kerala",
      legalName: "Muthoot Finance Limited", pan: "AABCM1234F",
      dateOfRegistration: "2011-06-01", status: "ACTIVE",
      businessType: "Non-Banking Financial Company",
      addressLine1: "Muthoot Chambers, Opposite Saritha Theatre", addressLine2: "Banerji Road",
      city: "Kochi", state: "Kerala", pincode: "682018",
      natureOfBusiness: "Financial Services", annualTurnover: "Above 100 Crore",
      compositeScheme: false, eInvoiceApplicable: true,
    },
  ];

  for (const gst of gstMasterData) {
    await prisma.gstMaster.upsert({
      where:  { gstin: gst.gstin },
      update: { tradeName: gst.tradeName, legalName: gst.legalName, status: gst.status },
      create: gst,
    });
  }
  console.log(`✅ GST master: ${gstMasterData.length} GSTIN records seeded`);

  // ── 3. Bank Master (IFSC reference data)
  const bankMasterData = [
    { ifscCode: "HDFC0001234", bankName: "HDFC Bank",           branchName: "Indiranagar, Bengaluru",       city: "Bengaluru",  state: "Karnataka"     },
    { ifscCode: "ICIC0002345", bankName: "ICICI Bank",           branchName: "Bandra Kurla Complex, Mumbai", city: "Mumbai",     state: "Maharashtra"   },
    { ifscCode: "SBIN0003456", bankName: "State Bank of India",  branchName: "Sholinganallur, Chennai",      city: "Chennai",    state: "Tamil Nadu"    },
    { ifscCode: "PUNB0004567", bankName: "Punjab National Bank", branchName: "Sector 10, Chandigarh",        city: "Chandigarh", state: "Punjab"        },
    { ifscCode: "UTIB0005678", bankName: "Axis Bank",            branchName: "Salt Lake, Kolkata",           city: "Kolkata",    state: "West Bengal"   },
    { ifscCode: "KKBK0006789", bankName: "Kotak Mahindra Bank",  branchName: "Banerji Road, Kochi",          city: "Kochi",      state: "Kerala"        },
    { ifscCode: "BARB0007890", bankName: "Bank of Baroda",       branchName: "Tandalja Road, Ahmedabad",     city: "Ahmedabad",  state: "Gujarat"       },
    { ifscCode: "CNRB0008901", bankName: "Canara Bank",          branchName: "HITEC City, Hyderabad",        city: "Hyderabad",  state: "Telangana"     },
    { ifscCode: "YESB0001111", bankName: "Yes Bank",             branchName: "Connaught Place, New Delhi",   city: "New Delhi",  state: "Delhi"         },
    { ifscCode: "IOBA0002222", bankName: "Indian Overseas Bank", branchName: "Anna Salai, Chennai",          city: "Chennai",    state: "Tamil Nadu"    },
    { ifscCode: "UBIN0003333", bankName: "Union Bank of India",  branchName: "Nariman Point, Mumbai",        city: "Mumbai",     state: "Maharashtra"   },
    { ifscCode: "BKID0004444", bankName: "Bank of India",        branchName: "Hazratganj, Lucknow",          city: "Lucknow",    state: "Uttar Pradesh" },
    { ifscCode: "IDIB0005555", bankName: "Indian Bank",          branchName: "T Nagar, Chennai",             city: "Chennai",    state: "Tamil Nadu"    },
    { ifscCode: "FDRL0006666", bankName: "Federal Bank",         branchName: "MG Road, Kochi",               city: "Kochi",      state: "Kerala"        },
    { ifscCode: "KARB0007777", bankName: "Karnataka Bank",       branchName: "Brigade Road, Bengaluru",      city: "Bengaluru",  state: "Karnataka"     },
  ];

  for (const bank of bankMasterData) {
    await prisma.bankMaster.upsert({
      where:  { ifscCode: bank.ifscCode },
      update: { bankName: bank.bankName, branchName: bank.branchName },
      create: bank,
    });
  }
  console.log(`✅ Bank master: ${bankMasterData.length} IFSC records seeded`);

  // ── 4. Penny Drop Logs
  const pennyDropData = [
    { accountNumber: "0987654321", ifscCode: "HDFC0001234", beneficiaryName: "FiniteLoop Technologies Pvt. Ltd.", accountType: "CURRENT" as const, status: "SUCCESS",       transactionId: "PD20260617001" },
    { accountNumber: "1234567890", ifscCode: "ICIC0002345", beneficiaryName: "Kotak Mahindra Bank Limited",        accountType: "CURRENT" as const, status: "SUCCESS",       transactionId: "PD20260617002" },
    { accountNumber: "9876543210", ifscCode: "SBIN0003456", beneficiaryName: "Tata Consultancy Services Limited",  accountType: "CURRENT" as const, status: "SUCCESS",       transactionId: "PD20260617003" },
    { accountNumber: "1122334455", ifscCode: "PUNB0004567", beneficiaryName: "Punjab National Bank Corporate",     accountType: "SAVINGS" as const, status: "SUCCESS",       transactionId: "PD20260617004" },
    { accountNumber: "5544332211", ifscCode: "UTIB0005678", beneficiaryName: "Wipro Limited",                      accountType: "CURRENT" as const, status: "SUCCESS",       transactionId: "PD20260617005" },
    { accountNumber: "6677889900", ifscCode: "KKBK0006789", beneficiaryName: "Muthoot Finance Limited",            accountType: "SAVINGS" as const, status: "SUCCESS",       transactionId: "PD20260617006" },
    { accountNumber: "1029384756", ifscCode: "BARB0007890", beneficiaryName: "Sun Pharmaceutical Industries Ltd.", accountType: "CURRENT" as const, status: "SUCCESS",       transactionId: "PD20260617007" },
    { accountNumber: "9081726354", ifscCode: "CNRB0008901", beneficiaryName: "Infosys Limited",                    accountType: "CURRENT" as const, status: "SUCCESS",       transactionId: "PD20260617008" },
    { accountNumber: "1111111111", ifscCode: "HDFC0001234", beneficiaryName: null,                                 accountType: "SAVINGS" as const, status: "NAME_MISMATCH", transactionId: "PD20260617009" },
    { accountNumber: "2222222222", ifscCode: "SBIN0003456", beneficiaryName: null,                                 accountType: "SAVINGS" as const, status: "ACCOUNT_FROZEN",transactionId: "PD20260617010" },
  ];

  for (const pd of pennyDropData) {
    await prisma.pennyDropLog.upsert({
      where:  { accountNumber_ifscCode: { accountNumber: pd.accountNumber, ifscCode: pd.ifscCode } },
      update: { status: pd.status, beneficiaryName: pd.beneficiaryName },
      create: pd,
    });
  }
  console.log(`✅ Penny drop logs: ${pennyDropData.length} records seeded`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
