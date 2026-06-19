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
