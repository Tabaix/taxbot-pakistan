# Pakistan AI Tax Filing Website — Complete Technical PRD
**Product Name:** TaxBot Pakistan  
**Version:** 1.0  
**Last Updated:** June 2026  
**Purpose:** This document is written for an AI coding assistant (Cursor, Claude, GPT-4, v0, etc.) to build the complete product from scratch. Every section contains exact logic, code patterns, copy, and rules.

---

## 1. PRODUCT OVERVIEW

### What this product does
A web application where any Pakistani citizen — salaried, business owner, freelancer, overseas Pakistani, or first-time filer — can:
1. Chat with an AI assistant in Urdu/English (Hinglish)
2. Enter their income and deduction details
3. Get their FBR tax calculated in real time
4. Download a filled PDF summary
5. Get exact step-by-step instructions to file on FBR IRIS portal

### What this product does NOT do
- It does NOT directly submit to FBR IRIS (no official API exists publicly)
- It does NOT store sensitive financial data on server (all calculation is client-side)
- It is NOT a CA firm — it is a guided self-filing tool

### Target users
| User Type | Problem They Have |
|---|---|
| Salaried person | Never filed, doesn't know how |
| Freelancer | Confused about 1% WHT on foreign income |
| Business owner | Doesn't know which expenses are deductible |
| Overseas Pakistani | Doesn't know if they must file, how to do it remotely |
| Non-filer with notice | Got FBR notice, panicking |
| First-time filer | Has NTN but never submitted a return |

---

## 2. TECH STACK

```
Frontend:     Next.js 14 (App Router)
Styling:      Tailwind CSS
AI:           Anthropic Claude API (claude-sonnet-4-6)
Database:     Supabase (PostgreSQL + Auth)
PDF:          @react-pdf/renderer
Hosting:      Vercel (free tier)
Payments:     Stripe (for Pro plan)
CMS:          Hardcoded config file (tax slabs update yearly)
Language:     TypeScript
```

### Folder structure
```
/app
  /page.tsx                  → Landing page
  /calculator/page.tsx       → Live calculator
  /chat/page.tsx             → AI chat assistant
  /guide/[type]/page.tsx     → Static guides (non-filer, overseas, etc.)
  /api
    /chat/route.ts           → Claude API proxy
    /generate-pdf/route.ts   → PDF generation
/components
  /TaxCalculator.tsx         → Live editable calculator
  /ChatBot.tsx               → AI conversation UI
  /TaxBreakdown.tsx          → Result display
  /IRISGuide.tsx             → Step-by-step IRIS instructions
  /PDFDownload.tsx           → PDF generation trigger
/lib
  /taxEngine.ts              → All FBR tax calculation logic
  /slabs.ts                  → FBR tax slabs config (update yearly)
  /prompts.ts                → All AI system prompts
  /types.ts                  → TypeScript interfaces
/config
  /taxYear2025.ts            → Current year slab rates
```

---

## 3. FBR TAX CALCULATION ENGINE

### File: `/lib/slabs.ts`
This file must be updated every year after Pakistan's Federal Budget (usually June).

