import React, { useState } from 'react';
import { StyleProfile } from '../types';
import { rewriteTextInStyle } from '../services/geminiService';
import { ArrowRight, RefreshCw, Send, Sparkles } from 'lucide-react';

interface Props {
  profile: StyleProfile;
  onBack: () => void;
}

const SAMPLE_INPUTS = [
  "I am sorry I cannot come to work today because I am sick.",
  "The weather is nice. We should go to the park.",
  "I disagree with your proposal. It is too expensive."
];

const Playground: React.FC<Props> = ({ profile, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRewrite = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    try {
      const result = await rewriteTextInStyle(inputText, profile.systemInstruction);
      setOutputText(result);
    } catch (e) {
      console.error(e);
      setOutputText("Error generating response. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSampleClick = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="max-w-5xl mx-auto w-full h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <button 
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors"
        >
            &larr; Back to Profile
        </button>
        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            <Sparkles size={16} />
            <span className="text-sm font-semibold">Using: {profile.name}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        {/* Input Column */}
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Original Text</span>
                <span className="text-xs text-slate-400">What you want to say</span>
            </div>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste a boring email, a dry paragraph, or anything you want rewritten in your voice..."
                className="flex-1 w-full p-6 resize-none focus:outline-none text-lg text-slate-700 leading-relaxed"
            />
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {SAMPLE_INPUTS.map((sample, i) => (
                        <button
                            key={i}
                            onClick={() => handleSampleClick(sample)}
                            className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                        >
                            Sample {i+1}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleRewrite}
                    disabled={!inputText.trim() || isGenerating}
                    className={`w-full py-3 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all ${
                        !inputText.trim() || isGenerating
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200'
                    }`}
                >
                    {isGenerating ? (
                        <>
                            <RefreshCw className="animate-spin" size={20} />
                            Rewriting...
                        </>
                    ) : (
                        <>
                            Rewrite in My Style <Send size={18} />
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col h-full bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-slate-800">
             <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <span className="font-semibold text-indigo-300">AI Rewrite</span>
                <span className="text-xs text-slate-400">In your voice</span>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
                {outputText ? (
                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="leading-relaxed whitespace-pre-wrap">{outputText}</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                        <Sparkles size={48} className="mb-4" />
                        <p className="text-center">Your personalized result will appear here.</p>
                    </div>
                )}
            </div>
             {outputText && (
                <div className="p-4 bg-slate-800 border-t border-slate-700 text-right">
                    <button 
                        onClick={() => {navigator.clipboard.writeText(outputText)}}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                        Copy to clipboard
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Playground;
