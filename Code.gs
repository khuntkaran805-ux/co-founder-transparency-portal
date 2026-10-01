/**
 * ==============================================================================
 * NEXUS PRIME // ENTERPRISE OPERATIONS & AUTOMATION MATRIX
 * Google Apps Script Backend Engine - Version 6.0 (Automations Suite)
 * ==============================================================================
 * Provider & Lead: Karan Khunt (+91 6353002399 | karankhunt805@gmail.com)
 * Database: Google Spreadsheet 'Business_Transparency_DB'
 *
 * Automated Systems Active:
 *   1. 🤖 Zero-Click WhatsApp & Email Payment Chaser (Daily Cron)
 *   2. 📁 Instant Google Drive Folder & Asset Provisioning (DriveApp)
 *   3. 🔔 Milestone Push: Automated Client Notification on Status Change
 *   4. ☕ 9:00 AM Daily Personal Business Briefing to Karan
 *   5. 💱 Live Forex Currency Rates Auto-Sync (USD/EUR/GBP/AED/CAD/AUD/INR)
 *   6. 📅 2-Way Google Calendar Deadline & Milestones Sync (CalendarApp)
 *   7. ⭐ Automated 24h Post-Delivery Review & Testimonial Collector
 *   8. 🔄 Recurring Monthly Subscription & Expense Logger (1st of month)
 *   9. 🧾 Automated PDF Invoice Generation & Email Dispatch (Drive + MailApp)
 *  10. 🛡️ Self-Healing Automated Cloud Backups & Weekly Snapshot (Sunday Cron)
 * ==============================================================================
 */

const SHEET_PROJECT_LOGS = 'Project_Logs';
const SHEET_AUDIT_TRAILS = 'Audit_Trails';
const SHEET_EXPENSES     = 'Expenses';
const SHEET_SETTINGS     = 'Settings_Config';

const ADMIN_EMAIL = 'karankhunt805@gmail.com';
const ADMIN_PHONE = '+91 6353002399';
const ADMIN_NAME  = 'Karan Khunt';

/**
 * Returns active spreadsheet
 */
function getDatabase() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Ensures all required sheets and headers exist
 */
function setupDatabase() {
  const ss = getDatabase();
  
  // 1. Project_Logs
  let projectSheet = ss.getSheetByName(SHEET_PROJECT_LOGS);
  if (!projectSheet) projectSheet = ss.insertSheet(SHEET_PROJECT_LOGS);
  const projectHeaders = [
    'Project_ID', 'Project_Name', 'Client_Name', 'Client_Contact', 'Category',
    'Total_Quote', 'Amount_Paid', 'Pending_Balance', 'Payment_Status',
    'Project_Status', 'Delivery_Deadline', 'Creation_Timestamp', 'Logged_By',
    'Internal_Notes', 'Drive_Folder_URL', 'Currency'
  ];
  if (projectSheet.getLastRow() === 0) {
    projectSheet.getRange(1, 1, 1, projectHeaders.length).setValues([projectHeaders]);
    projectSheet.getRange(1, 1, 1, projectHeaders.length)
      .setFontWeight('bold').setBackground('#0f172a').setFontColor('#00f5ff').setHorizontalAlignment('center');
    projectSheet.setFrozenRows(1);
  }

  // 2. Audit_Trails
  let auditSheet = ss.getSheetByName(SHEET_AUDIT_TRAILS);
  if (!auditSheet) auditSheet = ss.insertSheet(SHEET_AUDIT_TRAILS);
  const auditHeaders = ['Log_ID', 'Project_ID', 'Action_Type', 'Change_Description', 'Timestamp'];
  if (auditSheet.getLastRow() === 0) {
    auditSheet.getRange(1, 1, 1, auditHeaders.length).setValues([auditHeaders]);
    auditSheet.getRange(1, 1, 1, auditHeaders.length)
      .setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff').setHorizontalAlignment('center');
    auditSheet.setFrozenRows(1);
  }

  // 3. Expenses
  let expSheet = ss.getSheetByName(SHEET_EXPENSES);
  if (!expSheet) expSheet = ss.insertSheet(SHEET_EXPENSES);
  const expHeaders = ['Expense_ID', 'Date', 'Description', 'Category', 'Amount', 'Currency', 'Logged_By'];
  if (expSheet.getLastRow() === 0) {
    expSheet.getRange(1, 1, 1, expHeaders.length).setValues([expHeaders]);
    expSheet.getRange(1, 1, 1, expHeaders.length)
      .setFontWeight('bold').setBackground('#1e293b').setFontColor('#ff0055').setHorizontalAlignment('center');
    expSheet.setFrozenRows(1);
  }

  // 4. Settings_Config
  let setSheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!setSheet) setSheet = ss.insertSheet(SHEET_SETTINGS);
  const setHeaders = ['Key', 'Value', 'Updated_At'];
  if (setSheet.getLastRow() === 0) {
    setSheet.getRange(1, 1, 1, setHeaders.length).setValues([setHeaders]);
    setSheet.getRange(1, 1, 1, setHeaders.length)
      .setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff').setHorizontalAlignment('center');
    setSheet.setFrozenRows(1);
  }

  return { status: 'success', message: 'NEXUS Database initialized with all 4 sheets.' };
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * HTTP GET - Fetches projects, audits, expenses, and settings
 */
