import TaxCalculator from '@/components/TaxCalculator';

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">FBR Tax Calculator</h1>
          <p className="text-slate-600 mt-2">Accurately calculate your tax liability for 2024-2025.</p>
        </div>
        <TaxCalculator />
      </div>
    </div>
  );
}
