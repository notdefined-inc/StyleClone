import React, { useState } from 'react';
import { AppStep, WritingSample, StyleProfile, AnalysisConfig } from './types';
import PurposeSelection from './components/PurposeSelection';
import WritingPrompts from './components/WritingPrompts';
import StyleResult from './components/StyleResult';
import Playground from './components/Playground';
import { analyzeWritingStyle } from './services/geminiService';
import { BrainCircuit, Feather, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [config, setConfig] = useState<AnalysisConfig | null>(null);
  const [samples, setSamples] = useState<WritingSample[]>([]);
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetupComplete = (newConfig: AnalysisConfig) => {
    setConfig(newConfig);
    setStep(AppStep.WRITING);
  };

  const handleSamplesComplete = async (collectedSamples: WritingSample[]) => {
    setSamples(collectedSamples);
    setStep(AppStep.ANALYZING);
    setError(null);

    try {
      // Pass proofread flag from config
      const autoProofread = config?.autoProofread ?? false;
      const generatedProfile = await analyzeWritingStyle(collectedSamples, autoProofread);
      setProfile(generatedProfile);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error(err);
      setError("We encountered an issue analyzing your style. Please try again.");
      setStep(AppStep.WRITING);
    }
  };

  const resetApp = () => {
    setSamples([]);
    setProfile(null);
    setConfig(null);
    setStep(AppStep.SETUP);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={resetApp}
          >
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Feather size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              StyleClone AI
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.0 Flash & 3.0 Pro
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        
        {step === AppStep.SETUP && (
            <PurposeSelection onConfirm={handleSetupComplete} />
        )}

        {step === AppStep.WRITING && (
          <div className="flex-1 flex items-center justify-center animate-fade-in">
            <div className="w-full">
               {error && (
                 <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-center">
                   {error}
                 </div>
               )}
              <WritingPrompts 
                onComplete={handleSamplesComplete} 
                customPrompts={config?.prompts || []}
                onBack={() => setStep(AppStep.SETUP)}
              />
            </div>
          </div>
        )}

        {step === AppStep.ANALYZING && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <BrainCircuit size={64} className="text-indigo-600 relative z-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold mt-8 mb-2">Analyzing your neural linguistic patterns...</h2>
            <p className="text-slate-500 max-w-md">
              Gemini 3.0 Pro is entering "Thinking Mode" to deconstruct your vocabulary, sentence rhythm, and tonal nuances. This takes about 10-15 seconds.
            </p>
            <div className="mt-8 flex gap-2">
                <Loader2 className="animate-spin text-indigo-400" />
                <span className="text-indigo-600 font-medium">Processing {samples.length} samples</span>
            </div>
          </div>
        )}

        {step === AppStep.RESULT && profile && (
          <StyleResult 
            profile={profile} 
            onUpdateProfile={setProfile}
            onTryItOut={() => setStep(AppStep.PLAYGROUND)}
            onReset={resetApp}
          />
        )}

        {step === AppStep.PLAYGROUND && profile && (
          <Playground 
            profile={profile} 
            onBack={() => setStep(AppStep.RESULT)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;