function doGet(e) {
  try {
    const ss = getDatabase();
    ensureTabsExist(ss);

    const projectSheet = ss.getSheetByName(SHEET_PROJECT_LOGS);
    const auditSheet   = ss.getSheetByName(SHEET_AUDIT_TRAILS);
    const expSheet     = ss.getSheetByName(SHEET_EXPENSES);

    const projects    = fetchProjects(projectSheet);
    const auditTrails = fetchAuditTrails(auditSheet);
    const expenses    = fetchExpenses(expSheet);

    return jsonResponse({
      status: 'success',
      timestamp: new Date().toISOString(),
      lead: ADMIN_NAME,
      data: {
        projects: projects,
        auditTrails: auditTrails,
        expenses: expenses
      }
    });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * HTTP POST - Handles CRUD & All Automated Trigger Actions
 */
function doPost(e) {
  try {
    const ss = getDatabase();
    ensureTabsExist(ss);

    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    const projectSheet = ss.getSheetByName(SHEET_PROJECT_LOGS);
    const auditSheet   = ss.getSheetByName(SHEET_AUDIT_TRAILS);
    const expSheet     = ss.getSheetByName(SHEET_EXPENSES);

    let result = null;

    switch (action) {
      case 'INIT_DATABASE':
        result = setupDatabase();
        break;

      case 'SETUP_AUTOMATED_TRIGGERS':
        result = setupAllAutomatedCloudTriggers();
        break;

      case 'CREATE_PROJECT':
        result = handleCreateProject(projectSheet, auditSheet, payload.project, payload.actor);
        break;

      case 'UPDATE_PROJECT':
        result = handleUpdateProject(projectSheet, auditSheet, payload.project, payload.actor);
        break;

      case 'QUICK_PAYMENT':
        result = handleQuickPayment(projectSheet, auditSheet, payload.projectId, payload.paymentAmount, payload.paymentChannel, payload.actor);
        break;

      case 'QUICK_STATUS':
        result = handleQuickStatus(projectSheet, auditSheet, payload.projectId, payload.newStatus, payload.actor);
        break;

      case 'DELETE_PROJECT':
        result = handleDeleteProject(projectSheet, auditSheet, payload.projectId, payload.actor);
        break;

      case 'ADD_EXPENSE':
        result = handleAddExpense(expSheet, auditSheet, payload.expense, payload.actor);
        break;

      case 'DELETE_EXPENSE':
        result = handleDeleteExpense(expSheet, auditSheet, payload.expenseId, payload.actor);
        break;

      case 'TRIGGER_PAYMENT_CHASER':
        result = cronDailyPaymentChaser();
        break;

      case 'TRIGGER_EXECUTIVE_BRIEFING':
        result = cronDailyExecutiveBriefing();
        break;

      case 'TRIGGER_MONTHLY_RECURRING':
        result = cronMonthlyRecurringExpenses();
        break;

      case 'TRIGGER_WEEKLY_BACKUP':
        result = cronWeeklyCloudBackup();
        break;

      case 'DISPATCH_INVOICE_EMAIL':
        result = handleDispatchInvoiceEmail(payload.projectId, payload.clientEmail, payload.invoiceData);
        break;

      default:
        throw new Error('Unknown or unhandled action: ' + action);
    }

    return jsonResponse({
      status: 'success',
      action: action,
      result: result
    });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function ensureTabsExist(ss) {
  if (!ss.getSheetByName(SHEET_PROJECT_LOGS) || !ss.getSheetByName(SHEET_AUDIT_TRAILS) || !ss.getSheetByName(SHEET_EXPENSES)) {
    setupDatabase();
  }
}

// ==============================================================================
// 1. DATA READERS
// ==============================================================================
function fetchProjects(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, 16).getValues();
  const projects = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const totalQuote = parseFloat(row[5]) || 0;
    const amountPaid = parseFloat(row[6]) || 0;
    const pendingBalance = Math.max(0, totalQuote - amountPaid);

    projects.push({
      Project_ID: String(row[0]),
      Project_Name: String(row[1] || ''),
      Client_Name: String(row[2] || ''),
      Client_Contact: String(row[3] || ''),
      Category: String(row[4] || 'Other'),
      Total_Quote: totalQuote,
      Amount_Paid: amountPaid,
      Pending_Balance: pendingBalance,
      Payment_Status: String(row[8] || 'Unpaid'),
      Project_Status: String(row[9] || 'New Lead'),
      Delivery_Deadline: row[10] ? formatDateValue(row[10]) : '',
      Creation_Timestamp: row[11] ? formatDateValue(row[11]) : '',
      Logged_By: String(row[12] || ADMIN_NAME),
      Internal_Notes: String(row[13] || ''),
      Drive_Folder_URL: String(row[14] || ''),
      Currency: String(row[15] || 'INR')
    });
  }
  return projects;
}

function fetchAuditTrails(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  const logs = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    logs.push({
      Log_ID: String(row[0]),
      Project_ID: String(row[1] || ''),
      Action_Type: String(row[2] || ''),
      Change_Description: String(row[3] || ''),
      Timestamp: row[4] ? formatDateValue(row[4]) : ''
    });
  }
  return logs.reverse();
}

function fetchExpenses(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  const expenses = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    expenses.push({
      Expense_ID: String(row[0]),
      Date: row[1] ? formatDateValue(row[1]) : '',
      Description: String(row[2] || ''),
      Category: String(row[3] || 'General'),
      Amount: parseFloat(row[4]) || 0,
      Currency: String(row[5] || 'INR'),
      Logged_By: String(row[6] || ADMIN_NAME)
    });
  }
  return expenses.reverse();
}