```typescript
export type TaxpayerType = 'salaried' | 'business' | 'freelancer' | 'aop';
export type TaxYear = '2025' | '2024' | '2023';

export interface TaxSlab {
  min: number;
  max: number;
  fixedTax: number;
  marginalRate: number;
  label: string;
}

export const SLABS: Record<TaxYear, Record<TaxpayerType, TaxSlab[]>> = {
  '2025': {
    salaried: [
      { min: 0,        max: 600000,   fixedTax: 0,       marginalRate: 0,    label: '0%' },
      { min: 600001,   max: 1200000,  fixedTax: 0,       marginalRate: 0.05, label: '5%' },
      { min: 1200001,  max: 2200000,  fixedTax: 30000,   marginalRate: 0.15, label: '15%' },
      { min: 2200001,  max: 3200000,  fixedTax: 180000,  marginalRate: 0.25, label: '25%' },
      { min: 3200001,  max: 4100000,  fixedTax: 430000,  marginalRate: 0.30, label: '30%' },
      { min: 4100001,  max: Infinity, fixedTax: 700000,  marginalRate: 0.35, label: '35%' },
    ],
    business: [
      { min: 0,        max: 600000,   fixedTax: 0,       marginalRate: 0,     label: '0%' },
      { min: 600001,   max: 1200000,  fixedTax: 0,       marginalRate: 0.075, label: '7.5%' },
      { min: 1200001,  max: 1600000,  fixedTax: 45000,   marginalRate: 0.15,  label: '15%' },
      { min: 1600001,  max: 3200000,  fixedTax: 105000,  marginalRate: 0.20,  label: '20%' },
      { min: 3200001,  max: 5600000,  fixedTax: 425000,  marginalRate: 0.25,  label: '25%' },
      { min: 5600001,  max: Infinity, fixedTax: 1025000, marginalRate: 0.35,  label: '35%' },
    ],
    freelancer: [
      // Freelancers on foreign income: 1% WHT is FINAL TAX under SRO 1006(I)/2022
      // No progressive slabs apply if income remitted through banking channel
      { min: 0, max: Infinity, fixedTax: 0, marginalRate: 0.01, label: '1% final tax' },
    ],
    aop: [
      // Association of Persons — same as business slabs
      { min: 0,        max: 600000,   fixedTax: 0,       marginalRate: 0,     label: '0%' },
      { min: 600001,   max: 1200000,  fixedTax: 0,       marginalRate: 0.075, label: '7.5%' },
      { min: 1200001,  max: 1600000,  fixedTax: 45000,   marginalRate: 0.15,  label: '15%' },
      { min: 1600001,  max: 3200000,  fixedTax: 105000,  marginalRate: 0.20,  label: '20%' },
      { min: 3200001,  max: 5600000,  fixedTax: 425000,  marginalRate: 0.25,  label: '25%' },
      { min: 5600001,  max: Infinity, fixedTax: 1025000, marginalRate: 0.35,  label: '35%' },
    ],
  },
  // Add 2024 and 2023 slabs here similarly
  '2024': { salaried: [], business: [], freelancer: [], aop: [] },
  '2023': { salaried: [], business: [], freelancer: [], aop: [] },
};
```

### File: `/lib/taxEngine.ts`
This is the core calculation logic. All calculations happen here.

