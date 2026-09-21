/**
 * ==============================================================================
 * BUSINESS TRANSPARENCY & MANAGEMENT PORTAL - GOOGLE APPS SCRIPT BACKEND
 * ==============================================================================
 * Database: Google Spreadsheet titled 'Business_Transparency_DB'
 * Sheets:
 *   1. 'Project_Logs': (A1:N1)
 *      Project_ID, Project_Name, Client_Name, Client_Contact, Category,
 *      Total_Quote, Amount_Paid, Pending_Balance, Payment_Status,
 *      Project_Status, Delivery_Deadline, Creation_Timestamp, Logged_By, Internal_Notes
 *   2. 'Audit_Trails': (A1:E1)
 *      Log_ID, Project_ID, Action_Type, Change_Description, Timestamp
 *
 * Architecture: Jamstack Serverless RESTful API Proxy (CORS-enabled JSON)
 * Perpetual Cost: ₹0 ($0)
 * ==============================================================================
 */

const SHEET_PROJECT_LOGS = 'Project_Logs';
const SHEET_AUDIT_TRAILS = 'Audit_Trails';

/**
 * Returns active spreadsheet or opens by ID/creates if needed
 */
function getDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss;
}

/**
 * Initial setup utility to create tabs and standard headers if they don't exist.
 * Can be run manually from Apps Script Editor or triggered via API action 'INIT_DATABASE'.
 */
function setupDatabase() {
  const ss = getDatabase();
  
  // 1. Setup Project_Logs
  let projectSheet = ss.getSheetByName(SHEET_PROJECT_LOGS);
  if (!projectSheet) {
    projectSheet = ss.insertSheet(SHEET_PROJECT_LOGS);
  }
  
  const projectHeaders = [
    'Project_ID',
    'Project_Name',
    'Client_Name',
    'Client_Contact',
    'Category',
    'Total_Quote',
    'Amount_Paid',
    'Pending_Balance',
    'Payment_Status',
    'Project_Status',
    'Delivery_Deadline',
    'Creation_Timestamp',
    'Logged_By',
    'Internal_Notes'
  ];
  
  if (projectSheet.getLastRow() === 0) {
    projectSheet.getRange(1, 1, 1, projectHeaders.length).setValues([projectHeaders]);
    projectSheet.getRange(1, 1, 1, projectHeaders.length)
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    projectSheet.setFrozenRows(1);
  }

  // 2. Setup Audit_Trails
  let auditSheet = ss.getSheetByName(SHEET_AUDIT_TRAILS);
  if (!auditSheet) {
    auditSheet = ss.insertSheet(SHEET_AUDIT_TRAILS);
  }
  
  const auditHeaders = [
    'Log_ID',
    'Project_ID',
    'Action_Type',
    'Change_Description',
    'Timestamp'
  ];
  
  if (auditSheet.getLastRow() === 0) {
    auditSheet.getRange(1, 1, 1, auditHeaders.length).setValues([auditHeaders]);
    auditSheet.getRange(1, 1, 1, auditHeaders.length)
      .setFontWeight('bold')
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    auditSheet.setFrozenRows(1);
  }

  return { status: 'success', message: 'Database initialized successfully with tabs and headers.' };
}

/**
 * Helper to build standard JSON response with proper CORS headers
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles HTTP GET requests - Fetches structured JSON data for projects and audit trails
 */
function doGet(e) {
  try {
    const ss = getDatabase();
    ensureTabsExist(ss);

    const projectSheet = ss.getSheetByName(SHEET_PROJECT_LOGS);
    const auditSheet = ss.getSheetByName(SHEET_AUDIT_TRAILS);

    const projects = fetchProjects(projectSheet);
    const auditTrails = fetchAuditTrails(auditSheet);

    return jsonResponse({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        projects: projects,
        auditTrails: auditTrails
      }
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err.toString(),
      stack: err.stack
    });
  }
}