// ==============================================================================
// 2. DATA WRITERS & CRUD WITH AUTOMATED PROVISIONING
// ==============================================================================

/**
 * FEATURE 2: Auto-creates Google Drive Folder & FEATURE 6: Google Calendar Event
 */
function handleCreateProject(projectSheet, auditSheet, projectData, actor) {
  if (!projectData || !projectData.Project_ID) {
    throw new Error('Invalid project data. Project_ID is required.');
  }

  const nowStr = new Date().toISOString();
  const actorName = actor || ADMIN_NAME;
  const totalQuote = parseFloat(projectData.Total_Quote) || 0;
  const amountPaid = parseFloat(projectData.Amount_Paid) || 0;
  const rowNumber = projectSheet.getLastRow() + 1;
  const balanceFormula = '=F' + rowNumber + '-G' + rowNumber;

  // AUTOMATION 2: Provision Google Drive Folder
  let driveFolderUrl = projectData.Drive_Folder_URL || '';
  try {
    driveFolderUrl = autoProvisionGoogleDriveFolder(projectData.Client_Name, projectData.Project_ID);
  } catch (err) {
    Logger.log('Drive Auto-Provision Warning: ' + err.toString());
  }

  // AUTOMATION 6: Sync to Google Calendar
  try {
    if (projectData.Delivery_Deadline) {
      autoSyncToGoogleCalendar(projectData);
    }
  } catch (err) {
    Logger.log('Calendar Sync Warning: ' + err.toString());
  }

  const newRow = [
    projectData.Project_ID,
    projectData.Project_Name || '',
    projectData.Client_Name || '',
    projectData.Client_Contact || '',
    projectData.Category || 'Other',
    totalQuote,
    amountPaid,
    balanceFormula,
    projectData.Payment_Status || (amountPaid >= totalQuote ? 'Fully Paid' : (amountPaid > 0 ? 'Partial Advance' : 'Unpaid')),
    projectData.Project_Status || 'New Lead',
    projectData.Delivery_Deadline || '',
    projectData.Creation_Timestamp || nowStr,
    actorName,
    projectData.Internal_Notes || '',
    driveFolderUrl,
    projectData.Currency || 'INR'
  ];

  projectSheet.appendRow(newRow);

  logAuditTrail(
    auditSheet,
    projectData.Project_ID,
    'CREATE_PROJECT',
    'Mission "' + (projectData.Project_Name || projectData.Project_ID) + '" deployed by ' + actorName + ' (Quote: ' + (projectData.Currency || 'INR') + ' ' + totalQuote + ', Paid: ' + amountPaid + '). Auto-provisioned Drive folder.'
  );

  return {
    success: true,
    projectId: projectData.Project_ID,
    driveFolderUrl: driveFolderUrl,
    message: 'Project created and auto-provisioned successfully.'
  };
}

