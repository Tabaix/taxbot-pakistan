import ChatBot from '@/components/ChatBot';

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-100 pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">AI Tax Assistant</h1>
          <p className="text-slate-600 mt-2">Ask questions in Urdu or English. Let the AI calculate your tax.</p>
        </div>
        <ChatBot />
      </div>
    </div>
  );
}
