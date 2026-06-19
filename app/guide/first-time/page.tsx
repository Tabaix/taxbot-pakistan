import Link from 'next/link';

export default function FirstTimeFilerGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100 my-8">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">First-Time Filer Guide</h1>
        <p className="text-slate-600">A simple, step-by-step guide to becoming an Active Taxpayer in Pakistan.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">1</span> NTN Registration</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Go to the official FBR portal: <a href="https://iris.fbr.gov.pk" target="_blank" className="text-blue-600 hover:underline">iris.fbr.gov.pk</a></li>
            <li>Click on <strong>"Registration for Unregistered Person"</strong>.</li>
            <li>Enter your CNIC number, Name, Address, and Occupation details.</li>
            <li>Verify your mobile number and email address via OTP.</li>
            <li>Your NTN is generated instantly! (For individuals, your CNIC is your NTN).</li>
          </ul>
        </section>

        <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">2</span> Calculate Your Tax</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Before filing, you need to know exactly how much you owe or what refund you are entitled to.</li>
            <li>Use our <Link href="/calculator" className="text-blue-600 hover:underline">Tax Calculator</Link> or <Link href="/chat" className="text-blue-600 hover:underline">AI Chat</Link> to accurately determine your figures.</li>
            <li>Download the generated PDF—you will use these exact figures in the next step.</li>
          </ul>
        </section>

        <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">3</span> File the Return on IRIS</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Log into IRIS using your CNIC and the password you created.</li>
            <li>Click <strong>Declaration</strong> → <strong>Income Tax Return</strong>.</li>
            <li>Select the correct Tax Year (e.g., 2024 for income earned from July 2023 to June 2024).</li>
            <li>Enter your income, deductions, and withholding tax exactly as shown on the PDF from TaxBot.</li>
            <li>Click <strong>Calculate</strong> in IRIS to verify the payable amount matches.</li>
            <li>If there is tax payable, generate a PSID and pay via JazzCash, EasyPaisa, or any banking app.</li>
            <li>Finally, click <strong>Submit</strong>!</li>
          </ul>
        </section>

        <section className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
          <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center"><span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">4</span> Get on the Active Taxpayer List (ATL)</h2>
          <ul className="list-disc pl-5 space-y-2 text-emerald-800">
            <li>Congratulations! Within 24-48 hours of filing, your name will be added to the ATL.</li>
            <li>You can verify this at <a href="https://e.fbr.gov.pk/esbn/Service.aspx?PID=012" target="_blank" className="font-bold hover:underline">fbr.gov.pk/atl</a>.</li>
            <li>As an active filer, you will now pay exactly <strong>half</strong> the withholding tax on banking, property, and vehicle transactions compared to non-filers!</li>
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