```typescript
import { SLABS, TaxpayerType, TaxYear } from './slabs';

export interface TaxInput {
  taxpayerType: TaxpayerType;
  taxYear: TaxYear;
  filerStatus: 'filer' | 'nonfiler';
  isOverseas: boolean;
  
  // Income
  salary: number;              // Annual gross salary
  businessRevenue: number;     // Gross business revenue
  businessExpenses: number;    // Allowable business expenses
  rentalIncome: number;        // Gross rental received
  freelanceIncome: number;     // Foreign freelance income in PKR
  capitalGains: number;        // Shares/property gains
  otherIncome: number;         // Prizes, royalties, etc.
  
  // Deductions
  zakat: number;               // Zakat paid — directly reduces taxable income
  pensionContribution: number; // Approved pension fund contribution
  lifeInsurance: number;       // Life insurance premium (approved)
  donations: number;           // Donations to approved NPOs (Section 61)
  
  // WHT already paid (adjustable against final tax)
  whtSalary: number;           // Deducted by employer
  whtBank: number;             // Deducted by bank on transactions
  whtMobile: number;           // On mobile top-ups
  whtProperty: number;         // On property purchase/sale
  whtOther: number;            // Other withholding taxes
}

export interface TaxResult {
  // Income
  grossIncome: number;
  rentalDeduction: number;     // 20% of rental for repairs (automatic)
  netRentalIncome: number;
  netBusinessIncome: number;
  totalIncome: number;
  
  // Deductions
  zakatDeduction: number;
  taxableIncome: number;
  
  // Tax computation
  grossTax: number;
  currentSlab: string;
  marginalRate: number;
  effectiveRate: number;
  
  // Credits
  donationCredit: number;      // Section 61
  pensionCredit: number;       // Section 63
  totalCredits: number;
  
  // WHT adjustment
  totalWHTPaid: number;
  
  // Final result
  taxAfterCredits: number;
  netPayable: number;          // Positive = pay FBR, Negative = refund
  isRefund: boolean;
  
  // Non-filer extras
  nonfilerPenalty: string;     // Warning text if non-filer
}

export function calculateTax(input: TaxInput): TaxResult {
  const slabs = SLABS[input.taxYear][input.taxpayerType];
  
  // 1. Calculate all income
  const rentalDeduction = Math.round(input.rentalIncome * 0.20); // 20% for repairs
  const netRentalIncome = input.rentalIncome - rentalDeduction;
  const netBusinessIncome = Math.max(0, input.businessRevenue - input.businessExpenses);
  
  // Freelancers: foreign income is final tax — calculate separately
  if (input.taxpayerType === 'freelancer') {
    const freelanceTax = Math.round(input.freelanceIncome * 0.01);
    const totalWHT = input.whtSalary + input.whtBank + input.whtMobile + input.whtProperty + input.whtOther;
    const netPayable = freelanceTax - totalWHT;
    return {
      grossIncome: input.freelanceIncome,
      rentalDeduction: 0,
      netRentalIncome: 0,
      netBusinessIncome: 0,
      totalIncome: input.freelanceIncome,
      zakatDeduction: 0,
      taxableIncome: input.freelanceIncome,
      grossTax: freelanceTax,
      currentSlab: '1% final tax (SRO 1006)',
      marginalRate: 0.01,
      effectiveRate: 1,
      donationCredit: 0,
      pensionCredit: 0,
      totalCredits: 0,
      totalWHTPaid: totalWHT,
      taxAfterCredits: freelanceTax,
      netPayable,
      isRefund: netPayable < 0,
      nonfilerPenalty: input.filerStatus === 'nonfiler' ? 'Non-filer: extra 1% WHT on bank transactions. File karo — bahut faida hoga.' : '',
    };
  }
  
  const grossIncome = input.salary + netBusinessIncome + netRentalIncome + input.capitalGains + input.otherIncome;
  
  // 2. Apply deductions
  const zakatDeduction = Math.min(input.zakat, grossIncome); // Cannot exceed income
  const taxableIncome = Math.max(0, grossIncome - zakatDeduction);
  
  // 3. Calculate gross tax using slabs
  let grossTax = 0;
  let currentSlab = '0%';
  let marginalRate = 0;
  
  for (const slab of slabs) {
    if (taxableIncome <= slab.max) {
      const excessAboveMin = Math.max(0, taxableIncome - slab.min);
      grossTax = Math.round(slab.fixedTax + excessAboveMin * slab.marginalRate);
      currentSlab = slab.label;
      marginalRate = slab.marginalRate;
      break;
    }
  }
  
  // 4. Calculate tax credits
  // Section 61 — Donations: credit = (donations / taxableIncome) * grossTax, max 30% of taxable income
  const maxDonationBase = Math.min(input.donations, taxableIncome * 0.30);
  const donationCredit = taxableIncome > 0 ? Math.round((maxDonationBase / taxableIncome) * grossTax) : 0;
  
  // Section 63 — Pension: credit = 20% of contribution, max 20% of income or PKR 2M
  const maxPensionContrib = Math.min(input.pensionContribution + input.lifeInsurance, Math.min(2000000, grossIncome * 0.20));
  const pensionCredit = Math.round(maxPensionContrib * 0.20);
  
  const totalCredits = donationCredit + pensionCredit;
  const taxAfterCredits = Math.max(0, grossTax - totalCredits);
  
  // 5. WHT adjustment
  const totalWHTPaid = input.whtSalary + input.whtBank + input.whtMobile + input.whtProperty + input.whtOther;
  
  // 6. Final result
  const netPayable = taxAfterCredits - totalWHTPaid;
  const effectiveRate = grossIncome > 0 ? parseFloat(((grossTax / grossIncome) * 100).toFixed(2)) : 0;
  
  const nonfilerPenalty = input.filerStatus === 'nonfiler'
    ? 'Aap non-filer hain: bank transactions pe double WHT, property pe extra tax, car registration pe penalty. Abhi file karo — late penalty sirf PKR 1,000/month hai.'
    : '';
  
  return {
    grossIncome,
    rentalDeduction,
    netRentalIncome,
    netBusinessIncome,
    totalIncome: grossIncome,
    zakatDeduction,
    taxableIncome,
    grossTax,
    currentSlab,
    marginalRate,
    effectiveRate,
    donationCredit,
    pensionCredit,
    totalCredits,
    totalWHTPaid,
    taxAfterCredits,
    netPayable,
    isRefund: netPayable < 0,
    nonfilerPenalty,
  };
}

export function formatPKR(amount: number): string {
  return 'PKR ' + Math.abs(Math.round(amount)).toLocaleString('en-PK');
}

export function getLateFilingPenalty(monthsLate: number): number {
  // Income Tax Ordinance 2001, Section 182
  // PKR 1,000 per month late, maximum PKR 50,000 for individuals
  return Math.min(monthsLate * 1000, 50000);
}

export function getNonFilerWHTRate(category: string): { filer: string; nonfiler: string } {
  const rates: Record<string, { filer: string; nonfiler: string }> = {
    'bank_cash_withdrawal': { filer: '0%', nonfiler: '0.6%' },
    'bank_transfer': { filer: '0%', nonfiler: '0%' },
    'property_purchase': { filer: '3%', nonfiler: '10.5%' },
    'property_sale': { filer: '3%', nonfiler: '10.5%' },
    'car_purchase': { filer: '0%', nonfiler: '3%' },
    'mobile_topup': { filer: '10%', nonfiler: '10%' },
    'dividend': { filer: '15%', nonfiler: '30%' },
  };
  return rates[category] || { filer: 'N/A', nonfiler: 'N/A' };
}
```

