# Vaishnavi Classes — Fee Management System (Since 1996)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/17Prat/vaishnavi-classes)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/17Prat/vaishnavi-classes)

Production-ready Fee Management System for **Vaishnavi Classes** built with **Next.js (App Router)**, **FastAPI**, **SQLite / PostgreSQL**, and installable **PWA**. Inspiring institutional excellence since 1996.

---

## 🚀 Key Features

### 1. User ID + Password Authentication (No OTP)
- Strict User ID format:
  - **Admin:** `ADM0001`
  - **Staff:** `STF0001`, `STF0002`
  - **Student:** `STU0001`, `STU0002`, `STU0003`, `STU0004`
- Bcrypt password hashing, JWT HttpOnly sessions, self-service password update, and admin-assisted password resets.
- Multi-tenant institute-level data isolation.

### 2. Role-Based Dashboards
- **Admin Dashboard (`/admin`):** Total students, total staff, total fees, collected, pending, overdue metrics, live Recharts daily collection trends, payment method share, recent transactions, quick fee collection modal.
- **Staff Dashboard (`/staff`):** Cashier collection counter, today's collection, assigned student lookups, pending UPI verification queue, WhatsApp reminder triggers.
- **Student Dashboard (`/student`):** Student fee statement, quarterly/monthly installment timeline, paid amount, remaining balance, instant verified receipt downloads, UPI UTR submission.

### 3. Student & Academic Management
- Full student directory with search (by name, student ID, phone), batch filter, and CSV export.
- Academic structure: Academic Years, Courses, Classes, Batches, and Enrollments.
- Granular staff permissions: `can_collect_fees`, `can_verify_upi`, `can_send_reminders`, `can_view_reports`, `can_manage_students`.

### 4. Fee Structures & Student Ledgers
- Configurable fee plan heads: Admission, Tuition, Examination, Library, Transport, and Custom Charges.
- Concessions: Discounts and Merit Scholarships with audit reasons.
- Flexible installment frequencies: Full, Monthly, Quarterly, or Custom due dates.
- Uses `DECIMAL(12, 2)` precision for all currency calculations.

### 5. Payment Management & UPI Reconciliation
- Supported payment methods: **Cash**, **UPI**, **Bank Transfer (NEFT/RTGS)**, **Cheque**.
- **Student UPI Workflow:** Student transfers via UPI to institute VPA (`apexinstitute@upi`) → submits 12-digit UTR reference → marked as `Pending Verification` → Cashier or Admin verifies against bank statement → Ledger updates and verified PDF receipt is automatically issued.
- Duplicate prevention within 5 minutes, payment reversals with mandatory audit logs, and complete ledger restoration.

### 6. PDF Receipts with QR Verification
- Professional PDF receipts rendered using ReportLab Canvas with institute branding, student metadata, itemized charges, and authorized stamp.
- Verification QR code linking to `/verify-receipt/{receipt_number}` for instant digital validation.

### 7. Free Manual WhatsApp Reminders (Click-to-Chat)
- No paid third-party APIs required.
- Pre-composed personalized templates:
  - Upcoming Fee (Gentle Reminder)
  - Due Today (Urgent Action)
  - Overdue Fee (Immediate Notice with days late)
  - Partial Payment (Balance Acknowledgment)
  - Payment Confirmation
- One-click trigger launches `https://wa.me/{phone}?text={encoded_message}` in WhatsApp Web or Mobile.

### 8. Real-Time Chat (WebSockets)
- Instant messaging between Admin, Staff, and Students.
- Persistent message storage in PostgreSQL.
- Active presence indicator, conversation list, message history, and unread counts.

### 9. Reports & Analytics
- 30-day collection summary with transaction counts.
- Payment method breakdown.
- Fee Defaulters & Overdue Aging List with late-day tracking.
- Instant CSV export for Payments and Student Fee Ledgers.

### 10. Progressive Web App (PWA)
- Installable on Android, iPhone, iPad, Windows, and macOS browsers with service worker caching and manifest.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python FastAPI, SQLAlchemy (Async), Pydantic v2, Alembic, WebSockets, ReportLab, QRCode |
| **Database** | Neon PostgreSQL (Production) / aiosqlite (Local zero-config dev) |
| **DevOps** | Docker, Docker Compose |

---

## 🔑 Pre-Seeded Test Accounts

| Role | Login ID | Password | Name & Profile |
|---|---|---|---|
| **Admin** | `ADM0001` | `admin123` | Dr. Rajesh Sharma (Director) |
| **Staff** | `STF0001` | `staff123` | Anita Verma (Chief Accountant, Full Cashier Perms) |
| **Staff** | `STF0002` | `staff123` | Vikram Malhotra (Fee Clerk) |
| **Student** | `STU0001` | `student123` | Aarav Patel (Partial Paid, Verified Receipt #REC-2026-0001) |
| **Student** | `STU0002` | `student123` | Priya Sharma (Full Paid, Merit Scholarship) |
| **Student** | `STU0003` | `student123` | Rohan Nair (Overdue Installment for WhatsApp test) |
| **Student** | `STU0004` | `student123` | Ananya Iyer (Pending UPI ₹16,000 for Verification test) |

*The login page (`/login`) also includes convenient 1-click test buttons to instantly fill and sign in with any role!*

---

## 🏃 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.11+)

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt greenlet

# Initialize database schema and seed data
python init_db.py

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
# In another terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## ☁️ Neon PostgreSQL Cloud Configuration

To connect FeeFlow to Neon PostgreSQL:

1. Create a free PostgreSQL project at [neon.tech](https://neon.tech).
2. Copy your connection URI from the Neon dashboard.
3. In your environment or `.env` file, set:
```env
DATABASE_URL=postgresql+asyncpg://<username>:<password>@<ep-xyz>.neon.tech/<dbname>?ssl=require
```
FeeFlow's async database engine automatically detects the PostgreSQL URL, enables SSL pre-ping pooling, and provisions the entire schema upon startup.

---

## 🧪 Automated Testing

FeeFlow includes an end-to-end automated test suite covering authentication, role permissions, fee calculation, student UPI submissions, cashier verification, WhatsApp link formatting, and defaulter tracking.

```bash
# Run backend test suite
$env:PYTHONPATH="backend"
backend\venv\Scripts\pytest backend/tests -c backend/pytest.ini -v
```

---

## 🐳 Docker Deployment

Run the entire application stack (FastAPI Backend, Next.js Frontend, PostgreSQL) with a single command:

```bash
docker compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
