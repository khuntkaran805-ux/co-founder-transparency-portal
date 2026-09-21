# Deployment & Setup Manual: Co-Founder Transparency & Management Portal

This manual guides you through deploying the **Co-Founder Transparency & Management Portal** at **₹0 ($0) perpetual cost** using Google Sheets as a relational database, Google Apps Script as a serverless REST API, and GitHub Pages (or Vercel) for static web hosting.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Frontend Client (GitHub Pages)             │
│   • Single-Page App (HTML5, Vanilla JS ES6+, CSS3)      │
│   • Standalone LocalStorage Caching + Optimistic UI     │
│   • Dual-Partner Toggle, PIN Privacy Mask, Canvas Charts│
└────────────────────────────┬────────────────────────────┘
                             │  HTTPS fetch()
                             ▼
┌─────────────────────────────────────────────────────────┐
│        Serverless Backend (Google Apps Script)          │
│   • doGet(): Fetches project logs & audit trails (JSON) │
│   • doPost(): CRUD actions, quick payment, audit logs   │
│   • CORS-enabled with ContentService.MimeType.JSON      │
└────────────────────────────┬────────────────────────────┘
                             │  SpreadsheetApp API
                             ▼
┌─────────────────────────────────────────────────────────┐
│           Relational Database (Google Sheets)           │
│   • Database Name: Business_Transparency_DB             │
│   • Tab 1: Project_Logs (A1:N1)                         │
│   • Tab 2: Audit_Trails (A1:E1)                         │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1: Create Your Google Spreadsheet

1. Open [Google Sheets](https://sheets.new) in your browser.
2. Rename the spreadsheet to exactly:
   ```
   Business_Transparency_DB
   ```
3. You can either manually create the two sheets or let the script auto-initialize them. To set them up manually:

### Tab 1: `Project_Logs`
Set the headers in row 1 (`A1:N1`):
| Column | Header Name | Description |
| :--- | :--- | :--- |
| **A** | `Project_ID` | Auto-formatted unique ID (e.g. `PRJ-2026-001`) |
| **B** | `Project_Name` | Academic assignment / project title |
| **C** | `Client_Name` | Client name |
| **D** | `Client_Contact` | Phone / WhatsApp number |
| **E** | `Category` | Engineering, Management, Thesis, etc. |
| **F** | `Total_Quote` | Total quoted project amount in ₹ |
| **G** | `Amount_Paid` | Cleared payment collected in ₹ |
| **H** | `Pending_Balance` | Formula: `=F2-G2` |
| **I** | `Payment_Status` | `Unpaid`, `Partial Advance`, `Fully Paid`, `Refunded` |
| **J** | `Project_Status` | `New Lead`, `In Progress`, `Draft Submitted`, `Client Revision`, `Completed`, `Cancelled` |
| **K** | `Delivery_Deadline` | ISO target completion date (`YYYY-MM-DD`) |
| **L** | `Creation_Timestamp`| Intake ISO timestamp |
| **M** | `Logged_By` | Active partner designation (`Partner A` or `Partner B`) |
| **N** | `Internal_Notes` | Scope notes, client drive links, instructions |

### Tab 2: `Audit_Trails`
Set the headers in row 1 (`A1:E1`):
| Column | Header Name | Description |
| :--- | :--- | :--- |
| **A** | `Log_ID` | Unique audit log ID (e.g. `LOG-XXXXX`) |
| **B** | `Project_ID` | Associated Project ID |
| **C** | `Action_Type` | `CREATE_PROJECT`, `QUICK_PAYMENT`, `STATUS_CHANGE`, etc. |
| **D** | `Change_Description` | Timestamped audit description |
| **E** | `Timestamp` | ISO timestamp of modification |

---

## Step 2: Deploy Google Apps Script (`Code.gs`)

1. Inside your Google Sheet, click **Extensions** > **Apps Script** in the top menu bar.
2. Delete any default code in the editor (`Code.gs`).
3. Copy the entire contents of `Code.gs` from this project and paste it into the editor.
4. Save the project (click the disk icon or press `Ctrl + S`).
5. (Optional) Run Database Auto-Initialization:
   - In the toolbar dropdown, select the function `setupDatabase`.
   - Click **Run**.
   - Review permissions when prompted: Click **Review Permissions** > Select your Google Account > Click **Advanced** > Click **Go to Untitled project (unsafe)** > Click **Allow**.
   - This will automatically format headers and ensure both tabs exist.

---

## Step 3: Publish as a Web App

1. In the top-right corner of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Fill in the deployment details:
   - **Description**: `Business Transparency API v1`
   - **Execute as**: `Me (your_email@gmail.com)` *(Important: This allows the script to read/write to the sheet on behalf of the application)*
   - **Who has access**: `Anyone` *(Important: This enables your frontend app to send requests without OAuth login screens)*
4. Click **Deploy**.
5. Copy the generated **Web App URL**. It will look like:
   ```
   https://script.google.com/macros/s/AKfycbxAbCdEf1234567890.../exec
   ```

> [!TIP]
> Whenever you make changes to `Code.gs`, create a **New version** when re-deploying to make sure Google serves the updated script.

---

## Step 4: Connect the Frontend to Google Sheets

1. Open `index.html` in your web browser (or run locally via any web server).
2. Click the **Settings (gear icon)** in the top navigation bar.
3. Paste your Apps Script Web App URL into the **Google Apps Script Web App Endpoint URL** field.
4. Click **Test Connection & Sync**.
5. The badge will change to **Connected (Google Sheets)**, and all data will synchronize instantly.
6. Click **Save Configuration**.

---

## Step 5: Host for Free on GitHub Pages (100% Perpetual ₹0 Cost)

1. Create a new GitHub repository named `co-founder-transparency-portal`.
2. Push `index.html`, `Code.gs`, `DEPLOYMENT_GUIDE.md`, and `README.md` to the repository.
3. In GitHub, go to **Settings** > **Pages**.
4. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or `master`), folder: `/ (root)`
5. Click **Save**.
6. Within 1-2 minutes, your live site will be available at:
   ```
   https://<your-username>.github.io/co-founder-transparency-portal/
   ```

---

## Security & Operational Best Practices

1. **Quick PIN Privacy Mode**:
   - When reviewing accounts in public (cafes, coworking spaces), click **Privacy Mode** or press the Eye button.
   - All monetary figures (KPIs, table amounts, charts) are blurred and masked with `••••`.
   - Default PIN is `1234`. You can change this anytime in the **Settings** modal.

2. **Read-Only Mode for Executive Auditing**:
   - Toggle **Read-Only** from the top bar when inspecting records to disable write buttons and avoid accidental edits.

3. **Tamper-Evident Audit Trail**:
   - Every project creation, quick payment clearance, and status advancement automatically logs an entry in the `Audit_Trails` sheet with the actor's designation (`Partner A` or `Partner B`).

4. **1-Click WhatsApp Receipts**:
   - Click the phone icon next to any project to open a pre-formatted WhatsApp quote and receipt message ready to send to clients via `https://wa.me/`.