---

## 4. AI SYSTEM PROMPTS

### File: `/lib/prompts.ts`

```typescript
export const TAXBOT_SYSTEM_PROMPT = `
You are TaxBot Pakistan — Pakistan ka sabse helpful AI tax assistant.

LANGUAGE: Always respond in Hinglish (mix of Urdu/Hindi and English). Use simple words. 
Never use complicated legal terms without explaining them. 
If user writes in pure Urdu, respond in Urdu. If English, respond in English.

PERSONALITY:
- Friendly, patient, encouraging
- Like a knowledgeable friend — not a formal government officer
- Celebrate when user files for first time ("Congratulations! Aap ab official filer hain!")
- Never make user feel stupid for not knowing

YOUR JOB — STEP BY STEP:
1. First ask: Are they salaried, business, freelancer, or overseas?
2. Based on type, ask relevant income questions ONE AT A TIME
3. Ask about deductions (zakat, WHT, donations, pension)
4. When you have all numbers, output CALCULATE tag (see below)
5. After calculation shown, give IRIS filing instructions
6. Answer any follow-up questions

QUESTIONS TO ASK FOR SALARIED PERSON:
- "Aapki poori saal ki gross salary kitni hai? (July 2023 se June 2024 tak)"
- "Kya employer ne salary se koi tax kata? (salary slip pe dekhein — Income Tax column)"
- "Kya aapne zakat diya hai is saal? Kitna?"
- "Kya koi aur income hai? Rent, shares, ya kuch aur?"
- "Kya aapne kisi approved NPO ko donation diya?"

QUESTIONS TO ASK FOR BUSINESS OWNER:
- "Aapka is saal ka total revenue kya tha? (gross — expenses se pehle)"
- "Business expenses kitne the? (rent, salaries, utilities, raw material)"
- "Kya business bank account se koi WHT kata gaya?"
- "Proprietor hain ya partnership (AOP)?"

QUESTIONS TO ASK FOR FREELANCER:
- "Aap kahan se payment lete hain? (Upwork, Fiverr, direct client?)"
- "Kya payment Pakistan ke bank account mein aati hai?"
- "Is saal total kitne dollar/pound etc. mile? PKR mein kitna hua?"
- "Kya bank ne koi withholding tax kata? (bank statement dekh sakte hain)"
- NOTE: Freelancers remitting through banking channel pay only 1% final tax under SRO 1006(I)/2022

QUESTIONS TO ASK FOR OVERSEAS PAKISTANI:
- "Kitne din Pakistan mein rahe is saal? (183 din se zyada = resident, kam = non-resident)"
- "Pakistan mein koi property hai? Kya rent milta hai?"
- "Pakistan mein koi business ya investment hai?"
- "Bahar se paise Pakistan bhejte hain? (remittances)"
- If non-resident: only Pakistan-source income is taxable. Foreign salary is NOT taxable in Pakistan.

