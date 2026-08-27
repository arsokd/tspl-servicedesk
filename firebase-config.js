// ============================================================================
// TSPL ServiceDesk — Firebase & Core Infrastructure Configuration
// ============================================================================
// 1. Firebase Configuration Keys
// Obtain these values from Firebase Console:
//   -> https://console.firebase.google.com
//   -> Select Project -> Gear Icon (Project Settings) -> Your apps -> Web app ("</>")
// 
// Realtime Database URL:
//   -> Firebase Console -> Build -> Realtime Database.
//   -> Enable Realtime Database separately from Firestore.
// 
// MapTiler API Key:
//   -> Sign up / generate key at https://www.maptiler.com
// ============================================================================

var firebaseConfig = {
  apiKey: "AIzaSyBaXWUf_F0LbuwmxNEGCtWKR5XJC2HTaUQ",
  authDomain: "tspl-servicedesk.firebaseapp.com",
  databaseURL: "https://tspl-servicedesk-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tspl-servicedesk",
  storageBucket: "tspl-servicedesk.firebasestorage.app",
  messagingSenderId: "576837116834",
  appId: "1:576837116834:web:9f720c651eae1019fb08fb"
};

var MAPTILER_KEY = "PASTE-YOUR-MAPTILER-KEY-HERE";

// Initialize Firebase SDK (Compat 10.7.1)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

var db = firebase.firestore();
var auth = firebase.auth();
var storage = firebase.storage();
var rtdb = firebase.database();

// Enable offline persistence for Firestore
db.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
  if (err.code === 'failed-precondition') {
    console.warn('[TSPL] Multi-tab persistence failed: Multiple tabs open simultaneously.');
  } else if (err.code === 'unimplemented') {
    console.warn('[TSPL] Persistence is not supported by this browser environment.');
  }
});

// ============================================================================
// SECTION 4: FORMATTING & UI HELPERS
// ============================================================================

function padZero(n) {
  return n < 10 ? '0' + n : '' + n;
}

/**
 * Formats a Date object or ISO string to DD/MM/YYYY HH:MM:SS
 */
function fmtDateTime(d) {
  if (!d) return '--';
  var date = d instanceof Date ? d : (d.toDate ? d.toDate() : new Date(d));
  if (isNaN(date.getTime())) return '--';
  return (
    padZero(date.getDate()) + '/' +
    padZero(date.getMonth() + 1) + '/' +
    date.getFullYear() + ' ' +
    padZero(date.getHours()) + ':' +
    padZero(date.getMinutes()) + ':' +
    padZero(date.getSeconds())
  );
}

/**
 * Formats a Date object or ISO string to DD/MM/YYYY
 */
function fmtDate(d) {
  if (!d) return '--';
  var date = d instanceof Date ? d : (d.toDate ? d.toDate() : new Date(d));
  if (isNaN(date.getTime())) return '--';
  return (
    padZero(date.getDate()) + '/' +
    padZero(date.getMonth() + 1) + '/' +
    date.getFullYear()
  );
}

/**
 * Returns date stamp formatted as DDMMYY for counter & GPS trail doc IDs
 */
function fmtDDMMYY(d) {
  var date = d || new Date();
  var dd = padZero(date.getDate());
  var mm = padZero(date.getMonth() + 1);
  var yy = String(date.getFullYear()).slice(-2);
  return dd + mm + yy;
}

/**
 * Formats currency in Indian Rupee format (e.g. Rs. 1,25,000)
 */
function fmtRupees(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Rs. 0';
  var val = Math.round(Number(num));
  var sign = val < 0 ? '-' : '';
  val = Math.abs(val);
  var str = val.toString();
  var lastThree = str.substring(str.length - 3);
  var otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return sign + 'Rs. ' + res;
}

/**
 * Minutes elapsed between two dates
 */
function minsBetween(start, end) {
  if (!start) return 0;
  var s = start instanceof Date ? start : (start.toDate ? start.toDate() : new Date(start));
  var e = end ? (end instanceof Date ? end : (end.toDate ? end.toDate() : new Date(end))) : new Date();
  var diffMs = e.getTime() - s.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
}

