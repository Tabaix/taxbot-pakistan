import Link from 'next/link';

export default function OverseasGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100 my-8">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Overseas Pakistani Tax Guide</h1>
        <p className="text-slate-600">Everything you need to know about filing taxes in Pakistan while living abroad.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">Do you need to file?</h2>
          <div className="space-y-3 text-slate-700">
            <p><strong>The 183-Day Rule:</strong> If you stayed in Pakistan for less than 183 days during the tax year (July 1 to June 30), you are legally considered a <strong>Non-Resident</strong> for tax purposes.</p>
            <p className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-900">
              💡 <strong>Key Benefit:</strong> Non-residents only pay tax on Pakistan-source income. Your foreign salary and foreign business income are <strong>100% exempt</strong> from Pakistani tax!
            </p>
          </div>
        </section>

        <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">Common Overseas Tax Scenarios</h2>
          <div className="space-y-4 text-slate-700">
            <div className="bg-white p-4 rounded border">
              <h3 className="font-bold">1. Remittances</h3>
              <p className="text-sm mt-1">Money sent to Pakistan through official banking channels is generally exempt from tax. You do not need to pay tax on money sent to your family.</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h3 className="font-bold">2. Rental Income in Pakistan</h3>
              <p className="text-sm mt-1">If you own property in Pakistan and earn rent, that rent is <strong>taxable</strong> in Pakistan, regardless of your residential status.</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h3 className="font-bold">3. Buying/Selling Property</h3>
              <p className="text-sm mt-1">If you buy or sell property in Pakistan, you must pay withholding tax and capital gains tax. Becoming an Active Filer cuts the withholding tax rate by half.</p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">How to file from abroad</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>The FBR IRIS portal (<a href="https://iris.fbr.gov.pk" target="_blank" className="text-blue-600 hover:underline">iris.fbr.gov.pk</a>) works globally. You do not need a VPN.</li>
            <li>You can calculate your taxes using our <Link href="/calculator" className="text-blue-600 hover:underline">Tax Calculator</Link> (check the "Overseas Pakistani" toggle).</li>
            <li>If you have complex assets, you can grant a <strong>Power of Attorney</strong> to a trusted family member or tax consultant in Pakistan to file on your behalf.</li>
          </ul>
        </section>
      </div>
      
      <div className="mt-8 pt-6 border-t flex justify-between">
        <Link href="/guide" className="text-blue-600 hover:underline">← Back to Guides</Link>
        <Link href="/calculator" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">Start Calculator</Link>
      </div>
    </div>
  );
}
