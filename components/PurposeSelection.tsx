import React, { useState } from 'react';
import { AnalysisConfig } from '../types';
import { BookOpen, Briefcase, MessageCircle, PenTool, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  onConfirm: (config: AnalysisConfig) => void;
}

const PURPOSES = [
  {
    id: 'storytelling',
    label: 'Storytelling & Novels',
    icon: <BookOpen size={24} />,
    description: 'For creative writing, fiction, and engaging narratives.',
    prompts: [
      "Write a paragraph setting the scene for a mystery novel in a rainy city.",
      "Describe a character realizing they have a secret power.",
      "Write a dialogue between two old friends meeting after 10 years."
    ]
  },
  {
    id: 'professional',
    label: 'Professional & Email',
    icon: <Briefcase size={24} />,
    description: 'For emails, reports, and workplace communication.',
    prompts: [
      "Write a polite email rescheduling a meeting to next week.",
      "Write a brief status update for a project that is slightly delayed.",
      "Explain a complex problem to a client in simple terms."
    ]
  },
  {
    id: 'casual',
    label: 'Casual & Chat',
    icon: <MessageCircle size={24} />,
    description: 'For social media, texting, and personal blogs.',
    prompts: [
      "Text a friend about a movie you just saw and loved.",
      "Write a caption for a travel photo you are posting.",
      "Explain to a friend why you can't make it to their party."
    ]
  },
  {
    id: 'general',
    label: 'General / Mixed',
    icon: <PenTool size={24} />,
    description: 'A balanced analysis of your overall writing voice.',
    prompts: [
      "Explain to a friend why you cancelled plans at the last minute.",
      "Describe your favorite meal in vivid detail.",
      "What is your opinion on artificial intelligence? Be honest."
    ]
  }
];

const PurposeSelection: React.FC<Props> = ({ onConfirm }) => {
  const [selectedId, setSelectedId] = useState('general');
  const [autoProofread, setAutoProofread] = useState(false);

  const handleConfirm = () => {
    const purpose = PURPOSES.find(p => p.id === selectedId) || PURPOSES[3];
    onConfirm({
      purpose: purpose.label,
      prompts: purpose.prompts,
      autoProofread
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">What's your goal?</h2>
        <p className="text-slate-600 text-lg">
          Tell us how you plan to use your AI persona so we can tailor the analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {PURPOSES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`flex flex-col items-start p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${
              selectedId === p.id
                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
            }`}
          >
            <div className={`p-3 rounded-lg mb-4 ${
              selectedId === p.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
            }`}>
              {p.icon}
            </div>
            <h3 className={`font-bold text-lg mb-1 ${selectedId === p.id ? 'text-indigo-900' : 'text-slate-800'}`}>
              {p.label}
            </h3>
            <p className="text-sm text-slate-500 leading-snug">
              {p.description}
            </p>
            {selectedId === p.id && (
              <div className="absolute top-4 right-4 text-indigo-600">
                <CheckCircle2 size={24} />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
           onClick={() => setAutoProofread(!autoProofread)}>
        <div className="flex items-center gap-4">
           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${autoProofread ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
              {autoProofread && <CheckCircle2 size={16} className="text-white" />}
           </div>
           <div>
             <h3 className="font-semibold text-slate-800">Polish grammar & spelling</h3>
             <p className="text-sm text-slate-500">
               If checked, the AI will learn your tone/style but <span className="font-bold text-emerald-600">correct errors</span>. 
               <br/>Unchecked = The AI mimics your writing exactly, including typos and quirks.
             </p>
           </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleConfirm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold px-10 py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95"
        >
          Start Writing Samples &rarr;
        </button>
      </div>
    </div>
  );
};

export default PurposeSelection;
