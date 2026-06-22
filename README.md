<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-Neon-00E699?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" />

# 🏦 Vendor Management System
### Kotak Mahindra AMC — Internal Vendor Onboarding Platform

> A full-stack enterprise web application for managing vendor registrations, compliance verification, bank account validation, and Oracle ERP synchronization.

[Live Demo](#) · [Report Bug](https://github.com/kiranr12r/vendor_management_system/issues) · [Request Feature](https://github.com/kiranr12r/vendor_management_system/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Team](#-team)

---

## 🔍 Overview

The **Vendor Management System (VMS)** is an internal tool built for **Kotak Mahindra AMC** to streamline the end-to-end vendor onboarding process. It replaces manual paperwork with a structured 6-step digital registration flow, integrates with Oracle ERP for vendor ID synchronization, and provides a centralized dashboard for admin management.

---

## ✨ Features

### 🧾 6-Step Vendor Registration
| Step | Section | Description |
|------|---------|-------------|
| 1 | Contact & Identity | GST autofill, PAN, Aadhaar linkage, address & contact |
| 2 | Business & Compliance | Nature of service, MSME, e-invoice, GST scheme |
| 3 | Bank Details | Account verification, IFSC lookup, multiple accounts |
| 4 | Tax Information | TDS rate, ITR status, tax exemptions |
| 5 | Agreement Details | Contract start/end dates |
| 6 | Document Upload | Registration cert, PAN copy, ITR proof, MSME cert |

### 🏛️ Admin Dashboard
- Vendor list with search, filter, and status badges
- Approve / Reject vendor registrations
- Update Oracle ERP Vendor IDs
- Audit log for all changes

### 🔒 Security
- Role-based access control (Admin / Viewer)
- All data encrypted in transit (SSL)
- `.env` protected secrets — never committed to Git
- Prisma ORM prevents SQL injection

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** — App Router, Server Components
- **TypeScript** — Type safety across the entire codebase
- **Tailwind CSS 4** — Utility-first styling
- **React Hook Form + Zod** — Form validation

### Backend
- **Next.js API Routes** — REST API endpoints
- **Prisma ORM 7** — Type-safe database access
- **PostgreSQL (Neon)** — Serverless cloud database

### DevOps
- **GitHub** — Version control & collaboration
- **Vercel** — Deployment (planned)
- **Neon** — Managed PostgreSQL hosting

---

## 📁 Project Structure

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/kiranr12r/vendor_management_system.git
cd vendor_management_system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database — get this from your team lead via WhatsApp (never commit this)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Login credentials (dev):**
- Email: `admin@vendorlink.com`
- Password: `admin123`

---

## 🗄 Database Schema

users              — Admin accounts

vendors            — Core vendor records (6-step form data)

bank_accounts      — Multiple bank accounts per vendor

vendor_documents   — Uploaded files (S3 URLs)

audit_logs         — Change history for compliance

### Entity Relationships\
User

└── (manages) Vendor

├── BankAccount[]     (one vendor → many accounts)

├── VendorDocument[]  (one vendor → many documents)

└── AuditLog[]        (one vendor → full change history)

### Vendor Status Flow
DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE

↘ REJECTED

---

## 📡 API Reference

### `POST /api/vendors`
Create a new vendor registration.

**Request Body:**
```json
{
  "gstNumber": "29ABCDE1234F1Z5",
  "tradeName": "Vendor Name",
  "legalName": "Vendor Legal Pvt Ltd",
  "pan": "ABCDE1234F",
  "dateOfRegistration": "2022-01-01",
  "addressLine1": "123 MG Road",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pincode": "560001",
  "contactPerson": "John Doe",
  "contactEmail": "john@vendor.com",
  "contactPhone": "9876543210",
  "natureOfService": "IT Services",
  "paymentFrequency": "Monthly"
}
```

**Response:**
```json
{
  "success": true,
  "vendor": {
    "id": "cmq...",
    "status": "PENDING_APPROVAL",
    "gstNumber": "29ABCDE1234F1Z5",
    ...
  }
}
```

### `GET /api/vendors`
Fetch all vendors with bank accounts and documents.

**Response:**
```json
{
  "success": true,
  "vendors": [ ... ]
}
```

---

## 👥 Team

| Name | Role | Responsibility |
|------|------|---------------|
| Kiran R | Full Stack Lead | Project setup, DB schema, Step 1 form, API routes |
| Dev 2 | Frontend Dev | Steps 2–4 forms |
| Dev 3 | Frontend Dev | Steps 5–6, Vendor List, Oracle sync |

---

## 📌 Current Status

- [x] Project setup — Next.js 16 + TypeScript + Tailwind
- [x] Database schema — PostgreSQL + Prisma + Neon
- [x] GitHub repository — team collaboration ready
- [x] API routes — POST/GET /api/vendors working
- [x] Step 1 — Contact & Identity form
- [x] Dashboard layout — sidebar + topbar + stepper
- [ ] Steps 2–6 forms
- [ ] Vendor List page
- [ ] Authentication — NextAuth
- [ ] Document upload — S3/Supabase
- [ ] Oracle ERP integration
- [ ] Deployment — Vercel

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ Yes |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | ✅ Yes |
| `NEXTAUTH_URL` | App URL | ✅ Yes |

> ⚠️ Never commit `.env` to GitHub. Share credentials privately with teammates.

---

<div align="center">

Built with ❤️ by the FiniteLoop team for Kotak Mahindra AMC
https://docs.google.com/spreadsheets/d/1q41XuUpsOlOb_qNlWWksD_cDIoNY0Jlr/edit?usp=drive_link&ouid=107979258621554912791&rtpof=true&sd=true

</div>