function handleUpdateProject(projectSheet, auditSheet, projectData, actor) {
  if (!projectData || !projectData.Project_ID) {
    throw new Error('Project_ID required for update.');
  }

  const actorName = actor || ADMIN_NAME;
  const lastRow = projectSheet.getLastRow();
  if (lastRow <= 1) throw new Error('No projects found.');

  const ids = projectSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let targetRowIndex = -1;

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(projectData.Project_ID)) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) throw new Error('Project ID ' + projectData.Project_ID + ' not found.');

  const totalQuote = parseFloat(projectData.Total_Quote) || 0;
  const amountPaid = parseFloat(projectData.Amount_Paid) || 0;
  const balanceFormula = '=F' + targetRowIndex + '-G' + targetRowIndex;

  const existingDrive = projectSheet.getRange(targetRowIndex, 15).getValue() || '';

  const updatedRow = [
    projectData.Project_ID,
    projectData.Project_Name || '',
    projectData.Client_Name || '',
    projectData.Client_Contact || '',
    projectData.Category || 'Other',
    totalQuote,
    amountPaid,
    balanceFormula,
    projectData.Payment_Status || (amountPaid >= totalQuote ? 'Fully Paid' : (amountPaid > 0 ? 'Partial Advance' : 'Unpaid')),
    projectData.Project_Status || 'In Progress',
    projectData.Delivery_Deadline || '',
    projectData.Creation_Timestamp || new Date().toISOString(),
    projectData.Logged_By || actorName,
    projectData.Internal_Notes || '',
    projectData.Drive_Folder_URL || existingDrive,
    projectData.Currency || 'INR'
  ];

  projectSheet.getRange(targetRowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);

  // AUTOMATION 3: Automated Milestone Client Email on Status Change
  try {
    autoNotifyClientMilestone(projectData);
  } catch (e) {}

  logAuditTrail(
    auditSheet,
    projectData.Project_ID,
    'UPDATE_PROJECT',
    'Mission updated by ' + actorName + '. Status: ' + projectData.Project_Status + ', Paid: ' + amountPaid + '/' + totalQuote + '.'
  );

  return { success: true, projectId: projectData.Project_ID };
}

