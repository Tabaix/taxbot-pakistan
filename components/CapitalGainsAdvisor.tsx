'use client';

import { useState } from 'react';

interface CapitalGainsAdvisorProps {
  onClose: () => void;
  onApply: (calculatedGain: number) => void;
}

export default function CapitalGainsAdvisor({ onClose, onApply }: CapitalGainsAdvisorProps) {
  const [propertyType, setPropertyType] = useState('open_plot');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [holdingYears, setHoldingYears] = useState('0');

  const calculateGain = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const sale = parseFloat(salePrice) || 0;
    const profit = Math.max(0, sale - purchase);
    
    const years = parseFloat(holdingYears);
    let taxablePercentage = 100;

    // FBR Rules (Simplified for 2024-25)
    if (propertyType === 'open_plot') {
      if (years >= 1 && years < 2) taxablePercentage = 75;
      else if (years >= 2 && years < 3) taxablePercentage = 50;
      else if (years >= 3 && years < 4) taxablePercentage = 25;
      else if (years >= 4) taxablePercentage = 0;
    } else if (propertyType === 'constructed') {
      if (years >= 1 && years < 2) taxablePercentage = 75;
      else if (years >= 2 && years < 3) taxablePercentage = 50;
      else if (years >= 3) taxablePercentage = 0;
    } else if (propertyType === 'flat') {
      if (years >= 1 && years < 2) taxablePercentage = 75;
      else if (years >= 2) taxablePercentage = 0;
    }

    return Math.round(profit * (taxablePercentage / 100));
  };

  const taxableGain = calculateGain();

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">🏠 Property Tax Advisor</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Sold a property? The tax you pay depends on how long you owned it (Holding Period).
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-purple-500">
              <option value="open_plot">Open Plot</option>
              <option value="constructed">Constructed Property</option>
              <option value="flat">Flat / Apartment</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price</label>
              <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-purple-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price</label>
              <input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-purple-500" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Years Held</label>
            <input type="number" step="0.1" value={holdingYears} onChange={e => setHoldingYears(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-purple-500" placeholder="e.g. 2.5" />
            <p className="text-xs text-slate-500 mt-1">If you held an open plot for over 4 years, it's 100% tax exempt!</p>
          </div>

          <div className="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-purple-900">Taxable Capital Gain:</p>
              <p className="text-2xl font-bold text-purple-700">PKR {taxableGain.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => onApply(taxableGain)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add to Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
