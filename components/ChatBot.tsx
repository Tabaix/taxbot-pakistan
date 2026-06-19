'use client';

import { useState, useRef, useEffect } from 'react';
import { calculateTax, formatPKR, TaxInput, TaxResult } from '../lib/taxEngine';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  result?: TaxResult | null;
}

const QUICK_REPLIES = [
  "Main salaried hun",
  "Main business owner hun",
  "Main freelancer hun",
  "Main bahar rehta hun",
  "Mujhe NTN banana hai",
  "Mujhe notice aaya hai"
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('taxbot_chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved chat");
      }
    } else {
      setMessages([{ role: 'assistant', content: "Assalam o Alaikum! Main TaxBot hun, aapka AI tax assistant. Batayein, main aapki tax filing mein kaise madad kar sakta hun?" }]);
    }
  }, []);

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('taxbot_chat', JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) throw new Error('API call failed');

      const data = await res.json();
      let assistantContent = data.content || '';
      let taxResult: TaxResult | null = null;

      const calculatePrefix = 'CALCULATE:';
      if (assistantContent.includes(calculatePrefix)) {
        const parts = assistantContent.split(calculatePrefix);
        assistantContent = parts[0]; 
        const jsonPart = parts[1];
        try {
          const aiInput = JSON.parse(jsonPart);
          const mappedInput: TaxInput = {
              taxpayerType: aiInput.type || 'salaried',
              taxYear: aiInput.year || '2025',
              filerStatus: aiInput.filerStatus || 'filer',
              isOverseas: aiInput.isOverseas || false,
              salary: aiInput.salary || 0,
              businessRevenue: aiInput.businessRevenue || 0,
              businessExpenses: aiInput.businessExpenses || 0,
              rentalIncome: aiInput.rentalIncome || 0,
              freelanceIncome: aiInput.freelanceIncome || 0,
              capitalGains: aiInput.capitalGains || 0,
              otherIncome: aiInput.otherIncome || 0,
              zakat: aiInput.zakat || 0,
              pensionContribution: aiInput.pension || 0,
              lifeInsurance: aiInput.lifeInsurance || 0,
              donations: aiInput.donations || 0,
              whtSalary: aiInput.whtSalary || 0,
              whtBank: aiInput.whtBank || 0,
              whtMobile: aiInput.whtMobile || 0,
              whtProperty: aiInput.whtProperty || 0,
              whtOther: aiInput.whtOther || 0,
          };
          taxResult = calculateTax(mappedInput);
        } catch (e) {
          console.error('Failed to parse tax calculation JSON:', e);
          assistantContent += "\n\n[System: Calculation error due to missing data format.]";
        }
      }
      
      const assistantMessage: Message = { role: 'assistant', content: assistantContent, result: taxResult };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem('taxbot_chat');
    setMessages([{ role: 'assistant', content: "Chat cleared. Kaise madad kar sakta hun?" }]);
  };

  return (
    <div className="max-w-3xl mx-auto h-[85vh] flex flex-col bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md z-10">
        <div>
          <h2 className="font-bold text-lg flex items-center">
            <span className="text-2xl mr-2">🤖</span> TaxBot Assistant
          </h2>
          <p className="text-blue-200 text-xs">Powered by AI</p>
        </div>
        <button onClick={clearChat} className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-full transition-colors">
          Clear Chat
        </button>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              
              {/* TAX RESULT CARD (Rendered if AI triggered CALCULATE) */}
              {msg.result && (
                <div className="mt-4 bg-slate-800 text-white p-4 rounded-xl shadow-inner text-sm">
                  <h4 className="font-bold text-blue-400 mb-2 border-b border-slate-700 pb-2">Tax Calculation (2024-25)</h4>
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between"><span>Taxable Income:</span> <span>{formatPKR(msg.result.taxableIncome)}</span></div>
                    <div className="flex justify-between"><span>Gross Tax (Slab: {msg.result.currentSlab}):</span> <span>{formatPKR(msg.result.grossTax)}</span></div>
                    <div className="flex justify-between text-blue-300"><span>WHT Paid:</span> <span>- {formatPKR(msg.result.totalWHTPaid)}</span></div>
                  </div>
                  <div className={`pt-2 border-t border-slate-700 flex justify-between font-bold text-base ${msg.result.isRefund ? 'text-green-400' : 'text-rose-400'}`}>
                    <span>{msg.result.isRefund ? 'Refund Due:' : 'Net Payable:'}</span>
                    <span>{formatPKR(Math.abs(msg.result.netPayable))}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* TYPING INDICATOR */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex space-x-2 items-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK REPLIES */}
      {!isLoading && messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-50 flex flex-wrap gap-2 border-t border-slate-100">
          {QUICK_REPLIES.map((reply, i) => (
            <button key={i} onClick={() => handleSend(reply)} className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors shadow-sm">
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          className="flex-1 border border-slate-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
          placeholder="Apna sawal likhiye (Urdu/English)..."
          disabled={isLoading}
        />
        <button 
          onClick={() => handleSend()} 
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
