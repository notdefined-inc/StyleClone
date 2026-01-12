import React, { useState, useEffect } from 'react';
import { StyleProfile, ComparisonResult } from '../types';
import { Copy, Check, Sparkles, User, Fingerprint, Sliders, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { compareToFamousAuthors, refineSystemInstruction } from '../services/geminiService';

interface Props {
  profile: StyleProfile;
  onUpdateProfile: (profile: StyleProfile) => void;
  onTryItOut: () => void;
  onReset: () => void;
}

const StyleResult: React.FC<Props> = ({ profile, onUpdateProfile, onTryItOut, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(true);
  
  // Refinement State
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.systemInstruction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefine = async (preset?: string) => {
    const query = preset || refinementInput;
    if (!query.trim()) return;

    setIsRefining(true);
    try {
      const newInstruction = await refineSystemInstruction(profile.systemInstruction, query);
      onUpdateProfile({
        ...profile,
        systemInstruction: newInstruction,
        name: `${profile.name} (Refined)` // Optional: indicate it's modified
      });
      setRefinementInput('');
    } catch (e) {
      console.error("Failed to refine", e);
    } finally {
      setIsRefining(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchComparison = async () => {
      try {
        const result = await compareToFamousAuthors(profile.summary);
        if (mounted) setComparison(result);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoadingComparison(false);
      }
    };
    fetchComparison();
    return () => { mounted = false; };
  }, [profile.summary]);

  return (
    <div className="max-w-5xl mx-auto w-full animate-fade-in pb-12">
        <div className="mb-6">
            <button 
                onClick={onReset}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
                <ArrowLeft size={18} />
                Analyze a different style
            </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Main Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2 opacity-90">
                <Fingerprint size={20} />
                <span className="text-sm font-medium tracking-wider uppercase">Your Style Persona</span>
              </div>
              <h2 className="text-3xl font-bold">{profile.name}</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                {profile.summary}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.traits.map((trait, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                    {trait}
                  </span>
                ))}
              </div>
              
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 relative group">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-lg shadow-sm border border-slate-200 transition-all flex items-center gap-2"
                    title="Copy System Prompt"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    <span className="text-xs font-semibold">{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System Instruction</h3>
                <div className="font-mono text-sm text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {profile.systemInstruction}
                </div>
              </div>
            </div>
          </div>

          {/* Style Tuner Section */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
                <Sliders size={20} className="text-indigo-600"/>
                <h3 className="text-lg font-bold">Style Tuner</h3>
            </div>
            <p className="text-slate-500 text-sm mb-4">
                Love the voice but want to tweak it for a specific purpose? (e.g., "Fix my grammar but keep the vibe" or "Adapt for a mystery novel").
            </p>
            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={refinementInput}
                        onChange={(e) => setRefinementInput(e.target.value)}
                        placeholder="How should we polish or adapt this style?"
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                    />
                    <button 
                        onClick={() => handleRefine()}
                        disabled={isRefining || !refinementInput.trim()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isRefining ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                        Refine
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                    <button 
                        onClick={() => handleRefine("Fix grammar and typos, keep the tone")}
                        disabled={isRefining}
                        className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full hover:bg-emerald-100 transition-colors"
                    >
                        Clean up typos
                    </button>
                     <button 
                        onClick={() => handleRefine("Make it suitable for a formal email")}
                        disabled={isRefining}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        Formal Email
                    </button>
                    <button 
                        onClick={() => handleRefine("Adapt for novel writing and storytelling")}
                        disabled={isRefining}
                        className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 rounded-full hover:bg-amber-100 transition-colors"
                    >
                        Storytelling Mode
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Actions & Insights */}
        <div className="space-y-6">
             {/* Action Card */}
             <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white text-center">
                <User size={32} className="mx-auto mb-3 text-indigo-300" />
                <h3 className="font-bold text-lg mb-2">Test Your Persona</h3>
                <p className="text-slate-300 text-sm mb-4">
                    See how your AI persona rewrites generic text using the current system instruction.
                </p>
                <button
                    onClick={onTryItOut}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                    Open Playground <ArrowRight size={18} />
                </button>
            </div>

            {/* Comparison Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-4 text-purple-600">
                    <Sparkles size={20} />
                    <h3 className="font-bold">Style Twin</h3>
                </div>
                {loadingComparison ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-20 bg-slate-100 rounded"></div>
                    </div>
                ) : comparison ? (
                    <div>
                        <p className="text-sm text-slate-500 mb-1">You write a bit like:</p>
                        <p className="text-xl font-bold text-slate-800 mb-2">{comparison.author}</p>
                        <div className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded inline-block mb-3">
                            {comparison.similarity} Similarity
                        </div>
                        <p className="text-sm text-slate-600 leading-snug">{comparison.details}</p>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400">Could not find a comparison.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StyleResult;