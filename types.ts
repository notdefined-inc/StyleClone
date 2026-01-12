export interface WritingSample {
  id: string;
  prompt: string;
  text: string;
}

export interface StyleProfile {
  name: string;
  summary: string;
  systemInstruction: string;
  traits: string[];
}

export interface AnalysisConfig {
  purpose: string;
  prompts: string[];
  autoProofread: boolean;
}

export enum AppStep {
  SETUP = 'SETUP',
  WRITING = 'WRITING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  PLAYGROUND = 'PLAYGROUND'
}

export interface ComparisonResult {
  author: string;
  similarity: string;
  details: string;
}