CALCULATION OUTPUT FORMAT:
When you have all information, output exactly this on a new line:
CALCULATE:{"type":"salaried","year":"2025","salary":1200000,"businessRevenue":0,"businessExpenses":0,"rentalIncome":0,"freelanceIncome":0,"capitalGains":0,"otherIncome":0,"zakat":0,"pension":0,"lifeInsurance":0,"donations":0,"whtSalary":30000,"whtBank":0,"whtMobile":0,"whtProperty":0,"whtOther":0,"filerStatus":"filer","isOverseas":false}

After CALCULATE tag, write a friendly explanation of what the numbers mean.

IRIS FILING INSTRUCTIONS (give after calculation):
Tell user exactly:
1. Go to iris.fbr.gov.pk
2. Login with your NTN and password
3. Click Declaration → Income Tax Return
4. Select Tax Year [year]
5. In Income section: enter [exact figures from calculation]
6. In Deductions: enter [exact figures]
7. In Tax Paid/Payable: enter [WHT figures]
8. Preview → Verify → Submit
9. If tax payable: generate PSID → pay at any bank/JazzCash/EasyPaisa
10. If refund: fill refund form with your IBAN

NTN REGISTRATION (if user doesn't have NTN):
1. Go to iris.fbr.gov.pk
2. Click "Registration for Unregistered Person"
3. Enter CNIC number
4. Fill name, address, occupation
5. NTN is generated instantly — same as CNIC for individuals

NON-FILER RULES:
- Non-filers pay DOUBLE withholding tax on almost everything
- Property purchase: non-filer pays 10.5% vs filer pays 3%
- Bank cash withdrawal: non-filer pays 0.6% extra
- Car registration: extra tax for non-filers
- Late filing penalty: PKR 1,000 per month, max PKR 50,000
- Can file past 5 years returns (Section 114 ITO 2001)

OVERSEAS PAKISTANI RULES:
- 183 days rule: less than 183 days in Pakistan = Non-Resident
- Non-residents pay tax ONLY on Pakistan-source income
- Foreign salary/income: NOT taxable in Pakistan if you are non-resident
- Remittances sent to Pakistan: generally exempt
- Rental income from Pakistan property: taxable even if you live abroad
- Can file return online from anywhere in the world via IRIS
- Can give Power of Attorney to someone in Pakistan to file on their behalf

IMPORTANT RULES FOR YOU (AI):
- Never guess tax amounts — always use the CALCULATE tag to trigger the engine
- Never say "I think" or "maybe" about tax rules — be confident or say "is point pe CA se confirm karo"
- Always remind user that this is guidance — complex cases should be verified with a CA
- Never ask more than 2 questions in one message
- Keep messages short — mobile users hain zyada tar
`;

export const IRIS_GUIDE_PROMPT = `
You are an IRIS filing guide assistant. User has completed their tax calculation.
Help them file step by step on FBR IRIS portal (iris.fbr.gov.pk).
Be very specific — tell them exactly which menu, which field, which tab.
If they get stuck, troubleshoot patiently.
Language: Hinglish.
`;
```

---

## 5. API ROUTES

### File: `/app/api/chat/route.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { TAXBOT_SYSTEM_PROMPT } from '@/lib/prompts';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: TAXBOT_SYSTEM_PROMPT,
    messages,
  });
  
  return NextResponse.json({ 
    content: response.content[0].type === 'text' ? response.content[0].text : '' 
  });
}
```

---

## 6. KEY COMPONENTS

### Component: TaxCalculator.tsx
**What it does:** Live editable form where every keystroke recalculates tax instantly.

**Fields to show:**
```
SECTION 1 — Taxpayer Info
- Dropdown: Taxpayer type (Salaried / Business / AOP / Freelancer)
- Dropdown: Tax Year (2024-25 / 2023-24 / 2022-23)
- Dropdown: Filer status (Active filer / Non-filer)
- Toggle: Overseas Pakistani (yes/no)

SECTION 2 — Income (show/hide fields based on taxpayer type)
- Salaried: Gross annual salary
- Business: Gross revenue + Business expenses (net auto-calculated)
- Freelancer: Foreign income received in PKR
- Rental income (show for all types)
- Capital gains (show for all types)
- Other income (show for all types)

