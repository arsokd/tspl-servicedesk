export interface ContractSection {
  id: string;
  number: string;
  title: string;
  category: 'core' | 'operations' | 'compliance' | 'commercial' | 'legal' | 'schedules';
  riskLevel: 'critical' | 'high' | 'medium' | 'standard';
  keyHighlights: string[];
  deadlines?: string[];
  statutoryLaws?: string[];
  verbatimContent: string;
  practicalImplications: string;
}

export interface ContractMetadata {
  title: string;
  partyA: {
    name: string;
    shortName: string;
    registeredOffice: string;
    corporateOffice: string;
    business: string;
  };
  partyB: {
    name: string;
    shortName: string;
    scheduleRef: string;
  };
  effectiveDate: string;
  version: string;
  governingLaw: string;
  jurisdiction: string;
  arbitrationSeat: string;
}

export const CONTRACT_METADATA: ContractMetadata = {
  title: "SERVICES AGREEMENT (BNA/CRM/ATM Second Level Maintenance)",
  partyA: {
    name: "HITACHI PAYMENT SERVICES PRIVATE LIMITED",
    shortName: "HPY",
    registeredOffice: "Level-2, MPL Silicon Towers, #23/1, Velachery Tambaram Main Road, Chennai – 600 100",
    corporateOffice: "Godrej Two, Unit No. 904, 9th Floor, Pirojshahnagar, Eastern Express Highway, Vikhroli East, Mumbai 400079",
    business: "Establishing, owning and operating network of Bunch Note Acceptors/Cash Recycler Machines (BNAs/CRMs), ATMs, POS terminals across India."
  },
  partyB: {
    // Confirmed against the actual TSPL/HPY master template (SERVICES_AGREEMENT_TEMPLATE_2026):
    // the template itself leaves "Service Provider" as a blank to be filled from Schedule I
    // (CIN, PAN, GSTIN, directors etc. are all blank fields in the template) — TSPL's real
    // corporate name, from the company profile, is Tech ServiSphere Private Limited.
    name: "TECH SERVISPHERE PRIVATE LIMITED",
    shortName: "TSPL",
    scheduleRef: "Schedule 1"
  },
  // effectiveDate below is a placeholder — the template leaves the commencement date blank
  // ("___ day of _____ 2026"). Replace once the actual signed date is known.
  effectiveDate: "2026-08-01",
  version: "v2026.1-PROD",
  governingLaw: "Laws of India",
  jurisdiction: "Exclusive jurisdiction of Mumbai, Maharashtra",
  arbitrationSeat: "Mumbai, Maharashtra (Sole Arbitrator under Arbitration & Conciliation Act, 1996)"
};

