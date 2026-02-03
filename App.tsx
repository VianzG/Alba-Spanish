
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Difficulty, UserProgress, UILanguage, LevelProgress } from './types';
import { Icons, LEVEL_CONFIG, UI_STRINGS, DAILY_TOKEN_CAP, APP_NAME, CREDITS } from './constants';
import Dashboard from './views/Dashboard';
import TheoryView from './views/TheoryView';
import PracticeView from './views/PracticeView';
import ConversationView from './views/ConversationView';
import SettingsView from './views/SettingsView';

const initialLevelData = (): LevelProgress => ({
  completedLessons: [],
  score: 0,
  conversations: 0,
  lastActive: new Date().toISOString()
});

const SessionTracker: React.FC<{ setProgress: React.Dispatch<React.SetStateAction<UserProgress>> }> = ({ setProgress }) => {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/settings') {
      setProgress(prev => ({
        ...prev,
        lastSession: {
          view: location.pathname,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }, [location.pathname, setProgress]);
  return null;
};

const IntroScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFading(true), 2500);
    const removeTimer = setTimeout(() => onComplete(), 3200);
    return () => { clearTimeout(timer); clearTimeout(removeTimer); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full scale-150 animate-pulse"></div>
        <h1 className="text-4xl md:text-7xl font-black text-white tracking-[0.2em] md:tracking-[0.4em] animate-[tracking_3s_ease-out_forwards] relative z-10">
          ALBA
        </h1>
        <div className="h-px w-24 md:w-48 bg-gradient-to-r from-transparent via-white/50 to-transparent mt-4 md:mt-8 animate-[width_2s_ease-out_forwards]"></div>
        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.8em] mt-4 md:mt-8 opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
          Spanish Acquisition
        </p>
      </div>
      <style>{`
        @keyframes tracking {
          from { letter-spacing: -0.1em; opacity: 0; filter: blur(10px); }
          to { letter-spacing: 0.4em; opacity: 1; filter: blur(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes width {
          from { width: 0; opacity: 0; }
          to { width: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('alba_intro_shown'));
  const [isProcessingAi, setIsProcessingAi] = useState(false);

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('alba_spanish_v18');
    const defaultUsage = { tokensRemaining: DAILY_TOKEN_CAP, lastReset: new Date().toISOString(), isQuotaExceeded: false };
    
    if (saved) {
      const parsed = JSON.parse(saved);
      const lastReset = new Date(parsed.usage?.lastReset || defaultUsage.lastReset);
      if (new Date().getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000) {
        parsed.usage = defaultUsage;
      }
      if (!parsed.theoryCache) parsed.theoryCache = {};
      return parsed;
    }

    return {
      currentLevel: Difficulty.EASY,
      uiLanguage: 'en',
      userName: '',
      isBetaEnabled: false,
      betaStrictness: 50,
      betaSettings: { tolerance: 50, feedbackDepth: 50, rigor: 50, correctionType: 'semantic' },
      levelData: {
        [Difficulty.EASY]: initialLevelData(),
        [Difficulty.INTERMEDIATE]: initialLevelData(),
        [Difficulty.COMPLEX]: initialLevelData()
      },
      theoryCache: {},
      flaggedTopics: [],
      usage: defaultUsage,
      betaHistory: [],
      betaMetrics: { grammarPrecision: [], vocabularyBreadth: [], coherenceScore: [] }
    };
  });

  useEffect(() => {
    localStorage.setItem('alba_spanish_v18', JSON.stringify(progress));
  }, [progress]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('alba_intro_shown', 'true');
  };

  const t = UI_STRINGS[progress.uiLanguage];
  const isAiLocked = progress.usage.isQuotaExceeded || progress.usage.tokensRemaining <= 0;

  const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 px-3 md:px-5 py-2.5 md:py-3.5 rounded-2xl transition-all relative ${isActive ? 'text-indigo-600 md:bg-indigo-50/80 md:shadow-sm' : 'text-slate-400 md:text-slate-500 hover:text-slate-900 md:hover:bg-slate-50'}`}>
        {isActive && <div className="hidden md:block absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-full" />}
        <span className={`${isActive ? 'scale-110 md:scale-100' : ''}`}>{icon}</span>
        <span className="text-[9px] md:text-sm font-bold tracking-tight">{label}</span>
      </Link>
    );
  };

  return (
    <HashRouter>
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
      <SessionTracker setProgress={setProgress} />
      <div className={`flex flex-col md:flex-row min-h-[100dvh] bg-[#F8FAFC] transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200 p-8 flex-col fixed h-full z-20">
          <div className="mb-12">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
              <Icons.Logo />
              {APP_NAME}
            </h1>
          </div>

          <nav className="space-y-2 flex-grow">
            <NavLink to="/" icon={<Icons.Chart />} label={t.dashboard} />
            <NavLink to="/theory" icon={<Icons.Book />} label={t.theory} />
            <NavLink to="/practice" icon={<Icons.Activity />} label={t.practice} />
            <NavLink to="/conversation" icon={<Icons.Chat />} label={t.roleplay} />
          </nav>
          
          <div className="mt-auto pt-8 border-t border-slate-100 space-y-6">
            <div className={`p-5 rounded-[1.5rem] border transition-all relative overflow-hidden ${isAiLocked ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
              {isProcessingAi && (
                <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none" />
              )}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isAiLocked ? 'text-rose-500' : 'text-slate-400'}`}>
                  {isProcessingAi && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />}
                  {isAiLocked ? t.quotaReached : t.dailyQuota}
                </span>
                <span className={`text-xs font-black ${isAiLocked ? 'text-rose-600' : 'text-indigo-600'}`}>
                  {isAiLocked ? '0%' : `${Math.round((progress.usage.tokensRemaining / DAILY_TOKEN_CAP) * 100)}%`}
                </span>
              </div>
              <div className="h-1.5 bg-slate-200/50 rounded-full overflow-hidden relative z-10">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${isAiLocked ? 'bg-rose-500 w-0' : (progress.usage.tokensRemaining < DAILY_TOKEN_CAP * 0.2 ? 'bg-rose-400' : 'bg-indigo-600')}`} 
                  style={{ width: isAiLocked ? '0%' : `${(progress.usage.tokensRemaining / DAILY_TOKEN_CAP) * 100}%` }} 
                />
              </div>
            </div>
            
            <NavLink to="/settings" icon={<Icons.Settings />} label={t.settings} />
            
            <div className="px-5 opacity-40 group cursor-default border-t border-slate-50 pt-6">
               <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em]">{t.createdBy}</p>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-1">{CREDITS}</p>
               <p className="text-[8px] font-medium text-slate-400 mt-2 uppercase">{t.inTechnicalPreview} v18</p>
            </div>
          </div>
        </aside>

        {/* Navigation Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.8rem)] flex justify-around items-center z-50 shadow-2xl shadow-indigo-900/10">
          <NavLink to="/" icon={<Icons.Chart />} label={t.dashboard} />
          <NavLink to="/theory" icon={<Icons.Book />} label={t.theory} />
          <NavLink to="/practice" icon={<Icons.Activity />} label={t.practice} />
          <NavLink to="/conversation" icon={<Icons.Chat />} label={t.roleplay} />
          <NavLink to="/settings" icon={<Icons.Settings />} label={t.settings} />
        </nav>

        <main className="flex-grow md:ml-72 p-4 md:p-12 pb-32 md:pb-12 min-h-[100dvh] flex flex-col">
          <div className="max-w-6xl mx-auto w-full flex-grow">
            <Routes>
              <Route path="/" element={<Dashboard progress={progress} />} />
              <Route path="/theory" element={<TheoryView progress={progress} setProgress={setProgress} setAiState={setIsProcessingAi} />} />
              <Route path="/practice" element={<PracticeView progress={progress} setProgress={setProgress} setAiState={setIsProcessingAi} />} />
              <Route path="/conversation" element={<ConversationView progress={progress} setProgress={setProgress} setAiState={setIsProcessingAi} />} />
              <Route path="/settings" element={<SettingsView progress={progress} setProgress={setProgress} updateLevel={(l) => setProgress(p => ({...p, currentLevel: l}))} updateUILanguage={(l) => setProgress(p => ({...p, uiLanguage: l}))} />} />
            </Routes>
          </div>
          <footer className="md:hidden mt-12 pt-12 pb-8 text-center opacity-40 border-t border-slate-200/50">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{t.createdBy}</p>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-1">{CREDITS}</p>
             <p className="text-[8px] font-medium text-slate-400 mt-2 uppercase">{t.inTechnicalPreview} PREVIEW</p>
          </footer>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
