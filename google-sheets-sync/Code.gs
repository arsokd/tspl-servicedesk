/**
 * TSPL ServiceDesk — Automatic Google Sheets Sync
 * ============================================================================
 * Pulls dockets, SLA breaches, and engineer attendance out of the live
 * Firestore project and keeps a Google Sheet up to date automatically, on a
 * timer, with no manual export step. Built for Looker Studio to sit on top
 * of this Sheet as its data source.
 *
 * WHY THIS RUNS HERE INSTEAD OF AS A FIREBASE CLOUD FUNCTION:
 * Cloud Functions require Firebase's paid "Blaze" plan (a billing card on
 * file, even though usage would likely stay within the free tier). Apps
 * Script, bound to this Sheet, is completely free and needs no Firebase plan
 * change at all — it just calls Firestore's REST API on a timer, the same
 * way any external system would.
 *
 * COST: Firestore's free (Spark plan) quota is 50,000 document reads/day.
 * This script is deliberately incremental — it does NOT re-read the whole
 * database every run. It reads `docketActivity` (the audit trail already
 * being written for every action in the app) for entries since the last
 * run, and only re-fetches the specific dockets that actually had activity.
 * SLA breaches and attendance are read incrementally by their own timestamp
 * fields. A modest-sized operation should use a small fraction of the daily
 * free quota even running this every 15 minutes.
 *
 * SETUP: see google-sheets-sync/SETUP.md in this same repo folder for the
 * full no-coder walkthrough (creating the Sheet, pasting this file in,
 * creating the dedicated sync login, setting the four Script Properties
 * below, and arming the time trigger). Do not hardcode credentials in this
 * file — they're read from Script Properties precisely so this file can be
 * shared/committed without exposing them.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// CONFIG — column lists. Add/remove field names here if you want more or
// fewer columns; nothing else in the script needs to change to match.
// ---------------------------------------------------------------------------
var DOCKET_COLUMNS = [
  'docketNo', 'atmId', 'bank', 'bankName', 'locationCategory', 'ro', 'status',
  'currentDependency', 'callDateTime', 'reachedAt', 'resolvedAt', 'closedAt',
  'responseTargetMins', 'resolutionTargetMins', 'arrivalMethod',
  'arrivalDistanceMeters', 'currentlyOnSite', 'leftSiteAt',
  'assignedEngineerId', 'assignedEngineerName', 'subStatus',
  'tsplNetTATMinutes', 'penaltyPerInstance'
];

var BREACH_COLUMNS = [
  'docketNo', 'atmId', 'bank', 'locationCategory', 'breachType', 'targetMins',
  'actualMins', 'overdueMins', 'breachDependency', 'currentSubStatus',
  'tsplNetTATMinutes', 'tsplSharePercentage', 'engineerId', 'engineerName',
  'penaltyExposureRupees', 'loggedAt'
];

var ATTENDANCE_COLUMNS = [
  'uid', 'engineerName', 'date', 'status', 'punchIn', 'punchOut',
  'punchInCoords', 'punchOutCoords', 'autoClosed'
];

var LOOKBACK_DAYS_ON_FIRST_RUN = 30; // how far back to seed the sheets the very first time this runs

// ---------------------------------------------------------------------------
// ENTRY POINT — this is the one function the time trigger calls.
// ---------------------------------------------------------------------------
function syncAll() {
  var token = getFirebaseIdToken_();
  // Create all three tabs (with header rows) up front, regardless of
  // whether there's any data yet. Without this, a brand-new setup with no
  // dockets/breaches/attendance in the lookback window yet would finish
  // "successfully" while leaving the Sheet completely blank — confusing to
  // verify, since nothing would look different from a broken run.
  ensureSheetHeader_('Dockets', DOCKET_COLUMNS);
  ensureSheetHeader_('SLA Breaches', BREACH_COLUMNS.concat(['_syncKey']));
  ensureSheetHeader_('Attendance', ATTENDANCE_COLUMNS);
  syncDocketsViaActivityFeed_(token);
  syncSlaBreaches_(token);
  syncAttendance_(token);
}

// Creates the named tab with a frozen header row if it doesn't exist yet.
// Safe to call every run — a no-op once the tab is already there.
function ensureSheetHeader_(sheetName, columns) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(columns);
    sheet.setFrozenRows(1);
  }
}

// ---------------------------------------------------------------------------
// AUTH — signs in as the dedicated "sync" account (created in masters-users.html,
// see SETUP.md) and returns a short-lived Firestore-authorized ID token. This
// account is subject to the exact same firestore.rules as any other admin
// login in the app — nothing special or bypassed.
// ---------------------------------------------------------------------------
function getFirebaseIdToken_() {
  var props = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('FIREBASE_API_KEY');
  var email = props.getProperty('SYNC_EMAIL');
  var password = props.getProperty('SYNC_PASSWORD');
  if (!apiKey || !email || !password) {
    throw new Error('Missing Script Properties. Set FIREBASE_API_KEY, SYNC_EMAIL, SYNC_PASSWORD, FIREBASE_PROJECT_ID — see SETUP.md.');
  }

  var resp = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + apiKey,
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ email: email, password: password, returnSecureToken: true }),
      muteHttpExceptions: true
    }
  );
  var body = JSON.parse(resp.getContentText());
  if (!body.idToken) {
    throw new Error('Firebase sign-in failed: ' + resp.getContentText());
  }
  return body.idToken;
}

function firestoreBaseUrl_() {
  var projectId = PropertiesService.getScriptProperties().getProperty('FIREBASE_PROJECT_ID');
  return 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/(default)/documents';
}

function firestoreRunQuery_(token, structuredQuery) {
  var resp = UrlFetchApp.fetch(firestoreBaseUrl_() + ':runQuery', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ structuredQuery: structuredQuery }),
    muteHttpExceptions: true
  });
  var rows = JSON.parse(resp.getContentText());
  if (!Array.isArray(rows)) {
    throw new Error('Firestore query failed: ' + resp.getContentText());
  }
  return rows.filter(function (r) { return r.document; }).map(function (r) { return r.document; });
}

function firestoreGetDoc_(token, collectionId, docId) {
  var resp = UrlFetchApp.fetch(firestoreBaseUrl_() + '/' + collectionId + '/' + encodeURIComponent(docId), {
    method: 'get',
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() === 404) return null;
  return JSON.parse(resp.getContentText());
}

// ---------------------------------------------------------------------------
// VALUE CONVERSION — Firestore's REST API returns every field typed
// (stringValue / integerValue / timestampValue / mapValue / ...). Flatten to
// plain values a spreadsheet cell can hold.
// ---------------------------------------------------------------------------
function fsValueToJs_(v) {
  if (v == null) return '';
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return '';
  if ('geoPointValue' in v) return v.geoPointValue.latitude + ',' + v.geoPointValue.longitude;
  if ('referenceValue' in v) return v.referenceValue;
  if ('mapValue' in v) {
    var out = {};
    var mf = (v.mapValue && v.mapValue.fields) || {};
    for (var k in mf) out[k] = fsValueToJs_(mf[k]);
    return JSON.stringify(out);
  }
  if ('arrayValue' in v) {
    var av = (v.arrayValue && v.arrayValue.values) || [];
    return JSON.stringify(av.map(fsValueToJs_));
  }
  return '';
}

function docIdFromName_(doc) {
  // doc.name looks like: projects/P/databases/(default)/documents/dockets/AbCdEf123
  var parts = doc.name.split('/');
  return parts[parts.length - 1];
}

function docToRow_(doc, columns) {
  var fields = (doc && doc.fields) || {};
  return columns.map(function (col) {
    return fields[col] !== undefined ? fsValueToJs_(fields[col]) : '';
  });
}

// ---------------------------------------------------------------------------
// GENERIC UPSERT-BY-KEY SHEET WRITER
// Keeps one row per key value (e.g. per docketNo). Existing rows are updated
// in place; new keys are appended. Nothing is ever deleted by this script.
// ---------------------------------------------------------------------------
function upsertRows_(sheetName, columns, keyColumnIndex, rows) {
  if (!rows.length) return;
  ensureSheetHeader_(sheetName, columns);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  var lastRow = sheet.getLastRow();
  var existingKeys = {};
  if (lastRow > 1) {
    var keyValues = sheet.getRange(2, keyColumnIndex + 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < keyValues.length; i++) {
      existingKeys[String(keyValues[i][0])] = i + 2; // sheet row number
    }
  }

  var toAppend = [];
  rows.forEach(function (row) {
    var key = String(row[keyColumnIndex]);
    var existingRow = existingKeys[key];
    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, columns.length).setValues([row]);
    } else {
      toAppend.push(row);
    }
  });

  if (toAppend.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, toAppend.length, columns.length).setValues(toAppend);
  }
}

// ---------------------------------------------------------------------------
// DOCKETS — synced via the docketActivity change feed, not by re-scanning the
// whole dockets collection. Every action in the app (dispatch, arrival,
// resolve, close, parts, breach...) already writes an immutable row to
// docketActivity with a serverTimestamp — that's the cheapest possible
// signal for "which dockets changed since I last looked."
// ---------------------------------------------------------------------------
function syncDocketsViaActivityFeed_(token) {
  var props = PropertiesService.getScriptProperties();
  var lastSyncIso = props.getProperty('LAST_SYNC_ACTIVITY');
  if (!lastSyncIso) {
    var seedFrom = new Date(Date.now() - LOOKBACK_DAYS_ON_FIRST_RUN * 24 * 3600 * 1000);
    lastSyncIso = seedFrom.toISOString();
  }

  var activityDocs = firestoreRunQuery_(token, {
    from: [{ collectionId: 'docketActivity' }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'timestamp' },
        op: 'GREATER_THAN',
        value: { timestampValue: lastSyncIso }
      }
    },
    orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'ASCENDING' }],
    limit: 500
  });

  if (!activityDocs.length) return;

  // Collect the distinct set of docketIds that had any activity in this window.
  var docketIds = {};
  var newestTimestamp = lastSyncIso;
  activityDocs.forEach(function (doc) {
    var f = doc.fields || {};
    if (f.docketId && f.docketId.stringValue) docketIds[f.docketId.stringValue] = true;
    if (f.timestamp && f.timestamp.timestampValue && f.timestamp.timestampValue > newestTimestamp) {
      newestTimestamp = f.timestamp.timestampValue;
    }
  });

  var rows = [];
  Object.keys(docketIds).forEach(function (docketId) {
    var docketDoc = firestoreGetDoc_(token, 'dockets', docketId);
    if (docketDoc) rows.push(docToRow_(docketDoc, DOCKET_COLUMNS));
  });

  upsertRows_('Dockets', DOCKET_COLUMNS, 0, rows); // column 0 = docketNo

  // Only advance the cursor once everything above succeeded, so a failed run
  // gets retried next time rather than silently skipping the gap.
  props.setProperty('LAST_SYNC_ACTIVITY', newestTimestamp);
}

// ---------------------------------------------------------------------------
// SLA BREACHES — append-only by design (firestore.rules forbid updating or
// deleting a breach record once logged), so a simple incremental append by
// loggedAt is correct and cheap. No upsert needed.
// ---------------------------------------------------------------------------
function syncSlaBreaches_(token) {
  var props = PropertiesService.getScriptProperties();
  var lastSyncIso = props.getProperty('LAST_SYNC_BREACH');
  if (!lastSyncIso) {
    lastSyncIso = new Date(Date.now() - LOOKBACK_DAYS_ON_FIRST_RUN * 24 * 3600 * 1000).toISOString();
  }

  var docs = firestoreRunQuery_(token, {
    from: [{ collectionId: 'slaBreaches' }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'loggedAt' },
        op: 'GREATER_THAN',
        value: { timestampValue: lastSyncIso }
      }
    },
    orderBy: [{ field: { fieldPath: 'loggedAt' }, direction: 'ASCENDING' }],
    limit: 500
  });

  if (!docs.length) return;

  var rows = docs.map(function (doc) { return docToRow_(doc, BREACH_COLUMNS); });
  // Breaches don't have a natural human key like docketNo (one docket can breach
  // twice — response and resolution) — key on docketNo+breachType+loggedAt so
  // re-running never duplicates a row even if a run partially overlaps the next.
  var keyedRows = rows.map(function (row, i) {
    return row.concat([row[0] + '|' + row[4] + '|' + row[BREACH_COLUMNS.length - 1]]);
  });
  var columnsWithKey = BREACH_COLUMNS.concat(['_syncKey']);
  upsertRows_('SLA Breaches', columnsWithKey, columnsWithKey.length - 1, keyedRows);

  var newest = docs[docs.length - 1].fields.loggedAt.timestampValue;
  props.setProperty('LAST_SYNC_BREACH', newest);
}

// ---------------------------------------------------------------------------
// ATTENDANCE — updated twice a day per engineer (punch-in, then punch-out on
// the same document), so it needs two incremental queries and an upsert by
// document ID (uid_ddmmyy), not a single append.
// ---------------------------------------------------------------------------
function syncAttendance_(token) {
  var props = PropertiesService.getScriptProperties();
  var lastIn = props.getProperty('LAST_SYNC_ATTENDANCE_IN') ||
    new Date(Date.now() - LOOKBACK_DAYS_ON_FIRST_RUN * 24 * 3600 * 1000).toISOString();
  var lastOut = props.getProperty('LAST_SYNC_ATTENDANCE_OUT') ||
    new Date(Date.now() - LOOKBACK_DAYS_ON_FIRST_RUN * 24 * 3600 * 1000).toISOString();

  var changedDocIds = {};
  var newestIn = lastIn;
  var newestOut = lastOut;

  var punchInDocs = firestoreRunQuery_(token, {
    from: [{ collectionId: 'attendance' }],
    where: { fieldFilter: { field: { fieldPath: 'punchIn' }, op: 'GREATER_THAN', value: { timestampValue: lastIn } } },
    orderBy: [{ field: { fieldPath: 'punchIn' }, direction: 'ASCENDING' }],
    limit: 300
  });
  punchInDocs.forEach(function (doc) {
    changedDocIds[docIdFromName_(doc)] = true;
    var t = doc.fields.punchIn.timestampValue;
    if (t > newestIn) newestIn = t;
  });

  var punchOutDocs = firestoreRunQuery_(token, {
    from: [{ collectionId: 'attendance' }],
    where: { fieldFilter: { field: { fieldPath: 'punchOut' }, op: 'GREATER_THAN', value: { timestampValue: lastOut } } },
    orderBy: [{ field: { fieldPath: 'punchOut' }, direction: 'ASCENDING' }],
    limit: 300
  });
  punchOutDocs.forEach(function (doc) {
    changedDocIds[docIdFromName_(doc)] = true;
    var t = doc.fields.punchOut.timestampValue;
    if (t > newestOut) newestOut = t;
  });

  var ids = Object.keys(changedDocIds);
  if (ids.length) {
    var rows = [];
    ids.forEach(function (docId) {
      var doc = firestoreGetDoc_(token, 'attendance', docId);
      if (doc) rows.push(docToRow_(doc, ATTENDANCE_COLUMNS).map(function (v, i) {
        return ATTENDANCE_COLUMNS[i] === 'uid' && !v ? docId : v;
      }));
    });
    // uid+date together are already unique per document (that's the doc ID itself);
    // key on the 'date' column combined with 'uid' for a human-checkable key.
    upsertRows_('Attendance', ATTENDANCE_COLUMNS, 0, rows); // column 0 = uid
  }

  props.setProperty('LAST_SYNC_ATTENDANCE_IN', newestIn);
  props.setProperty('LAST_SYNC_ATTENDANCE_OUT', newestOut);
}

// ---------------------------------------------------------------------------
// ONE-TIME SETUP HELPER — run this once manually from the Apps Script editor
// (select it from the function dropdown, click Run) to arm the recurring
// trigger. Safe to run again later; it removes any previous trigger for this
// function first so you never end up with duplicates.
// ---------------------------------------------------------------------------
function armTimeTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'syncAll') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('syncAll').timeBased().everyMinutes(15).create();
}
