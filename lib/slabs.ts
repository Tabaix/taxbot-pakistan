// lib/slabs.ts
//
// VERIFIED against:
//  - PwC Pakistan Tax Memorandum on Finance Bill 2025
//  - Cross-checked against FileKero's published Finance Act 2025 slabs (filekero.pk)
// Last verified: June 2026, for Tax Year 2025-26 (income earned July 2025–June 2026,
// filed by 30 Sept 2026). This is the CURRENT filing season as of today.
//
// IMPORTANT: Pakistan's Finance Act changes every June. Re-verify these numbers
// against the official FBR gazette notification once the FY2026-27 Finance Act
// (Budget 2026-27, announced 12 June 2026) is formally passed into law — it is
// currently still a Bill, not yet enacted, so it is NOT included here.

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
  // TAX YEAR 2025-26 — Finance Act 2025 (VERIFIED, current filing season)
  '2025': {
    salaried: [
      { min: 0,       max: 600000,   fixedTax: 0,      marginalRate: 0,    label: '0%' },
      { min: 600001,  max: 1200000,  fixedTax: 0,      marginalRate: 0.01, label: '1%' },
      { min: 1200001, max: 2200000,  fixedTax: 6000,   marginalRate: 0.11, label: '11%' },
      { min: 2200001, max: 3200000,  fixedTax: 116000, marginalRate: 0.23, label: '23%' },
      { min: 3200001, max: 4100000,  fixedTax: 346000, marginalRate: 0.30, label: '30%' },
      { min: 4100001, max: Infinity, fixedTax: 616000, marginalRate: 0.35, label: '35%' },
    ],
    // AOP / non-salaried business individuals — materially higher rates than salaried
    business: [
      { min: 0,       max: 600000,   fixedTax: 0,       marginalRate: 0,    label: '0%' },
      { min: 600001,  max: 1200000,  fixedTax: 0,       marginalRate: 0.15, label: '15%' },
      { min: 1200001, max: 1600000,  fixedTax: 90000,   marginalRate: 0.20, label: '20%' },
      { min: 1600001, max: 3200000,  fixedTax: 170000,  marginalRate: 0.30, label: '30%' },
      { min: 3200001, max: 5600000,  fixedTax: 650000,  marginalRate: 0.40, label: '40%' },
      { min: 5600001, max: Infinity, fixedTax: 1610000, marginalRate: 0.45, label: '45%' },
    ],
    aop: [
      { min: 0,       max: 600000,   fixedTax: 0,       marginalRate: 0,    label: '0%' },
      { min: 600001,  max: 1200000,  fixedTax: 0,       marginalRate: 0.15, label: '15%' },
      { min: 1200001, max: 1600000,  fixedTax: 90000,   marginalRate: 0.20, label: '20%' },
      { min: 1600001, max: 3200000,  fixedTax: 170000,  marginalRate: 0.30, label: '30%' },
      { min: 3200001, max: 5600000,  fixedTax: 650000,  marginalRate: 0.40, label: '40%' },
      { min: 5600001, max: Infinity, fixedTax: 1610000, marginalRate: 0.45, label: '45%' },
    ],
    freelancer: [
      // Section 154A — IT/export-of-services freelancers, paid through banking channel.
      // PSEB-registered: 0.25% final tax. Unregistered: 1% final tax.
      // The 0.25% vs 1% split is handled in taxEngine.ts via the `pseRegistered` flag,
      // NOT here — this entry is the fallback/unregistered rate.
      { min: 0, max: Infinity, fixedTax: 0, marginalRate: 0.01, label: '1% final tax (unregistered) / 0.25% if PSEB-registered' },
    ],
  },
  // 2024 and 2023 slabs are UNVERIFIED placeholders — do not rely on these for
  // anything but rough historical reference until checked against FBR's actual
  // Finance Act text for those years.
  '2024': { salaried: [], business: [], freelancer: [], aop: [] },
  '2023': { salaried: [], business: [], freelancer: [], aop: [] },
};

// Surcharge: 9% on computed tax where annual taxable income exceeds PKR 10,000,000
// (reduced from 10% under Finance Act 2024). Applies to salaried AND AOP individuals.
export const HIGH_INCOME_SURCHARGE_THRESHOLD = 10_000_000;
export const HIGH_INCOME_SURCHARGE_RATE = 0.09;

export function applySurcharge(taxableIncome: number, grossTax: number): number {
  if (taxableIncome > HIGH_INCOME_SURCHARGE_THRESHOLD) {
    return Math.round(grossTax * HIGH_INCOME_SURCHARGE_RATE);
  }
  return 0;
}

// Updated WHT filer vs non-filer rates (Finance Act 2025) — for getNonFilerWHTRate()
// in taxEngine.ts. Property bands now have THREE tiers, not flat 3%/10.5%.
export const WHT_RATES_2025 = {
  bank_cash_withdrawal: { filer: '0%', nonfiler: '0.8%' }, // raised from 0.6%
  property_purchase_under_50m: { filer: '1.5%', nonfiler: '10.5%' },
  property_purchase_50m_to_100m: { filer: '2%', nonfiler: '14.5%' },
  property_purchase_over_100m: { filer: '2.5%', nonfiler: '18.5%' },
  property_sale: { filer: '4.5%-5.5%', nonfiler: '10% flat' },
  profit_on_debt_bank: { filer: '20%', nonfiler: '40%' }, // raised from 15%
  dividend: { filer: '15%', nonfiler: '30%' },
};