/**
 * Handles HTTP POST requests - Processes CRUD and Quick actions
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
    const auditSheet = ss.getSheetByName(SHEET_AUDIT_TRAILS);

    let result = null;

    switch (action) {
      case 'INIT_DATABASE':
        result = setupDatabase();
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

      default:
        throw new Error('Unknown or missing action: ' + action);
    }

    return jsonResponse({
      status: 'success',
      action: action,
      result: result
    });

  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

/**
 * Make sure required tabs exist
 */
function ensureTabsExist(ss) {
  if (!ss.getSheetByName(SHEET_PROJECT_LOGS) || !ss.getSheetByName(SHEET_AUDIT_TRAILS)) {
    setupDatabase();
  }
}

/**
 * Fetch all projects from Project_Logs tab
 */
function fetchProjects(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, 14).getValues();
  const projects = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty project ID

    const totalQuote = Number(row[5]) || 0;
    const amountPaid = Number(row[6]) || 0;
    const pendingBalance = totalQuote - amountPaid;

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
      Logged_By: String(row[12] || 'Partner A (Operations Lead)'),
      Internal_Notes: String(row[13] || '')
    });
  }

  return projects;
}

/**
 * Fetch all audit logs from Audit_Trails tab
 */
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

  // Return sorted newest first
  return logs.reverse();
}

/**
 * Create a new project row and audit log entry
 */
function handleCreateProject(projectSheet, auditSheet, projectData, actor) {
  if (!projectData || !projectData.Project_ID) {
    throw new Error('Invalid project data. Project_ID is required.');
  }

  const nowStr = new Date().toISOString();
  const actorName = actor || 'Partner A (Operations Lead)';
  const totalQuote = Number(projectData.Total_Quote) || 0;
  const amountPaid = Number(projectData.Amount_Paid) || 0;
  const rowNumber = projectSheet.getLastRow() + 1;

  // Pending balance formula `=F{row}-G{row}`
  const balanceFormula = '=F' + rowNumber + '-G' + rowNumber;

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
    projectData.Internal_Notes || ''
  ];

  projectSheet.appendRow(newRow);

  // Write audit trail
  logAuditTrail(
    auditSheet,
    projectData.Project_ID,
    'CREATE_PROJECT',
    'Project "' + (projectData.Project_Name || projectData.Project_ID) + '" created by ' + actorName + ' with Quote ₹' + totalQuote + ' (Paid ₹' + amountPaid + ').'
  );

  return {
    success: true,
    projectId: projectData.Project_ID,
    message: 'Project created successfully.'
  };
}

/**
 * Update an existing project
 */
function handleUpdateProject(projectSheet, auditSheet, projectData, actor) {
  if (!projectData || !projectData.Project_ID) {
    throw new Error('Invalid project data. Project_ID is required for update.');
  }

  const actorName = actor || 'Partner A (Operations Lead)';
  const lastRow = projectSheet.getLastRow();
  if (lastRow <= 1) throw new Error('No projects found to update.');

  const ids = projectSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let targetRowIndex = -1;

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(projectData.Project_ID)) {
      targetRowIndex = i + 2; // +2 for 1-based index and skipping header
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error('Project ID ' + projectData.Project_ID + ' not found in sheet.');
  }

  const totalQuote = Number(projectData.Total_Quote) || 0;
  const amountPaid = Number(projectData.Amount_Paid) || 0;
  const balanceFormula = '=F' + targetRowIndex + '-G' + targetRowIndex;

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
    projectData.Internal_Notes || ''
  ];

  projectSheet.getRange(targetRowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);

  // Log audit trail
  logAuditTrail(
    auditSheet,
    projectData.Project_ID,
    'UPDATE_PROJECT',
    'Project updated by ' + actorName + '. Status: ' + projectData.Project_Status + ', Quoted: ₹' + totalQuote + ', Paid: ₹' + amountPaid + '.'
  );

  return {
    success: true,
    projectId: projectData.Project_ID,
    message: 'Project updated successfully.'
  };
}

/**
 * Handle quick payment clearance modal action
 */
