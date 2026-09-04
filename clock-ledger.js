/**
 * TSPL ServiceDesk — Clock Ownership Ledger
 * ============================================================================
 * Built from the Sep 2026 TSPL process-review meeting: the docket's overall
 * timer (open → close = MTTR) NEVER stops once a docket is raised, but at
 * any given moment the elapsed time is being "charged" to one of two
 * accounts:
 *
 *   TSPL   — TSPL is the one actively working, or waiting on something
 *            entirely within its own control (its own spare parts stock).
 *   CLIENT — TSPL is blocked on something the client/CRA/OEM controls
 *            (CRA slot & arrival, client/OEM-sourced spare parts).
 *
 * This is a genuinely different (and more precise) thing than the existing
 * `currentDependency` label on a docket: that label is a human-readable
 * status shown on the SLA Board; this ledger is the actual auditable,
 * minute-by-minute record both TSPL and HPY/the client can reconcile
 * against, with an independent SMS/WhatsApp trail backing the CRA-related
 * transitions (see sendCraNotification() in docket-work.html).
 *
 * DATA MODEL
 * ----------
 * dockets/{id}/clockSegments/{segId}
 *   owner:      'TSPL' | 'CLIENT'
 *   heading:    one of CLOCK_HEADINGS keys below
 *   startedAt:  server timestamp
 *   endedAt:    server timestamp, or null while this segment is still active
 *   note:       free text (optional)
 *
 * Denormalized onto the docket doc itself, for fast/live reads without
 * always paying for a subcollection query:
 *   clockOwner              'TSPL' | 'CLIENT' | null (null once finally closed)
 *   clockHeading            current heading key, or null
 *   clockSegmentStartedAt   when the CURRENT segment began (for a live ticker)
 *   activeClockSegmentId    id of the currently-open segment doc, or null
 *   clockTotals             { byHeading, tsplMinutes, clientMinutes, mttrMinutes,
 *                             tsplPercent, clientPercent } — last computed snapshot
 *   clockTotalsAsOf         server timestamp of that snapshot
 *   Flat mirrors of clockTotals (so Firestore's REST API / Sheets sync, which
 *   doesn't need to unpack a nested map, can read them directly):
 *   tsplClockMinutes, clientClockMinutes, mttrClockMinutes,
 *   tsplClockPercent, clientClockPercent,
 *   craWaitMinutes, partsWaitTsplMinutes, partsWaitClientMinutes, tsplActiveMinutes
 * ============================================================================
 */

var CLOCK_HEADINGS = {
  TSPL_ACTIVE:           { label: 'TSPL Active Work',                owner: 'TSPL' },
  AWAITING_CRA:          { label: 'Awaiting CRA (Custodian)',         owner: 'CLIENT' },
  AWAITING_PARTS_TSPL:   { label: 'Awaiting Parts (TSPL Source)',     owner: 'TSPL' },
  AWAITING_PARTS_CLIENT: { label: 'Awaiting Parts (Client/OEM Source)', owner: 'CLIENT' }
};

function clockHeadingOwner(heading) {
  return (CLOCK_HEADINGS[heading] && CLOCK_HEADINGS[heading].owner) || 'TSPL';
}

function clockHeadingLabel(heading) {
  return (CLOCK_HEADINGS[heading] && CLOCK_HEADINGS[heading].label) || heading || '--';
}

/**
 * Opens the very first clock segment for a brand-new docket. Call this from
 * dockets.html, inside the SAME batch that creates the docket, so the clock
 * is provably running from the instant the docket number reaches our system
 * — never later, per the confirmed process.
 */
function ledgerOpenFirstSegment(batch, docketRef, heading) {
  heading = heading || 'TSPL_ACTIVE';
  var segRef = docketRef.collection('clockSegments').doc();
  var owner = clockHeadingOwner(heading);
  var now = firebase.firestore.FieldValue.serverTimestamp();
  batch.set(segRef, { owner: owner, heading: heading, startedAt: now, endedAt: null, note: '' });
  batch.update(docketRef, {
    clockOwner: owner,
    clockHeading: heading,
    clockSegmentStartedAt: now,
    activeClockSegmentId: segRef.id
  });
  return segRef.id;
}

/**
 * Closes whichever segment is currently active and opens a new one for
 * `newHeading`, as part of the SAME batch the caller is already committing
 * (arrival, CRA slot confirmed, parts requested/received, etc). `currentDocket`
 * must be the caller's in-memory copy of the docket doc (needs
 * .activeClockSegmentId) — read fresh from Firestore, not stale.
 */
function ledgerSwitchSegment(batch, docketRef, currentDocket, newHeading, note) {
  var now = firebase.firestore.FieldValue.serverTimestamp();
  if (currentDocket && currentDocket.activeClockSegmentId) {
    var oldSegRef = docketRef.collection('clockSegments').doc(currentDocket.activeClockSegmentId);
    batch.update(oldSegRef, { endedAt: now });
  }
  var newSegRef = docketRef.collection('clockSegments').doc();
  var owner = clockHeadingOwner(newHeading);
  batch.set(newSegRef, { owner: owner, heading: newHeading, startedAt: now, endedAt: null, note: note || '' });
  batch.update(docketRef, {
    clockOwner: owner,
    clockHeading: newHeading,
    clockSegmentStartedAt: now,
    activeClockSegmentId: newSegRef.id
  });
  return newSegRef.id;
}

