# TSPL ServiceDesk — Contract Parameters Setup Guide

Before launching TSPL ServiceDesk into live operations with HPY, you must obtain a small number of contractual parameters from the TSPL Commercial & Operations leadership team and record them in the **Active Contract** document (`contracts/contract_hpy_2026` or via the Admin Setup Portal).

**Verified against the actual signed template** (`SERVICES_AGREEMENT_TEMPLATE_2026`, Schedule II & III): most of TSPL's HPY master template is fixed boilerplate, with only a handful of fields genuinely left blank for a specific deal. Sections 1 and 4 below are the fields that really are blank in the template and must be obtained. Sections 2, 3 and 5 are **already answered by the template itself** — they're included here so nobody re-negotiates or overrides a figure the contract already fixes.

---

## 1. Liquidated Damages (Penalty) Rate per Instance
* **Contractual Reference:** Clause 13 (Liquidated Damages) — "at the rate _________________________, for each day or instance of delay..."
* **Confirmed status:** genuinely blank in the template. This is the one rate that must come from TSPL Commercial leadership for this specific HPY engagement.
* **What to ask TSPL:** *"What is the penalty amount (in INR) charged per breached docket/instance for failing to meet the Response or Resolution SLA?"*
* **Where to configure:** `contracts/{contractId}.slaMatrix[category].penaltyPerInstance` or `contracts/{contractId}.defaultPenaltyRate`. Seeded as `0` in `setup-data.html` until this is filled in — don't guess a number here.

---

## 2. Aggregate Liability Cap — already fixed by Clause 11.5, don't override
* **Contractual Reference:** Clause 11.5 (Indemnity and Liability)
* **Confirmed formula (verbatim from the template):** *"the aggregate liability of the Service Provider for all other claims... shall not exceed the total Service Fees paid or payable by HPY to the Service Provider for the twelve (12) months immediately preceding the date on which the claim first arose. This cap shall apply per claim, and not as an aggregate cap for the entire term of this Agreement."*
* **What this means in practice:** it's a **rolling per-claim cap**, not a fixed rupee figure or "100% of one month's invoice" — it's 12 months of trailing Service Fees, recalculated at the time each claim arises. A single static `liabilityCapRupees` number can't represent this correctly.
* **Not yet implemented:** `billing.html` does not currently compute or enforce this cap at all — there's no code path today that sums trailing Service Fees and checks a claim against it. Treat this as a follow-up engineering item (compute trailing-12-month Service Fees from the `billing` collection, then compare any single claim/dispute against that rolling figure) rather than something to configure as one number.
* **Exceptions:** the cap does **not** apply to the unlimited-liability items in Clause 11.4 (data/DPDP breach, fraud/gross negligence, IP infringement, regulatory penalties, personnel claims, tax/GST ITC loss) — those remain uncapped regardless of this figure.

---

## 3. Free Call Allowance & Paid-Call Rate
* **Contractual Reference:** Schedule III (Commercials)
* **Confirmed rate (verbatim from the template):** *"Calls beyond Free calls will be paid at 1000Rs per call completion."* This ₹1,000/call rate is fixed in the template — do not treat it as a guess.
* **Still blank in the template — ask TSPL:** *"How many preventive/corrective site visits per ATM per month (or total pooled calls) are bundled free before the ₹1,000 paid-call rate applies?"* The template defines which call *types* count as free (Installation / BD (Breakdown) / Assistance / Rollout / PM calls) but leaves the actual free-call *count* blank.
* **Crucial Rule (confirmed):** *"Calls re-dispatched due to vendor related issues will not be considered under Free calls/Paid calls"* — i.e. unbillable, and don't consume the free-call quota either way.
* **Where to configure:** `contracts/{contractId}.freeCallsIncluded` and `contracts/{contractId}.freeCallsRemaining` for the quota; the ₹1,000 paid-call rate should be added as `contracts/{contractId}.paidCallRate` (not currently a field — another small follow-up item, since today's billing screens don't read a rate from the contract doc at all).

---

## 4. Grouting & De-grouting Commercial Rates
* **Contractual Reference:** Schedule III (Commercials) — the "Grouting" column of the rate table
* **Confirmed status:** genuinely blank in the template (the rate cell has no figure), same as the penalty rate above — this one must come from TSPL Commercial leadership too.
* **What to ask TSPL:** *"What are the agreed contractual rates for grouting, re-grouting, and site de-grouting per ATM under this specific engagement?"*
* **Where to configure:** `contracts/{contractId}.rateCard.grouting` and `contracts/{contractId}.rateCard.degrouting`.

---

## 5. SLA Response & Resolution Targets by RBI Location Category — already fixed, don't tier it
* **Contractual Reference:** Schedule II Part B (Service Levels & Penalty)
* **Confirmed (verbatim from the template):** a single flat row — *"Response Time: 2 hrs. Resolution Time: 2 hrs"* — applied 24x7x365, with **no tiering by RBI location category** (Metro/Urban/Semi-Urban/Rural is an ATM classification used elsewhere in the app for reporting, but Schedule II does not give each category a different TAT).
* **`setup-data.html` already seeds this correctly** — Metro, Urban, Semi-Urban and Rural are all seeded at `responseMins: 120, resolutionMins: 120`. **Do not "correct" this to a tiered scheme** (e.g. 4h/6h/8h resolution for the non-Metro categories) — that would be *loosening* the SLA below what the signed template actually commits TSPL to, and would under-report real breach exposure.
* If a specific bank/site ever negotiates a genuinely different TAT from this template, that's a customer-specific amendment — configure it only for that contract document, not as a change to the general baseline.
* **Where to configure:** `contracts/{contractId}.slaMatrix` containing keys `Metro`, `Urban`, `Semi-Urban`, `Rural`, each with `responseMins` and `resolutionMins` — leave all four at `120`/`120` unless a specific signed amendment says otherwise.

---

### Step-by-Step Entry in TSPL ServiceDesk
1. Navigate to **`setup-data.html`** or **Firestore Console** > `contracts` collection.
2. Select the active contract document `contract_hpy_2026`.
3. Update the figures collected above.
4. Save the record. All active calculations on `sla-board.html`, `dockets.html`, and `billing.html` will automatically synchronize.