function handleQuickPayment(projectSheet, auditSheet, projectId, paymentAmount, paymentChannel, actor) {
  const actorName = actor || 'Partner A (Operations Lead)';
  const paymentNum = Number(paymentAmount);
  if (!projectId || isNaN(paymentNum) || paymentNum <= 0) {
    throw new Error('Valid Project ID and positive payment amount are required.');
  }

  const lastRow = projectSheet.getLastRow();
  const data = projectSheet.getRange(2, 1, lastRow - 1, 10).getValues();
  let targetRowIndex = -1;
  let currentQuote = 0;
  let currentPaid = 0;

  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(projectId)) {
      targetRowIndex = i + 2;
      currentQuote = Number(data[i][5]) || 0;
      currentPaid = Number(data[i][6]) || 0;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error('Project ID ' + projectId + ' not found.');
  }

  const newPaid = currentPaid + paymentNum;
  const newPaymentStatus = newPaid >= currentQuote ? 'Fully Paid' : 'Partial Advance';

  // Update Amount_Paid and Payment_Status
  projectSheet.getRange(targetRowIndex, 7).setValue(newPaid);
  projectSheet.getRange(targetRowIndex, 9).setValue(newPaymentStatus);

  const channelDesc = paymentChannel ? ' via ' + paymentChannel : '';
  const desc = 'Cleared balance payment of ₹' + paymentNum + channelDesc + ' by ' + actorName + '. New total paid: ₹' + newPaid + ' / ₹' + currentQuote + ' (' + newPaymentStatus + ').';

  logAuditTrail(auditSheet, projectId, 'QUICK_PAYMENT', desc);

  return {
    success: true,
    projectId: projectId,
    newPaid: newPaid,
    newPaymentStatus: newPaymentStatus,
    message: 'Payment recorded successfully.'
  };
}

/**
 * Handle quick status dropdown update in table row
 */
function handleQuickStatus(projectSheet, auditSheet, projectId, newStatus, actor) {
  const actorName = actor || 'Partner A (Operations Lead)';
  if (!projectId || !newStatus) {
    throw new Error('Project ID and new status are required.');
  }

  const lastRow = projectSheet.getLastRow();
  const ids = projectSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let targetRowIndex = -1;

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(projectId)) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error('Project ID ' + projectId + ' not found.');
  }

  const oldStatus = projectSheet.getRange(targetRowIndex, 10).getValue();
  projectSheet.getRange(targetRowIndex, 10).setValue(newStatus);

  logAuditTrail(
    auditSheet,
    projectId,
    'STATUS_UPDATE',
    'Status changed from "' + oldStatus + '" to "' + newStatus + '" by ' + actorName + '.'
  );

  return {
    success: true,
    projectId: projectId,
    oldStatus: oldStatus,
    newStatus: newStatus
  };
}

/**
 * Handle deleting a project
 */
function handleDeleteProject(projectSheet, auditSheet, projectId, actor) {
  const actorName = actor || 'Partner B (Auditor/Executive)';
  if (!projectId) throw new Error('Project ID is required.');

  const lastRow = projectSheet.getLastRow();
  const ids = projectSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let targetRowIndex = -1;

  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(projectId)) {
      targetRowIndex = i + 2;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error('Project ID ' + projectId + ' not found.');
  }

  projectSheet.deleteRow(targetRowIndex);

  logAuditTrail(
    auditSheet,
    projectId,
    'DELETE_PROJECT',
    'Project ID ' + projectId + ' was deleted by ' + actorName + '.'
  );

  return {
    success: true,
    projectId: projectId,
    message: 'Project deleted successfully.'
  };
}

/**
 * Append entry to Audit_Trails
 */
function logAuditTrail(auditSheet, projectId, actionType, description) {
  try {
    const timestamp = new Date().toISOString();
    const logId = 'LOG-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
    auditSheet.appendRow([logId, projectId, actionType, description, timestamp]);
  } catch (err) {
    Logger.log('Error logging audit trail: ' + err.toString());
  }
}

/**
 * Formats dates safely to ISO strings
 */
function formatDateValue(val) {
  if (val instanceof Date) {
    return val.toISOString();
  }
  return String(val);
}
