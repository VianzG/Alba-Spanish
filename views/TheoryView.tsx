
import React, { useState } from 'react';
import { UserProgress, CurricularUnit } from '../types';
import { Icons, CURRICULUM, UI_STRINGS } from '../constants';
import { generateTheory, isQuotaError } from '../services/geminiService';
import AnnotatedSpanish from '../components/AnnotatedSpanish';
import TTSButton from '../components/TTSButton';

const TheoryView: React.FC<{ 
  progress: UserProgress, 
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>,
  setAiState: (s: boolean) => void
}> = ({ progress, setProgress, setAiState }) => {
  const t = UI_STRINGS[progress.uiLanguage];
  const levelCurriculum = CURRICULUM[progress.currentLevel];
  const [selectedUnit, setSelectedUnit] = useState<CurricularUnit | null>(null);
  const [loading, setLoading] = useState(false);

  const isAiLocked = progress.usage.isQuotaExceeded || progress.usage.tokensRemaining <= 0;

  const fetchUnitContent = async (unit: CurricularUnit) => {
    // POLICY: Check cache first. Cache hits are FREE.
    if (progress.theoryCache[unit.id]) {
      setSelectedUnit(unit);
      if (window.innerWidth < 1024) window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    if (isAiLocked) {
      setSelectedUnit(unit);
      return;
    }

    setLoading(true);
    setAiState(true);
    setSelectedUnit(unit);
    if (window.innerWidth < 1024) window.scrollTo({ top: 400, behavior: 'smooth' });

    try {
      const response = await generateTheory(progress.currentLevel, unit, progress.uiLanguage);
      const content = response.data || 'Error.';
      const tokensConsumed = response.usage?.totalTokenCount || 500;
      
      setProgress(prev => {
        const currentData = prev.levelData[prev.currentLevel];
        const isNew = !currentData.completedLessons.includes(unit.id);
        
        return {
          ...prev,
          theoryCache: { ...prev.theoryCache, [unit.id]: content },
          levelData: {
            ...prev.levelData,
            [prev.currentLevel]: {
              ...currentData,
              completedLessons: isNew ? [...currentData.completedLessons, unit.id] : currentData.completedLessons,
              score: isNew ? currentData.score + 10 : currentData.score
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
      setLoading(false);
      setAiState(false);
    }
  };

  const isCompleted = (id: string) => progress.levelData[progress.currentLevel].completedLessons.includes(id);
  const currentContent = selectedUnit ? progress.theoryCache[selectedUnit.id] : null;

  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{t.theory} & Foundations</h2>
          <p className="text-indigo-600 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">{t.trackLevel}</p>
        </div>
        <div className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{progress.uiLanguage === 'en' ? 'Acquisitions' : 'Adquisiciones'}</span>
          <span className="text-indigo-600 font-black text-sm md:text-base">{Object.keys(progress.theoryCache).length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <aside className="lg:col-span-4 space-y-2 md:space-y-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">{t.curriculumUnits}</p>
          {levelCurriculum.map(unit => {
            const isCached = !!progress.theoryCache[unit.id];
            return (
              <button 
                key={unit.id} 
                onClick={() => fetchUnitContent(unit)} 
                disabled={loading} 
                className={`w-full text-left p-4 md:p-5 rounded-2xl md:rounded-3xl transition-all border-2 relative flex items-center justify-between gap-3 ${selectedUnit?.id === unit.id ? 'border-indigo-600 bg-white shadow-lg ring-2 ring-indigo-50' : 'border-white bg-white hover:border-slate-200 shadow-sm'} ${loading ? 'cursor-wait opacity-80' : ''}`}
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm md:text-base font-bold leading-tight ${selectedUnit?.id === unit.id ? 'text-indigo-600' : 'text-slate-800'}`}>{unit.title}</h4>
                    {!isCached && <Icons.Energy />}
                  </div>
                  <p className="text-[8px] md:text-[9px] text-slate-400 uppercase font-black mt-1 tracking-wider">
                    {isCached ? (progress.uiLanguage === 'en' ? 'LOCAL ACCESS' : 'ACCESO LOCAL') : unit.topic}
                  </p>
                </div>
                {isCompleted(unit.id) && <span className="text-emerald-500 shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>}
              </button>
            );
          })}
        </aside>

        <section className="lg:col-span-8">
          {!selectedUnit ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem] h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
              <div className="text-slate-300 scale-150 mb-4 opacity-50"><Icons.Book /></div>
              <h3 className="text-base md:text-lg font-bold text-slate-800 mt-4">{t.selectUnit}</h3>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-slate-100 shadow-xl min-h-[500px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] md:h-[500px]">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.analyzing}</p>
                </div>
              ) : (!currentContent && isAiLocked) ? (
                <div className="flex flex-col items-center justify-center h-[400px] md:h-[500px] text-center p-6 animate-fade-in">
                   <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner"><Icons.Energy /></div>
                   <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-2">{t.quotaReached}</h3>
                   <p className="text-slate-500 text-xs md:text-sm max-w-sm font-medium leading-relaxed">{t.quotaWait}</p>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-slate-50 p-5 md:p-8 rounded-2xl md:rounded-[2rem] flex-grow border-l-4 border-indigo-500">
                      <span className="text-[8px] md:text-[9px] font-black uppercase text-indigo-400 tracking-[0.2em] block mb-2">{t.pedagogicalObjective}</span>
                      <p className="text-sm md:text-lg font-bold text-slate-800 leading-snug">{selectedUnit.objective}</p>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap text-slate-700 text-sm md:text-base leading-relaxed font-medium">
                    {currentContent}
                  </div>
                  
                  {progress.isBetaEnabled && selectedUnit.betaInsights && (
                    <div className="mt-8 md:mt-12 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="p-6 md:p-8 bg-rose-950 text-white rounded-2xl md:rounded-[2.5rem] shadow-lg border-l-8 border-rose-500">
                        <div className="flex items-center gap-2 mb-3">
                           <Icons.Lab />
                           <h4 className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] text-rose-300">{progress.uiLanguage === 'en' ? 'Linguistic Insight' : 'Inmersión Lingüística'}</h4>
                        </div>
                        <p className="text-xs md:text-sm italic leading-relaxed opacity-90">{selectedUnit.betaInsights.linguisticDeepDive}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TheoryView;
