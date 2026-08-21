# TSPL ServiceDesk — Contract Parameters Setup Guide

Before launching TSPL ServiceDesk into live operations with HPY, you must obtain 5 specific contractual parameters from the TSPL Commercial & Operations leadership team and record them in the **Active Contract** document (`contracts/contract_hpy_2026` or via the Admin Setup Portal).

---

## 1. Liquidated Damages (Penalty) Rate per Instance
* **Contractual Reference:** Schedule II Part B (Service Level Agreement & Penalties)
* **What to ask TSPL:** *"What is the penalty amount (in INR) charged per breached docket/instance for failing to meet the Response or Resolution SLA?"*
* **Baseline / Default:** `₹500` per instance.
* **Where to configure:** `contracts/{contractId}.slaMatrix[category].penaltyPerInstance` or `contracts/{contractId}.defaultPenaltyRate`.

---

## 2. Aggregate Liability Cap
* **Contractual Reference:** Clause 14 / Limitation of Liability
* **What to ask TSPL:** *"What is the maximum aggregate liability cap per month or year under the HPY Master Services Agreement?"*
* **Baseline / Default:** Commonly capped at **100% of the monthly invoice value** or a fixed figure such as `₹50,00,000`.
* **Where to configure:** `contracts/{contractId}.liabilityCapRupees` (used in `billing.html` to ensure monthly penalty deductions never exceed the contractual liability ceiling).

---

## 3. Free Call Allowance Count
* **Contractual Reference:** Schedule III (Commercials & Scope of Work)
* **What to ask TSPL:** *"How many preventive / corrective site visits per ATM per month (or total pooled calls) are bundled free before billable 'Paid Call' rates apply?"*
* **Baseline / Default:** Typically `2` free calls per ATM/month, or a pooled quota (e.g. `2,400` free calls across the ATM estate).
* **Crucial Rule:** Calls re-dispatched due to vendor/engineer errors are strictly **Unbillable** and do not consume free call credits.
* **Where to configure:** `contracts/{contractId}.freeCallsIncluded` and `contracts/{contractId}.freeCallsRemaining`.

---

## 4. Grouting & De-grouting Commercial Rates
* **Contractual Reference:** Schedule III Part C (Ad-hoc Installation & Site Civil Services)
* **What to ask TSPL:** *"What are the agreed contractual rates for standard 4-bolt M12 core chemical grouting, re-grouting, and site de-grouting per ATM?"*
* **Baseline / Default:** Standard market rates:
  - Chemical Grouting (4-bolt Hilti/Fisher M12): `₹1,850` per site.
  - De-grouting & base floor restoration: `₹1,200` per site.
* **Where to configure:** `contracts/{contractId}.rateCard.grouting` and `contracts/{contractId}.rateCard.degrouting`.

---

## 5. SLA Response & Resolution Targets by RBI Location Category
* **Contractual Reference:** Schedule II (Turn Around Time Matrix)
* **What to ask TSPL:** *"Does HPY enforce a flat 2-hour SLA across all locations, or are there tiered TAT targets based on RBI Location Classification?"*
* **Baseline / Default Matrix (24x7 Coverage):**

| RBI Category | Description | Response SLA Target | Resolution SLA Target |
| :--- | :--- | :--- | :--- |
| **Metro** | Tier-1 cities (> 50 Lakh population) | **2 Hours (120 min)** | **2 Hours (120 min)** |
| **Urban** | Tier-2 cities (10–50 Lakh population) | **2 Hours (120 min)** | **4 Hours (240 min)** *(if tiered)* |
| **Semi-Urban** | Towns (1–10 Lakh population) | **3 Hours (180 min)** | **6 Hours (360 min)** *(if tiered)* |
| **Rural / Remote** | Villages (< 1 Lakh population) | **4 Hours (240 min)** | **8 Hours (480 min)** *(if tiered)* |

* **Where to configure:** `contracts/{contractId}.slaMatrix` containing keys: `Metro`, `Urban`, `SemiUrban`, `Rural`, with `responseMins` and `resolutionMins`.

---

### Step-by-Step Entry in TSPL ServiceDesk
1. Navigate to **`setup-data.html`** or **Firestore Console** > `contracts` collection.
2. Select the active contract document `contract_hpy_2026`.
3. Update the figures collected above.
4. Save the record. All active calculations on `sla-board.html`, `dockets.html`, and `billing.html` will automatically synchronize.
