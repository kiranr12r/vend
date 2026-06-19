import { NextRequest, NextResponse } from "next/server";

// ── Dummy IFSC database — auto-fills bank + branch when IFSC is entered
const IFSC_DATABASE: Record<string, any> = {
  "HDFC0001234": { bankName: "HDFC Bank",           branchName: "Indiranagar, Bengaluru",       city: "Bengaluru",  state: "Karnataka"    },
  "ICIC0002345": { bankName: "ICICI Bank",           branchName: "Bandra Kurla Complex, Mumbai", city: "Mumbai",     state: "Maharashtra"  },
  "SBIN0003456": { bankName: "State Bank of India",  branchName: "Sholinganallur, Chennai",      city: "Chennai",    state: "Tamil Nadu"   },
  "PUNB0004567": { bankName: "Punjab National Bank", branchName: "Sector 10, Chandigarh",        city: "Chandigarh", state: "Punjab"       },
  "UTIB0005678": { bankName: "Axis Bank",            branchName: "Salt Lake, Kolkata",           city: "Kolkata",    state: "West Bengal"  },
  "KKBK0006789": { bankName: "Kotak Mahindra Bank",  branchName: "Banerji Road, Kochi",          city: "Kochi",      state: "Kerala"       },
  "BARB0007890": { bankName: "Bank of Baroda",       branchName: "Tandalja Road, Ahmedabad",     city: "Ahmedabad",  state: "Gujarat"      },
  "CNRB0008901": { bankName: "Canara Bank",          branchName: "HITEC City, Hyderabad",        city: "Hyderabad",  state: "Telangana"    },
  "YESB0001111": { bankName: "Yes Bank",             branchName: "Connaught Place, New Delhi",   city: "New Delhi",  state: "Delhi"        },
  "IOBA0002222": { bankName: "Indian Overseas Bank", branchName: "Anna Salai, Chennai",          city: "Chennai",    state: "Tamil Nadu"   },
  "UBIN0003333": { bankName: "Union Bank of India",  branchName: "Nariman Point, Mumbai",        city: "Mumbai",     state: "Maharashtra"  },
  "BKID0004444": { bankName: "Bank of India",        branchName: "Hazratganj, Lucknow",          city: "Lucknow",    state: "Uttar Pradesh"},
  "IDIB0005555": { bankName: "Indian Bank",          branchName: "T Nagar, Chennai",             city: "Chennai",    state: "Tamil Nadu"   },
  "FDRL0006666": { bankName: "Federal Bank",         branchName: "MG Road, Kochi",               city: "Kochi",      state: "Kerala"       },
  "KARB0007777": { bankName: "Karnataka Bank",       branchName: "Brigade Road, Bengaluru",      city: "Bengaluru",  state: "Karnataka"    },
};

function validateIFSC(ifsc: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ifsc = searchParams.get("ifsc")?.toUpperCase().trim();

  if (!ifsc) {
    return NextResponse.json(
      { success: false, error: "IFSC code is required" },
      { status: 400 }
    );
  }

  if (!validateIFSC(ifsc)) {
    return NextResponse.json(
      { success: false, error: "Invalid IFSC format. Example: HDFC0001234" },
      { status: 400 }
    );
  }

  // Simulate API delay
  await new Promise((r) => setTimeout(r, 400));

  const branch = IFSC_DATABASE[ifsc];

  if (!branch) {
    return NextResponse.json(
      { success: false, error: "IFSC not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { ifsc, ...branch },
  });
}