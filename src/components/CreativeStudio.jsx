import React, { useState } from 'react';
import { Zap, Code, Music, Lightbulb, Sparkles, RefreshCw, ArrowRight, ChevronRight, PenTool } from 'lucide-react';
import { getCreativeGeminiResponse } from '../services/gemini';

const CreativeStudio = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const creativeTypes = [
    { id: 'poem', label: 'Poetry', icon: Music, desc: 'Craft beautiful verses', color: 'bg-rose-50 text-rose-600' },
    { id: 'code', label: 'Engineering', icon: Code, desc: 'Generate robust code', color: 'bg-blue-50 text-blue-600' },
    { id: 'idea', label: 'Strategy', icon: Lightbulb, desc: 'Brainstorm next big thing', color: 'bg-amber-50 text-amber-600' },
    { id: 'joke', label: 'Humor', icon: Zap, desc: 'Write witty jokes', color: 'bg-purple-50 text-purple-600' },
  ];

  const handleGenerate = async () => {
    if (!selectedType || !topic.trim()) return;

    setLoading(true);
    setResult('');
    try {
      const response = await getCreativeGeminiResponse(selectedType, topic);
      setResult(response);
    } catch (error) {
      console.error(error);
      setResult("Oops! Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 px-6 max-w-6xl mx-auto flex flex-col items-center">
      <div className="text-center mb-16 animate-in">
        <h1 className="text-3xl md:text-6xl font-extrabold mb-4 tracking-tight text-slate-900">Creative Studio</h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Choose a tool to jumpstart your imagination.
        </p>
      </div>

      {!result ? (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in" style={{ animationDelay: '0.1s' }}>
          {creativeTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`group relative p-8 rounded-3xl text-left transition-all duration-300 border-2
                  ${isSelected ? 'bg-white border-blue-500 shadow-xl scale-105 ring-4 ring-blue-500/10' : 'bg-white/60 border-transparent hover:bg-white hover:shadow-lg hover:border-slate-100'}
                `}
              >
                <div className={`w-14 h-14 rounded-2xl ${type.color} flex items-center justify-center mb-6 text-xl transition-transform group-hover:scale-110 duration-300`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{type.label}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{type.desc}</p>
                
                <div className={`absolute top-6 right-6 transition-opacity ${isSelected ? 'opacity-100 text-blue-500' : 'opacity-0'}`}>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {selectedType && !result && (
        <div className="mt-12 w-full max-w-xl animate-in">
          <div className="card-modern p-2 flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={`Topic specifically for ${creativeTypes.find(t => t.id === selectedType)?.label}...`}
              className="flex-1 bg-transparent border-none text-slate-800 text-lg px-6 py-4 placeholder-slate-400 focus:ring-0 outline-none font-medium"
              autoFocus
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary rounded-xl"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <ArrowRight />}
            </button>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
         <div className="mt-8 w-full card-modern p-10 animate-in relative">
           <button 
             onClick={() => setResult('')}
             className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 font-bold text-sm bg-slate-100 px-4 py-2 rounded-lg"
           >
             Close
           </button>
           <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-6">Generated Content</h3>
           <div className="prose prose-lg prose-slate max-w-none text-slate-800">
             {result}
           </div>
         </div>
      )}

    </div>
  );
};

export default CreativeStudio;
