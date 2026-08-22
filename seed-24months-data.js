import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  writeBatch, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
const auth = getAuth(app);

console.log('--- Initializing 24 Months System Data Generator ---');
console.log('Project:', firebaseConfig.projectId);

// -------------------------------------------------------------
// CONSTANTS & TAXONOMY
// -------------------------------------------------------------
const BANKS = [
  'HDFC Bank', 'State Bank Of India', 'ICICI Bank', 'Axis Bank', 
  'Canara Bank', 'Bank of Baroda', 'Punjab National Bank', 'Union Bank of India'
];

const ROS = ['NORTH', 'SOUTH', 'EAST', 'WEST'];

const LOC_CATEGORIES = ['Metro', 'Urban', 'Semi-Urban', 'Rural'];

const CALL_TYPES = [
  { type: 'Break Down', subTypes: ['Dispenser', 'Card Reader', 'Cash Jam', 'Receipt Printer', 'EPP', 'Cassette', 'Machine down', 'Sensor'] },
  { type: 'Major PM', subTypes: ['Quarterly Deep Service', 'Module Overhaul', 'Calibration', 'Major PM'] },
  { type: 'Minor PM', subTypes: ['Monthly Inspection', 'Cleaning & Lubrication', 'Minor PM'] },
  { type: 'Assistance', subTypes: ['Custodian Guidance', 'Admin Assistance', 'EOD Request'] },
  { type: 'Chronic Call', subTypes: ['Repeat Cash Jam', 'Dispenser Alignment', 'Chronic Call'] }
];

const PARTS_CATALOG = [
  { name: 'Dispenser Stacker Unit', code: 'DSP-STK-900', cost: 18500 },
  { name: 'Motorized Card Reader', code: 'MCR-HY-201', cost: 12000 },
  { name: 'EPP V6 PCI Keypad', code: 'EPP-PCI-600', cost: 14500 },
  { name: 'Thermal Receipt Printer', code: 'PRN-TH-80M', cost: 8500 },
  { name: 'Currency Cassette (Pick Module)', code: 'CAS-INR-500', cost: 9500 },
  { name: 'Industrial SMPS Power Supply', code: 'PWR-SMPS-450', cost: 6500 },
  { name: 'Main Controller Board', code: 'MCB-SR75-01', cost: 32000 },
  { name: 'Reject Bin Assembly', code: 'RJB-STD-002', cost: 7200 }
];

const ENGINEERS = [
  { uid: 'ENG-NO-101', name: 'Amit Sharma', ro: 'NORTH', mobile: '+91 98110 12345', email: 'amit.sharma@tspl.in', vehicleNo: 'DL-01-AB-4491', lat: 28.6315, lng: 77.2167 },
  { uid: 'ENG-NO-102', name: 'Rajesh Verma', ro: 'NORTH', mobile: '+91 98110 54321', email: 'rajesh.verma@tspl.in', vehicleNo: 'HR-26-CD-8812', lat: 28.4595, lng: 77.0266 },
  { uid: 'ENG-SO-201', name: 'Suresh Nair', ro: 'SOUTH', mobile: '+91 98450 67890', email: 'suresh.nair@tspl.in', vehicleNo: 'KA-01-EF-2311', lat: 12.9716, lng: 77.5946 },
  { uid: 'ENG-SO-202', name: 'Karthik Swaminathan', ro: 'SOUTH', mobile: '+91 98450 98765', email: 'karthik.s@tspl.in', vehicleNo: 'TN-07-GH-9904', lat: 13.0827, lng: 80.2707 },
  { uid: 'ENG-EA-301', name: 'Subhasish Das', ro: 'EAST', mobile: '+91 98300 11223', email: 'subhasish.das@tspl.in', vehicleNo: 'WB-02-JK-3401', lat: 22.5726, lng: 88.3639 },
  { uid: 'ENG-EA-302', name: 'Arup Mukherjee', ro: 'EAST', mobile: '+91 98300 44556', email: 'arup.m@tspl.in', vehicleNo: 'OD-02-LM-7788', lat: 20.2961, lng: 85.8245 },
  { uid: 'ENG-WE-401', name: 'Vikram Deshmukh', ro: 'WEST', mobile: '+91 98200 77889', email: 'vikram.d@tspl.in', vehicleNo: 'MH-02-NP-5566', lat: 19.0760, lng: 72.8777 },
  { uid: 'ENG-WE-402', name: 'Sachin Patil', ro: 'WEST', mobile: '+91 98200 99001', email: 'sachin.patil@tspl.in', vehicleNo: 'GJ-01-QR-1122', lat: 23.0225, lng: 72.5714 }
];

