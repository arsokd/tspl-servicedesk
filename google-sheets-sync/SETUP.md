# Automatic Google Sheets Sync — Setup Guide

Gets dockets, SLA breaches, and attendance flowing automatically out of Firestore into a Google Sheet, on a timer, for Looker Studio to sit on top of. No manual export, ever, once this is set up. No Firebase plan change needed — this runs entirely in Google Sheets' own free automation (Apps Script), not Firebase Cloud Functions.

Do this in order. Every step is a browser action — no coding required, just careful copy-pasting.

---

## Step 1: Create a dedicated login for the sync script

The script needs to sign in to the app just like a staff member would, so it's bound by the same security rules as everyone else. Give it its own account rather than reusing a human's login.

1. Log in to the live app as Admin, go to **Masters → Users → + Add User / Engineer**.
2. Fill in:
   - **Full Name:** `Reports Sync (Automated)`
   - **Email:** `reports-sync@tspl.in` (or any address you control — it never needs to receive real mail)
   - **Phone:** any valid 10-digit placeholder, e.g. `9000000001`
   - **Role:** `admin` (needed for read access across dockets, SLA breaches, and attendance)
3. Save. Note the generated password (`TSPL@` + last 4 digits of the phone you entered — e.g. `TSPL@0001`).
4. **Immediately change that password to something long and random** that only this script will ever use — log in once as this account and set a new password when prompted (first-login flow forces this). Write the final password down somewhere safe; you'll paste it into Script Properties in Step 4.

## Step 2: Create the Google Sheet and open its Apps Script editor

1. Go to **sheets.google.com**, create a new blank spreadsheet. Name it e.g. **TSPL ServiceDesk — Live Data**.
2. In the Sheet, go to **Extensions → Apps Script**. This opens a code editor bound to this specific spreadsheet.
3. Delete the placeholder `function myFunction() {}` code you see there.
4. Open `google-sheets-sync/Code.gs` from this repository (`github.com/arsokd/tspl-servicedesk`), copy its entire contents, and paste it into the Apps Script editor.
5. Click the **Save** icon (disk icon, top left).

## Step 3: Find your Firebase Project ID and API Key

You already have these — they're in `firebase-config.js` in the repo:
- **FIREBASE_PROJECT_ID** → the `projectId` value (currently `tspl-servicedesk`)
- **FIREBASE_API_KEY** → the `apiKey` value

## Step 4: Set the four Script Properties

These are where credentials live — never paste them directly into the code, so the code stays safe to share/version-control.

1. In the Apps Script editor, click the **gear icon (Project Settings)** on the left sidebar.
2. Scroll to **Script Properties**, click **Add script property**, and add these four, one at a time:

   | Property | Value |
   |---|---|
   | `FIREBASE_PROJECT_ID` | `tspl-servicedesk` |
   | `FIREBASE_API_KEY` | (the apiKey from firebase-config.js) |
   | `SYNC_EMAIL` | `reports-sync@tspl.in` (whatever you used in Step 1) |
   | `SYNC_PASSWORD` | (the password you changed to in Step 1.4) |

3. Click **Save script properties**.

## Step 5: Run it once manually to test, and grant permissions

1. Back in the **Editor** tab, use the function dropdown at the top (next to the "Run" button) and select **`syncAll`**.
2. Click **Run**.
3. The first time, Google will ask you to **authorize** the script (it needs permission to call external services and edit this spreadsheet). Click through: **Review permissions → (pick your Google account) → Advanced → Go to [project name] (unsafe) → Allow**. This "unsafe" warning is normal for any script you write/paste yourself that Google hasn't independently reviewed — it is not a sign of a real problem.
4. Check the Sheet — you should now see new tabs: **Dockets**, **SLA Breaches**, **Attendance**, each with a header row and (if you have live data from the last 30 days) some rows already filled in.

If you see an error instead, open **Executions** (left sidebar, clock icon) to read exactly what failed — most likely a typo in one of the four Script Properties above.

## Step 6: Arm the automatic timer