/**
 * Formats duration from minutes into human-readable string (e.g., 2h 15m)
 */
function fmtDuration(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) return '--';
  var mins = Math.max(0, Math.floor(totalMinutes));
  var hrs = Math.floor(mins / 60);
  var remMins = mins % 60;
  if (hrs === 0) return remMins + 'm';
  return hrs + 'h ' + padZero(remMins) + 'm';
}

/**
 * Computes hours elapsed from call date time to now or closure
 */
function ageingHours(callDateTime, closedAt) {
  if (!callDateTime) return 0;
  var start = callDateTime instanceof Date ? callDateTime : (callDateTime.toDate ? callDateTime.toDate() : new Date(callDateTime));
  var end = closedAt ? (closedAt instanceof Date ? closedAt : (closedAt.toDate ? closedAt.toDate() : new Date(closedAt))) : new Date();
  var diffMs = end.getTime() - start.getTime();
  return Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(1)));
}

/**
 * Exact 14-band Ageing Bucket in Hours
 */
function ageingBucketHours(hours) {
  var h = Number(hours) || 0;
  if (h < 24) return 'a) < 24 hrs';
  if (h < 48) return 'b) 24-48 hrs';
  if (h < 72) return 'c) 48-72 hrs';
  if (h < 96) return 'd) 72-96 hrs';
  if (h < 120) return 'e) 96-120 hrs';
  if (h < 150) return 'f) 120-150 hrs';
  if (h < 200) return 'g) 150-200 hrs';
  if (h < 300) return 'h) 200-300 hrs';
  if (h < 400) return 'i) 300-400 hrs';
  if (h < 500) return 'j) 400-500 hrs';
  if (h < 600) return 'k) 500-600 hrs';
  if (h < 700) return 'l) 600-700 hrs';
  if (h <= 1000) return 'm) 700-1000 hrs';
  return 'n) > 1000 hrs';
}

/**
 * Exact 7-band Ageing Bucket in Days
 */
function ageingBucketDays(hours) {
  var days = (Number(hours) || 0) / 24;
  if (days <= 2) return 'a) 0-2days';
  if (days <= 4) return 'b) 3-4days';
  if (days <= 6) return 'c) 5-6days';
  if (days <= 7) return 'd) 7days';
  if (days <= 10) return 'e) 8-10days';
  if (days <= 14) return 'f) 11-14days';
  return 'g) >14days';
}

/**
 * Global Non-intrusive Toast Notification
 */
