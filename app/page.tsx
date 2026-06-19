import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white pt-20 pb-24 px-4 text-center rounded-b-[3rem] shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-blue-700/50 text-blue-200 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6 border border-blue-600">
            🇵🇰 Pakistan's First AI Tax Assistant
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Tax Filing Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Simple & Stress-Free</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
            Salaried, business, freelancer, or overseas—calculate your FBR tax in seconds and get step-by-step guidance in Urdu and English.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/calculator" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 text-lg">
              Calculate Your Tax
            </Link>
            <Link href="/chat" className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all hover:-translate-y-1 text-lg flex items-center justify-center">
              Chat with AI Assistant ✨
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-blue-200 font-medium">
            <div className="flex items-center"><span className="text-emerald-400 mr-2">✓</span> FBR 2024-25 Slabs</div>
            <div className="flex items-center"><span className="text-emerald-400 mr-2">✓</span> 100% Private (No data saved)</div>
            <div className="flex items-center"><span className="text-emerald-400 mr-2">✓</span> Completely Free</div>
          </div>
        </div>
      </section>

      {/* THREE PATHS SECTION */}
      <section className="py-20 px-4 max-w-6xl mx-auto -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
            <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              👶
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">First-Time Filer?</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Don't have an NTN yet? No problem. Our step-by-step guide makes registering with FBR incredibly easy.
            </p>
            <Link href="/guide/first-time" className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center">
              Read Guide <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
            <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              ✈️
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Overseas Pakistani?</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Living abroad? Understand your specific tax exemptions and learn how to file your returns from anywhere.
            </p>
            <Link href="/guide/overseas" className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center">
              Read Guide <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
            <div className="bg-rose-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Received a Notice?</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Got a letter from the FBR and panicking? We'll help you understand what it means and what to do next.
            </p>
            <Link href="/guide/notice" className="text-rose-600 font-semibold hover:text-rose-700 flex items-center">
              Read Guide <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-slate-800 text-white py-20 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Everything you need to file with confidence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-left">
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl">⚡</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Live Calculation Engine</h4>
                <p className="text-slate-400">Instantly see your tax liability update as you type. No waiting, no loading spinners.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl">🤖</div>
              <div>
                <h4 className="font-bold text-lg mb-2">AI Chat Assistant</h4>
                <p className="text-slate-400">Ask questions in Roman Urdu or English. It's like having a friendly CA in your pocket.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl">📄</div>
              <div>
                <h4 className="font-bold text-lg mb-2">PDF Export</h4>
                <p className="text-slate-400">Download a clean, structured PDF summary of your return to reference while filing.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-blue-400 text-2xl">🔍</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Tax Discovery Tools</h4>
                <p className="text-slate-400">Find hidden WHT you've already paid and discover new ways to legally reduce your tax.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
