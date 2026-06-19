'use client';

import { useState } from 'react';

interface WHTFinderProps {
  onClose: () => void;
  onApply: (totalFound: number) => void;
}

export default function WHTFinder({ onClose, onApply }: WHTFinderProps) {
  const [mobileBill, setMobileBill] = useState('');
  const [internetBill, setInternetBill] = useState('');
  const [vehicleCC, setVehicleCC] = useState('0');
  
  const calculateHiddenWHT = () => {
    let total = 0;
    
    // Postpaid mobile / internet usually has ~10% WHT on the bill amount (excluding sales tax, but rough estimate)
    // Actually, on prepaid recharge it's 10%. Let's assume the user enters annual recharge/bill.
    const mobile = parseFloat(mobileBill) || 0;
    total += mobile * 0.10; // 10% WHT

    const internet = parseFloat(internetBill) || 0;
    total += internet * 0.10;

    // Vehicle Token Tax (approximate rates for filers)
    const cc = parseInt(vehicleCC);
    if (cc > 1000 && cc <= 1199) total += 1500;
    else if (cc >= 1200 && cc <= 1299) total += 1750;
    else if (cc >= 1300 && cc <= 1499) total += 2500;
    else if (cc >= 1500 && cc <= 1599) total += 3750;
    else if (cc >= 1600 && cc <= 1999) total += 4500;
    else if (cc >= 2000) total += 10000;

    return Math.round(total);
  };

  const totalFound = calculateHiddenWHT();

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">🔍 Hidden Withholding Tax Finder</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Many people pay tax on daily services without realizing it. Answer these questions to estimate your unclaimed WHT.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Mobile Recharge/Bill (PKR)</label>
            <input type="number" value={mobileBill} onChange={e => setMobileBill(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-blue-500" placeholder="e.g. 12000" />
            <p className="text-xs text-slate-500 mt-1">Telecom companies deduct 10% income tax on every recharge.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Internet/Broadband Bill (PKR)</label>
            <input type="number" value={internetBill} onChange={e => setInternetBill(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-blue-500" placeholder="e.g. 24000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Do you own a car? (Engine Capacity)</label>
            <select value={vehicleCC} onChange={e => setVehicleCC(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-blue-500">
              <option value="0">No car / Under 1000cc (Exempt)</option>
              <option value="1001">1001cc to 1199cc</option>
              <option value="1200">1200cc to 1299cc</option>
              <option value="1300">1300cc to 1499cc</option>
              <option value="1500">1500cc to 1599cc</option>
              <option value="1600">1600cc to 1999cc</option>
              <option value="2000">2000cc and above</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Income tax is collected with your annual token tax.</p>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-blue-900">Estimated WHT Found:</p>
              <p className="text-2xl font-bold text-blue-700">PKR {totalFound.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => onApply(totalFound)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add to Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