const ATMS_LIST = [
  // NORTH
  { atmId: 'HDFC00101', bank: 'HDFC Bank', ro: 'NORTH', locationCat: 'Metro', city: 'New Delhi', state: 'Delhi', address: 'Connaught Place Outer Circle, Block C', lat: 28.6315, lng: 77.2167, custodian: 'Sunil Kumar (+91 9811122334)', model: 'Hitachi SR7500', status: 'Active' },
  { atmId: 'SBIN00201', bank: 'State Bank Of India', ro: 'NORTH', locationCat: 'Metro', city: 'Gurugram', state: 'Haryana', address: 'Cyber City DLF Phase 2 Ground Floor', lat: 28.4908, lng: 77.0898, custodian: 'Ramesh Chand (+91 9811122335)', model: 'Hitachi CashLive 300', status: 'Active' },
  { atmId: 'ICIC00301', bank: 'ICICI Bank', ro: 'NORTH', locationCat: 'Urban', city: 'Noida', state: 'Uttar Pradesh', address: 'Sector 18 Commercial Complex', lat: 28.5708, lng: 77.3271, custodian: 'Deepak Saxena (+91 9811122336)', model: 'Hitachi HT-2845V', status: 'Active' },
  { atmId: 'AXIS00401', bank: 'Axis Bank', ro: 'NORTH', locationCat: 'Semi-Urban', city: 'Karnal', state: 'Haryana', address: 'Kunjpura Road Near Bus Stand', lat: 29.6857, lng: 76.9905, custodian: 'Vikas Tyagi (+91 9811122337)', model: 'Hitachi SR7500', status: 'Active' },
  { atmId: 'PNBN00501', bank: 'Punjab National Bank', ro: 'NORTH', locationCat: 'Rural', city: 'Palwal', state: 'Haryana', address: 'Main Market GT Road Branch', lat: 28.1447, lng: 77.3260, custodian: 'Ajay Sharma (+91 9811122338)', model: 'Hitachi CashLive 300', status: 'Active' },
  { atmId: 'BOBN00601', bank: 'Bank of Baroda', ro: 'NORTH', locationCat: 'Urban', city: 'Jaipur', state: 'Rajasthan', address: 'MI Road Near Ajmeri Gate', lat: 26.9157, lng: 75.8190, custodian: 'Mohit Mathur (+91 9811122339)', model: 'Hitachi HT-2845V', status: 'Active' },

  // SOUTH
  { atmId: 'HDFC00102', bank: 'HDFC Bank', ro: 'SOUTH', locationCat: 'Metro', city: 'Bengaluru', state: 'Karnataka', address: 'MG Road Trinity Circle Metro Plaza', lat: 12.9756, lng: 77.6066, custodian: 'Gopal Krishna (+91 9845112233)', model: 'Hitachi SR7500', status: 'Active' },
  { atmId: 'SBIN00202', bank: 'State Bank Of India', ro: 'SOUTH', locationCat: 'Metro', city: 'Bengaluru', state: 'Karnataka', address: 'Indiranagar 100 Feet Road', lat: 12.9784, lng: 77.6408, custodian: 'Prashanth Rao (+91 9845112234)', model: 'Hitachi CashLive 300', status: 'Active' },
  { atmId: 'ICIC00302', bank: 'ICICI Bank', ro: 'SOUTH', locationCat: 'Metro', city: 'Chennai', state: 'Tamil Nadu', address: 'Anna Salai Near LIC Building', lat: 13.0645, lng: 80.2642, custodian: 'Murali Raman (+91 9845112235)', model: 'Hitachi HT-2845V', status: 'Active' },
  { atmId: 'CANR00701', bank: 'Canara Bank', ro: 'SOUTH', locationCat: 'Urban', city: 'Kochi', state: 'Kerala', address: 'MG Road Ernakulam South', lat: 9.9674, lng: 76.2870, custodian: 'Benny Joseph (+91 9845112236)', model: 'Hitachi SR7500', status: 'Active' },
  { atmId: 'AXIS00402', bank: 'Axis Bank', ro: 'SOUTH', locationCat: 'Semi-Urban', city: 'Mysuru', state: 'Karnataka', address: 'Devaraja Urs Road City Centre', lat: 12.3087, lng: 76.6496, custodian: 'Naveen Shetty (+91 9845112237)', model: 'Hitachi CashLive 300', status: 'Active' },
  { atmId: 'UBIN00801', bank: 'Union Bank of India', ro: 'SOUTH', locationCat: 'Rural', city: 'Hosur', state: 'Tamil Nadu', address: 'Bagalur Road Industrial Junction', lat: 12.7409, lng: 77.8253, custodian: 'K. Balaji (+91 9845112238)', model: 'Hitachi HT-2845V', status: 'Active' },

  // EAST
  { atmId: 'HDFC00103', bank: 'HDFC Bank', ro: 'EAST', locationCat: 'Metro', city: 'Kolkata', state: 'West Bengal', address: 'Park Street Camac Street Junction', lat: 22.5510, lng: 88.3526, custodian: 'Debabrata Sen (+91 9830112233)', model: 'Hitachi SR7500', status: 'Active' },
  { atmId: 'SBIN00203', bank: 'State Bank Of India', ro: 'EAST', locationCat: 'Metro', city: 'Kolkata', state: 'West Bengal', address: 'Salt Lake Sector V Tech Hub', lat: 22.5768, lng: 88.4344, custodian: 'Somnath Roy (+91 9830112234)', model: 'Hitachi CashLive 300', status: 'Active' },
  { atmId: 'ICIC00303', bank: 'ICICI Bank', ro: 'EAST', locationCat: 'Urban', city: 'Bhubaneswar', state: 'Odisha', address: 'Janpath Road Saheed Nagar', lat: 20.2882, lng: 85.8436, custodian: 'Alok Panda (+91 9830112235)', model: 'Hitachi HT-2845V', status: 'Active' },
  { atmId: 'AXIS00403', bank: 'Axis Bank', ro: 'EAST', locationCat: 'Urban', city: 'Patna', state: 'Bihar', address: 'Dak Bungalow Road Fraser Road', lat: 25.6110, lng: 85.1384, custodian: 'Rakesh Mishra (+91 9830112236)', model: 'Hitachi SR7500', status: 'Active' },
  { atmId: 'PNBN00502', bank: 'Punjab National Bank', ro: 'EAST', locationCat: 'Semi-Urban', city: 'Siliguri', state: 'West Bengal', address: 'Hill Cart Road Main Bazaar', lat: 26.7271, lng: 88.4239, custodian: 'Pradip Ghosh (+91 9830112237)', model: 'Hitachi CashLive 300', status: 'Active' },
  { atmId: 'BOBN00602', bank: 'Bank of Baroda', ro: 'EAST', locationCat: 'Rural', city: 'Cuttack', state: 'Odisha', address: 'Choudwar Industrial Area', lat: 20.5284, lng: 85.8763, custodian: 'Manoj Sahoo (+91 9830112238)', model: 'Hitachi HT-2845V', status: 'Active' },

  // WEST
  { atmId: 'HDFC00104', bank: 'HDFC Bank', ro: 'WEST', locationCat: 'Metro', city: 'Mumbai', state: 'Maharashtra', address: 'Bandra Kurla Complex (BKC) G Block', lat: 19.0657, lng: 72.8687, custodian: 'Sanjay Sawant (+91 9820112233)', model: 'Hitachi SR7500', status: 'Active' },
  { atmId: 'SBIN00204', bank: 'State Bank Of India', ro: 'WEST', locationCat: 'Metro', city: 'Mumbai', state: 'Maharashtra', address: 'Nariman Point Express Towers Ground', lat: 18.9272, lng: 72.8226, custodian: 'Pravin Jadhav (+91 9820112234)', model: 'Hitachi CashLive 300', status: 'Active' },
  { atmId: 'ICIC00304', bank: 'ICICI Bank', ro: 'WEST', locationCat: 'Metro', city: 'Pune', state: 'Maharashtra', address: 'FC Road Deccan Gymkhana', lat: 18.5204, lng: 73.8427, custodian: 'Anand Shinde (+91 9820112235)', model: 'Hitachi HT-2845V', status: 'Active' },
  { atmId: 'AXIS00404', bank: 'Axis Bank', ro: 'WEST', locationCat: 'Metro', city: 'Ahmedabad', state: 'Gujarat', address: 'CG Road Navrangpura Circle', lat: 23.0338, lng: 72.5601, custodian: 'Chetan Patel (+91 9820112236)', model: 'Hitachi SR7500', status: 'Active' },
  { atmId: 'CANR00702', bank: 'Canara Bank', ro: 'WEST', locationCat: 'Urban', city: 'Surat', state: 'Gujarat', address: 'Ring Road Textile Market Plaza', lat: 21.1860, lng: 72.8310, custodian: 'Hitesh Desai (+91 9820112237)', model: 'Hitachi CashLive 300', status: 'Active' },
  { atmId: 'UBIN00802', bank: 'Union Bank of India', ro: 'WEST', locationCat: 'Semi-Urban', city: 'Nashik', state: 'Maharashtra', address: 'College Road Canada Corner', lat: 19.9975, lng: 73.7898, custodian: 'Mahesh Kulkarni (+91 9820112238)', model: 'Hitachi HT-2845V', status: 'Active' },
  { atmId: 'BOBN00603', bank: 'Bank of Baroda', ro: 'WEST', locationCat: 'Rural', city: 'Vadodara Rural', state: 'Gujarat', address: 'Padra Highway Chowkdi', lat: 22.2415, lng: 73.0886, custodian: 'Paresh Shah (+91 9820112239)', model: 'Hitachi CashLive 300', status: 'Active' }
];

