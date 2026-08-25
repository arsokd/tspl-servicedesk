# Firestore Composite Indexes — What's Covered and What Isn't

`firestore.indexes.json` covers the composite indexes needed by the queries that
are exercised by default (no optional filters applied) on:

- `dashboard.html` / `sla-board.html` — the new live-computed stats (`computeLiveStats()`).
- `client-portal.html` — the default open/closed docket listing for a bank client.
- `parts.html` — the default status and RO listings.
- `reports.html` — the default RO/bank report pulls.
- `dockets.html` — the default ATM-ID search fallback.

**What this does NOT cover:** several of these screens let a user stack *multiple*
optional filters at once (e.g. `client-portal.html` combining a bank + open/closed
+ location-category filter all together). Each distinct combination of equality
filters plus a sort field is its own composite index in Firestore — enumerating
every possible combination by hand isn't practical, and most of them will never
actually get used in real operation.

**This is expected, not a bug**, and here's the normal way to handle it: the
first time a real user's browser runs a filter combination that has no matching
index, Firestore returns an error containing a direct link that creates the
exact missing index with one click (takes 1–5 minutes to build, no downtime).
Whoever holds the Firebase Console login for techservisphere@gmail.com should
click that link when it appears, then add the same field combination to this
file and redeploy (`firebase deploy --only firestore:indexes`) so it survives
a fresh project setup in future. Firebase Console's **Firestore > Indexes >
"Indexes recommended based on query history"** panel is worth checking a week
or two after go-live for exactly this reason.
