import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Tax Guides</h1>
          <p className="text-xl text-slate-600">Your comprehensive resource for understanding taxes in Pakistan.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/guide/first-time" className="block bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-4">👶</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">First-Time Filer Guide</h2>
            <p className="text-slate-600">New to filing taxes? Learn how to get your NTN and file your first return step-by-step.</p>
          </Link>
          
          <Link href="/guide/overseas" className="block bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-4">✈️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Overseas Pakistani Guide</h2>
            <p className="text-slate-600">Living abroad? Understand the 183-day rule, exemptions, and how to file from anywhere.</p>
          </Link>
          
          <Link href="/guide/notice" className="block bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all hover:-translate-y-1">
            <div className="text-3xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">FBR Notice Guide</h2>
            <p className="text-slate-600">Received a notice from the FBR? Don't panic. Here's exactly what you need to do next.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
