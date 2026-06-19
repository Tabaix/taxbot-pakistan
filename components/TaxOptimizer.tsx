'use client';

import { TaxInput, TaxResult, formatPKR } from '../lib/taxEngine';

interface TaxOptimizerProps {
  input: TaxInput;
  result: TaxResult;
  onApply: (field: string, value: number) => void;
}

export default function TaxOptimizer({ input, result, onApply }: TaxOptimizerProps) {
  // Simple optimization logic
  // Max pension contribution is 20% of taxable income or 2M (simplified)
  const maxPensionAllowed = Math.min(2000000, result.totalIncome * 0.20);
  const remainingPensionSpace = Math.max(0, maxPensionAllowed - input.pensionContribution - input.lifeInsurance);
  
  // Potential tax saving if they max out pension (20% of contribution amount)
  const potentialSaving = Math.round(remainingPensionSpace * 0.20);

  if (potentialSaving <= 0) {
    return (
      <div className="bg-emerald-900/40 border border-emerald-700 rounded-lg p-4">
        <h4 className="text-emerald-400 font-semibold mb-1 flex items-center">
          <span>🌟 Tax Fully Optimized</span>
        </h4>
        <p className="text-sm text-emerald-200">
          You are already maximizing your pension/insurance tax credits!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-900/40 border border-indigo-700 rounded-lg p-4">
      <h4 className="text-indigo-400 font-semibold mb-2 flex items-center">
        <span className="mr-2">💡</span> Tax Saving Optimizer
      </h4>
      <p className="text-sm text-indigo-200 mb-3 leading-relaxed">
        You can legally reduce your tax by <strong>{formatPKR(potentialSaving)}</strong> if you invest <strong>{formatPKR(remainingPensionSpace)}</strong> in an approved Voluntary Pension Scheme (VPS) or Mutual Fund before June 30th.
      </p>
      
      <div className="flex gap-2">
        <button 
          onClick={() => onApply('pensionContribution', input.pensionContribution + remainingPensionSpace)}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded shadow transition-colors"
        >
          Simulate Max Investment
        </button>
      </div>
    </div>
  );
}