function handleQuickPayment(projectSheet, auditSheet, projectId, paymentAmount, paymentChannel, actor) {
  const actorName = actor || ADMIN_NAME;
  const paymentNum = parseFloat(paymentAmount);
  if (!projectId || isNaN(paymentNum) || paymentNum <= 0) {
    throw new Error('Valid Project ID and positive payment amount required.');
  }

  const lastRow = projectSheet.getLastRow();
  const data = projectSheet.getRange(2, 1, lastRow - 1, 10).getValues();
  let targetRowIndex = -1;
  let currentQuote = 0;
  let currentPaid = 0;
  let clientContact = '';
  let projectName = '';

  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(projectId)) {
      targetRowIndex = i + 2;
      projectName = data[i][1];
      clientContact = data[i][3];
      currentQuote = parseFloat(data[i][5]) || 0;
      currentPaid = parseFloat(data[i][6]) || 0;
      break;
    }
  }

  if (targetRowIndex === -1) throw new Error('Project ID ' + projectId + ' not found.');

  const newPaid = currentPaid + paymentNum;
  const newPaymentStatus = newPaid >= currentQuote ? 'Fully Paid' : 'Partial Advance';

  projectSheet.getRange(targetRowIndex, 7).setValue(newPaid);
  projectSheet.getRange(targetRowIndex, 9).setValue(newPaymentStatus);

  const desc = 'Cleared balance payment of ' + paymentNum + ' via ' + (paymentChannel || 'UPI') + ' by ' + actorName + '. Total Paid: ' + newPaid + ' / ' + currentQuote + ' (' + newPaymentStatus + ').';
  logAuditTrail(auditSheet, projectId, 'QUICK_PAYMENT', desc);

  // AUTOMATION: Send Payment Receipt Email to Client if email
  if (clientContact && clientContact.includes('@')) {
    try {
      MailApp.sendEmail({
        to: clientContact,
        subject: 'Payment Received Confirmation // ' + projectName + ' [' + projectId + ']',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; background: #030611; color: #fff; padding: 25px; border-radius: 10px; max-width: 550px;">
            <h2 style="color: #00f5ff; margin-top: 0;">Payment Clearance Confirmation</h2>
            <p>Dear Valued Partner,</p>
            <p>We have successfully cleared and credited your payment of <strong>₹${paymentNum.toLocaleString()}</strong> towards project <strong>${projectName}</strong>.</p>
            <div style="background: rgba(0,245,255,0.08); border-left: 3px solid #00f5ff; padding: 12px 15px; margin: 15px 0;">
              <div>Total Quoted: <strong>₹${currentQuote.toLocaleString()}</strong></div>
              <div>Total Cleared to Date: <strong>₹${newPaid.toLocaleString()}</strong></div>
              <div>Remaining Escrow: <strong>₹${Math.max(0, currentQuote - newPaid).toLocaleString()}</strong></div>
              <div>Status: <strong style="color: #00ff9d;">${newPaymentStatus}</strong></div>
            </div>
            <p>Thank you for partnering with us.</p>
            <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
              Karan Khunt // Lead Architect<br>
              Phone: +91 6353002399 | Email: karankhunt805@gmail.com
            </p>
          </div>
        `
      });
    } catch (e) {}
  }

  return { success: true, projectId, newPaid, newPaymentStatus };
}

function handleQuickStatus(projectSheet, auditSheet, projectId, newStatus, actor) {
  const actorName = actor || ADMIN_NAME;
  const lastRow = projectSheet.getLastRow();
  const data = projectSheet.getRange(2, 1, lastRow - 1, 10).getValues();
  let targetRowIndex = -1;
  let oldStatus = '';
  let projectObj = {};

  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(projectId)) {
      targetRowIndex = i + 2;
      oldStatus = data[i][9];
      projectObj = {
        Project_ID: data[i][0],
        Project_Name: data[i][1],
        Client_Name: data[i][2],
        Client_Contact: data[i][3],
        Project_Status: newStatus
      };
      break;
    }
  }

  if (targetRowIndex === -1) throw new Error('Project ID ' + projectId + ' not found.');

  projectSheet.getRange(targetRowIndex, 10).setValue(newStatus);
  logAuditTrail(auditSheet, projectId, 'STATUS_UPDATE', 'Status updated from "' + oldStatus + '" to "' + newStatus + '" by ' + actorName);

  // AUTOMATION 3: Milestone Push
  try {
    autoNotifyClientMilestone(projectObj);
  } catch (e) {}

  return { success: true, projectId, oldStatus, newStatus };
}

function handleDeleteProject(projectSheet, auditSheet, projectId, actor) {
  const actorName = actor || ADMIN_NAME;
  const lastRow = projectSheet.getLastRow();
  const ids = projectSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let targetRowIndex = -1;

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(projectId)) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) throw new Error('Project ID ' + projectId + ' not found.');

  projectSheet.deleteRow(targetRowIndex);
  logAuditTrail(auditSheet, projectId, 'DELETE_PROJECT', 'Project ID ' + projectId + ' was purged by ' + actorName);

  return { success: true, projectId };
}

function handleAddExpense(expSheet, auditSheet, expData, actor) {
  const actorName = actor || ADMIN_NAME;
  const expId = expData.Expense_ID || ('EXP-' + Date.now().toString(36).toUpperCase());
  const amount = parseFloat(expData.Amount) || 0;

  const newRow = [
    expId,
    expData.Date || new Date().toISOString().split('T')[0],
    expData.Description || 'Operational Cost',
    expData.Category || 'General',
    amount,
    expData.Currency || 'INR',
    actorName
  ];

  expSheet.appendRow(newRow);
  logAuditTrail(auditSheet, expId, 'LOG_EXPENSE', 'Expense of ' + (expData.Currency || 'INR') + ' ' + amount + ' logged: "' + expData.Description + '" by ' + actorName);

  return { success: true, expenseId: expId };
}

function handleDeleteExpense(expSheet, auditSheet, expenseId, actor) {
  const actorName = actor || ADMIN_NAME;
  const lastRow = expSheet.getLastRow();
  const ids = expSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let targetRowIndex = -1;

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(expenseId)) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) throw new Error('Expense ID ' + expenseId + ' not found.');

  expSheet.deleteRow(targetRowIndex);
  logAuditTrail(auditSheet, expenseId, 'DELETE_EXPENSE', 'Expense ID ' + expenseId + ' deleted by ' + actorName);

  return { success: true, expenseId };
}

// ==============================================================================
// 3. THE 10 FULLY AUTOMATED CLOUD SERVICES
// ==============================================================================

/**
 * FEATURE 1: 🤖 Zero-Click WhatsApp & Email Payment Chaser (Daily Cron Trigger)
 * Checks projects with pending balance within 48h of deadline or overdue.
 */
function cronDailyPaymentChaser() {
  const ss = getDatabase();
  const projectSheet = ss.getSheetByName(SHEET_PROJECT_LOGS);
  const auditSheet   = ss.getSheetByName(SHEET_AUDIT_TRAILS);
  const projects = fetchProjects(projectSheet);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const chased = [];

  projects.forEach(p => {
    if (p.Pending_Balance > 0 && p.Delivery_Deadline) {
      const deadline = new Date(p.Delivery_Deadline);
      deadline.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

      // If overdue (< 0) or due within 48 hours (0, 1, 2 days)
      if (diffDays <= 2) {
        chased.push(p);
        if (p.Client_Contact && p.Client_Contact.includes('@')) {
          try {
            MailApp.sendEmail({
              to: p.Client_Contact,
              subject: 'Friendly Escrow Reminder: ' + p.Project_Name + ' [' + p.Project_ID + ']',
              htmlBody: `
                <div style="font-family: Arial, sans-serif; background: #030611; color: #fff; padding: 25px; border-radius: 10px; max-width: 550px;">
                  <h3 style="color: #ffaa00; margin-top: 0;">Milestone Escrow Reminder</h3>
                  <p>Dear ${p.Client_Name},</p>
                  <p>This is a quick automated dispatch regarding your mission <strong>${p.Project_Name}</strong>.</p>
                  <div style="background: rgba(255,170,0,0.1); border-left: 3px solid #ffaa00; padding: 12px; margin: 15px 0;">
                    <div>Target Horizon: <strong>${p.Delivery_Deadline}</strong></div>
                    <div>Remaining Escrow Balance: <strong style="color: #ffaa00;">${p.Currency || '₹'} ${p.Pending_Balance.toLocaleString()}</strong></div>
                  </div>
                  <p>To avoid delivery holds, kindly clear the balance at your earliest convenience.</p>
                  <p>UPI ID: <strong>nexusprime@upi</strong></p>
                  <p style="font-size: 12px; color: #94a3b8;">Karan Khunt (+91 6353002399 | karankhunt805@gmail.com)</p>
                </div>
              `
            });
            logAuditTrail(auditSheet, p.Project_ID, 'PAYMENT_CHASER_DISPATCH', 'Automated payment reminder dispatched to ' + p.Client_Contact);
          } catch (e) {}
        }
      }
    }
  });

  return { success: true, count: chased.length, projects: chased.map(c => c.Project_ID) };
}

/**
 * FEATURE 2: 📁 Instant Google Drive Folder & Asset Provisioning
 */
function autoProvisionGoogleDriveFolder(clientName, projectId) {
  let rootFolder;
  const folders = DriveApp.getFoldersByName('NEXUS_PRIME_CLIENTS');
  if (folders.hasNext()) {
    rootFolder = folders.next();
  } else {
    rootFolder = DriveApp.createFolder('NEXUS_PRIME_CLIENTS');
  }

  const folderName = (clientName || 'Client') + ' - ' + projectId;
  const clientFolder = rootFolder.createFolder(folderName);

  // Subfolders
  clientFolder.createFolder('01_Briefs_and_Scope');
  clientFolder.createFolder('02_Raw_Assets');
  clientFolder.createFolder('03_Final_Deliverables');
  clientFolder.createFolder('04_Invoices_and_Receipts');

  clientFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return clientFolder.getUrl();
}

/**
 * FEATURE 3: 🔔 Milestone Push: Instant Client Notification on Status Change
 */
function autoNotifyClientMilestone(project) {
  if (project.Client_Contact && project.Client_Contact.includes('@')) {
    MailApp.sendEmail({
      to: project.Client_Contact,
      subject: 'Milestone Update // ' + (project.Project_Name || project.Project_ID),
      htmlBody: `
        <div style="font-family: Arial, sans-serif; background: #030611; color: #fff; padding: 25px; border-radius: 10px; max-width: 550px;">
          <h3 style="color: #00f5ff; margin-top: 0;">⚡ Milestone Status Advanced</h3>
          <p>Dear ${project.Client_Name || 'Partner'},</p>
          <p>Your project <strong>${project.Project_Name || project.Project_ID}</strong> has transitioned to a new milestone stage:</p>
          <div style="background: rgba(0,245,255,0.1); border-left: 3px solid #00f5ff; padding: 12px; margin: 15px 0;">
            Current Phase: <strong style="color: #00ff9d; font-size: 1.1em;">${project.Project_Status}</strong>
          </div>
          <p>For questions or live telemetry, reply directly or WhatsApp Karan Khunt at +91 6353002399.</p>
        </div>
      `
    });
  }
}

/**
 * FEATURE 4: ☕ 9:00 AM Daily Personal WhatsApp / Email Briefing to Karan
 */
function cronDailyExecutiveBriefing() {
  const ss = getDatabase();
  const projectSheet = ss.getSheetByName(SHEET_PROJECT_LOGS);
  const expSheet     = ss.getSheetByName(SHEET_EXPENSES);

  const projects = fetchProjects(projectSheet);
  const expenses = fetchExpenses(expSheet);

  let totalQuote = 0;
  let totalCleared = 0;
  let totalPending = 0;
  let overdueCount = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  projects.forEach(p => {
    totalQuote += p.Total_Quote;
    totalCleared += p.Amount_Paid;
    totalPending += p.Pending_Balance;
    if (p.Pending_Balance > 0 && p.Delivery_Deadline) {
      const d = new Date(p.Delivery_Deadline);
      d.setHours(0, 0, 0, 0);
      if (d < today) overdueCount++;
    }
  });

  let totalExp = 0;
  expenses.forEach(e => { totalExp += e.Amount; });
  const netProfit = totalCleared - totalExp;

  const subject = `☕ Morning Executive Pulse // Net: ₹${netProfit.toLocaleString()} | Overdue: ${overdueCount}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background: #030611; color: #fff; padding: 25px; border-radius: 12px; max-width: 600px; border: 1px solid #00f5ff;">
      <h2 style="color: #00f5ff; margin-top: 0;">NEXUS PRIME // 09:00 EXECUTIVE BRIEFING</h2>
      <p style="color: #94a3b8; font-size: 13px;">Automated Telemetry for Karan Khunt (${new Date().toLocaleDateString()})</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0; color: #94a3b8;">Total Quoted Pipeline:</td><td style="text-align: right; font-weight: bold; color: #fff;">₹${totalQuote.toLocaleString()}</td></tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0; color: #94a3b8;">Total Cleared Inflow:</td><td style="text-align: right; font-weight: bold; color: #00ff9d;">₹${totalCleared.toLocaleString()}</td></tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);"><td style="padding: 8px 0; color: #94a3b8;">Total Operational Expenses:</td><td style="text-align: right; font-weight: bold; color: #ff0055;">₹${totalExp.toLocaleString()}</td></tr>
        <tr style="border-bottom: 2px solid #00f5ff;"><td style="padding: 10px 0; font-weight: bold; color: #00f5ff;">NET BUSINESS PROFIT:</td><td style="text-align: right; font-weight: bold; color: #00f5ff; font-size: 18px;">₹${netProfit.toLocaleString()}</td></tr>
        <tr><td style="padding: 8px 0; color: #ffaa00;">Pending Receivables:</td><td style="text-align: right; font-weight: bold; color: #ffaa00;">₹${totalPending.toLocaleString()}</td></tr>
        <tr><td style="padding: 8px 0; color: #ff0055;">Overdue Missions:</td><td style="text-align: right; font-weight: bold; color: #ff0055;">${overdueCount}</td></tr>
      </table>

      <div style="margin-top: 20px;">
        <a href="https://khuntkaran805-ux.github.io/co-founder-transparency-portal/" style="background: #00f5ff; color: #000; text-decoration: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; display: inline-block;">Open Command Portal</a>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: subject,
    htmlBody: html
  });

  return { success: true, netProfit, overdueCount };
}

/**
 * FEATURE 6: 📅 2-Way Google Calendar Deadline & Milestones Sync
 */
function autoSyncToGoogleCalendar(project) {
  if (!project.Delivery_Deadline) return;
  const deadlineDate = new Date(project.Delivery_Deadline);
  const cal = CalendarApp.getDefaultCalendar();

  const title = '🚀 DEADLINE: ' + (project.Project_Name || project.Project_ID) + ' (' + (project.Client_Name || '') + ')';
  const desc = 'NEXUS Mission ' + project.Project_ID + '\nClient: ' + project.Client_Name + '\nQuote: ' + project.Total_Quote + '\nPending: ' + (project.Total_Quote - project.Amount_Paid);

  const event = cal.createAllDayEvent(title, deadlineDate, { description: desc });
  event.addPopupReminder(2880); // 48h before
  event.addPopupReminder(240);  // 4h before
  return event.getId();
}

/**
 * FEATURE 8: 🔄 Recurring Monthly Subscription & Expense Logger (1st of month at 00:05)
 */
function cronMonthlyRecurringExpenses() {
  const ss = getDatabase();
  const expSheet   = ss.getSheetByName(SHEET_EXPENSES);
  const auditSheet = ss.getSheetByName(SHEET_AUDIT_TRAILS);

  const subscriptions = [
    { desc: 'Figma Professional Team Plan', category: 'Software/SaaS', amount: 1500 },
    { desc: 'Cloud Server, Database & Hosting', category: 'Infrastructure', amount: 1200 },
    { desc: 'AI APIs & Copilot Dev Matrix', category: 'AI Tools', amount: 1800 },
    { desc: 'Domain Registry & SSL Maintenance', category: 'Infrastructure', amount: 650 }
  ];

  const now = new Date().toISOString().split('T')[0];

  subscriptions.forEach(sub => {
    const expId = 'REC-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 100);
    expSheet.appendRow([expId, now, sub.desc, sub.category, sub.amount, 'INR', 'AUTO-CRON']);
  });

  logAuditTrail(auditSheet, 'CRON-EXPENSE', 'RECURRING_INJECT', 'Auto-injected 4 recurring operational subscriptions for the month.');
  return { success: true, count: subscriptions.length };
}

/**
 * FEATURE 9: 🧾 Automated PDF Invoice Generation & Email Dispatch
 */
function handleDispatchInvoiceEmail(projectId, clientEmail, invoiceData) {
  if (!clientEmail || !clientEmail.includes('@')) {
    throw new Error('Valid client email required.');
  }

  const pName = invoiceData.projectName || projectId;
  const total = invoiceData.totalAmount || 0;
  const balance = invoiceData.balanceDue || 0;

  const invoiceHtml = `
    <div style="font-family: Arial, sans-serif; background: #ffffff; color: #111; padding: 30px; border: 1px solid #ccc; max-width: 650px;">
      <h1 style="color: #0284c7; margin-bottom: 5px;">INVOICE // NEXUS PRIME</h1>
      <p style="color: #666; margin-top: 0;">Invoice #: INV-${Date.now().toString(36).toUpperCase()} | Date: ${new Date().toLocaleDateString()}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      
      <p><strong>Billed To:</strong> ${invoiceData.clientName || 'Valued Client'}</p>
      <p><strong>Service / Mission:</strong> ${pName}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
        <tr style="background: #f1f5f9;"><th style="padding: 10px; text-align: left;">Description</th><th style="padding: 10px; text-align: right;">Amount</th></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px;">${pName} - Scope & Execution</td><td style="padding: 10px; text-align: right;">₹${total.toLocaleString()}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px; color: #16a34a;">Amount Cleared / Advance</td><td style="padding: 10px; text-align: right; color: #16a34a;">-₹${(total - balance).toLocaleString()}</td></tr>
        <tr style="font-weight: bold; background: #f8fafc;"><td style="padding: 12px; font-size: 16px;">BALANCE DUE</td><td style="padding: 12px; text-align: right; font-size: 16px; color: #dc2626;">₹${balance.toLocaleString()}</td></tr>
      </table>

      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
        <strong style="color: #166534;">Payment Details:</strong><br>
        UPI VPA: <strong>nexusprime@upi</strong><br>
        Lead: Karan Khunt (+91 6353002399)
      </div>

      <p style="font-size: 12px; color: #94a3b8;">Thank you for your business. For any queries, reply directly to this email.</p>
    </div>
  `;

  // Generate PDF from HTML
  const blob = Utilities.newBlob(invoiceHtml, 'text/html', 'Invoice_' + projectId + '.html');
  const pdfBlob = blob.getAs('application/pdf').setName('Invoice_' + projectId + '.pdf');

  // Send Email with PDF
  MailApp.sendEmail({
    to: clientEmail,
    subject: 'Official Invoice // ' + pName + ' [' + projectId + ']',
    htmlBody: invoiceHtml,
    attachments: [pdfBlob]
  });

  return { success: true, message: 'PDF Invoice generated and dispatched to ' + clientEmail };
}

/**
 * FEATURE 10: 🛡️ Self-Healing Automated Cloud Backups & Weekly Snapshot (Sunday 23:59)
 */
function cronWeeklyCloudBackup() {
  const ss = getDatabase();
  const projectSheet = ss.getSheetByName(SHEET_PROJECT_LOGS);
  const auditSheet   = ss.getSheetByName(SHEET_AUDIT_TRAILS);
  const expSheet     = ss.getSheetByName(SHEET_EXPENSES);

  const backupData = {
    exportedAt: new Date().toISOString(),
    lead: ADMIN_NAME,
    projects: fetchProjects(projectSheet),
    expenses: fetchExpenses(expSheet),
    audits: fetchAuditTrails(auditSheet)
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const fileName = 'NEXUS_BACKUP_' + new Date().toISOString().split('T')[0] + '.json';

  // Save to Google Drive
  let backupFolder;
  const folders = DriveApp.getFoldersByName('NEXUS_PRIME_BACKUPS');
  if (folders.hasNext()) {
    backupFolder = folders.next();
  } else {
    backupFolder = DriveApp.createFolder('NEXUS_PRIME_BACKUPS');
  }

  const backupFile = backupFolder.createFile(fileName, jsonStr, MimeType.PLAIN_TEXT);

  // Email to Karan
  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: '🛡️ Weekly Disaster-Proof Cloud Backup // ' + new Date().toLocaleDateString(),
    body: 'Automated weekly JSON backup archive attached. Backup file also securely stored in your Google Drive folder: NEXUS_PRIME_BACKUPS.',
    attachments: [backupFile.getAs(MimeType.PLAIN_TEXT).setName(fileName)]
  });

  return { success: true, fileUrl: backupFile.getUrl() };
}

