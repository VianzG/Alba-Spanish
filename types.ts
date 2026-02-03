
export enum Difficulty {
  EASY = 'easy',
  INTERMEDIATE = 'intermediate',
  COMPLEX = 'complex'
}

export type UILanguage = 'en' | 'es';
export type EvaluationStatus = 'CORRECT' | 'IMPROVABLE' | 'INCORRECT';

export type ExerciseType = 
  | 'DIRECT_INSTRUCTION' 
  | 'CONTEXTUAL_COMPLETION' 
  | 'GUIDED_TRANSLATION' 
  | 'SENTENCE_CONSTRUCTION' 
  | 'REFORMULATION' 
  | 'ERROR_CORRECTION' 
  | 'JUSTIFICATION' 
  | 'FREE_PRODUCTION' 
  | 'ADAPTIVE_DIAGNOSTIC' 
  | 'COMPARATIVE_REFORMULATION';

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export interface AiResponse<T> {
  data: T;
  usage?: UsageMetadata;
}

export interface LevelProgress {
  completedLessons: string[];
  score: number;
  conversations: number;
  lastActive: string;
}

export interface TokenUsage {
  tokensRemaining: number;
  lastReset: string;
  isQuotaExceeded: boolean;
}

export interface BetaMetrics {
  grammarPrecision: number[];
  vocabularyBreadth: number[];
  coherenceScore: number[];
}

export interface BetaSettings {
  tolerance: number;
  feedbackDepth: number;
  rigor: number;
  correctionType: 'semantic' | 'structural';
}

export interface LastSession {
  view: string;
  id?: string;
  timestamp: string;
}

export interface UserProgress {
  currentLevel: Difficulty;
  uiLanguage: UILanguage;
  userName: string;
  isBetaEnabled: boolean;
  betaStrictness: number; 
  betaSettings: BetaSettings;
  lastSession?: LastSession;
  levelData: Record<Difficulty, LevelProgress>;
  theoryCache: Record<string, string>; // ID de lección -> Contenido generado
  flaggedTopics: string[];
  usage: TokenUsage;
  betaHistory: EvaluationResult[];
  betaMetrics: BetaMetrics;
}

export interface PracticeTask {
  id: string;
  type: ExerciseType;
  instruction: string;
  context: string;
  targetGrammar?: string;
  targetVocabulary?: string[];
  sampleResponse?: string;
  isBetaOnly?: boolean;
}

export interface KeywordMetadata {
  word: string;
  explanation: string;
}

export interface CurricularUnit {
  id: string;
  title: string;
  topic: string;
  description: string;
  objective: string;
  grammarFocus: string[];
  vocabularyFocus: string[];
  betaInsights?: {
    linguisticDeepDive: string;
    culturalNote: string;
  };
}

export interface EvaluationResult {
  timestamp: string;
  status: EvaluationStatus;
  score: number;
  feedback: string;
  intentValidation: string;
  suggestedCorrection?: string;
  modelComparison?: string;
  retryHint?: string;
  pedagogicalReport: {
    grammarAccuracy: string;
    vocabularyUsage: string;
    coherence: string;
  };
  keywords: KeywordMetadata[];
}

export interface BatchedEvaluationResult {
  evaluations: EvaluationResult[];
  overallSummary: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  annotations?: KeywordMetadata[];
}