1. In the function dropdown, select **`armTimeTrigger`** this time, and click **Run**.
2. This sets the sync to run automatically every minute, forever, with no further action from you. You can confirm it's active under **Triggers** (clock icon, left sidebar) — you should see one entry for `syncAll`.

That's it — the Sheet now updates itself. Leave both browser tabs; you never need to open Apps Script again unless something needs adjusting.

## Step 7: Connect Looker Studio

1. Go to **lookerstudio.google.com → Create → Data source → Google Sheets**.
2. Pick the spreadsheet you created in Step 2, and one of its tabs (Dockets / SLA Breaches / Attendance) — add each as its own data source if you want to build charts across all three.
3. Build your dashboard as normal from there — every chart will refresh with the Sheet automatically (Looker Studio's own refresh interval, typically every 15 minutes to a few hours depending on your Looker Studio settings).

---

## What's covered, and what isn't yet

- **Dockets** tab: every ticket's current status, SLA targets, arrival details, dependency, response/resolution timing — refreshed the moment any action happens on that docket (dispatch, arrival, resolve, close, etc.), because it rides on the same audit-trail log (`docketActivity`) the app already writes for every action.
- **SLA Breaches** tab: every logged breach with its penalty exposure figure, engineer, and dependency at time of breach.
- **Attendance** tab: punch-in/punch-out times and coordinates per engineer per day.
- **Not included yet:** a dedicated Billing/invoice export — `billing.html` reads a monthly summary that isn't consistently written by the app today (it wasn't a real automated collection to sync from). The billing-relevant numbers (paid vs. free call classification, penalty amounts) are already present in the Dockets and SLA Breaches tabs above, so a Looker Studio dashboard can compute billing totals directly from those two tabs rather than needing a separate export.
- **Read cost**: this stays well inside Firestore's free daily quota because it only re-reads what actually changed since the last run, not the whole database each time. If you ever see it stop updating, check **Executions** in the Apps Script editor first — that's where any error would show up.
- **Clock ownership ledger** (Sep 2026 process review): the Dockets tab now also carries the TSPL-vs-Client/CRA time split per docket — `clockOwner`, `clockHeading`, `tsplClockMinutes`, `clientClockMinutes`, `tsplClockPercent`, `clientClockPercent`, plus a per-heading breakdown (`craWaitMinutes`, `partsWaitTsplMinutes`, `partsWaitClientMinutes`, `tsplActiveMinutes`). This is the same data a client sees when they review a docket — whose account the elapsed time was actually charged to, and why.

---

## Step 8 (optional): CRA SMS/WhatsApp notifications

The app can send an automatic SMS/WhatsApp to the CRA whenever an engineer confirms their promised time slot, or logs "waiting for CRA past promised time" — this is the independent, timestamped proof that prevents "I said 12:30, not 11:30" disputes. It reuses this same Apps Script project rather than needing a separate setup:

1. In this Apps Script project, go to **Deploy → New deployment → Web app**. Set "Execute as" to **Me** and "Who has access" to **Anyone**, then **Deploy**. Copy the resulting URL.
2. Open `docket-work.html` in the repo and paste that URL into the `CRA_NOTIFY_WEBHOOK_URL` constant near the bottom of its `<script>` block.
3. Pick an SMS/WhatsApp provider (Twilio, Gupshup, and the official WhatsApp Business API are the common choices in India) and get an API key + sender ID from them.
4. Back in **Script Properties** (same place as Step 4 above), add three more properties: `SMS_PROVIDER_URL`, `SMS_PROVIDER_KEY`, `SMS_SENDER_ID`.
5. Open `Code.gs`'s `sendViaProvider_()` function and adjust the request body to match your chosen provider's exact API format (check their docs — every provider's payload shape is slightly different).

Until you do this, the app keeps working exactly as before — the CRA slot/no-show flow and the clock ledger are fully functional either way; only the actual SMS/WhatsApp send is skipped (logged to Executions instead, so you can verify what *would* have been sent).