function toast(msg, type) {
  var container = document.getElementById('tspl-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'tspl-toast-container';
    container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  var bg = '#4F46E5'; // default indigo
  if (type === 'success') bg = '#16A34A'; // green
  if (type === 'error') bg = '#DC2626'; // red
  if (type === 'warn') bg = '#D97706'; // amber

  var el = document.createElement('div');
  el.className = 'pointer-events-auto px-4 py-3 text-white text-sm font-medium rounded-md shadow-lg transition-all duration-300 transform translate-y-2 opacity-0 flex items-center gap-2';
  el.style.backgroundColor = bg;
  el.textContent = msg;

  container.appendChild(el);
  requestAnimationFrame(function () {
    el.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(function () {
    el.classList.add('opacity-0', 'translate-y-2');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }, 4000);
}

/**
 * Button spinner and disabling helpers
 */
function showLoader(btnEl, customText) {
  if (!btnEl) return;
  btnEl.disabled = true;
  btnEl.dataset.originalText = btnEl.innerHTML;
  var text = customText || 'Processing...';
  btnEl.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> ' + text;
}

function hideLoader(btnEl) {
  if (!btnEl) return;
  btnEl.disabled = false;
  if (btnEl.dataset.originalText) {
    btnEl.innerHTML = btnEl.dataset.originalText;
  }
}

// ============================================================================
// SECTION 5: MASTER DATA & STATUS MAP CACHING
// Reads Firestore once per session, saves in-memory + sessionStorage
// ============================================================================

var _cache = {
  masters: {},
  statusMap: null,
  activeContract: null
};

async function getMasters(type) {
  if (_cache.masters[type]) return _cache.masters[type];
  var cachedJson = sessionStorage.getItem('tspl_master_' + type);
  if (cachedJson) {
    try {
      _cache.masters[type] = JSON.parse(cachedJson);
      return _cache.masters[type];
    } catch (e) {}
  }

  try {
    var snap = await db.collection('masters').doc(type).get();
    var list = snap.exists ? (snap.data().values || []) : [];
    _cache.masters[type] = list;
    sessionStorage.setItem('tspl_master_' + type, JSON.stringify(list));
    return list;
  } catch (err) {
    console.error('Failed to load masters:', type, err);
    return [];
  }
}

async function getStatusMap() {
  if (_cache.statusMap) return _cache.statusMap;
  var cached = sessionStorage.getItem('tspl_status_map');
  if (cached) {
    try {
      _cache.statusMap = JSON.parse(cached);
      return _cache.statusMap;
    } catch (e) {}
  }

  try {
    var snap = await db.collection('statusMap').get();
    var map = {};
    snap.forEach(function (doc) {
      map[doc.id] = doc.data();
    });
    _cache.statusMap = map;
    sessionStorage.setItem('tspl_status_map', JSON.stringify(map));
    return map;
  } catch (err) {
    console.error('Failed to load status map:', err);
    return {};
  }
}

async function getDependency(subStatus) {
  if (!subStatus) return 'Engineer Dependency';
  var sm = await getStatusMap();
  if (sm[subStatus] && sm[subStatus].dependency) {
    return sm[subStatus].dependency;
  }
  return 'Engineer Dependency';
}

async function getActiveContract() {
  if (_cache.activeContract) return _cache.activeContract;
  var cached = sessionStorage.getItem('tspl_active_contract');
  if (cached) {
    try {
      _cache.activeContract = JSON.parse(cached);
      return _cache.activeContract;
    } catch (e) {}
  }

  try {
    var snap = await db.collection('contracts').where('status', '==', 'Active').limit(1).get();
    if (!snap.empty) {
      var contract = { id: snap.docs[0].id, ...snap.docs[0].data() };
      _cache.activeContract = contract;
      sessionStorage.setItem('tspl_active_contract', JSON.stringify(contract));
      return contract;
    }
  } catch (err) {
    console.error('Failed to load active contract:', err);
  }
  return null;
}

// ============================================================================
// SECTION 6: DOCKET SEQUENCER
// Generates unique sequential docket numbers using Firestore Transaction
// (e.g. DOC-210826-0001). Transactions guarantee collision-free sequence numbers
// without gaps across concurrent writes from 500+ engineers and call centre staff.
// ============================================================================

async function nextDocketNo() {
  var stamp = fmtDDMMYY(new Date());
  var counterRef = db.collection('counters').doc('dockets_' + stamp);

  var seq = await db.runTransaction(async function (transaction) {
    var doc = await transaction.get(counterRef);
    var current = 0;
    if (doc.exists && doc.data().lastSeq) {
      current = doc.data().lastSeq;
    }
    var next = current + 1;
    transaction.set(counterRef, { lastSeq: next, date: stamp }, { merge: true });
    return next;
  });

  var padded = ('0000' + seq).slice(-4);
  return 'DOC-' + stamp + '-' + padded;
}

// ============================================================================
// SECTION 7: ATOMIC PRE-AGGREGATED STATS (bumpStats)
// Dashboard numbers come from pre-aggregated counters in stats/live.
// FieldValue.increment() allows updating metrics inside the SAME WriteBatch as
// the docket write so the counters move atomically without reading full collections.
// ============================================================================

function bumpStats(changes, existingBatch) {
  var batch = existingBatch || db.batch();
  var statsRef = db.collection('stats').doc('live');

  var updates = {};
  for (var key in changes) {
    if (Object.prototype.hasOwnProperty.call(changes, key)) {
      updates[key] = firebase.firestore.FieldValue.increment(changes[key]);
    }
  }
  batch.set(statsRef, updates, { merge: true });

  if (!existingBatch) {
    return batch.commit();
  }
  return batch;
}

// ============================================================================
// SECTION 8: PAGED QUERIES (pagedQuery)
// Cursor pagination with limit(50) and startAfter(lastDoc)
// ============================================================================

async function pagedQuery(baseQuery, pageSize, lastDoc) {
  var size = pageSize || 50;
  var q = baseQuery.limit(size);
  if (lastDoc) {
    q = q.startAfter(lastDoc);
  }
  var snap = await q.get();
  return {
    docs: snap.docs,
    lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    hasMore: snap.docs.length === size
  };
}

// ============================================================================
// SECTION 9: CLIENT-SIDE IMAGE COMPRESSION (compressImage)
// Selfies: (400, 0.6), Part photos: (1000, 0.7)
// ============================================================================

function compressImage(file, maxWidth, quality) {
  return new Promise(function (resolve, reject) {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'));
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var width = img.width;
        var height = img.height;
        var maxW = maxWidth || 1000;
        var qual = quality || 0.7;

        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(function (blob) {
          if (!blob) {
            return reject(new Error('Canvas compression failed'));
          }
          resolve(blob);
        }, 'image/jpeg', qual);
      };
      img.onerror = function (err) { reject(err); };
      img.src = e.target.result;
    };
    reader.onerror = function (err) { reject(err); };
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// SECTION 10: GEODATA HELPERS (haversine)
// Returns distance in metres between two coordinate pairs
// ============================================================================

function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371000; // metres
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// SECTION 11: THE SLA ENGINE — CORE CONTRACTUAL RULES
// ============================================================================
// Under the HPY Services Agreement (Schedule II Part B):
// - Response Time   : 2 hours (120 mins) from call logging.
// - Resolution Time : 2 hours (120 mins) from call logging.
// - 24x7 service coverage including Public Holidays.
// - Configurable per RBI Location Category (Metro, Urban, Semi-Urban, Rural).
// - Penalties apply per instance of delay and are deducted from TSPL invoices.
// ============================================================================

async function getSLATarget(locationCategory) {
  var contract = await getActiveContract();
  var cat = locationCategory || 'Metro';

  if (contract && contract.slaMatrix && contract.slaMatrix[cat]) {
    var rule = contract.slaMatrix[cat];
    return {
      responseMins: Number(rule.responseMins) || 120,
      resolutionMins: Number(rule.resolutionMins) || 120,
      penaltyPerInstance: Number(rule.penaltyPerInstance) || 500
    };
  }

  // Contractual baseline fallback: 2 hours = 120 minutes
  return {
    responseMins: 120,
    resolutionMins: 120,
    penaltyPerInstance: 500
  };
}

/**
 * Computes live SLA status for an active or closed docket
 */
function slaStatus(docket, targetOverride) {
  var responseTargetMins = (targetOverride && targetOverride.responseMins) || (docket.responseTargetMins || 120);
  var resolutionTargetMins = (targetOverride && targetOverride.resolutionMins) || (docket.resolutionTargetMins || 120);

  var callTime = docket.callDateTime instanceof Date ? docket.callDateTime : (docket.callDateTime ? (docket.callDateTime.toDate ? docket.callDateTime.toDate() : new Date(docket.callDateTime)) : new Date());

  // Response calculation
  var responseActualMins = 0;
  var responseStatus = 'Pending';
  if (docket.reachedAt) {
    var reached = docket.reachedAt instanceof Date ? docket.reachedAt : (docket.reachedAt.toDate ? docket.reachedAt.toDate() : new Date(docket.reachedAt));
    responseActualMins = Math.max(0, Math.floor((reached.getTime() - callTime.getTime()) / 60000));
    responseStatus = responseActualMins <= responseTargetMins ? 'Met' : 'Breached';
  } else {
    responseActualMins = Math.max(0, Math.floor((Date.now() - callTime.getTime()) / 60000));
    responseStatus = responseActualMins <= responseTargetMins ? 'In Progress' : 'Breached';
  }

  // Resolution calculation
  var resolutionActualMins = 0;
  var resolutionStatus = 'Pending';
  if (docket.resolvedAt) {
    var resolved = docket.resolvedAt instanceof Date ? docket.resolvedAt : (docket.resolvedAt.toDate ? docket.resolvedAt.toDate() : new Date(docket.resolvedAt));
    resolutionActualMins = Math.max(0, Math.floor((resolved.getTime() - callTime.getTime()) / 60000));
    resolutionStatus = resolutionActualMins <= resolutionTargetMins ? 'Met' : 'Breached';
  } else {
    resolutionActualMins = Math.max(0, Math.floor((Date.now() - callTime.getTime()) / 60000));
    resolutionStatus = resolutionActualMins <= resolutionTargetMins ? 'In Progress' : 'Breached';
  }

  var minsRemaining = resolutionTargetMins - resolutionActualMins;
  var breached = resolutionStatus === 'Breached' || (!docket.reachedAt && responseStatus === 'Breached');

  // RAG Colour calculation
  var ragColour = 'green';
  if (minsRemaining <= 0 || breached) {
    ragColour = 'breach';
  } else if (minsRemaining <= 15) {
    ragColour = 'red';
  } else if (minsRemaining <= (resolutionTargetMins * 0.5)) {
    ragColour = 'amber';
  } else {
    ragColour = 'green';
  }

  return {
    responseTargetMins: responseTargetMins,
    responseActualMins: responseActualMins,
    responseStatus: responseStatus,
    resolutionTargetMins: resolutionTargetMins,
    resolutionActualMins: resolutionActualMins,
    resolutionStatus: resolutionStatus,
    minsRemaining: minsRemaining,
    ragColour: ragColour,
    breached: breached,
    breachDependency: docket.currentDependency || 'Engineer Dependency'
  };
}

/**
 * Records breach in slaBreaches collection.
 * This record is TSPL's legal defence during monthly HPY penalty reconciliations:
 * it captures the exact Dependency (Bank/Custodian/Parts vs Engineer) at the moment of breach.
 */
function recordBreach(docket, type, existingBatch) {
  var batch = existingBatch || db.batch();
  var breachRef = db.collection('slaBreaches').doc();

  var callTime = docket.callDateTime instanceof Date ? docket.callDateTime : (docket.callDateTime ? (docket.callDateTime.toDate ? docket.callDateTime.toDate() : new Date(docket.callDateTime)) : new Date());
  var target = type === 'response' ? (docket.responseTargetMins || 120) : (docket.resolutionTargetMins || 120);
  var actual = Math.max(0, Math.floor((Date.now() - callTime.getTime()) / 60000));
  var overrun = Math.max(0, actual - target);

  var netTAT = docket.tsplNetTATMinutes || 0;
  var grossTAT = actual;
  var tsplSharePct = grossTAT > 0 ? Math.min(100, Math.round((netTAT / grossTAT) * 100)) : 100;
  var penaltyExposure = (docket.penaltyPerInstance || 500) * (tsplSharePct / 100);

  var breachData = {
    breachId: breachRef.id,
    docketNo: docket.docketNo || '',
    atmId: docket.atmId || '',
    bank: docket.bank || '',
    locationCategory: docket.locationCategory || 'Metro',
    breachType: type, // "response" | "resolution"
    targetMins: target,
    actualMins: actual,
    overrunMins: overrun,
    breachDependency: docket.currentDependency || 'Engineer Dependency',
    currentSubStatus: docket.subStatus || '',
    tsplNetTATMinutes: netTAT,
    tsplSharePercentage: tsplSharePct,
    engineerId: docket.assignedEngineerId || '',
    engineerName: docket.assignedEngineerName || '',
    penaltyExposureRupees: Math.round(penaltyExposure),
    loggedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  batch.set(breachRef, breachData);

  if (!existingBatch) {
    return batch.commit();
  }
  return batch;
}

/**
 * Returns formatted live ticker string: "01:47:22 left" or "BREACHED by 4h 12m"
 */
function slaCountdownText(minsRemaining) {
  if (minsRemaining === null || minsRemaining === undefined) return '--';
  if (minsRemaining < 0) {
    var overdueMins = Math.abs(minsRemaining);
    var hrs = Math.floor(overdueMins / 60);
    var rem = overdueMins % 60;
    return 'BREACHED by ' + (hrs > 0 ? hrs + 'h ' : '') + rem + 'm';
  }
  var h = Math.floor(minsRemaining / 60);
  var m = minsRemaining % 60;
  return padZero(h) + ':' + padZero(m) + ':00 left';
}

// ============================================================================
// SECTION 12: BILLING HELPERS — SCHEDULE III
// "Calls re-dispatched due to vendor related issues will not be considered under Free calls/Paid calls."
// ============================================================================

function classifyBillability(docket, contract) {
  if (docket.reDispatchReason && docket.reDispatchVendorCaused === true) {
    return 'Unbillable - vendor re-dispatch';
  }

  var freeAllowanceRemaining = contract && typeof contract.freeCallsRemaining === 'number'
    ? contract.freeCallsRemaining
    : 0;

  if (freeAllowanceRemaining > 0) {
    return 'Free';
  }

  return 'Paid';
}

// ============================================================================
// SECTION 13: REAL-TIME TRACKING & SENSOR TELEMETRY LAYER
// Unified implementation supporting Mobile Web & Capacitor Native Wrapper
// ============================================================================

var _trackingState = {
  watchId: null,
  activeMode: 'off', // 'off' | 'onduty' | 'travelling'
  lastSentPosition: null,
  lastSentTime: 0,
  heldTrail: [],
  intervalFlush: null,
  wakeLock: null,
  frozenCoordCount: 0,
  lastAccuracy: 0,
  lowAccuracyStreak: 0
};

function isNativeApp() {
  return typeof window !== 'undefined' && Boolean(window.TSPLTracker);
}

// ============================================================================
// SECTION 13B: AUTOMATIC ARRIVAL GEOFENCE
// Lets docket-work.html arm a "tell me the moment the engineer is within N
// metres of this ATM" watch on top of the existing live GPS stream, instead of
// requiring the engineer to notice they've arrived and tap a button. Every
// position handlePosition() receives while a target is armed is checked
// against it; the first fix that lands inside the radius fires onArrival and
// disarms itself so it can't fire twice.
//
// Known limits, not silently hidden: this only runs while the tab/PWA is open
// in the foreground (the shared _trackingState above has the same limit) — a
// backgrounded browser tab on a phone can be suspended by the OS. The Method
// A (manual GPS) and Method B (photo) confirmations in docket-work.html stay
// in place precisely as the fallback for that case, and for indoor GPS drift
// that never resolves to inside the radius. Reliable always-on background
// capture needs a native wrapper around this PWA (window.TSPLTracker already
// exists as that integration point) — not something this can promise today.
// ============================================================================

var _geofenceTarget = null;

function registerArrivalGeofence(config) {
  if (!config || typeof config.onArrival !== 'function' || !config.atmLat || !config.atmLng) {
    console.warn('[Geofence] registerArrivalGeofence called with incomplete config; ignored.');
    return;
  }
  _geofenceTarget = {
    docketId: config.docketId || null,
    atmLat: config.atmLat,
    atmLng: config.atmLng,
    radiusMeters: config.radiusMeters || 50,
    onArrival: config.onArrival
  };
}

function clearArrivalGeofence() {
  _geofenceTarget = null;
}

/**
 * Checks one GPS fix against the currently armed geofence target, if any.
 * Fires at most once per registerArrivalGeofence() call (disarms itself
 * immediately, before the async onArrival callback even runs, so a second
 * fix arriving while onArrival's Firestore write is still in flight can't
 * trigger it again).
 */
function checkArrivalGeofence(lat, lng, accuracy) {
  if (!_geofenceTarget) return;

  // Accuracy sanity gate: a very poor fix (e.g. >100m, common right after GPS
  // cold-start or deep indoors) could sit "inside" a 50m radius by coincidence
  // of error rather than by actually being there. Let a fix that imprecise
  // fall through to the manual/photo confirmation instead of auto-firing.
  if (accuracy && accuracy > 100) return;

  var distMeters = haversine(lat, lng, _geofenceTarget.atmLat, _geofenceTarget.atmLng);
  if (distMeters <= _geofenceTarget.radiusMeters) {
    var target = _geofenceTarget;
    _geofenceTarget = null; // disarm before calling out, so this can't double-fire
    try {
      target.onArrival({ lat: lat, lng: lng, accuracy: Math.round(accuracy || 0) }, Math.round(distMeters));
    } catch (err) {
      console.error('[Geofence] onArrival callback threw:', err);
    }
  }
}

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      _trackingState.wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
      console.warn('[Tracking] Screen WakeLock unavailable:', err);
    }
  }
}

async function getBatteryLevel() {
  if ('getBattery' in navigator) {
    try {
      var b = await navigator.getBattery();
      return Math.round(b.level * 100);
    } catch (e) {}
  }
  return 100;
}

/**
 * Validates GPS position for anomalous flags (anti-fraud sanity check)
 */
function validatePosition(lat, lng, accuracy, speed, timestamp) {
  var flags = [];

  // Check 1: Accuracy unrealistically high repeated times
  if (accuracy <= 3) {
    _trackingState.lowAccuracyStreak++;
    if (_trackingState.lowAccuracyStreak > 10) {
      flags.push('Unrealistic accuracy streak (<3m)');
    }
  } else {
    _trackingState.lowAccuracyStreak = 0;
  }

  // Check 2: Implied or GPS speed exceeds 150 km/h
  var speedKmh = (speed || 0) * 3.6;
  if (speedKmh > 150) {
    flags.push('Excessive speed (>150 km/h): ' + Math.round(speedKmh) + ' km/h');
  }

  // Check 3: Static frozen coordinates during travelling mode
  if (_trackingState.lastSentPosition) {
    var latDiff = Math.abs(lat - _trackingState.lastSentPosition.lat);
    var lngDiff = Math.abs(lng - _trackingState.lastSentPosition.lng);
    if (latDiff < 0.000001 && lngDiff < 0.000001 && _trackingState.activeMode === 'travelling') {
      _trackingState.frozenCoordCount++;
      if (_trackingState.frozenCoordCount >= 5) {
        flags.push('Frozen coordinates across 5 pings');
      }
    } else {
      _trackingState.frozenCoordCount = 0;
    }

    // Check 4: Inter-ping jump velocity
    var dtHours = (timestamp - _trackingState.lastSentTime) / (1000 * 3600);
    if (dtHours > 0) {
      var distKm = haversine(_trackingState.lastSentPosition.lat, _trackingState.lastSentPosition.lng, lat, lng) / 1000;
      var impliedSpeed = distKm / dtHours;
      if (impliedSpeed > 160) {
        flags.push('Anomalous GPS teleportation: ' + Math.round(impliedSpeed) + ' km/h');
      }
    }
  }

  return flags;
}

/**
 * Dispatches position update to RTDB and appends to in-memory trail
 */
async function handlePosition(pos) {
  var user = auth.currentUser;
  if (!user || _trackingState.activeMode === 'off') return;

  var coords = pos.coords;
  var lat = parseFloat(coords.latitude.toFixed(5));
  var lng = parseFloat(coords.longitude.toFixed(5));
  var accuracy = coords.accuracy || 0;
  var speed = coords.speed || 0;
  var now = Date.now();

  // Runs on every fix, independent of the send-throttling below — arrival needs to be
  // caught the moment it happens, not whenever the next RTDB broadcast happens to fire.
  checkArrivalGeofence(lat, lng, accuracy);

  var distanceThreshold = _trackingState.activeMode === 'travelling' ? 30 : 100;
  var timeThreshold = 30 * 1000; // 30 seconds
  var heartbeatThreshold = 5 * 60 * 1000; // 5 minutes

  var distMoved = _trackingState.lastSentPosition
    ? haversine(_trackingState.lastSentPosition.lat, _trackingState.lastSentPosition.lng, lat, lng)
    : 9999;
  var elapsed = now - _trackingState.lastSentTime;

  var shouldSend = (elapsed >= timeThreshold && distMoved >= distanceThreshold) || elapsed >= heartbeatThreshold;

  if (!shouldSend && _trackingState.lastSentPosition) {
    return;
  }

  var flags = validatePosition(lat, lng, accuracy, speed, now);
  var batteryPct = await getBatteryLevel();

  var liveData = {
    uid: user.uid,
    name: user.displayName || 'Field Engineer',
    lat: lat,
    lng: lng,
    accuracy: Math.round(accuracy),
    speedKmh: Math.round((speed || 0) * 3.6),
    battery: batteryPct,
    mode: _trackingState.activeMode,
    online: true,
    flags: flags,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };

  var userLiveRef = rtdb.ref('liveLocations/' + user.uid);
  userLiveRef.set(liveData);

  // Setup disconnect hook to mark offline cleanly
  userLiveRef.onDisconnect().update({
    online: false,
    lastSeen: firebase.database.ServerValue.TIMESTAMP
  });

  _trackingState.lastSentPosition = { lat: lat, lng: lng };
  _trackingState.lastSentTime = now;
  _trackingState.heldTrail.push([lat, lng, now]);
}

/**
 * Flushes in-memory trail to Firestore gpsTrail/{uid}_{DDMMYY}
 */
async function flushTrail() {
  var user = auth.currentUser;
  if (!user || _trackingState.heldTrail.length === 0) return;

  var points = _trackingState.heldTrail.slice();
  _trackingState.heldTrail = [];

  var stamp = fmtDDMMYY(new Date());
  var docRef = db.collection('gpsTrail').doc(user.uid + '_' + stamp);

  try {
    await docRef.set({
      uid: user.uid,
      date: stamp,
      points: firebase.firestore.FieldValue.arrayUnion.apply(firebase.firestore.FieldValue, points)
    }, { merge: true });
  } catch (err) {
    console.error('[Tracking] Trail flush error:', err);
    // restore unflushed points
    _trackingState.heldTrail = points.concat(_trackingState.heldTrail);
  }
}

function startTracking(mode) {
  _trackingState.activeMode = mode || 'onduty';
  requestWakeLock();

  if (isNativeApp()) {
    window.TSPLTracker.start({ mode: _trackingState.activeMode });
  } else if ('geolocation' in navigator) {
    if (_trackingState.watchId) {
      navigator.geolocation.clearWatch(_trackingState.watchId);
    }
    _trackingState.watchId = navigator.geolocation.watchPosition(
      handlePosition,
      function (err) { console.warn('[GPS Watch Error]', err); },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
  }

  if (!_trackingState.intervalFlush) {
    _trackingState.intervalFlush = setInterval(flushTrail, 5 * 60 * 1000);
  }

  window.addEventListener('beforeunload', flushTrail);
}

function setTrackingMode(mode) {
  _trackingState.activeMode = mode;
  if (isNativeApp()) {
    window.TSPLTracker.setMode(mode);
  }
}

function stopTracking() {
  _trackingState.activeMode = 'off';
  _geofenceTarget = null; // e.g. an engineer punching out mid-travel shouldn't leave a stale watch armed

  if (isNativeApp()) {
    window.TSPLTracker.stop();
  } else if (_trackingState.watchId !== null) {
    navigator.geolocation.clearWatch(_trackingState.watchId);
    _trackingState.watchId = null;
  }

  if (_trackingState.intervalFlush) {
    clearInterval(_trackingState.intervalFlush);
    _trackingState.intervalFlush = null;
  }

  flushTrail();

  var user = auth.currentUser;
  if (user) {
    rtdb.ref('liveLocations/' + user.uid).update({
      online: false,
      lastSeen: firebase.database.ServerValue.TIMESTAMP
    });
  }

  if (_trackingState.wakeLock) {
    _trackingState.wakeLock.release().catch(function () {});
    _trackingState.wakeLock = null;
  }
}
