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
