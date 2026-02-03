
import React, { useState, useEffect, useCallback } from 'react';
import { Difficulty, EvaluationResult, UserProgress, PracticeTask, BatchedEvaluationResult } from '../types';
import { evaluateBatch, generatePracticeTask, isQuotaError } from '../services/geminiService';
import AnnotatedSpanish from '../components/AnnotatedSpanish';
import TTSButton from '../components/TTSButton';
import { UI_STRINGS, PRACTICE_SEED_BANK, Icons } from '../constants';

const SESSION_SIZE = 5;

const PracticeView: React.FC<{ 
  progress: UserProgress, 
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>,
  setAiState: (s: boolean) => void
}> = ({ progress, setProgress, setAiState }) => {
  const t = UI_STRINGS[progress.uiLanguage];
  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>(new Array(SESSION_SIZE).fill(''));
  const [evaluation, setEvaluation] = useState<BatchedEvaluationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAiLocked = progress.usage.isQuotaExceeded || progress.usage.tokensRemaining <= 0;

  const loadNewSession = useCallback(async () => {
    if (isAiLocked) {
      setError(t.quotaReached);
      return;
    }

    setIsGenerating(true);
    setAiState(true);
    setEvaluation(null);
    setUserInputs(new Array(SESSION_SIZE).fill(''));
    setError(null);
    
    try {
      const levelSeeds = PRACTICE_SEED_BANK[progress.currentLevel] || [];
      const filteredSeeds = levelSeeds.filter(s => !s.isBetaOnly || progress.isBetaEnabled);
      const shuffledSeeds = [...filteredSeeds].sort(() => 0.5 - Math.random()).slice(0, SESSION_SIZE);
      const sessionTasks = [...shuffledSeeds];
      
      let tokensUsed = 0;
      while (sessionTasks.length < SESSION_SIZE) {
        if (isAiLocked) break;
        const response = await generatePracticeTask(progress.currentLevel, progress.uiLanguage, progress.isBetaEnabled);
        sessionTasks.push(response.data);
        tokensUsed += response.usage?.totalTokenCount || 400;
      }
      
      setTasks(sessionTasks.slice(0, SESSION_SIZE));
      if (tokensUsed > 0) {
        setProgress(prev => ({
          ...prev,
          usage: { 
            ...prev.usage, 
            tokensRemaining: Math.max(0, prev.usage.tokensRemaining - tokensUsed),
            isQuotaExceeded: false 
          }
        }));
      }
    } catch (err: any) {
      if (isQuotaError(err)) {
        setProgress(prev => ({ ...prev, usage: { ...prev.usage, isQuotaExceeded: true, tokensRemaining: 0 } }));
      }
    } finally {
      setIsGenerating(false);
      setAiState(false);
    }
  }, [progress.currentLevel, progress.uiLanguage, isAiLocked, progress.isBetaEnabled, setProgress, t.quotaReached, setAiState]);

  useEffect(() => {
    loadNewSession();
  }, [progress.currentLevel, loadNewSession]);

  const handleEvaluateBatch = async () => {
    if (isAiLocked) return;
    if (userInputs.some(input => !input.trim())) {
      setError('Complete all tasks.');
      return;
    }
    
    setIsEvaluating(true);
    setAiState(true);
    setError(null);
    try {
      const items = tasks.map((task, i) => ({ task, userInput: userInputs[i] }));
      const response = await evaluateBatch(items, progress);
      setEvaluation(response.data);
      
      const tokensConsumed = response.usage?.totalTokenCount || 3000;
      const totalScore = response.data.evaluations.reduce((acc, curr) => acc + curr.score, 0);
      
      setProgress(prev => {
        const currentData = prev.levelData[prev.currentLevel];
        return {
          ...prev,
          levelData: {
            ...prev.levelData,
            [prev.currentLevel]: {
              ...currentData,
              score: currentData.score + totalScore,
              completedLessons: [...new Set([...currentData.completedLessons, `Session_${Date.now()}`])]
            }
          },
          usage: {
            ...prev.usage,
            tokensRemaining: Math.max(0, prev.usage.tokensRemaining - tokensConsumed),
            isQuotaExceeded: false
          }
        };
      });
    } catch (err: any) {
      if (isQuotaError(err)) {
        setProgress(prev => ({ ...prev, usage: { ...prev.usage, isQuotaExceeded: true, tokensRemaining: 0 } }));
      }
    } finally {
      setIsEvaluating(false);
      setAiState(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-16">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{t.practiceSession}</h2>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
             {progress.uiLanguage === 'en' ? 'LOCAL NAVIGATION IS FREE — AI GENERATION COSTS TOKENS' : 'NAVEGACIÓN LOCAL GRATUITA — GENERACIÓN IA CONSUME TOKENS'}
           </p>
        </div>
        <button 
          onClick={loadNewSession} 
          disabled={isGenerating || isEvaluating || isAiLocked} 
          className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2"
        >
          <Icons.Energy />
          {t.refreshSession}
        </button>
      </header>

      {isGenerating ? (
        <div className="bg-white rounded-[3rem] p-32 flex flex-col items-center justify-center border shadow-2xl">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8"></div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">{t.analyzing}</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="space-y-6">
            {tasks.map((task, index) => (
              <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">{index + 1}</span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{task.type}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{task.instruction}</h3>
                  <textarea 
                    value={userInputs[index]} 
                    onChange={(e) => { const n = [...userInputs]; n[index] = e.target.value; setUserInputs(n); }} 
                    disabled={isEvaluating || !!evaluation || isAiLocked} 
                    className="w-full h-32 p-8 rounded-3xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 transition-all text-lg font-serif italic mb-4 disabled:opacity-50" 
                  />
                  {evaluation?.evaluations[index] && (
                    <div className="p-6 bg-slate-50 rounded-2xl flex items-start gap-4 animate-fade-in">
                       <span className="font-black text-2xl text-indigo-600">{evaluation.evaluations[index].score}</span>
                       <div className="flex-grow">
                          <AnnotatedSpanish text={evaluation.evaluations[index].suggestedCorrection || ''} keywords={evaluation.evaluations[index].keywords} className="block mb-2 font-bold spanish-text" />
                          <p className="text-xs text-slate-500">{evaluation.evaluations[index].feedback}</p>
                       </div>
                       {!isAiLocked && <TTSButton text={evaluation.evaluations[index].suggestedCorrection || ''} size="sm" />}
                    </div>
                  )}
              </div>
            ))}
          </div>

          {!evaluation ? (
            <button 
              onClick={handleEvaluateBatch} 
              disabled={isEvaluating || userInputs.some(i => !i.trim()) || isAiLocked} 
              className={`w-full text-white py-8 rounded-[2rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 ${isAiLocked ? 'bg-slate-300 cursor-not-allowed opacity-50' : 'bg-slate-900 hover:bg-slate-800'}`}
            >
              <Icons.Energy />
              {isEvaluating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isAiLocked ? 'Tokens Exhausted' : t.gradeSession)}
            </button>
          ) : (
            <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl animate-fade-in">
               <p className="text-2xl font-black mb-10">"{evaluation.overallSummary}"</p>
               <button onClick={loadNewSession} className="w-full bg-white text-indigo-600 py-6 rounded-[1.5rem] font-black flex items-center justify-center gap-2">
                 <Icons.Energy />
                 {t.nextTask}
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeView;
