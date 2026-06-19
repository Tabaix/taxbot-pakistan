'use client';

import { useState, useEffect } from 'react';

export default function ApiKeyModal({ onClose }: { onClose: () => void }) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user_gemini_key');
    if (stored) setKey(stored);
  }, []);

  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem('user_gemini_key', key.trim());
    } else {
      localStorage.removeItem('user_gemini_key');
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setKey('');
    localStorage.removeItem('user_gemini_key');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5">
          <h3 className="font-bold text-lg">🔑 Your Gemini API Key</h3>
          <p className="text-blue-100 text-sm mt-1">Use your own key to avoid rate limits</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            💡 <strong>Optional:</strong> The site already has a default key. Add yours only if you hit the free usage limit.
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-3 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Get a free key at{' '}
              <a href="https://aistudio.google.com" target="_blank" className="text-blue-600 hover:underline font-medium">
                aistudio.google.com
              </a>
            </p>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 border rounded-lg p-3">
            🔒 Your key is saved <strong>only on your device</strong> (localStorage). It is never sent to our server without your request, and is not stored anywhere else.
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors ${
                saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saved ? '✓ Saved!' : 'Save Key'}
            </button>
            {key && (
              <button
                onClick={handleClear}
                className="px-4 py-2.5 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