/**
 * Closes the active segment WITHOUT opening a replacement — the docket is
 * finally closing and no further clock time should ever accrue against it.
 */
function ledgerCloseFinal(batch, docketRef, currentDocket) {
  var now = firebase.firestore.FieldValue.serverTimestamp();
  if (currentDocket && currentDocket.activeClockSegmentId) {
    var oldSegRef = docketRef.collection('clockSegments').doc(currentDocket.activeClockSegmentId);
    batch.update(oldSegRef, { endedAt: now });
  }
  batch.update(docketRef, { clockOwner: null, clockHeading: null, activeClockSegmentId: null });
}

/**
 * Reads every segment for a docket and computes the full breakdown: total
 * minutes per heading, TSPL vs Client totals, MTTR, and percentages. A
 * still-open segment (endedAt === null) is measured up to `asOfDate` (default
 * now), so this can be called for a live "as of this moment" read on an open
 * docket, or a final read right after ledgerCloseFinal on a closed one.
 */
async function ledgerComputeTotals(docketId, asOfDate) {
  var snap = await db.collection('dockets').doc(docketId).collection('clockSegments').orderBy('startedAt', 'asc').get();
  var asOf = asOfDate || new Date();
  var byHeading = {};
  var tsplMinutes = 0, clientMinutes = 0;

  snap.forEach(function (doc) {
    var seg = doc.data();
    var start = seg.startedAt && seg.startedAt.toDate ? seg.startedAt.toDate() : new Date(seg.startedAt);
    var end = seg.endedAt && seg.endedAt.toDate ? seg.endedAt.toDate() : (seg.endedAt ? new Date(seg.endedAt) : asOf);
    var mins = Math.max(0, (end.getTime() - start.getTime()) / 60000);
    byHeading[seg.heading] = (byHeading[seg.heading] || 0) + mins;
    if (seg.owner === 'CLIENT') clientMinutes += mins; else tsplMinutes += mins;
  });

  var mttrMinutes = tsplMinutes + clientMinutes;
  var tsplPercent = mttrMinutes > 0 ? (tsplMinutes / mttrMinutes * 100) : 0;
  var clientPercent = mttrMinutes > 0 ? (clientMinutes / mttrMinutes * 100) : 0;

  return {
    byHeading: byHeading,
    tsplMinutes: Math.round(tsplMinutes),
    clientMinutes: Math.round(clientMinutes),
    mttrMinutes: Math.round(mttrMinutes),
    tsplPercent: Math.round(tsplPercent * 10) / 10,
    clientPercent: Math.round(clientPercent * 10) / 10
  };
}

/**
 * Computes and persists the breakdown onto the docket doc, both as a nested
 * `clockTotals` object (convenient for the app's own detail views) and as
 * flat top-level fields (so the Google Sheets sync / Looker Studio, which
 * read Firestore's typed REST fields directly, can chart them without any
 * JSON-unpacking). Safe to call repeatedly — e.g. on every clock switch and
 * again at final closure.
 */
async function ledgerPersistTotals(docketId, batchOrNull) {
  var totals = await ledgerComputeTotals(docketId);
  var docketRef = db.collection('dockets').doc(docketId);
  var payload = {
    clockTotals: totals,
    clockTotalsAsOf: firebase.firestore.FieldValue.serverTimestamp(),
    tsplClockMinutes: totals.tsplMinutes,
    clientClockMinutes: totals.clientMinutes,
    mttrClockMinutes: totals.mttrMinutes,
    tsplClockPercent: totals.tsplPercent,
    clientClockPercent: totals.clientPercent,
    craWaitMinutes: Math.round(totals.byHeading.AWAITING_CRA || 0),
    partsWaitTsplMinutes: Math.round(totals.byHeading.AWAITING_PARTS_TSPL || 0),
    partsWaitClientMinutes: Math.round(totals.byHeading.AWAITING_PARTS_CLIENT || 0),
    tsplActiveMinutes: Math.round(totals.byHeading.TSPL_ACTIVE || 0)
  };
  if (batchOrNull) {
    batchOrNull.update(docketRef, payload);
  } else {
    await docketRef.update(payload);
  }
  return totals;
}

/**
 * Renders a small live "clock is currently on ___'s account" banner given the
 * docket's denormalized fields. Returns an HTML string; caller drops it into
 * a container. Ticks are the caller's responsibility (re-render on an
 * interval reading clockSegmentStartedAt, same pattern as the rest of the app's
 * SLA countdowns).
 */
function renderClockOwnerBanner(docket) {
  if (!docket || !docket.clockOwner) {
    return '<div class="text-[11px] text-slate-400">Clock closed — docket finalized.</div>';
  }
  var isClient = docket.clockOwner === 'CLIENT';
  var bg = isClient ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-indigo-50 border-indigo-300 text-indigo-900';
  var startedAt = docket.clockSegmentStartedAt && docket.clockSegmentStartedAt.toDate ? docket.clockSegmentStartedAt.toDate() : new Date(docket.clockSegmentStartedAt || Date.now());
  var mins = Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 60000));
  return (
    '<div class="p-2.5 border rounded-lg text-[11px] font-semibold ' + bg + '">' +
      'Clock running on: <strong>' + (isClient ? 'CLIENT / CRA' : 'TSPL') + ' account</strong>' +
      ' &bull; ' + clockHeadingLabel(docket.clockHeading) +
      ' &bull; ' + mins + ' min so far' +
    '</div>'
  );
}