SECTION 3 — Deductions
- Zakat paid
- Pension/provident fund contribution
- Life insurance premium
- Donations to NPOs

SECTION 4 — WHT Already Paid
- Employer deducted (from salary slip)
- Bank deducted
- Mobile/utility WHT
- Property WHT
- Other WHT

RESULT PANEL (always visible, right side or bottom)
- Big number: Net Payable / Refund
- Effective tax rate
- Tax slab you are in
- Full breakdown table
- IRIS instructions (auto-generated from the numbers)
- Download PDF button
```

**Behavior rules:**
- All calculation happens in browser using taxEngine.ts — NO server call
- Result updates on every keystroke — no submit button needed
- If non-filer selected: show red warning banner with non-filer penalty rates
- If overseas selected: show info box about non-resident rules
- Mobile responsive: form on top, results below (not side by side on mobile)

### Component: ChatBot.tsx
**What it does:** Full conversational AI that guides user through filing.

**Chat UI features:**
- Message bubbles (user right, AI left)
- Quick reply chips below AI messages
- Typing indicator (3 dots animation) while AI responds
- When AI outputs CALCULATE tag: parse JSON, run taxEngine, display TaxBreakdown card inside chat
- Sticky input bar at bottom
- "Clear chat" button
- Save chat to localStorage so user can continue later

**Quick reply suggestions to show at start:**
- "Main salaried hun"
- "Main business owner hun"  
- "Main freelancer hun"
- "Main bahar rehta hun"
- "Mujhe NTN banana hai"
- "Mujhe notice aaya hai"

### Component: PDFDownload.tsx
**What it does:** Generates a downloadable PDF summary of the tax return.

**PDF content:**
```
Page 1 — Tax Summary
- Header: "FBR Income Tax Return Summary — Tax Year [year]"
- Taxpayer Name: [if user entered]
- CNIC/NTN: [if user entered]
- Taxpayer Type: [type]

Income Summary table:
- Salary Income
- Business Income (net)
- Rental Income (net)
- Other Income
- TOTAL INCOME

Deductions table:
- Zakat
- Other deductions
- TAXABLE INCOME

Tax Computation table:
- Tax on [taxable income] @ [slab]
- Less: Tax credits
- Less: WHT paid
- NET TAX PAYABLE / REFUND

Page 2 — IRIS Filing Instructions
Step by step with exact field names matching IRIS portal
```

**PDF library to use:** @react-pdf/renderer
**File name format:** `TaxReturn_[year]_[CNIC if available]_[timestamp].pdf`

---

## 7. PAGE DESIGNS

### Landing Page (`/`)
**Hero section:**
- Headline: "Pakistan ka pehla AI Tax Assistant"
- Subheadline: "Salaried, business, freelancer, ya overseas — sab ke liye. Urdu aur English mein."
- Two CTA buttons: "Tax Calculate Karo" (→ /calculator) and "AI Se Poochho" (→ /chat)
- Trust badges: "FBR 2024-25 Slabs", "Browser mein — data upload nahi hota", "Bilkul free"

**Three path cards:**
```
Card 1: Pehli baar filer
"NTN nahi hai? Koi baat nahi — hum batayenge"
→ /guide/first-time

Card 2: Overseas Pakistani  
"Bahar se bhi file kar sakte ho"
→ /guide/overseas

Card 3: Non-filer notice
"Notice aaya? Ghabrao mat — hal hai"
→ /guide/notice
```

**Features section:**
- Live calculation (no server upload)
- AI guide in Urdu/English
- IRIS step-by-step instructions
- PDF download
- All income types supported

### Guide Pages (`/guide/[type]`)
Three static guide pages with detailed content:

**`/guide/first-time` — Pehli Baar Filer Guide:**
```
Step 1: NTN Registration
- iris.fbr.gov.pk pe jao
- "Registration for Unregistered Person" click karo
- CNIC number enter karo
- Details fill karo
- NTN foran mil jata hai

Step 2: Income Calculate Karo
- Upar wala calculator use karo
- Ya AI chatbot se madad lo

