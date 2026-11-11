# Gauss Maths

**Gauss Maths** is a modern, responsive **PC Desktop Web Portal** designed for mathematics students and faculty, featuring pure client-side architecture, dynamic curriculum management, OAuth 2.0 authentication, custom PDF examination series, and certified academic reporting.

---

## 🎨 Logo & Visual Theme

The portal is styled to match the official **Gauss Maths** brand identity:
- **Official Brand Logo**: Located at [assets/logo.png](file:///c:/Users/fires/.gemini/antigravity/scratch/gauss-maths-portal/assets/logo.png), featuring the Gauss open mathematical volume inside the signature Electric Lime emblem.
- **Deep Midnight Indigo (`#291B5F`)**: Primary brand base for headers, navigation, prominent badges, and controls.
- **Electric Lime (`#C1FF72`)**: High-contrast vibrant accent for action buttons, callout badges, active states, and highlights.
- **Ultra-Light Tints (`#F6FEED`, `#EBFDC8`)**: Soft, distraction-free mathematical canvas backgrounds and card borders.

---

## 🚀 Quick Start & Deployment

### Two Dedicated Pages:
- 🎓 **Student Portal**: [index.html](file:///c:/Users/fires/.gemini/antigravity/scratch/gauss-maths-portal/index.html) — Pure student experience with zero admin controls or role switchers.
- 👨‍🏫 **Faculty & Admin Console**: [admin.html](file:///c:/Users/fires/.gemini/antigravity/scratch/gauss-maths-portal/admin.html) — Dedicated management interface for uploading resources, creating tests, and grading student answer sheets.

Both pages share persistent data in real time via browser `localStorage`.

### Local Browser Launch
Simply open `index.html` or `admin.html` directly in any web browser (Chrome, Edge, Firefox, Brave, Safari). No npm dependencies, Node.js, or build pipeline needed!

```powershell
start index.html
start admin.html
```

Or run via the built-in Python lightweight server:
```powershell
python server.py
# Student Portal:  http://localhost:8080/index.html
# Faculty Console: http://localhost:8080/admin.html
```

### 🌐 Instant Production Deployment
This repository is 100% static and ready to deploy to any host:
1. **GitHub Pages**:
   - Push repository to GitHub.
   - Go to **Settings > Pages** -> Select branch `main` and root `/`.
   - Your student site is live at `https://<username>.github.io/<repo>/` and admin at `https://<username>.github.io/<repo>/admin.html`.
2. **Netlify / Vercel**:
   - Drag and drop this folder, or connect your Git repo.
   - Set Build Command to **blank / none** and Publish Directory to `.`.
3. **Firebase Hosting**:
   - Run `firebase init hosting` -> public directory: `.`.
   - Run `firebase deploy`.

---

## 🖥️ PC Web Application Architecture

### 1. Student Portal (`index.html`)
- **Strictly Student-Focused**: No admin switchers, role toggles, or faculty controls.
- **Top PC Application Bar**: Gauss Maths logo, global search bar (`Ctrl + K`), OAuth 2.0 login button, and student profile avatar.
- **Sidebar Navigation**:
  - 🏠 **Dashboard**: Streamlined hero greeting (`Welcome @username`) and 4 core academic portals.
  - 📝 **Assigned Tests**: Interactive CBT exams and Custom PDF test series with student solution PDF submission.
  - 📚 **Study Resources Library**: Curated Important Questions and Previous Year Questions (PYQs).
  - 📤 **Homework & Doubts**: Handwritten proof upload with live teacher scoring and feedback.
  - 📊 **Performance & Reports**: Score trends, chapter mastery breakdowns, and certified printable marksheets.

### 2. Dedicated Faculty & Admin Console (`admin.html`)
- **Official Brand Branding**: Gauss Maths logo with Faculty Management Portal header and quick link back to the student site.
- **Real-Time KPI Dashboard**: Live counts of study resources, active test series, student submissions, and pending evaluations.
- **Interactive Tab Navigation**:
  - 📤 **Upload Resources**: Publish Important Questions & PYQ documents with custom editable chapters.
  - 📝 **Create Tests**: Build Custom PDF Series (with official question paper attachment) or interactive timed MCQ tests.
  - ✍️ **Grade Homework & Test Papers**: Inspect student submitted answer sheets, view/download solution PDFs, enter scores, and send personalized feedback.
  - 👥 **Student Approvals & Links**: Generate 1-click approved access links and manage student admission approvals.

### 3. Admin Authentication & Security
- **Protected Access**: Admin console is secured behind a dedicated faculty sign-in screen.
- **Faculty Login Credentials**:
  - **Email**: `gaussmaths26@gmail@gmail.com` (also accepts `gaussmaths26@gmail.com`)
  - **Password**: `gauss26`
- **Session Persistence**: Stored via browser storage with dedicated **Sign Out** button.

### 4. Approval-Based Student Access System (No OAuth)
- **Direct Student Link Generator**: Faculty generates approved invite links (e.g. `index.html?token=gauss_xyz123`) with one-click copy to share via WhatsApp, SMS, or Email.
- **Admission Request & Approval Queue**:
  - Students without links can request admission on `index.html` by submitting their name, class, and contact number.
  - Teachers review pending requests in the Admin Console and click **Approve** to activate the student and generate their access link.
- **Instant Token Verification**: Visiting `index.html?token=...` or entering an approved token unlocks the portal, customizes the `@username` greeting, and restores persistent student session.

### 5. Fully Admin-Editable Chapters / Topics
- **No Hardcoded Chapter Constraints**: Teachers and faculty can freely type any chapter or topic name directly into the input fields when:
  - Uploading **Study Resources** (Important Questions or Previous Year Questions).
  - Creating a **Custom PDF Test Series** (uploadable Question Paper).
  - Drafting an **Interactive Computer-Based Test (MCQ)**.
  - Submitting homework worksheets or problem proofs.
- **Dynamic Curriculum Discovery**: The portal dynamically indexes and aggregates all distinct chapter names from published tests, resources, and submissions, maintaining clean real-time search and filter capabilities.

### 6. Custom PDF Test Series & Interactive CBT Engine
- **📄 Custom PDF Test Series**:
  - Teachers upload official examination Question Paper PDFs with custom titles, editable chapters, deadlines, and marks.
  - Students view Question Papers directly in the built-in desktop viewer or download them.
  - Students upload their solved handwritten answer sheets as single PDF documents.
  - Integrated evaluation workflow: Teachers review student PDF sheets, assign grades, and provide feedback remarks.
- **⚡ Interactive Online Examination Engine**:
  - Live countdown timer with pulse warning under 2 minutes.
  - Mathematical questions rendered with KaTeX.
  - Interactive Question Palette (Answered, Marked for Review, Unanswered).
  - Instant Performance Analysis modal with step-by-step mathematical explanations.

### 7. Study Resources (Important Questions & PYQs)
- Focused strictly on high-yield exam preparation categories:
  1. **Important Questions**: Curated expected questions and step-by-step model solutions.
  2. **Previous Year Questions (PYQ)**: Past examination question banks and marking scheme solutions.
- Starts fresh with **0 pre-loaded resources** (uploadable on-demand by faculty).
- Multi-column desktop resource cards with KaTeX LaTeX math formula reader modal and PDF download simulation.

### 8. Certified Performance Reports & Report Cards
- Interactive Chart.js Score Progression Line Chart & Chapter Mastery Bar Chart styled in the brand indigo and lime palette.
- **Official Certified Gauss Report Card** modal with high-resolution brand logo and `@media print` print-to-PDF stylesheet.