// Helper: Commit array of operations in batches of 400
async function commitOps(ops, label) {
  const batchSize = 400;
  const total = ops.length;
  console.log(`Writing ${total} records for ${label}...`);
  for (let i = 0; i < total; i += batchSize) {
    const chunk = ops.slice(i, i + batchSize);
    const batch = writeBatch(db);
    chunk.forEach(op => {
      if (op.type === 'set') {
        batch.set(op.ref, op.data, op.options || { merge: true });
      }
    });
    await batch.commit();
    console.log(`  Committed ${Math.min(i + batchSize, total)} / ${total} ${label}`);
  }
}

async function run() {
  try {
    console.log('Authenticating for administrative Firestore permissions...');
    try {
      const userCred = await signInWithEmailAndPassword(auth, 'ars.okd@gmail.com', 'Dev@2026!');
      console.log('Authenticated as Developer:', userCred.user.email, userCred.user.uid);
    } catch (e) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, 'ars.okd@gmail.com', 'Dev@2026!');
        console.log('Created Developer Auth user:', userCred.user.email);
      } catch (err2) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, 'techservisphere@gmail.com', 'Tspl@2026');
          console.log('Authenticated as Admin:', userCred.user.email);
        } catch (err3) {
          console.log('Auth note:', err3.message);
        }
      }
    }

    console.log('1. Seeding Master ATM Fleet (25 Sites)...');
    const atmOps = ATMS_LIST.map(atm => ({
      type: 'set',
      ref: doc(db, 'atms', atm.atmId),
      data: {
        atmId: atm.atmId,
        bank: atm.bank,
        bankName: atm.bank,
        ro: atm.ro,
        locationCategory: atm.locationCat,
        city: atm.city,
        state: atm.state,
        address: atm.address,
        vendor: 'HPY',
        make: 'Hitachi',
        model: atm.model,
        siteStatus: atm.status,
        isActive: atm.status === 'Active',
        isGpsVerified: true,
        latitude: atm.lat,
        longitude: atm.lng,
        custodianContact: atm.custodian,
        regionalManager: `${atm.ro} RO Lead`,
        chronicCallCount: Math.floor(Math.random() * 2),
        installationDate: '2023-01-15',
        updatedAt: Timestamp.now()
      }
    }));
    await commitOps(atmOps, 'ATMs');

    console.log('2. Seeding Users & Field Engineers...');
    const userOps = [
      // Admins & Dev
      {
        type: 'set',
        ref: doc(db, 'users', 'dev_ars_okd'),
        data: {
          uid: 'dev_ars_okd',
          email: 'ars.okd@gmail.com',
          name: 'Developer (ars.okd)',
          role: 'admin',
          employeeId: 'DEV-ARS-001',
          mobile: '+91 99999 99999',
          ro: 'NATIONAL',
          isActive: true,
          isDeveloper: true,
          bgvStatus: 'Cleared',
          updatedAt: Timestamp.now()
        }
      },
      {
        type: 'set',
        ref: doc(db, 'users', 'adm_tspl_lead'),
        data: {
          uid: 'adm_tspl_lead',
          email: 'techservisphere@gmail.com',
          name: 'TSPL Operations Head',
          role: 'admin',
          employeeId: 'TSPL-ADM-001',
          mobile: '+91 98100 00001',
          ro: 'NATIONAL',
          isActive: true,
          bgvStatus: 'Cleared',
          updatedAt: Timestamp.now()
        }
      },
      // RO Leads
      ...ROS.map(ro => ({
        type: 'set',
        ref: doc(db, 'users', `ro_${ro.toLowerCase()}_lead`),
        data: {
          uid: `ro_${ro.toLowerCase()}_lead`,
          email: `ro.${ro.toLowerCase()}@tspl.in`,
          name: `${ro} Regional Head`,
          role: 'regionalhead',
          employeeId: `TSPL-RO-${ro}-01`,
          mobile: '+91 98000 11111',
          ro: ro,
          isActive: true,
          bgvStatus: 'Cleared',
          updatedAt: Timestamp.now()
        }
      })),
      // Field Engineers
      ...ENGINEERS.map(eng => ({
        type: 'set',
        ref: doc(db, 'users', eng.uid),
        data: {
          uid: eng.uid,
          email: eng.email,
          name: eng.name,
          role: 'engineer',
          employeeId: eng.uid,
          mobile: eng.mobile,
          ro: eng.ro,
          vehicleNo: eng.vehicleNo,
          isActive: true,
          bgvStatus: 'Cleared',
          latitude: eng.lat,
          longitude: eng.lng,
          lastPing: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      }))
    ];
    await commitOps(userOps, 'Users');

    console.log('3. Generating 24 Months Chronological Dockets & Parts Pipeline (Aug 2024 - Aug 2026)...');
    const now = new Date(2026, 7, 21, 12, 30, 0); // 21 Aug 2026

    const docketOps = [];
    const partsOps = [];
    const complianceMonthly = {};
    const billingMonthly = {};

    let globalDocketSeq = 10001;
    let globalIndentSeq = 5001;

    // We will generate data across 24 consecutive calendar months
    for (let m = 23; m >= 0; m--) {
      const monthDate = new Date(2026, 7 - m, 1);
      const year = monthDate.getFullYear();
      const monthIndex = monthDate.getMonth();
      const monthStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      const isCurrentMonth = (m === 0);
      const callsTargetForMonth = isCurrentMonth ? 18 : 22 + (m % 5); // realistic monthly call volume for the 25 ATM cluster

      let monthTotalCalls = 0;
      let monthResponseMet = 0;
      let monthResolutionMet = 0;
      let monthBreaches = 0;
      let monthTotalDownHours = 0;
      let monthPaidCalls = 0;
      let monthFreeCalls = 0;
      let monthUnbillable = 0;

      for (let c = 0; c < callsTargetForMonth; c++) {
        globalDocketSeq++;
        const docketNo = `DOC-${year.toString().slice(2)}${String(monthIndex + 1).padStart(2, '0')}${String(c + 1).padStart(3, '0')}`;
        const atm = ATMS_LIST[(globalDocketSeq + c) % ATMS_LIST.length];
        const engineer = ENGINEERS.find(e => e.ro === atm.ro) || ENGINEERS[0];

        const day = isCurrentMonth ? Math.floor((c / callsTargetForMonth) * 21) + 1 : (c % daysInMonth) + 1;
        const hour = 8 + (c % 12);
        const minute = (c * 17) % 60;
        const callTime = new Date(year, monthIndex, day, hour, minute, 0);

        // Subcall type selection
        const catObj = CALL_TYPES[c % CALL_TYPES.length];
        const subType = catObj.subTypes[c % catObj.subTypes.length];

        // Is this a live ongoing call in current month?
        const isLiveWIP = isCurrentMonth && (c >= callsTargetForMonth - 6);

        let subStatus = 'Completed';
        let isClosed = true;
        let closedAt = null;
        let dispatchedAt = new Date(callTime.getTime() + (15 + (c % 15)) * 60000);
        let reachedAt = new Date(dispatchedAt.getTime() + (25 + (c % 35)) * 60000);
        let workStartedAt = new Date(reachedAt.getTime() + 10 * 60000);

        let responseMins = Math.round((reachedAt - callTime) / 60000);
        let responseMet = responseMins <= 120; // 2 hour SLA

        let resolutionMins = 0;
        let resolutionMet = true;
        let grossDownHours = 0;
        let excludedHours = 0;
        let netDownHours = 0;
        let tsplFault = false;
        let billability = 'Free Allowance';
        let chargeAmount = 0;

        if (!isLiveWIP) {
          // Closed ticket
          const hasPartDelay = (subType === 'Dispenser' || subType === 'Main Controller Board') && (c % 3 === 0);
          const hasCustodianDelay = (c % 7 === 0);

          if (hasCustodianDelay) {
            excludedHours = 2.5;
          }

          let fixDurationMinutes = (30 + (c % 45));
          if (hasPartDelay) {
            fixDurationMinutes += 240; // 4 hours spare transit
            excludedHours += 3.0; // SCM / parts transit SLA pause
          }

          const rawTotalDuration = Math.round((workStartedAt.getTime() - callTime.getTime()) / 60000) + fixDurationMinutes;
          closedAt = new Date(callTime.getTime() + rawTotalDuration * 60000);
          grossDownHours = parseFloat((rawTotalDuration / 60).toFixed(2));
          netDownHours = Math.max(0, parseFloat((grossDownHours - excludedHours).toFixed(2)));
          resolutionMins = Math.round(netDownHours * 60);

          resolutionMet = resolutionMins <= 120; // 2 hours SLA
          if (!resolutionMet && !hasCustodianDelay && !hasPartDelay) {
            tsplFault = true;
            monthBreaches++;
          }

          // Commercial Billability Logic (HPY Master Contract)
          if (c % 15 === 14) {
            billability = 'Unbillable Re-dispatch';
            chargeAmount = 0;
            monthUnbillable++;
          } else if (c % 10 === 9) {
            billability = 'Paid Over-Allowance';
            chargeAmount = 1000;
            monthPaidCalls++;
          } else {
            billability = 'Free Allowance';
            chargeAmount = 0;
            monthFreeCalls++;
          }

          monthTotalDownHours += netDownHours;
          if (responseMet) monthResponseMet++;
          if (resolutionMet) monthResolutionMet++;
          monthTotalCalls++;

          // Parts indent generation for part-required tickets
          if (hasPartDelay || subType === 'Dispenser' || subType === 'Motorized Card Reader') {
            globalIndentSeq++;
            const partObj = PARTS_CATALOG[c % PARTS_CATALOG.length];
            const indentNo = `IND-${year.toString().slice(2)}${String(globalIndentSeq).padStart(4, '0')}`;
            const indentCreated = new Date(callTime.getTime() + 45 * 60000);
            const indentDelivered = new Date(indentCreated.getTime() + 180 * 60000);
            const indentInstalled = new Date(indentDelivered.getTime() + 45 * 60000);

            partsOps.push({
              type: 'set',
              ref: doc(db, 'parts_indents', indentNo),
              data: {
                indentNo: indentNo,
                docketNo: docketNo,
                atmId: atm.atmId,
                bank: atm.bank,
                ro: atm.ro,
                partName: partObj.name,
                partCode: partObj.code,
                unitCost: partObj.cost,
                qty: 1,
                priority: 'High',
                status: 'Installed',
                requesterUid: engineer.uid,
                requesterName: engineer.name,
                courierPartner: 'BlueDart Logistics',
                courierAwb: `BD${year}${globalIndentSeq}IN`,
                trackingStatus: 'Delivered to Site',
                faultSummary: `Faulty ${partObj.name} requiring replacement.`,
                createdAt: Timestamp.fromDate(indentCreated),
                dispatchedAt: Timestamp.fromDate(new Date(indentCreated.getTime() + 60 * 60000)),
                deliveredAt: Timestamp.fromDate(indentDelivered),
                installedAt: Timestamp.fromDate(indentInstalled),
                updatedAt: Timestamp.fromDate(indentInstalled)
              }
            });
          }

        } else {
          // LIVE IN-PROGRESS DOCKETS (August 2026)
          isClosed = false;
          const liveSubStatuses = [
            'Call Accepted', 
            'Dispatched Engineer', 
            'Engineer Reached', 
            'Work in Progress', 
            'Under Observation', 
            'Pending For Parts'
          ];
          subStatus = liveSubStatuses[c % liveSubStatuses.length];

          // Realistic live timings (hours ago today)
          const minsAgo = (c + 1) * 35;
          const liveCallTime = new Date(now.getTime() - minsAgo * 60000);
          callTime.setTime(liveCallTime.getTime());
          dispatchedAt = new Date(liveCallTime.getTime() + 15 * 60000);
          reachedAt = minsAgo > 30 ? new Date(dispatchedAt.getTime() + 20 * 60000) : null;
          workStartedAt = reachedAt && minsAgo > 45 ? new Date(reachedAt.getTime() + 10 * 60000) : null;
          closedAt = null;

          if (subStatus === 'Pending For Parts') {
            globalIndentSeq++;
            const partObj = PARTS_CATALOG[1];
            const liveIndentNo = `IND-26${String(globalIndentSeq).padStart(4, '0')}`;
            partsOps.push({
              type: 'set',
              ref: doc(db, 'parts_indents', liveIndentNo),
              data: {
                indentNo: liveIndentNo,
                docketNo: docketNo,
                atmId: atm.atmId,
                bank: atm.bank,
                ro: atm.ro,
                partName: partObj.name,
                partCode: partObj.code,
                unitCost: partObj.cost,
                qty: 1,
                priority: 'High',
                status: 'Dispatched',
                requesterUid: engineer.uid,
                requesterName: engineer.name,
                courierPartner: 'BlueDart Logistics',
                courierAwb: `BD26${globalIndentSeq}IN`,
                trackingStatus: 'In Transit to ATM Site',
                faultSummary: 'Card reader sensor misalignment. Replacement enroute.',
                createdAt: Timestamp.fromDate(new Date(liveCallTime.getTime() + 20 * 60000)),
                dispatchedAt: Timestamp.fromDate(new Date(liveCallTime.getTime() + 35 * 60000)),
                updatedAt: Timestamp.now()
              }
            });
          }
        }

        docketOps.push({
          type: 'set',
          ref: doc(db, 'dockets', docketNo),
          data: {
            docketNo: docketNo,
            atmId: atm.atmId,
            bank: atm.bank,
            bankName: atm.bank,
            ro: atm.ro,
            locationCategory: atm.locationCat,
            city: atm.city,
            state: atm.state,
            address: atm.address,
            callType: catObj.type,
            subCallType: subType,
            status: isClosed ? 'Closed' : 'Open',
            subStatus: subStatus,
            dependency: isClosed ? 'Closed' : (subStatus === 'Pending For Parts' ? 'SCM Dependency' : 'Engineer Dependency'),
            isClosed: isClosed,
            assignedEngineerId: engineer.uid,
            engineerId: engineer.uid,
            engineerName: engineer.name,
            engineerMobile: engineer.mobile,
            callDateTime: Timestamp.fromDate(callTime),
            dispatchedAt: dispatchedAt ? Timestamp.fromDate(dispatchedAt) : null,
            reachedAt: reachedAt ? Timestamp.fromDate(reachedAt) : null,
            workStartedAt: workStartedAt ? Timestamp.fromDate(workStartedAt) : null,
            closedAt: closedAt ? Timestamp.fromDate(closedAt) : null,
            responseMins: responseMins,
            responseMet: responseMet,
            resolutionMins: resolutionMins,
            resolutionMet: resolutionMet,
            grossDownHours: grossDownHours,
            excludedHours: excludedHours,
            netDownHours: netDownHours,
            tsplFault: tsplFault,
            billability: billability,
            chargeAmount: chargeAmount,
            problemDescription: `Machine reported: ${subType} on ${atm.atmId}. Customer transaction impacted.`,
            actionTaken: isClosed ? `Inspected module, resolved ${subType}, ran 5 test cash cycles. Machine certified Live.` : 'Engineer on-site troubleshooting.',
            updatedAt: Timestamp.now()
          }
        });
      }

      // Record monthly SLA compliance totals
      const uptimePct = parseFloat((99.5 - (monthBreaches * 0.15) - (monthTotalDownHours / (25 * 720) * 100)).toFixed(2));
      const respCompliance = monthTotalCalls > 0 ? parseFloat(((monthResponseMet / monthTotalCalls) * 100).toFixed(1)) : 98.0;
      const resolCompliance = monthTotalCalls > 0 ? parseFloat(((monthResolutionMet / monthTotalCalls) * 100).toFixed(1)) : 96.5;
      const penaltyIncurred = monthBreaches * 1000;

      complianceMonthly[monthStr] = {
        monthYear: monthStr,
        monthName: monthName,
        totalCalls: monthTotalCalls,
        responseMet: monthResponseMet,
        responseCompliancePct: respCompliance,
        resolutionMet: monthResolutionMet,
        resolutionCompliancePct: resolCompliance,
        uptimePercentage: Math.max(98.2, Math.min(99.8, uptimePct)),
        breachCount: monthBreaches,
        penaltyIncurred: penaltyIncurred,
        status: isCurrentMonth ? 'Open / In Progress' : 'Audited & Reconciled',
        verifiedAt: Timestamp.fromDate(monthDate)
      };

      // Record monthly Invoicing totals
      const basePayable = (monthPaidCalls * 1000) + 15000; // Contract base SLA fee + paid over-quota
      const netPayable = Math.max(0, basePayable - penaltyIncurred);
      const gst = Math.round(netPayable * 0.18);
      const grandTotal = netPayable + gst;

      billingMonthly[monthStr] = {
        invoiceNo: `INV-TSPL-${year}-${String(monthIndex + 1).padStart(2, '0')}`,
        monthYear: monthStr,
        period: monthName,
        totalCalls: monthTotalCalls,
        freeAllowanceCalls: monthFreeCalls,
        paidOverQuotaCalls: monthPaidCalls,
        unbillableDispatches: monthUnbillable,
        baseAmount: basePayable,
        penaltyDeduction: penaltyIncurred,
        netTaxableAmount: netPayable,
        gstAmount: gst,
        totalInvoiceAmount: grandTotal,
        paymentStatus: isCurrentMonth ? 'Unbilled' : (m === 1 ? 'Under Processing' : 'Paid in Full'),
        createdAt: Timestamp.fromDate(monthDate)
      };
    }

    await commitOps(docketOps, 'Dockets (24 Months)');
    await commitOps(partsOps, 'Parts Indents');

    console.log('4. Seeding 24 Months Compliance & Billing Ledger...');
    const complianceOps = Object.keys(complianceMonthly).map(mKey => ({
      type: 'set',
      ref: doc(db, 'compliance', mKey),
      data: complianceMonthly[mKey]
    }));
    await commitOps(complianceOps, 'Compliance (24 Months)');

    const billingOps = Object.keys(billingMonthly).map(mKey => ({
      type: 'set',
      ref: doc(db, 'billing', mKey),
      data: billingMonthly[mKey]
    }));
    await commitOps(billingOps, 'Invoices (24 Months)');

    console.log('5. Aggregating Real-Time Live Stats Document...');
    const liveStats = {
      open: 6,
      closedToday: 4,
      slaBreachedToday: 0,
      slaAtRisk: 2,
      dep_Engineer_Dependency: 4,
      dep_WIP: 1,
      dep_HD_Dependency: 0,
      dep_CRA_Delay: 0,
      dep_SCM_Dependency: 1,
      dep_Bank_Dependency: 0,
      dep_TSS_Dependency: 0,
      dep_Third_Party_Dependency: 0,
      dep_Force_Majeure: 0,
      dep_Access_Time_Exceeded: 0,
      dep_Closed: 0,
      age_a: 5,
      age_b: 1,
      age_c: 0,
      age_d: 0,
      age_e: 0,
      age_f: 0,
      age_g: 0,
      lastRebuiltAt: Timestamp.now()
    };
    await setDoc(doc(db, 'stats', 'live'), liveStats, { merge: true });
    await setDoc(doc(db, 'stats', 'atms'), { totalAtms: 25, activeAtms: 25, lastUpdated: Timestamp.now() }, { merge: true });
    await setDoc(doc(db, 'stats', 'parts'), { pendingIndents: 1, dispatchedIndents: 1, lastUpdated: Timestamp.now() }, { merge: true });

    for (const ro of ROS) {
      await setDoc(doc(db, 'stats', `ro_${ro.toLowerCase()}`), {
        ...liveStats,
        open: 1 + (ro === 'NORTH' ? 2 : 1),
        lastRebuiltAt: Timestamp.now()
      }, { merge: true });
    }

    console.log('=====================================================');
    console.log('SUCCESS: All 24 Months Interconnected Data Uploaded!');
    console.log('  - ATMs: 25 Sites');
    console.log('  - Users & Engineers: 14 Active Accounts');
    console.log(`  - Dockets Generated: ${docketOps.length} Chronological Records`);
    console.log(`  - Parts Indents: ${partsOps.length} Pipeline Records`);
    console.log(`  - Compliance Scorecards: 24 Monthly Audits`);
    console.log(`  - Billing Invoices: 24 Monthly Statements`);
    console.log('=====================================================');

  } catch (err) {
    console.error('Fatal Error during dataset generation:', err);
  }
}

run();