Step 3: Return File Karo
- IRIS mein login karo NTN se
- Declaration → Income Tax Return
- Tax Year select karo
- Calculated figures daalo
- Submit karo

Step 4: ATL Mein Aa Jao
- 24-48 hours mein Active Taxpayer List mein naam aata hai
- FBR ki website pe verify kar sakte ho: fbr.gov.pk/atl
- Ab sab tax rates filer wali apply hongi
```

**`/guide/overseas` — Overseas Pakistani Guide:**
```
Section 1: Kya aapko file karna chahiye?
- 183 din rule explain karo
- Pakistan-source income ki list
- Foreign income exemption explain karo

Section 2: Kaise file karo bahar se?
- IRIS online kaam karta hai globally
- VPN ki zaroorat nahi
- Power of Attorney option

Section 3: Common overseas cases
- Rental income from Pakistan property
- Pakistani bank account ka sauda
- Property khareedna/bechna Pakistan mein
- Pakistani company mein shares
```

**`/guide/notice` — FBR Notice Guidance:**
```
Section 1: Notice kyun aaya?
- Non-filer status
- Mismatch in data
- Previous year return issues
- Property transaction detected

Section 2: Ghabrao mat — yeh karo
- 30 din ka jawab dene ka waqt hota hai
- Return file karo abhi bhi
- Late penalty calculate karo

Section 3: Notice ka jawab kaise dein
- IRIS mein notice ka section
- Required documents
- CA ki zaroorat kab hai
```

---

## 8. DATABASE SCHEMA (Supabase)

```sql
-- Users table (Supabase Auth handles this automatically)

-- Tax calculations saved by user
CREATE TABLE saved_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tax_year VARCHAR(4) NOT NULL,
  taxpayer_type VARCHAR(20) NOT NULL,
  input_data JSONB NOT NULL,       -- Full TaxInput object
  result_data JSONB NOT NULL,      -- Full TaxResult object
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions (optional — for premium users)
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE saved_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users see own calculations" ON saved_calculations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own chats" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);
```

---

## 9. REVENUE MODEL

### Free tier (no login required)
- Tax calculator — unlimited
- AI chat — 10 messages per day
- Basic IRIS instructions
- One PDF download per session

### Pro tier — PKR 999/year
- Unlimited AI chat
- Save up to 5 tax years
- Advanced deduction finder (AI suggests missed deductions)
- PDF with CA review checklist
- WhatsApp reminder before filing deadline
- Priority support

### Expert tier — PKR 2,999 per filing
- Everything in Pro
- 30-minute video call with a real CA
- CA reviews and signs off on your return
- CA submits on your behalf via Power of Attorney

### Payment integration
- JazzCash (most popular in Pakistan)
- EasyPaisa
- Bank transfer (for overseas Pakistanis)
- Stripe (for overseas Pakistanis paying in foreign currency)

---

## 10. ENVIRONMENT VARIABLES

```env
# .env.local

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App
NEXT_PUBLIC_APP_URL=https://taxbot.pk
```

---

## 11. IMPORTANT FBR RULES TO ENCODE

### Filing deadlines
- Individual / Salaried: 30 September each year
- Business (sole proprietor): 30 September
- Company: 31 December
- AOP: 30 September

### WHT rates — filer vs non-filer difference
| Transaction | Filer | Non-filer |
|---|---|---|
| Cash withdrawal from bank | 0% | 0.6% |
| Property purchase (value > 4M) | 3% | 10.5% |
| Property sale | 3% | 10.5% |
| Dividend income | 15% | 30% |
| Car purchase (>1600cc) | PKR 10,000 | PKR 30,000 |
| Mobile top-up | 10% | 10% (same) |
| Prize bond | 15% | 25% |

### Rental income deductions (automatic — always apply)
- 20% of gross rent for repairs/maintenance (Section 15A)
- Municipal taxes actually paid
- Ground rent actually paid
- Net rental = Gross rent × 80% (minimum)

### Capital gains tax rates (Tax Year 2025)
- Shares held < 1 year: 15%
- Shares held 1-2 years: 12.5%
- Shares held > 2 years: 0%
- Immovable property < 1 year: 15%
- Immovable property 1-2 years: 7.5%
- Immovable property > 2 years: 0% (if declared)

### Freelancer special rule
- Income remitted through banking channel: 1% WHT = FINAL TAX (SRO 1006(I)/2022)
- No need to include in income tax return if WHT deducted
- If income received in cash or through informal channels: normal business slabs apply

---

## 12. DEPLOYMENT CHECKLIST

```bash
# 1. Create Next.js project
npx create-next-app@latest taxbot-pk --typescript --tailwind --app

