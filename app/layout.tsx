import Link from 'next/link';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaxBot Pakistan - AI Tax Assistant',
  description: 'Pakistan\'s first AI-powered tax assistant. Calculate your tax, get answers to your questions, and file your return with ease.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
        <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <Link href="/" className="font-bold text-xl tracking-tight text-white hover:text-blue-300 transition-colors">
            TaxBot.pk
          </Link>
          <div className="flex gap-6 font-medium text-sm">
            <Link href="/calculator" className="hover:text-blue-300 transition-colors">Calculator</Link>
            <Link href="/chat" className="hover:text-blue-300 transition-colors">AI Chat</Link>
            <Link href="/guide" className="hover:text-blue-300 transition-colors">Guides</Link>
          </div>
        </nav>

        <main className="flex-1">
          {children}
        </main>
        
        <footer className="bg-slate-100 border-t border-slate-200 text-slate-500 text-center py-6 text-sm mt-auto">
           <p>&copy; {new Date().getFullYear()} TaxBot.pk - Your AI Tax Partner.</p>
           <p className="mt-1">For educational and guidance purposes only. Please verify with a tax professional or CA.</p>
        </footer>
      </body>
    </html>
  )
}
