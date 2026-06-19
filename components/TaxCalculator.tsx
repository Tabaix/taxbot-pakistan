'use client';

import { useState, useEffect } from 'react';
import { calculateTax, formatPKR, TaxInput, TaxResult } from '../lib/taxEngine';
import type { TaxpayerType, TaxYear } from '../lib/slabs';
import WHTFinder from './WHTFinder';
import TaxOptimizer from './TaxOptimizer';
import CapitalGainsAdvisor from './CapitalGainsAdvisor';
import PDFDownload from './PDFDownload';

const initialInput: TaxInput = {
  taxpayerType: 'salaried',
  taxYear: '2025',
  filerStatus: 'filer',
  isOverseas: false,
  salary: 1200000,
  businessRevenue: 0,
  businessExpenses: 0,
  rentalIncome: 0,
  freelanceIncome: 0,
  capitalGains: 0,
  otherIncome: 0,
  zakat: 0,
  pensionContribution: 0,
  lifeInsurance: 0,
  donations: 0,
  whtSalary: 0,
  whtBank: 0,
  whtMobile: 0,
  whtProperty: 0,
  whtOther: 0,
};

export default function TaxCalculator() {
  const [input, setInput] = useState<TaxInput>(initialInput);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [showWHTFinder, setShowWHTFinder] = useState(false);
  const [showCGAdvisor, setShowCGAdvisor] = useState(false);

  useEffect(() => {
    const res = calculateTax(input);
    setResult(res);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: string | number | boolean;
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else {
      parsedValue = value;
    }

    setInput(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const applyFoundWHT = (totalWHTFound: number) => {
    setInput(prev => ({ ...prev, whtOther: prev.whtOther + totalWHTFound }));
    setShowWHTFinder(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN - INPUT FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Tax Calculator (2024-25)</h2>
        
        {/* SECTION 1: Taxpayer Info */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">1. Your Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Tax Year</label>
              <select name="taxYear" value={input.taxYear} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="2025">2025 (July 2024 - June 2025)</option>
                <option value="2024">2024 (July 2023 - June 2024)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Taxpayer Type</label>
              <select name="taxpayerType" value={input.taxpayerType} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="salaried">Salaried</option>
                <option value="business">Business Owner</option>
                <option value="freelancer">Freelancer (IT/Export)</option>
                <option value="aop">AOP (Partnership)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Filer Status</label>
              <select name="filerStatus" value={input.filerStatus} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="filer">Active Filer</option>
                <option value="nonfiler">Non-Filer</option>
              </select>
            </div>
            
            <div className="flex items-center mt-6">
              <input type="checkbox" id="isOverseas" name="isOverseas" checked={input.isOverseas} onChange={handleInputChange} className="h-5 w-5 text-blue-600" />
              <label htmlFor="isOverseas" className="ml-2 block text-sm text-slate-700">I am an Overseas Pakistani</label>
            </div>
          </div>
          
          {input.isOverseas && (
             <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
                <strong>Overseas Rule:</strong> If you stayed in Pakistan for less than 183 days, you are a Non-Resident. Foreign income is exempt! Only enter Pakistan-source income below.
             </div>
          )}
        </div>

        {/* SECTION 2: Income */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">2. Income</h3>
          
          {input.taxpayerType === 'salaried' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Annual Gross Salary (PKR)</label>
              <input type="number" name="salary" value={input.salary || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. 1200000" />
            </div>
          )}

          {(input.taxpayerType === 'business' || input.taxpayerType === 'aop') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Gross Revenue (PKR)</label>
                <input type="number" name="businessRevenue" value={input.businessRevenue || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Business Expenses (PKR)</label>
                <input type="number" name="businessExpenses" value={input.businessExpenses || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}

          {input.taxpayerType === 'freelancer' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Foreign Income Remitted (PKR)</label>
              <input type="number" name="freelanceIncome" value={input.freelanceIncome || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-slate-500 mt-1">1% Final Tax applies under SRO 1006(I)/2022 if remitted via banking channel.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Gross Rental Income</label>
              <input type="number" name="rentalIncome" value={input.rentalIncome || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-600">Capital Gains (Property/Shares)</label>
                <button onClick={() => setShowCGAdvisor(true)} className="text-xs text-purple-600 hover:text-purple-800 font-medium">Use Advisor</button>
              </div>
              <input type="number" name="capitalGains" value={input.capitalGains || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* SECTION 3: Deductions */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">3. Deductions & Credits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Zakat Paid (Official)</label>
              <input type="number" name="zakat" value={input.zakat || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Pension Fund Contribution</label>
              <input type="number" name="pensionContribution" value={input.pensionContribution || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Approved Donations</label>
              <input type="number" name="donations" value={input.donations || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Life Insurance Premium</label>
              <input type="number" name="lifeInsurance" value={input.lifeInsurance || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
        </div>

        {/* SECTION 4: Withholding Tax */}
        <div className="space-y-4 mb-4">
          <div className="flex justify-between items-end border-b pb-2">
            <h3 className="text-lg font-semibold text-slate-700">4. Withholding Tax (Already Paid)</h3>
            <button onClick={() => setShowWHTFinder(true)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors">
              🔍 Find Missing WHT
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {input.taxpayerType === 'salaried' && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Deducted by Employer</label>
                <input type="number" name="whtSalary" value={input.whtSalary || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Bank (Cash Withdrawal/Transfers)</label>
              <input type="number" name="whtBank" value={input.whtBank || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Mobile / Internet Bills</label>
              <input type="number" name="whtMobile" value={input.whtMobile || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Property Purchase/Sale</label>
              <input type="number" name="whtProperty" value={input.whtProperty || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Other WHT (Car, Dividends)</label>
              <input type="number" name="whtOther" value={input.whtOther || ''} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-yellow-50" />
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN - RESULTS */}
      <div className="space-y-6">
        {result && (
          <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg sticky top-6">
            <h3 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Tax Calculation Summary</h3>
            
            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between">
                <span>Total Income</span>
                <span className="font-medium text-white">{formatPKR(result.totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxable Income (After Zakat)</span>
                <span className="font-medium text-white">{formatPKR(result.taxableIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Slab / Rate</span>
                <span className="font-medium text-blue-400">{result.currentSlab}</span>
              </div>
              <div className="flex justify-between">
                <span>Gross Tax Computed</span>
                <span className="font-medium text-white">{formatPKR(result.grossTax)}</span>
              </div>
              
              {result.totalCredits > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Less: Tax Credits (Donation/Pension)</span>
                  <span>- {formatPKR(result.totalCredits)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t border-slate-700 pt-3 mt-3">
                <span>Tax After Credits</span>
                <span className="font-medium text-white">{formatPKR(result.taxAfterCredits)}</span>
              </div>
              <div className="flex justify-between text-blue-300">
                <span>Less: Withholding Tax Paid</span>
                <span>- {formatPKR(result.totalWHTPaid)}</span>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg text-center ${result.isRefund ? 'bg-green-900/50 border border-green-500' : 'bg-rose-900/50 border border-rose-500'}`}>
              <h4 className={`text-sm uppercase tracking-wider font-semibold mb-1 ${result.isRefund ? 'text-green-400' : 'text-rose-400'}`}>
                {result.isRefund ? 'Refund Due From FBR' : 'Net Tax Payable to FBR'}
              </h4>
              <p className="text-3xl font-bold">
                {formatPKR(Math.abs(result.netPayable))}
              </p>
            </div>

            {result.nonfilerPenalty && (
               <div className="mt-4 bg-orange-900/50 border border-orange-600 text-orange-200 p-3 rounded-lg text-sm leading-relaxed">
                 ⚠️ <strong>Warning:</strong> {result.nonfilerPenalty}
               </div>
            )}
            
            {/* New Feature: Tax Optimizer */}
            {result.netPayable > 0 && input.taxpayerType !== 'freelancer' && (
               <div className="mt-6 pt-6 border-t border-slate-700">
                  <TaxOptimizer input={input} result={result} onApply={(field, val) => setInput(prev => ({...prev, [field]: val}))} />
               </div>
            )}
            
            <PDFDownload input={input} result={result} />

          </div>
        )}
      </div>

      {/* MODALS */}
      {showWHTFinder && <WHTFinder onClose={() => setShowWHTFinder(false)} onApply={applyFoundWHT} />}
      {showCGAdvisor && (
        <CapitalGainsAdvisor 
          onClose={() => setShowCGAdvisor(false)} 
          onApply={(gain) => {
            setInput(prev => ({ ...prev, capitalGains: prev.capitalGains + gain }));
            setShowCGAdvisor(false);
          }} 
        />
      )}
    </div>
  );
}