# 2. Install dependencies
npm install @anthropic-ai/sdk @supabase/supabase-js @react-pdf/renderer

# 3. Set up Supabase
# - Create project at supabase.com
# - Run the SQL schema from Section 8
# - Copy URL and keys to .env.local

# 4. Set up Anthropic
# - Get API key from console.anthropic.com
# - Add to .env.local

# 5. Deploy to Vercel
vercel deploy

# 6. Custom domain
# - Buy taxbot.pk or similar from PKNIC
# - Add to Vercel domains
# - Update NEXT_PUBLIC_APP_URL
```

---

## 13. CONTENT — ALL UI TEXT (Hinglish)

### Calculator page headings
- Page title: "Pakistan Tax Calculator 2024-25"
- Section 1: "Aap kaun hain?"
- Section 2: "Aapki income"
- Section 3: "Deductions aur reductions"
- Section 4: "Pehle se kata tax (WHT)"
- Result: "Aapka tax" / "Aapka refund"

### Result states
- Tax payable: "Aapko FBR ko [amount] dena hai"
- Refund: "FBR aapko [amount] wapas karega 🎉"
- Zero tax: "Aapka koi tax nahi banta — bas return file karo"
- Non-filer warning: "⚠️ Aap non-filer hain — property, bank, car sab pe extra tax lag raha hai"

### IRIS guide text
- "IRIS mein yeh numbers yahan daalen:"
- "Step 1: iris.fbr.gov.pk pe login karo"
- "Step 2: Declaration → Income Tax Return"
- "Step 3: Income section mein salary field mein [X] likhein"
- "Step 4: WHT column mein [Y] likhein"
- "Step 5: Preview karo aur submit karein"

### Error messages
- No income entered: "Pehle apni income daalen"
- Invalid CNIC: "CNIC 13 digits ka hota hai — dobara check karein"
- API error: "AI se connection nahi hua — thodi der baad try karein"

---

## 14. SEO STRATEGY

### Target keywords (Urdu + English)
- "Pakistan tax return kaise file karein"
- "FBR return file karna"
- "income tax Pakistan 2025"
- "non-filer se filer kaise banein"
- "overseas Pakistani tax return"
- "freelancer tax Pakistan"
- "FBR IRIS tutorial Urdu"

### Meta tags for each page
```html
<!-- Landing page -->
<title>TaxBot Pakistan — AI Tax Return Filing Assistant | FBR 2024-25</title>
<meta name="description" content="Pakistan ka pehla AI tax assistant. Salaried, business, freelancer aur overseas Pakistanis ke liye. FBR return file karein Urdu mein — bilkul free.">

<!-- Calculator page -->
<title>Pakistan Income Tax Calculator 2024-25 | FBR Slabs</title>
<meta name="description" content="Live Pakistan income tax calculator FBR 2024-25. Salary, business, rental aur freelance income ka tax foran calculate karein.">
```

---

## 15. WHAT TO BUILD FIRST (Priority Order)

### Phase 1 — MVP (2 weeks)
1. Tax calculation engine (`/lib/taxEngine.ts` and `/lib/slabs.ts`)
2. Live calculator page (`/calculator`)
3. Basic AI chat (`/chat`) with Claude API
4. PDF download (basic — just the numbers)
5. Deploy to Vercel

### Phase 2 — Complete product (2 more weeks)
1. Three guide pages (first-time, overseas, notice)
2. NTN registration guide
3. Landing page with proper design
4. Supabase auth (save calculations)
5. Mobile responsive polish

### Phase 3 — Revenue (1 month)
1. Pro plan with Stripe/JazzCash
2. Expert CA booking system
3. Email reminders (filing deadline alerts)
4. Blog content for SEO

---

*End of PRD. This document contains everything needed to build TaxBot Pakistan from scratch. Give this entire document to your AI coding assistant and say: "Build this complete Next.js application."*
