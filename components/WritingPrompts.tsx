import React, { useState } from 'react';
import { WritingSample } from '../types';
import { ArrowRight, RefreshCw, PenTool, ArrowLeft, Plus, Trash2, FileText, MessageSquare } from 'lucide-react';

interface Props {
  onComplete: (samples: WritingSample[]) => void;
  customPrompts: string[];
  onBack: () => void;
}

type Mode = 'guided' | 'freeform';

const WritingPrompts: React.FC<Props> = ({ onComplete, customPrompts, onBack }) => {
  const [mode, setMode] = useState<Mode>('guided');
  
  // Guided Mode State
  const [samples, setSamples] = useState<WritingSample[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Freeform Mode State
  const [freeformInputs, setFreeformInputs] = useState<string[]>(['', '']); 

  // Guided Logic
  const activePrompts = customPrompts.length > 0 ? customPrompts : ["Describe your day."];
  const currentPrompt = activePrompts[currentPromptIndex % activePrompts.length];

  const handleNextGuided = () => {
    if (!currentText.trim()) return;

    const newSample: WritingSample = {
      id: Date.now().toString(),
      prompt: currentPrompt,
      text: currentText
    };

    const newSamples = [...samples, newSample];
    setSamples(newSamples);
    setCurrentText('');

    if (newSamples.length >= 3) {
      onComplete(newSamples);
    } else {
      setCurrentPromptIndex((prev) => (prev + 1) % activePrompts.length);
    }
  };

  const handleSkipGuided = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % activePrompts.length);
    setCurrentText('');
  };

  // Freeform Logic
  const handleAddFreeformInput = () => {
    setFreeformInputs([...freeformInputs, '']);
  };

  const handleRemoveFreeformInput = (index: number) => {
    const newInputs = freeformInputs.filter((_, i) => i !== index);
    setFreeformInputs(newInputs.length ? newInputs : ['']);
  };

  const handleFreeformChange = (index: number, value: string) => {
    const newInputs = [...freeformInputs];
    newInputs[index] = value;
    setFreeformInputs(newInputs);
  };

  const handleFreeformSubmit = () => {
    const validInputs = freeformInputs.filter(t => t.trim().length > 0);
    if (validInputs.length === 0) return;

    const formattedSamples: WritingSample[] = validInputs.map((text, i) => ({
      id: `freeform-${i}-${Date.now()}`,
      prompt: "User provided raw text sample (Context unknown)",
      text: text
    }));

    onComplete(formattedSamples);
  };

  const guidedProgress = (samples.length / 3) * 100;

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-in">
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Selection
        </button>

        <div className="flex bg-slate-200 p-1 rounded-lg">
            <button
                onClick={() => setMode('guided')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'guided' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
            >
                <MessageSquare size={16} />
                Guided Prompts
            </button>
            <button
                onClick={() => setMode('freeform')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'freeform' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-800'
                }`}
            >
                <FileText size={16} />
                Paste Raw Text
            </button>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {mode === 'guided' ? "Let's get to know your voice" : "Paste your best work"}
        </h2>
        <p className="text-slate-600">
            {mode === 'guided' 
                ? "Answer at least 3 prompts so our AI can analyze your unique writing DNA."
                : "Add a few paragraphs of your previous writing. More data = better results."}
        </p>
      </div>

      {mode === 'guided' ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 w-full">
            <div 
                className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                style={{ width: `${guidedProgress}%` }}
            />
            </div>

            <div className="p-8">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                <PenTool size={24} />
                </div>
                <div className="flex-1">
                <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">Prompt {samples.length + 1} / 3</span>
                <h3 className="text-xl font-medium text-slate-800 mt-1 leading-snug">
                    {currentPrompt}
                </h3>
                </div>
                <button 
                onClick={handleSkipGuided}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                title="Skip this prompt"
                >
                <RefreshCw size={18} />
                </button>
            </div>

            <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Type your answer here... don't overthink it, just write naturally."
                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-700 leading-relaxed text-lg"
                autoFocus
            />

            <div className="mt-6 flex justify-between items-center">
                <span className="text-sm text-slate-500">
                {currentText.length > 0 ? `${currentText.split(' ').length} words` : 'Waiting for input...'}
                </span>
                <button
                onClick={handleNextGuided}
                disabled={!currentText.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 ${
                    !currentText.trim() 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                }`}
                >
                {samples.length === 2 ? 'Finish & Analyze' : 'Next Prompt'}
                <ArrowRight size={20} />
                </button>
            </div>
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            {freeformInputs.map((text, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md border border-slate-200 p-6 relative group animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                         <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Sample {index + 1}</span>
                         {freeformInputs.length > 1 && (
                            <button 
                                onClick={() => handleRemoveFreeformInput(index)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                title="Remove this sample"
                            >
                                <Trash2 size={18} />
                            </button>
                         )}
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => handleFreeformChange(index, e.target.value)}
                        placeholder="Paste a paragraph, email, or story snippet here..."
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-700 leading-relaxed"
                    />
                </div>
            ))}

            <div className="flex justify-between items-center pt-4">
                <button
                    onClick={handleAddFreeformInput}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
                >
                    <Plus size={20} />
                    Add another sample
                </button>

                <button
                    onClick={handleFreeformSubmit}
                    disabled={freeformInputs.filter(t => t.trim().length > 0).length === 0}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                        freeformInputs.filter(t => t.trim().length > 0).length === 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-200'
                    }`}
                >
                    Analyze Writing Style
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
      )}

      {/* Preview of Guided Samples (Only shown in Guided Mode) */}
      {mode === 'guided' && samples.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {samples.map((s, i) => (
            <div key={s.id} className="bg-white/50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
                <div className="font-semibold text-slate-800 mb-1">Sample {i + 1}</div>
                <div className="line-clamp-2">{s.text}</div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default WritingPrompts;
