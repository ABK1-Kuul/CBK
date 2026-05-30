# SME CreditBook™ — Frontend & Credit Intelligence

This directory contains the mobile-first, responsive React web application. It integrates AI-driven bookkeeping OCR simulation with dynamic, real-time creditworthiness grading.

## 📂 Directory & Component Architecture

Our UI/UX structure follows a modular, feature-oriented pattern designed for scalability and maintainability:

```text
client/
├── public/                 # Static assets & public resources
├── src/
│   ├── components/         # Modular React Components
│   │   ├── auth/           # Login, registration, and profile setups
│   │   │   └── Onboarding.tsx
│   │   ├── bookkeeping/    # Receipts, OCR uploads, and searchable ledger
│   │   │   └── Bookkeeping.tsx
│   │   ├── analytics/      # Dynamic KPIs and monthly bar trend charts
│   │   │   └── Dashboard.tsx
│   │   ├── credit/         # AI Trust gauge and contextual playbooks
│   │   │   └── CreditScore.tsx
│   │   ├── passport/       # PDF briefings and lender-ready sharing sheets
│   │   │   └── FinancialPassport.tsx
│   │   └── MobileFrame.tsx # Interactive viewport container (390x844 device emulator)
│   │
│   ├── types.ts            # Core TypeScript interfaces (BusinessProfile, Transaction)
│   ├── index.css           # Global CSS and custom Tailwind extensions
│   ├── App.tsx             # Main React app state coordination & AI logic
│   └── main.tsx            # React DOM StrictMode entrypoint
│
├── index.html              # Shell HTML template (styled with Inter font)
├── package.json            # Client package manifest & dependency locks
├── postcss.config.js       # PostCSS utility hooks for Tailwind
├── tailwind.config.js      # Theme customizations (deep slates, emeralds, indicators)
├── tsconfig.json           # Compiler strict rules and target configurations
└── vite.config.ts          # Vite asset bundler configurations (port: 3000)
```

---

## ⚡ Key Architectural Features & Interactive Flow

1. **Authentication & Multi-Step Wizard (`Onboarding.tsx`)**
   - Implements a single-column, validation-backed sign-up screen.
   - Leads to a multi-step profile builder collecting Industry, Revenue range, and Account Longevity.
   - Initialized date choices represent continuous platform operations (3 months, 1 year, 2+ years).

2. **AI OCR Invoice Simulators & Interactive Ledger (`Bookkeeping.tsx`)**
   - Interactive Drag-and-drop card supporting manual file uploads or pre-loaded simulation files.
   - Displays real-time extraction progress loader with confirmation modals to edit/discard OCR outcomes.
   - Multi-tier searching and categorical sorting.
   - Complete quick-action manual log controls (Floating Action Button).

3. **Dynamic FICO Credit Scoring Gauge (`CreditScore.tsx`)**
   - High-fidelity SVG progress ring mapping dynamic business trust (300 to 900 scale).
   - Dynamically re-grades scores based on profile age, invoice ledger size, and cash margins.
   - Interactive Credit Booster workbench showcasing how API attachments (linking bank feeds, verifying IRS transcripts) instantly uplift trust rankings.
   - Actionable recommendation engines matching SME profile tiers.

4. **Financial Credit Passport Export (`FinancialPassport.tsx`)**
   - Renders a formal, lender-ready executive PDF briefing.
   - Features QR validation blocks, audited metrics tables, and pre-approved lines of capital.
   - Bottom sheet sharing hooks with secure email options and Plaid banking APIs.

---

## 🚀 Running the Project

To run the application locally on your machine, run:

```bash
# Navigate to client directory
cd client

# Install dependencies (React 18+, Tailwind, PostCSS, Lucide Icons)
npm install

# Start development server
npm run dev
```

The application will run on **`http://localhost:3000`** with hot module replacement (HMR) enabled!