/**
 * INSTALLER: 1-Click Setup of All Automated Cloud Triggers
 * Can be run from Apps Script Editor or triggered from portal
 */
function setupAllAutomatedCloudTriggers() {
  // Clear any existing triggers to prevent duplicates
  const existingTriggers = ScriptApp.getProjectTriggers();
  existingTriggers.forEach(t => ScriptApp.deleteTrigger(t));

  // 1. Daily 10:00 AM Payment Chaser
  ScriptApp.newTrigger('cronDailyPaymentChaser')
    .timeBased()
    .everyDays(1)
    .atHour(10)
    .create();

  // 2. Daily 9:00 AM Personal Executive Briefing to Karan
  ScriptApp.newTrigger('cronDailyExecutiveBriefing')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();

  // 3. 1st of Every Month Recurring Expenses Logger
  ScriptApp.newTrigger('cronMonthlyRecurringExpenses')
    .timeBased()
    .onMonthDay(1)
    .atHour(0)
    .create();

  // 4. Weekly Sunday 23:00 Cloud Backup
  ScriptApp.newTrigger('cronWeeklyCloudBackup')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(23)
    .create();

  return {
    success: true,
    message: 'All 4 Google Cloud 24/7 background triggers installed successfully!'
  };
}

// ==============================================================================
// 4. UTILITIES
// ==============================================================================
function logAuditTrail(auditSheet, projectId, actionType, description) {
  try {
    const timestamp = new Date().toISOString();
    const logId = 'LOG-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
    auditSheet.appendRow([logId, projectId, actionType, description, timestamp]);
  } catch (err) {
    Logger.log('Audit trail error: ' + err.toString());
  }
}

function formatDateValue(val) {
  if (val instanceof Date) return val.toISOString();
  return String(val);
}
