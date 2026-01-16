import React, { useState } from 'react';
import { Search, Loader2, Send, MessageSquare } from 'lucide-react';
import { getGeminiResponse } from '../services/gemini';

const SmartSearch = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await getGeminiResponse(query);
      setResult(response);
    } catch (err) {
      setError('Failed to fetch response. Please check your API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 md:pt-32 px-4 w-full max-w-4xl mx-auto">
      <div className="text-center mb-10 animate-in">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <MessageSquare className="text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight">
          Ask me anything.
        </h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto">
          Get instant, intelligent answers.
        </p>
      </div>

      {/* Modern Input */}
      <div className="w-full relative z-10 animate-in" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 w-6 h-6" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="How do black holes work?"
            className="input-modern pl-14 pr-16 py-5 text-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-2.5 bottom-2.5 px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {(result || error) && (
        <div className="mt-8 w-full card-modern p-8 animate-in">
          {error ? (
            <div className="text-red-500 font-medium text-center bg-red-50 p-4 rounded-xl">{error}</div>
          ) : (
            <div className="prose prose-lg prose-slate max-w-none">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Response</h3>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {result}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