export const CONTRACT_SECTIONS: ContractSection[] = [
  {
    id: "sec-preamble",
    number: "Preamble & Recitals",
    title: "Parties and Background Recitals",
    category: "core",
    riskLevel: "medium",
    keyHighlights: [
      "Agreement entered into between Hitachi Payment Services Pvt Ltd (HPY) and Service Provider (Schedule I).",
      "HPY operates BNA/CRM/ATM network for banks & financial institutions across India.",
      "Service Provider represents it has requisite skill, infrastructure, trained personnel, and 24x7x365 service capability.",
      "Principal-to-principal basis with no agency, partnership, or employment relationship."
    ],
    deadlines: ["365 days a year service readiness"],
    statutoryLaws: ["Companies Act, 1956/2013"],
    verbatimContent: `SERVICES AGREEMENT
THIS SERVICE AGREEMENT (hereinafter referred as “Agreement”) is made and entered on this ___ day of _____ 2026 by and between;
HITACHI PAYMENT SERVICES PRIVATE LIMITED, a Company incorporate under the provisions of Companies Act, 1956 and having its registered Office at Level-2, MPL Silicon Towers, #23/1, Velachery Tambaram Main Road, Chennai – 600 100 and corporate office at Godrej Two, Unit No. 904, 9th Floor, Pirojshahnagar, Eastern Express Highway, Vikhroli East, Mumbai 400079 (hereinafter referred as “HPY”) (which term shall so far as the context admits be deemed to mean and include its divisions, subsidiaries, affiliates and their successors and assigns).
AND
SERVICE PROVIDER (hereinafter collectively referred to as “Service Provider” details of which stated in Schedule I to this Agreement)
HPY and Service Provider are hereinafter collectively referred to as the “Parties” and each of them is individually referred to as a “Party”).

WHEREAS:
A. HPY is engaged in the business of establishing, owning and operating network of Bunch Note Acceptors/Cash Recycler Machines (hereinafter referred to as “BNAs/CRMs”) in various places across India, which HPY intends to make available to various banks and financial institutions for the use and benefit of their customers/clientele, together with software solutions for transaction processing at BNAs/CRMs, ATM’s, POS terminals and other value added services;
B. Service Provider has represented to HPY that it provides the Services in India and possesses the requisite skill, knowledge, experiences, expertise, infrastructure and capability to carry out the Services on all days throughout the year, and has obtained all required regulatory and statutory approvals;
C. HPY desires to appoint the Service Provider to perform the Services subject to terms and conditions herein.`,
    practicalImplications: "HPY contracts as a principal and operates critical banking cash infrastructure. The Service Provider guarantees full 24/7/365 operational readiness."
  },
  {
    id: "sec-1",
    number: "Section 1",
    title: "Definitions, Interpretation & Order of Precedence",
    category: "core",
    riskLevel: "high",
    keyHighlights: [
      "Strict Order of Precedence: 1. Main Body > 2. Written Amendments > 3. PO/Work Orders > 4. Schedules & Annexures > 5. Written Instructions.",
      "Comprehensive definition of Confidential Information surviving indefinitely.",
      "DPDP Act 2023 and DPDP Rules 2025 expressly incorporated with precedence in privacy matters.",
      "GST/ITC non-compliance strictly defined to prevent tax loss to HPY."
    ],
    deadlines: ["Order of precedence resolves any conflicting specifications immediately"],
    statutoryLaws: ["DPDP Act 2023", "DPDP Rules 2025", "IT Act 2000", "GST Laws"],
    verbatimContent: `1. DEFINITIONS, INTERPRETATION & ORDER OF PRECEDENCE
1.1. DEFINITIONS
- “Agreement” means this Services Agreement together with all Schedules, Annexures, Appendices, exhibits, written instructions, and all amendments...
- “Confidential Information” means and includes all information of whatever nature... software, systems, business plans, commercial relationships, financial data, employee lists...
- “Customer” means HPY or any bank, financial institution, company, government authority...
- “Data” includes personal data, digitized information, surveillance footage, audio/video recordings...
- “Data Breach” means any unauthorised processing of personal data or accidental disclosure, loss of access...
- “Data Privacy Legislations” means DPDP Act 2023 & DPDP Rules 2025, IT Act 2000 & SPDI Rules 2011, RBI guidelines.
- “Personnel” means employees, staff, contractors, sub-contractors deployed by Service Provider.
- “Scope of Work” set out in Schedule II including POs/Work Orders.
- “Service Fee” set out in Schedule III subject to deductions and set offs.

1.3. Order of Precedence:
(a) The main body of this Agreement;
(b) Any written Amendments executed by the Parties;
(c) Any Purchase Orders or Work Orders issued by HPY under this Agreement;
(d) The Schedules and Annexures;
(e) Written instructions issued by HPY relating to the Scope of Work.`,
    practicalImplications: "If a PO or Schedule contradicts the Main Body, the Main Body controls. Strict definitions ensure banking client compliance."
  },
  {
    id: "sec-2",
    number: "Section 2",
    title: "Appointment and Scope of Services",
    category: "operations",
    riskLevel: "medium",
    keyHighlights: [
      "Non-exclusive, principal-to-principal appointment. HPY free to engage multiple service providers.",
      "Services to be rendered 24x7x365 across India for BNA/CRM/ATM fleet.",
      "HPY has unilateral right to amend Scope of Work; binding immediately on Service Provider.",
      "Dedicated Project Manager required; HPY has veto and replacement rights at will without cause."
    ],
    deadlines: ["Services active 365 days/year without holiday downtime"],
    statutoryLaws: ["Indian Contract Act, 1872"],
    verbatimContent: `2. APPOINTMENT AND SCOPE OF SERVICES
2.1. Appointment of Service Provider: Non-exclusive, principal-to-principal basis. HPY entitled to engage any other service provider(s) for identical or similar services.
2.2. Purpose and Scope: Covers Schedule II (SLM). Service Provider shall perform Services on all days throughout the year.
2.3. Modifications: HPY has sole discretion to amend/modify Scope of Work. Service Provider cannot alter scope or suspend services without HPY consent.
2.4. Standard of Performance: Due skill, care, diligence, industry best practices, compliance with all laws and no disruption to HPY or bank customers.
2.6. Project Management: Dedicated Project Manager acceptable to HPY. HPY has right to require replacement of Project Manager or Personnel if deemed unsuitable or incompetent.
2.7. No Agency: No authority to act as agent or bind HPY.`,
    practicalImplications: "HPY retains absolute control over scope changes, vendor performance oversight, and personnel replacements."
  },
  {
    id: "sec-3",
    number: "Section 3",
    title: "Term and Renewal Conditions",
    category: "core",
    riskLevel: "medium",
    keyHighlights: [
      "Time is strictly of the essence for all obligations.",
      "No automatic renewal: renewal requires formal written instrument signed by HPY.",
      "Bank Customers entitled to full benefit of services.",
      "Interim service continuation governed by agreement terms if requested by HPY."
    ],
    deadlines: ["Initial fixed term with written extension required"],
    statutoryLaws: ["Indian Contract Act, 1872"],
    verbatimContent: `3. TERM
3.1. Commences on Commencement Date and remains valid for initial fixed term. Time shall be of the essence. HPY executes for itself and on behalf of bank Customers.
3.2. Upon expiry, HPY may renew at sole discretion on revised commercial terms. Renewal shall NOT be automatic. Requires written renewal instrument. Service Provider must continue interim services if directed by HPY.`,
    practicalImplications: "Vendors have no claim to automatic extension; strict adherence to time milestones is mandatory."
  },
  {
    id: "sec-4",
    number: "Section 4",
    title: "Representations and Warranties of Service Provider",
    category: "compliance",
    riskLevel: "critical",
    keyHighlights: [
      "Full corporate validity, statutory approvals, and licenses maintained at vendor cost.",
      "Personnel remain sole employees of vendor; vendor bears 100% labour law/PF/ESIC liabilities.",
      "Schedule IV Background Verification (BGV) mandatory before deployment (no criminal records).",
      "DPDP Act 2023 & DPDP Rules 2025 compliance strictly enforced.",
      "CRITICAL: 2 (Two) hours mandatory notification to HPY upon any Data Breach.",
      "DATA LOCALIZATION: All data stored and processed strictly within India data centers."
    ],
    deadlines: ["<= 2 Hours: Mandatory Data Breach written report to HPY"],
    statutoryLaws: ["DPDP Act 2023", "DPDP Rules 2025", "IT Act 2000", "Labour & Wages Acts"],
    verbatimContent: `4. REPRESENTATIONS AND WARRANTIES OF THE SERVICE PROVIDER
4.1 Corporate authority and binding enforceability.
4.2 Must obtain and maintain all statutory licenses/approvals at own cost.
4.4 Deploys adequate, competent, trained and background-verified personnel.
4.5 All Personnel are sole employees of Service Provider. Service Provider solely responsible for salaries, wages, statutory dues (PF/ESIC/bonus).
4.6 Background verification mandatory per Schedule IV. No personnel with criminal convictions.
4.7 Full compliance with Digital Personal Data Protection Act, 2023 ('DPDP Act') and DPDP Rules, 2025.
4.8 Data usage strictly within the territory of India; all servers/data centers situated in India.
4.9 IN THE EVENT OF DATA BREACH: Service Provider shall without delay and in any event within 2 (two) hours of becoming aware, provide HPY detailed description including nature, extent, timing, location and likely impact.
4.10 IP warranties: Materials owned or licensed; non-infringement guarantee.`,
    practicalImplications: "Immediate 2-hour notification threshold for data breaches, complete India-only data localization, and strict BGV adherence."
  },
  {
    id: "sec-5",
    number: "Section 5",
    title: "Covenants and Operational Obligations",
    category: "operations",
    riskLevel: "high",
    keyHighlights: [
      "Strict performance to Scope of Work, SLA, and PO instructions with business continuity measures.",
      "Periodic service performance and incident reporting to HPY.",
      "Subcontracting strictly prohibited without prior written consent of HPY.",
      "Comprehensive insurance coverage required (Professional liability, Workmen comp, Third party).",
      "HPY may terminate on 15 days notice for standard failure or suspend services with fee deductions."
    ],
    deadlines: ["15 Days: HPY notice period to terminate for deficient performance"],
    statutoryLaws: ["Insurance Act", "Anti-Bribery Laws"],
    verbatimContent: `5. COVENANTS AND OBLIGATIONS OF THE SERVICE PROVIDER
5.1 Perform Services strictly per Scope of Work, POs, and service levels. Promptly rectify non-conforming services at own cost.
5.3 Periodic reports on performance, incidents, risks. Maintain complete records for unannounced audits.
5.5 Deploy only background-verified personnel. Replace unsuitable personnel upon HPY demand.
5.6 No subcontracting, assignment, or transfer without HPY's prior written consent.
5.7 Maintain adequate insurance (professional liability, employee comp, third party).
5.8 Zero tolerance for corrupt, fraudulent, or unethical practices.
5.10 If standards not met, HPY may terminate on fifteen (15) days' prior written notice without compensation, or suspend services with fee reduction.
5.11 HPY may appoint third parties for services; vendor must extend full cooperation.`,
    practicalImplications: "HPY has fast-track 15-day termination right for performance failure and complete prohibition on unapproved subcontracting."
  },
  {
    id: "sec-6",
    number: "Section 6",
    title: "Fees, Payment Terms and Tax/GST Compliance",
    category: "commercial",
    riskLevel: "critical",
    keyHighlights: [
      "60-Day payment term from receipt of undisputed compliant invoices.",
      "HPY dispute notice window: commercially reasonable efforts within 30 working days.",
      "Invoice Deductions allowed for SLA penalties, liquidated damages, deficient work, and lost ITC.",
      "Over-billing / discrepancy refund within 7 DAYS by Service Provider.",
      "GST / ITC Warranty: Invoices must reflect in GSTR-1 and auto-populate HPY's GSTR-2B.",
      "Indemnity & deduction right against vendor for any denial, loss or delay of Input Tax Credit.",
      "TDS deducted as per Income Tax Act; immediate termination for tax violations."
    ],
    deadlines: [
      "60 Days: HPY payment term for undisputed invoices",
      "30 Working Days: HPY dispute notice effort window",
      "7 Days: Mandatory vendor refund for billing errors"
    ],
    statutoryLaws: ["CGST Act 2017", "IGST Act", "Income Tax Act (TDS)"],
    verbatimContent: `6. FEES, PAYMENT TERMS AND TAX/GST COMPLIANCE
6.1 HPY pays Service Fee per Schedule III based on accepted deliverables.
6.2 All-inclusive except GST.
6.3 HPY entitled to deductions for: 6.3.1 non-performance, 6.3.2 penalties/liquidated damages, 6.3.4 Loss/denial of Input Tax Credit (ITC), 6.3.5 billing discrepancies.
6.5 Invoice requirements: GSTIN, HSN/SAC codes, taxable value, GST rate, place of supply, supporting attendance logs and acceptance certificates.
6.7 Payment of undisputed portions within sixty (60) days of receipt.
6.8 HPY notifies disputed amounts within 30 working days; failure does not waive right to dispute.
6.10 Discrepancy or over-payment must be refunded within 7 days.
6.12 Subject to TDS with TDS certificates.
6.14 GST Obligations: All invoices uploaded to GSTN within statutory deadlines. Must appear in GSTR-1 and auto-populate in HPY GSTR-2B.
6.14.3 If HPY loses ITC due to vendor default, HPY deducts or recovers full tax + interest + penalties.
6.14.5 Immediate termination for tax/GST breach.`,
    practicalImplications: "Rigid 60-day cycle with total financial protection for HPY against any GST/ITC mismatches or billing overcharges."
  },
  {
    id: "sec-7",
    number: "Section 7",
    title: "Commencement, Personnel and Operational Obligations",
    category: "operations",
    riskLevel: "high",
    keyHighlights: [
      "Time is of the essence; delays constitute material breach.",
      "Service Provider is sole employer; indemnifies HPY against all labour/wage claims.",
      "Schedule IV background screening must precede deployment.",
      "Mandatory visible ID cards for all technicians on ATM/CRM sites.",
      "Immediate removal and replacement of any staff upon HPY request."
    ],
    deadlines: ["Immediate replacement of unsuitable field personnel"],
    statutoryLaws: ["Contract Labour Act", "Minimum Wages Act", "EPF & MP Act", "ESI Act"],
    verbatimContent: `7. COMMENCEMENT, PERSONNEL AND OPERATIONAL OBLIGATIONS
7.1 Continuous, uninterrupted service delivery. Time of the essence.
7.2 Sole employer responsibility for salaries, wages, benefits, PF, ESIC. Complete indemnity to HPY.
7.3 Comprehensive background verification strictly per Schedule IV before deployment.
7.4 Professional conduct, discipline, valid ID cards displayed on sites. Immediate removal upon HPY notice.
7.5 Maintain adequate manpower, tools, equipment, 365-day operation.
7.6 No lien or retention right over HPY property or cash machines.
7.8 Appoint dedicated Project Manager; HPY may require replacement anytime.`,
    practicalImplications: "Complete insulation of HPY from field labour liabilities and strict technician vetting before site access."
  },
  {
    id: "sec-8",
    number: "Section 8",
    title: "Confidentiality, Data Protection & Information Security",
    category: "compliance",
    riskLevel: "critical",
    keyHighlights: [
      "Confidentiality survives INDEFINITELY after termination.",
      "Strict 2-hour notification for any actual or suspected security incident.",
      "Mandatory ISO/IEC 27001 or equivalent information security program.",
      "Prohibition: No personal devices, no removable media, no unapproved cloud apps, no public Wi-Fi.",
      "Complete Data Localization in India; no data export without prior written approval."
    ],
    deadlines: [
      "<= 2 Hours: Security incident & confidentiality breach notification",
      "Indefinite survival of confidentiality post-contract"
    ],
    statutoryLaws: ["DPDP Act 2023", "ISO/IEC 27001", "CERT-In Cyber Directives"],
    verbatimContent: `8. CONFIDENTIALITY, DATA PROTECTION AND INFORMATION SECURITY
8.1 Keep all Confidential Information strictly confidential. Survives indefinitely.
8.2 Execute confidentiality undertakings with all personnel/subcontractors.
8.3 Need-to-know access only; detailed access logs maintained.
8.4 MANDATORY NOTIFICATION: Within two (2) hours of becoming aware of actual or suspected breach of confidentiality, data compromise, or security incident, provide incident report, impact, containment, root cause.
8.5 Injunctive relief and immediate termination rights for HPY.
8.6 Data remains exclusive property of HPY. Reasonable security practices.
8.7 DPDP Act compliance; no data transfer outside India without prior consent.
8.8 Maintain ISO/IEC 27001 info security program.
8.10 Banned: personal devices for HPY work, storing data on removable media, unapproved cloud tools, unsecured networks.
8.11 Return or destroy all Confidential Information immediately upon termination.`,
    practicalImplications: "Zero tolerance for data leakage; strict ISO 27001 controls and 2-hour CERT-In/DPDP incident alignment."
  },
  {
    id: "sec-9",
    number: "Section 9",
    title: "Insurance Requirements & Endorsements",
    category: "operations",
    riskLevel: "high",
    keyHighlights: [
      "Mandatory Comprehensive General Liability, Workmen Comp, and Fidelity/Crime/Dishonesty insurance.",
      "HPY must be named as LOSS PAYEE / BENEFICIARY under Fidelity and Crime policies.",
      "30 Days prior written notice required for any policy cancellation or material modification.",
      "HPY right to procure insurance at vendor expense if vendor defaults."
    ],
    deadlines: ["30 Days: Prior notice to HPY for insurance alteration/cancellation"],
    statutoryLaws: ["Insurance Regulatory and Development Authority (IRDAI) regulations"],
    verbatimContent: `9. INSURANCE
9.1 Service Provider must maintain at own cost:
9.1.1 Comprehensive General Liability (CGL) Insurance (bodily injury, death, property damage);
9.1.2 Employee/Workmen-related Insurance;
9.1.3 Fidelity, Crime or Dishonesty Insurance covering fraud, theft, robbery, forgery by personnel;
9.1.4 Other insurance specified by HPY.
9.2 HPY MUST BE NAMED AS LOSS PAYEE / BENEFICIARY on fidelity and crime policies.
9.3 Provide proof of premium and policy certificates upon execution and renewal.
9.6 HPY may procure insurance at vendor cost if vendor fails to maintain.
9.7 30 days prior written notice before cancellation or non-renewal.`,
    practicalImplications: "Direct cash protection for ATM theft or employee fraud through HPY Loss Payee endorsement."
  },
  {
    id: "sec-10",
    number: "Section 10",
    title: "Audit, Inspection, Oversight & Record Retention",
    category: "compliance",
    riskLevel: "high",
    keyHighlights: [
      "Unrestricted, irrevocable audit rights by HPY, Bank Customers, and Regulators (RBI).",
      "Audits can be unannounced without prior justification.",
      "Subcontractors subject to identical audit oversight.",
      "100% Audit costs shifted to Service Provider if non-compliance or breach is discovered."
    ],
    deadlines: ["Immediate access for unannounced regulator/customer audits"],
    statutoryLaws: ["RBI Outsourcing Directives", "Banking Regulation Act"],
    verbatimContent: `10. AUDIT, INSPECTION, OVERSIGHT AND RECORD RETENTION
10.1 HPY, internal/external auditors, statutory auditors, Bank Customers, and regulators (RBI) have unrestricted right to audit and inspect all records, systems, BGV reports, logs, and SLM performance.
10.2 Covers all offices, branches, delivery centres, data centres, cloud environments.
10.3 Unconditional cooperation. Confidentiality cannot be invoked to block audit access.
10.4 Subcontractor audit rights mandatory.
10.8 Routine audits borne by HPY; BUT if audit reveals non-compliance, the ENTIRE COST of audit, follow-up audits and remediation shall be borne by Service Provider.
10.9 Maintain complete records for minimum statutory period or longer as directed.`,
    practicalImplications: "RBI outsourcing guidelines pass through seamlessly to all SLM operations and field units."
  },
  {
    id: "sec-11",
    number: "Section 11",
    title: "Indemnity and Liability",
    category: "legal",
    riskLevel: "critical",
    keyHighlights: [
      "UNLIMITED LIABILITY for: 1. Data Privacy/DPDP breach, 2. Loss/corruption of data, 3. Fraud/Gross Negligence, 4. IP Infringement, 5. Regulatory fines, 6. Personnel claims, 7. Tax/GST ITC losses, 8. All Indemnity obligations.",
      "Capped claims limited to preceding 12 months service fees (applies per claim, not aggregate term).",
      "Liability cap does not apply in repeated non-performance or lack of insurance.",
      "HPY total aggregate liability capped at preceding 12 months fees, zero consequential damages."
    ],
    deadlines: ["Per-claim 12-month trailing fee calculation for non-exempt claims"],
    statutoryLaws: ["Indian Contract Act, 1872", "DPDP Act 2023"],
    verbatimContent: `11. INDEMNITY AND LIABILITY
11.1 Comprehensive indemnity to HPY, directors, officers, customers against breach, negligence, fraud, regulatory penalties, labour claims, and data breach.
11.4 UNLIMITED LIABILITY: The Service Provider's liability shall be UNLIMITED, absolute and unrestricted in respect of:
11.4.1 breach of confidentiality, Data Privacy Legislations, cybersecurity;
11.4.2 loss/corruption/unauthorised disclosure of data;
11.4.3 fraud, gross negligence, wilful misconduct;
11.4.4 IP infringement;
11.4.5 regulatory penalties;
11.4.6 personnel claims;
11.4.7 breach of applicable laws;
11.4.8 tax/GST non-compliance & ITC loss;
11.4.9 property/asset loss;
11.4.10 all indemnity obligations.
11.5 Standard capped claims limited to Service Fees paid in the 12 months preceding the claim (per claim basis).
11.6 Cap void if repeated failure or failure to maintain insurance.`,
    practicalImplications: "Vendor bears complete unmitigated financial liability for data, tax, regulatory, IP, and fraud risks."
  },
  {
    id: "sec-12",
    number: "Section 12",
    title: "Intellectual Property Rights",
    category: "legal",
    riskLevel: "high",
    keyHighlights: [
      "Work Product = 'Works Made for Hire' and vests exclusively in HPY.",
      "Perpetual, worldwide, royalty-free license to HPY for any vendor Pre-Existing IP.",
      "Service Provider banned from using HPY logos, trademarks, or branding without prior consent.",
      "Unlimited liability for IP infringement."
    ],
    deadlines: ["Immediate surrender of all work product upon contract conclusion"],
    statutoryLaws: ["Copyright Act, 1957", "Patents Act, 1970", "Trademarks Act, 1999"],
    verbatimContent: `12. INTELLECTUAL PROPERTY RIGHTS
12.1 Pre-existing IP retained by respective parties.
12.2 All Work Product created during Services vests exclusively in HPY as works made for hire. Full assignment.
12.3 Perpetual, irrevocable, worldwide, royalty-free license to HPY for embedded pre-existing IP.
12.5 Service Provider defends and indemnifies HPY at own cost against third-party IP claims.
12.7 No use of HPY trademarks or logos.
12.9 Unlimited liability for IP infringement.`,
    practicalImplications: "Custom software integrations, diagnostic scripts, and reports belong 100% to HPY."
  },
  {
    id: "sec-13",
    number: "Section 13",
    title: "Liquidated Damages & SLA Remedies",
    category: "commercial",
    riskLevel: "high",
    keyHighlights: [
      "Liquidated damages agreed as genuine pre-estimate of loss, not penalty.",
      "Direct right of set-off from vendor unpaid invoices or Bank Guarantee.",
      "Balance payment due within 7 DAYS if set-off insufficient.",
      "Does not waive right to terminate for cause or seek additional indemnification."
    ],
    deadlines: ["7 Days: Vendor payment of unpaid liquidated damages balance"],
    statutoryLaws: ["Section 74, Indian Contract Act, 1872"],
    verbatimContent: `13. LIQUIDATED DAMAGES
13.1 Delay/deficiency causes substantial disruption; damages represent genuine pre-estimate of loss.
13.2 Recoverable at agreed rate per day/instance of delay until fully cured.
13.3 Without prejudice to Performance Bank Guarantee, service credits, or suspension.
13.4 HPY has right to set off from pending invoices. Vendor pays balance within seven (7) days of demand.
13.6 Written waiver by HPY required for exceptional reduction.`,
    practicalImplications: "HPY can deduct SLA penalties automatically from monthly invoices without court action."
  },
  {
    id: "sec-14",
    number: "Section 14",
    title: "Conflict of Interest and Non-Circumvention",
    category: "compliance",
    riskLevel: "high",
    keyHighlights: [
      "12 MONTHS post-termination non-circumvention restriction.",
      "Strict ban on soliciting or contracting with HPY bank customers, partners, or vendors introduced by HPY.",
      "Liquidated damages equal to 100% value of diverted business opportunity.",
      "Immediate injunctive relief without posting bond."
    ],
    deadlines: ["12 Months: Post-termination non-circumvention duration"],
    statutoryLaws: ["Indian Contract Act, 1872", "Specific Relief Act, 1963"],
    verbatimContent: `14. CONFLICT OF INTEREST AND NON-CIRCUMVENTION
14.1 Vendor warrants no conflict of interest exists.
14.3 Non-circumvention: During the term and for twelve (12) months thereafter, vendor shall NOT approach, solicit, negotiate with, or contract with any HPY Customer, vendor, or partner introduced through HPY for competitive services.
14.4 No use of HPY confidential pricing/strategy to divert opportunities.
14.6 Penalty: HPY entitled to liquidated damages equivalent to the full value of the diverted business/transaction.
14.7 Survives for 12 months post-termination.`,
    practicalImplications: "Prevents SLM vendors from poaching HPY's banking clients (SBI, HDFC, ICICI, etc.) for 1 year after contract end."
  },
  {
    id: "sec-15",
    number: "Section 15",
    title: "Change Management, Subcontracting & BCP/DR",
    category: "operations",
    riskLevel: "high",
    keyHighlights: [
      "Formal Change Request (CR) required for any scope, system, or tooling adjustment.",
      "Subcontractors must sign identical flow-down terms and pass Schedule IV BGV.",
      "Business Continuity Plan (BCP) & Disaster Recovery (DRP) mandatory.",
      "BCP/DR testing required at least ONCE EVERY 12 MONTHS with reports submitted to HPY.",
      "Hourly updates to HPY during any disaster / outage event until stabilization."
    ],
    deadlines: [
      "Every 12 Months: Mandatory BCP/DR simulation testing",
      "Hourly: Status updates during disaster recovery invocation"
    ],
    statutoryLaws: ["RBI BCP/DR Guidelines"],
    verbatimContent: `15. CHANGE MANAGEMENT, SUBCONTRACTING CONTROLS AND BUSINESS CONTINUITY
15.1 Formal Change Request (CR) required for any alteration. No unapproved changes.
15.2 Subcontracting: Prior written consent required. Subcontractors subject to BGV and Section 10 audit rights.
15.3 BCP and DRP covering system outages, data loss, cyber incidents, pandemic.
15.3.2 Conduct BCP/DR testing at least once every twelve (12) months; share test results and remediation.
15.3.3 Upon invocation: ensure continuity, provide HOURLY updates to HPY until stabilization, restore within approved timelines.
15.4 All BCP/DR obligations performed at no additional cost to HPY.`,
    practicalImplications: "Guarantees high-availability ATM network uptime even during regional outages or cyber events."
  },
  {
    id: "sec-16",
    number: "Section 16",
    title: "Termination and Exit Management",
    category: "legal",
    riskLevel: "critical",
    keyHighlights: [
      "Termination for Convenience: HPY may terminate at will on 30 DAYS written notice without liability.",
      "Immediate termination for cause by HPY (breach, fraud, DPDP violation, insolvency, regulatory order).",
      "Vendor termination right ONLY for HPY uncured material breach after 60 DAYS written notice.",
      "Up to 90 DAYS mandatory Exit Assistance provided at NO ADDITIONAL COST to HPY.",
      "Survival of confidentiality, indemnity, IP, audit, GST, and exit obligations."
    ],
    deadlines: [
      "30 Days: HPY convenience termination notice",
      "60 Days: Vendor cure notice window for HPY material breach",
      "Up to 90 Days: Mandatory free transition/exit assistance"
    ],
    statutoryLaws: ["Specific Relief Act, 1963"],
    verbatimContent: `16. TERMINATION AND EXIT MANAGEMENT
16.1 Convenience: HPY may terminate in whole or part without assigning reason on thirty (30) days' prior written notice.
16.2 Cause: HPY may terminate with immediate effect for: material breach, repeated SLA failures, fraud/negligence, data privacy breach, regulatory penalty, failure to maintain insurance, insolvency, or change in control.
16.3 Vendor right: May terminate ONLY for material breach by HPY uncured for sixty (60) days.
16.6 Return all property, assets, data, work product immediately.
16.7 Exit Assistance: Service Provider provides full cooperation and exit assistance for up to ninety (90) days at no additional cost.
16.10 Surviving clauses: Confidentiality, indemnity, liability, IP, audit, GST, exit management.`,
    practicalImplications: "HPY has maximum flexibility to exit with 30-day notice and lock in 90-day smooth transition support."
  },
  {
    id: "sec-17",
    number: "Section 17",
    title: "Force Majeure",
    category: "legal",
    riskLevel: "medium",
    keyHighlights: [
      "Force Majeure excludes: manpower shortage, cyberattacks/ransomware, equipment maintenance failure, vendor subcontractor default.",
      "48-Hour mandatory notification to invoke Force Majeure.",
      "If Force Majeure exceeds 30 CONSECUTIVE DAYS, HPY may terminate without liability."
    ],
    deadlines: [
      "48 Hours: Notice of Force Majeure event",
      "30 Days: HPY right to terminate if FM persists"
    ],
    statutoryLaws: ["Indian Contract Act (Section 56)"],
    verbatimContent: `17. FORCE MAJEURE
17.1 Covers acts of God, war, riot, pandemic declared by government, changes in law.
17.2 EXCLUSIONS: Shortage of manpower, equipment failure due to poor maintenance, cyber incidents/ransomware/data breaches, financial distress, subcontractor defaults.
17.3 48 hours notice required with impact and mitigation plan.
17.5 HPY may procure third party replacement services and suspend payments during FM.
17.6 If FM continues beyond thirty (30) consecutive days, HPY may terminate without liability.
17.7 FM does not relieve confidentiality, data protection, indemnity, or return of property.`,
    practicalImplications: "Cyberattacks and tech failures are explicitly barred from being claimed as Force Majeure."
  },
  {
    id: "sec-18",
    number: "Section 18",
    title: "Governing Law and Dispute Resolution",
    category: "legal",
    riskLevel: "medium",
    keyHighlights: [
      "Governed exclusively by Indian Law.",
      "15 Days amicable negotiation period prior to arbitration.",
      "Sole Arbitrator in Mumbai, Maharashtra under Arbitration and Conciliation Act, 1996.",
      "Exclusive jurisdiction of Mumbai courts for interim injunctive relief.",
      "Services must continue uninterrupted during pendency of dispute."
    ],
    deadlines: ["15 Days: Negotiation window before initiating arbitration"],
    statutoryLaws: ["Arbitration and Conciliation Act, 1996", "Code of Civil Procedure, 1908"],
    verbatimContent: `18. GOVERNING LAW AND DISPUTE RESOLUTION
18.1 Governed and construed under Laws of India.
18.2 Exclusive jurisdiction of courts at Mumbai, Maharashtra.
18.3 15 days amicable negotiation.
18.4 Final settlement by sole arbitrator appointed mutually. Seat and venue: Mumbai. English language. Award final and binding.
18.5 HPY entitled to interim/injunctive relief without bond.
18.6 Service Provider must continue services during dispute without slowdown.`,
    practicalImplications: "Fast dispute resolution in Mumbai with explicit ban on service stoppage during disputes."
  },
  {
    id: "sec-19",
    number: "Section 19",
    title: "Miscellaneous Provisions",
    category: "legal",
    riskLevel: "high",
    keyHighlights: [
      "Entire Agreement superseding all prior oral/written understandings.",
      "All stamp duty, registration fees borne 100% by Service Provider.",
      "12 MONTHS non-solicitation of HPY employees.",
      "Strict ban on press releases or public announcements without HPY consent.",
      "Notices to HPY Corporate Office at Godrej Two, 9th Fl, Vikhroli East, Mumbai 400079."
    ],
    deadlines: ["12 Months: Post-term non-solicitation"],
    statutoryLaws: ["Indian Stamp Act, 1899", "Registration Act, 1908"],
    verbatimContent: `19. MISCELLANEOUS
19.1 Entire agreement.
19.2 Amendments require signed writing.
19.3 No assignment without HPY consent.
19.5 Formal notice delivery to HPY Mumbai Corporate Office (Godrej Two, Unit 904, 9th Fl, Vikhroli East, Mumbai 400079).
19.10 All stamp duty and registration charges borne exclusively by Service Provider.
19.12 Non-solicitation: 12 months restriction on soliciting HPY personnel.
19.13 No publicity or trademark use without consent.`,
    practicalImplications: "All statutory stamping costs are on the vendor; clear notice addresses established."
  },
  {
    id: "sec-20",
    number: "Section 20",
    title: "Anti-Bribery, Anti-Corruption & HPY Code of Conduct",
    category: "compliance",
    riskLevel: "high",
    keyHighlights: [
      "Strict compliance with Prevention of Corruption Act 1988, US FCPA, and UK Bribery Act.",
      "Adherence to HPY Code of Conduct (HPY CoC).",
      "Immediate disclosure of beneficial ownership; HPY has 30 DAYS due diligence right.",
      "Mandatory anti-bribery & ethics training for senior management."
    ],
    deadlines: ["30 Days: HPY beneficial ownership due diligence window"],
    statutoryLaws: ["Prevention of Corruption Act, 1988", "US FCPA", "UK Bribery Act 2010"],
    verbatimContent: `20. ANTI-BRIBERY, ANTI-CORRUPTION AND CODE OF CONDUCT COMPLIANCE
20.1 Compliance with PCA 1988, FCPA, UK Bribery Act.
20.3 Mandatory compliance with HPY Code of Conduct. Material breach for any violation.
20.6 Full cooperation in internal/external anti-corruption investigations.
20.9 Beneficial ownership disclosure: HPY has 30 days to review and terminate if compliance risk.
20.10 Certification that no beneficial owner is a government official or political entity.
20.11 Mandatory senior management training in anti-bribery.`,
    practicalImplications: "Full global standard compliance ensuring zero corruption in banking procurement."
  },
  {
    id: "sec-21",
    number: "Section 21",
    title: "Export Control Policy",
    category: "compliance",
    riskLevel: "medium",
    keyHighlights: [
      "Compliance with US Export Control Reform Act (ECRA) & Export Administration Regulations (EAR).",
      "Prohibition against transferring tech data to US-embargoed countries or military/nuclear end-uses."
    ],
    statutoryLaws: ["US Export Control Reform Act", "EAR"],
    verbatimContent: `21. EXPORT CONTROL POLICY
21.1 Act in strict compliance with export control and data protection laws. No export/re-export of HPY technical data without licenses under US ECRA/EAR.
21.2 No transfer to US-embargoed destinations or denied party entities.
21.3 Certification against nuclear, chemical, biological, or military weapon use.`,
    practicalImplications: "Protects high-tech ATM hardware firmware and cryptographic modules."
  },
  {
    id: "sec-22",
    number: "Section 22",
    title: "Non-Solicitation and Non-Hire",
    category: "legal",
    riskLevel: "critical",
    keyHighlights: [
      "12 MONTHS non-solicitation & non-hire of HPY personnel (active or employed in past 6 months).",
      "LIQUIDATED DAMAGES: 100% of the employee's Annual Total Cost-to-Company (CTC).",
      "Injunctive relief without bond.",
      "HPY remains free to hire vendor personnel at any time without restriction."
    ],
    deadlines: [
      "12 Months: Duration of non-solicit & non-hire post-termination",
      "6 Months: Lookback window for former HPY employees"
    ],
    statutoryLaws: ["Indian Contract Act, 1872"],
    verbatimContent: `22. NON-SOLICITATION AND NON-HIRE
22.1 12 months post-termination restriction on soliciting or recruiting HPY employees.
22.2 Ban on hiring any HPY employee employed in preceding 6 months without prior written consent.
22.4 Right to injunctive relief without posting bond.
22.5 LIQUIDATED DAMAGES: Service Provider liable to pay 100% of the annual total cost-to-company (CTC) of the employee concerned as liquidated damages.
22.6 HPY is NOT restricted from hiring vendor personnel.`,
    practicalImplications: "Severe financial penalty (1x annual CTC) if vendor attempts to hire HPY engineers or managers."
  },
  {
    id: "sched-1",
    number: "Schedule I",
    title: "Service Provider Corporate Details",
    category: "schedules",
    riskLevel: "standard",
    keyHighlights: [
      "Entity details: Name, Company type, Directors/Partners, Authorized Signatories.",
      "Statutory Registrations: CIN, PAN, PF Registration, ESIC, GSTIN.",
      "Official notice address and contact coordinates."
    ],
    statutoryLaws: ["Companies Act", "Income Tax Act", "GST Act", "EPF Act", "ESI Act"],
    verbatimContent: `Schedule 1
Name and other details of the Service Provider:
- Name of the company / partnership firm / proprietary concern / HUF / society / trust
- Type of entity
- Names of all DIRECTORS / partners / Karta / members
- Name(s) of authorized signatory(ies)
- Registered / Head / Principal office address
- CIN (Registration No.), PAN, PF Registration No., ESIC No., Goods & Services Tax No. (GSTIN)
- Address where notice is to be sent, Fax, Email, Phone, Attention person`,
    practicalImplications: "Master KYC and statutory verification sheet for the contractor."
  },
  {
    id: "sched-2",
    number: "Schedule II",
    title: "Scope of Work: Second Level Maintenance (SLM) & SLA Matrix",
    category: "schedules",
    riskLevel: "critical",
    keyHighlights: [
      "PART A: SLM services for both parts and non-parts calls across BNA/CRM/ATM machines.",
      "Covers all calls escalated beyond First Level Maintenance (FLM).",
      "PART B: 24x7x365 coverage including public holidays.",
      "RBI SITE CLASSIFICATION SLA: Turnaround Time (TAT) = 2 Hours Response Time & 2 Hours Resolution Time."
    ],
    deadlines: [
      "Response Time: 2 Hours from call logging",
      "Resolution Time: 2 Hours (24x7x365 coverage)"
    ],
    statutoryLaws: ["RBI Master Direction on ATM / Cash Recycler Operations"],
    verbatimContent: `Schedule – II
PART A
The Service Provider has agreed to provide Second Level Maintenance ("SLM") services to HPY for both parts and non-parts calls. Any exceptions would be chargeable. Any calls that cannot be fixed by First Level Maintenance ("FLM") agent can be deemed as SLM which requires an engineer's intervention, which may be parts or non-parts call.

PART B
SERVICE LEVELS & PENALTY
Service Provider shall provide SLM services 24x7 (twenty four hours a day, seven days a week including Public Holidays).
Response and Resolution time from the time of call logging shall be as below:
- Equipment site Location category (as per RBI classification): TAT
- Response Time: 2 hrs
- Resolution Time: 2 hrs`,
    practicalImplications: "High-urgency 2-hour response and resolution SLA across all RBI ATM categories 24 hours a day."
  },
  {
    id: "sched-3",
    number: "Schedule III",
    title: "Commercials, Fee Structure & Call Rates",
    category: "schedules",
    riskLevel: "critical",
    keyHighlights: [
      "Commercial matrix: AMC Cost, Free Calls quota, Grouting rate, Extra calls rate.",
      "Free Calls include: Installation calls, BD (Breakdown) calls, Assistance calls, Rollout calls, PM (Preventive Maintenance) calls.",
      "Extra calls beyond free quota: Paid at ₹1,000 per completed call.",
      "Break Open / Battery Replacement / Third-party parts reimbursed on ACTUALS.",
      "Vendor Re-dispatch calls due to vendor issues are NOT chargeable.",
      "Courier charges for Incident Certificates (IC) / Reports included in base fee (no extra bill)."
    ],
    deadlines: ["Monthly billing with 60-day credit term"],
    statutoryLaws: ["GST Invoicing Rules"],
    verbatimContent: `Schedule III
FEES / CHARGES PAYABLE TO THE SERVICE PROVIDER:
COMMERCIAL:
- AMC Cost
- Free Calls
- Grouting
- Cost Beyond Free calls: Rs. 1000 per call completion

T&C:
• Rates and free calls as mentioned in above table.
• Free calls include Installation calls / BD Calls / Assistance Calls / Rollout / PM Calls. No bifurcation or extra charges till free calls are completed.
• No other charges applicable to HPY including courier charges for IC/Reports to be submitted in time.
• Grouting rates as updated in table.
• Break Open / Battery Replaced cost / Any other third party involved charges will be reimbursed on actuals.
• Calls beyond Free calls will be paid at 1000Rs per call completion. Calls re-dispatched due to vendor related issues will not be considered under Free calls/Paid calls.`,
    practicalImplications: "Clear billing mechanics: bundled free maintenance calls + flat ₹1,000 for additional calls + strict exclusion of re-dispatches."
  },
  {
    id: "sched-4",
    number: "Schedule IV",
    title: "Personnel Screening & 7-Point Background Verification",
    category: "schedules",
    riskLevel: "critical",
    keyHighlights: [
      "Mandatory 7-Point BGV screening at vendor expense prior to deployment.",
      "Point 1: Academic veracity confirmation.",
      "Point 2: Previous employment verification.",
      "Point 3: Criminal conviction & civil judgment check.",
      "Point 4: Financial check (creditworthiness / default).",
      "Point 5: Employment references from past employers.",
      "Point 6: Current residential address & telephone verification.",
      "Point 7: Proof of legal right to work.",
      "DPDP ACT STATUS: Service Provider is the sole 'Data Fiduciary' for BGV information.",
      "Immediate removal & replacement at zero cost if screening is unsatisfactory."
    ],
    deadlines: ["Immediate removal & zero-cost substitution of failed personnel"],
    statutoryLaws: ["DPDP Act 2023", "Police Verification & BGV Standards"],
    verbatimContent: `Schedule IV
PERSONNEL SCREENING
1 Service Provider will, in accordance with applicable laws, properly screen all Service Provider personnel at Service Provider’s expense:
1.1 Confirmation of the veracity of academic representations;
1.2 Confirmation of the personnel’s previous employment;
1.3 Check of civil judgments and criminal conviction records;
1.4 Financial check;
1.5 Employment references for the previous employment;
1.6 Confirmation that the resident address and telephone number on the record are correct and current;
1.7 Proof of eligibility for employment in place of employment.
2 Allow HPY or Customer to interact with Personnel prior to deputation.
3 Information obtained termed 'Background Information'.
4 Unsatisfactory findings disqualify personnel. If already working, vendor must immediately notify HPY and substitute suitable alternative at no extra cost.
5 Disclose background information upon HPY request.
6 Data Fiduciary: Service Provider is solely responsible as Data Fiduciary under DPDP Act. HPY is not liable for BGV data handling.`,
    practicalImplications: "Comprehensive field engineer vetting protecting ATM cash vaults and financial hardware security."
  }
];

export const CONTRACT_RISK_SUMMARY = {
  totalSections: 26, // 22 sections + preamble + 4 schedules
  criticalClauses: 7, // Sec 4, Sec 6, Sec 8, Sec 11, Sec 16, Sec 22, Sched II, Sched III, Sched IV
  highClauses: 8,
  slaTAT: "2 Hours Response / 2 Hours Resolution (24x7x365)",
  dataBreachNotice: "Within 2 Hours",
  paymentTerm: "60 Days from receipt",
  nonSolicitationLiquidatedDamages: "100% of Annual CTC",
  extraCallRate: "₹1,000 per completed call",
  bcpDrTesting: "Every 12 Months",
  unlimitedLiabilityCategories: [
    "DPDP & Data Privacy Breaches",
    "Data Loss or Compromise",
    "Fraud & Gross Negligence",
    "Intellectual Property Infringement",
    "Regulatory Fines & Penalties",
    "Personnel & Labour Claims",
    "GST / ITC Loss & Non-compliance",
    "Indemnity Obligations"
  ]
};
