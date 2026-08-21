# TSPL ServiceDesk — Client Production Deployment & Account Handover

**Client Organization:** Tech Servisphere Pvt Ltd (TSPL)  
**Designated Organization Email:** `techservisphere@gmail.com`  
**Hosting Target:** Netlify  
**Backend Database:** Google Firebase (Firestore, Auth, Realtime Database)

---

## 1. Firebase Setup under `techservisphere@gmail.com`

To host the backend entirely under the client's official Google Account (`techservisphere@gmail.com`), follow either **Option A (New Project)** or **Option B (Project Ownership Transfer)**:

### Option A: Create New Production Firebase Project (Recommended)
1. Sign in to [Firebase Console](https://console.firebase.google.com/) using `techservisphere@gmail.com`.
2. Click **"Add project"** and name it `tspl-servicedesk` (or your preferred name).
3. Once created:
   - **Authentication:** Go to *Build > Authentication* > Click *Get Started* > Enable **Email/Password**.
   - **Firestore Database:** Go to *Build > Firestore Database* > Click *Create database* > Select Region (e.g. `asia-south1` Mumbai) > Start in **Production mode**.
   - **Realtime Database:** Go to *Build > Realtime Database* > Click *Create database* (used for live engineer GPS coordinates).
4. **Register Web App & Copy Keys:**
   - Click the Web icon (`</>`) in Project Overview.
   - Register App name (e.g. `TSPL Web Portal`).
   - Copy the `firebaseConfig` object:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "tspl-servicedesk.firebaseapp.com",
       databaseURL: "https://tspl-servicedesk-default-rtdb.firebaseio.com",
       projectId: "tspl-servicedesk",
       storageBucket: "tspl-servicedesk.appspot.com",
       messagingSenderId: "...",
       appId: "..."
     };
     ```
   - Paste these values into `/firebase-config.js` in this repository.
5. **Deploy Security Rules:**
   - In Firestore Console > *Rules* tab, paste the contents of `firestore.rules` from this repository and click **Publish**.
   - In Realtime Database > *Rules* tab, paste the contents of `database.rules.json` and click **Publish**.

---

### Option B: Add `techservisphere@gmail.com` as Owner to Existing Project
1. Open the [Google Cloud Console IAM Page](https://console.cloud.google.com/iam-admin/iam).
2. Select the provisioned project.
3. Click **"Grant Access"** / **"Add Principal"**.
4. Enter `techservisphere@gmail.com`.
5. Assign Role: **Owner** (or **Firebase Admin** + **Editor**).
6. Click **Save**. `techservisphere@gmail.com` now has full administrative ownership.

---

## 2. Netlify Deployment under `techservisphere@gmail.com`

### Step 1: Create Netlify Account
1. Go to [Netlify.com](https://app.netlify.com/signup).
2. Sign up using **`techservisphere@gmail.com`** (via Email or connected GitHub/GitLab).

### Step 2: Deploy the Repository
You can deploy using either method:

#### Method 1: Git-Connected Continuous Deployment (Recommended)
1. Push this codebase to GitHub/GitLab under the TSPL organization or account.
2. In Netlify Dashboard, click **"Add new site" > "Import an existing project"**.
3. Connect your Git provider and select the repository.
4. Build settings:
   - **Base directory:** Leave blank (root `/`)
   - **Build command:** `echo 'Deploying static files'` (or `npm run build`)
   - **Publish directory:** `.` (root directory)
5. Click **"Deploy site"**.

#### Method 2: Direct Folder Upload (Manual / Instant)
1. In Netlify Dashboard, go to **"Sites"**.
2. Drag and drop the downloaded codebase directory directly into the **"Drag & drop your site output folder here"** area.
3. Your site will be live instantly with SSL HTTPS certificate automatically provisioned.

### Step 3: Custom Domain Configuration (e.g. `servicedesk.techservisphere.com`)
1. In Netlify > Site configuration > **Domain management**.
2. Click **"Add domain alias"** or **"Add custom domain"**.
3. Add a CNAME record in your DNS provider pointing to your Netlify subdomain.

---

## 3. Post-Deployment Database Seeding

Once deployed to production with `techservisphere@gmail.com` credentials:
1. Open `https://your-site.netlify.app/setup-data.html` in your browser.
2. Click **"Initialize Base Seed Data"** to populate:
   - Default Master Users (Call Centre, Tech Support, Regional Managers, Field Engineers, Bank Clients)
   - ATM Master records
   - Status & SLA definition counters
3. Log in via `https://your-site.netlify.app/login.html` using the configured administrative credentials.
