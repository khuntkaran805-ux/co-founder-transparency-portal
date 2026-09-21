# Co-Founder Transparency & Management Portal

> **A ₹0 ($0) perpetual cost, high-density Jamstack operations and financial transparency portal for co-founders running an online academic and consulting project business in India.**

Built to solve the co-founder visibility challenge: one partner manages day-to-day intake and operations while the other requires real-time, tamper-evident transparency into revenue, pipeline velocity, cleared receivables, and client milestones.

---

## 🌟 Key Features

### 1. Dual Authorization & Security View Modes
- **Identity Switcher**: Seamlessly switch between **Partner A (Operations Lead)** and **Partner B (Auditor/Executive)**. All actions and logs are tagged with the active partner.
- **Quick PIN Privacy Mode**: One-click screen blur & masking (`••••••`) for all financial figures when working in public spaces. Unlock via 4-digit PIN (default: `1234`).
- **Read-Only Mode**: Locks modification controls to allow executive inspection without accidental data changes.

### 2. Real-Time Financial & Operational Dashboard (7 KPI Cards)
- **Gross Lifetime Quoted Revenue** (Sum in ₹ formatted in Indian numbering: `₹1,25,000`).
- **Total Cleared Income** (Filtered by active date range).
- **Total Outstanding Dues / Receivables** (`Quoted - Paid`).
- **Monthly Active Pipeline Tally** (`In Progress` + `Client Revision`).
- **Total Delivered Projects Count** (`Completed`).
- **Average Order Value (AOV)** (`Quoted Revenue / Total Projects`).
- **Financial Collection Percentage Gauge** (SVG circular progress gauge with color thresholds).

### 3. Advanced Project Ingestion & Editing (CRUD)
- Auto-formatted sequential Project IDs (`PRJ-2026-001`).
- Dynamic balance calculation in real-time (`Total Quoted - Advance Paid`).
- Intelligent payment status suggestions (`Unpaid`, `Partial Advance`, `Fully Paid`, `Refunded`).
- Delivery deadline countdown badges (`Due Today`, `Overdue`, `X days left`).
- Categorization across Engineering, Management, Software Development, Thesis, Graphic Design, and Other.

### 4. Dynamic Data Table & Real-Time Filtering
- Real-time global search across ID, Title, Client, WhatsApp, and Category.
- Filter by execution status, payment status, category, and date range (Today, This Week, This Month, Custom, All-Time).
- Multi-column sorting (Deadline, Quoted Amount, ID).
- In-row action controls:
  - **Quick Payment Clearance Modal** (record balance payments with 1 click).
  - **Quick Status Dropdown** (advance project milestones directly in table rows).
  - **Detail View Slide-Over Drawer** (review guidelines, notes, and audit history).
  - **1-Click WhatsApp Receipt Sharing** (`https://wa.me/` with formatted message).
  - **One-Click CSV Export** of filtered datasets.

### 5. Pure HTML5 Canvas Analytics (Zero CDN Dependencies)
- **Monthly Cleared vs Pending Dues** (6-month dual-bar comparison with INR formatting).
- **Project Status Distribution** (Multi-color donut chart).
- **Category-wise Revenue Breakdown** (Horizontal bar chart).

### 6. Tamper-Evident Audit Trail
- Logs every project creation, balance payment, and status update with actor attribution and timestamps.
- Available in both the project drawer and full audit explorer modal.

### 7. Zero-Cost Perpetual Architecture (₹0 / $0 Forever)
- **Frontend**: GitHub Pages / Vercel (Single-file HTML5/CSS/JS).
- **Backend API**: Google Apps Script (V8 Engine, RESTful JSON with CORS).
- **Database**: Google Sheets (`Business_Transparency_DB`).

---

## 🚀 Quick Start (Local Preview)

Simply open `index.html` in any web browser!

The portal comes pre-loaded with realistic sample data for an Indian project consulting agency, saved locally in your browser's `localStorage`. You can immediately test adding projects, recording payments, changing statuses, searching, exporting CSVs, and toggling privacy modes.

To connect with live Google Sheets, follow the [Deployment Guide](file:///C:/Users/DARSHAN/.gemini/antigravity/scratch/co-founder-transparency-portal/DEPLOYMENT_GUIDE.md).

---

## 📁 Repository Structure

```
co-founder-transparency-portal/
├── index.html              # Complete SPA frontend (HTML5, CSS3, Vanilla JS, Canvas)
├── Code.gs                 # Google Apps Script backend (CORS REST API & Sheets handler)
├── DEPLOYMENT_GUIDE.md     # Detailed setup and deployment manual
└── README.md               # Project overview and documentation
```
