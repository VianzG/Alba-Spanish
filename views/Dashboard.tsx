
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProgress } from '../types';
import { LEVEL_CONFIG, UI_STRINGS, CURRICULUM, DAILY_TOKEN_CAP, Icons, APP_NAME } from '../constants';

const Dashboard: React.FC<{ progress: UserProgress }> = ({ progress }) => {
  const t = UI_STRINGS[progress.uiLanguage];
  const navigate = useNavigate();
  const levelData = LEVEL_CONFIG[progress.currentLevel];
  const stats = progress.levelData[progress.currentLevel];
  const totalInLevel = CURRICULUM[progress.currentLevel].length;
  const completionPercent = Math.min(100, Math.round((stats.completedLessons.length / (totalInLevel * 2)) * 100));

  const getTimeRemaining = () => {
    const lastReset = new Date(progress.usage.lastReset);
    const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
    const diff = nextReset.getTime() - new Date().getTime();
    if (diff <= 0) return `0${t.hours}`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}${t.hours} ${minutes}${t.minutes}`;
  };

  const handleResume = () => {
    if (progress.isBetaEnabled && progress.lastSession) {
      navigate(progress.lastSession.view);
    }
  };

  return (
    <div className="animate-fade-up pb-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">{t.welcome}, {progress.userName || 'Estudiante'}</h2>
          <p className="text-slate-400 font-medium text-sm md:text-lg">
            {t.experiencePremium} <span className="text-indigo-600 font-extrabold">{progress.uiLanguage === 'en' ? levelData.label : levelData.labelEs}</span>.
          </p>
        </div>
        {progress.isBetaEnabled && (
           <div className="glass px-6 py-2.5 rounded-2xl flex items-center gap-3 text-rose-600 shadow-sm border-rose-100">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.betaStatus}</span>
           </div>
        )}
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12">
        {[
          { label: t.xp, val: stats.score, color: 'text-slate-900' },
          { label: t.verifications, val: stats.completedLessons.length, color: 'text-slate-900' },
          { label: t.completion, val: `${completionPercent}%`, color: 'text-indigo-600' },
          { label: t.dailyQuota, val: `${Math.round((progress.usage.tokensRemaining / DAILY_TOKEN_CAP) * 100)}%`, color: 'text-slate-900', sub: `Reset: ${getTimeRemaining()}` }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">{item.label}</p>
            <p className={`text-2xl md:text-5xl font-black tracking-tighter ${item.color}`}>{item.val}</p>
            {item.sub && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4 opacity-70">{item.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <section className={`lg:col-span-7 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl min-h-[350px] md:min-h-[450px] flex flex-col justify-center ${progress.isBetaEnabled ? 'bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A]' : 'bg-slate-900'}`}>
          <div className="relative z-10">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-8 border-white/10">
               <Icons.Logo />
            </div>
            <h3 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-tight">{t.continueJourney}</h3>
            <p className="text-slate-400 mb-10 max-w-sm text-sm md:text-lg font-medium leading-relaxed">
              {progress.uiLanguage === 'en' ? levelData.description : levelData.descriptionEs}
            </p>
            <div className="flex flex-col md:flex-row gap-4">
               <button 
                onClick={handleResume}
                disabled={!progress.isBetaEnabled || !progress.lastSession}
                className={`px-10 py-5 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-3 ${progress.isBetaEnabled && progress.lastSession ? 'bg-white text-slate-900 hover:scale-[1.03] active:scale-95 shadow-xl shadow-white/10' : 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed'}`}
               >
                 {t.resume}
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
               </button>
               
               {!progress.isBetaEnabled && (
                  <button onClick={() => navigate('/settings')} className="px-10 py-5 rounded-[1.5rem] font-black text-sm text-white/50 hover:text-white transition-colors">
                     {progress.uiLanguage === 'en' ? 'Unlock Laboratory Settings' : 'Desbloquear Ajustes de Laboratorio'}
                  </button>
               )}
            </div>
          </div>
          <div className={`absolute top-0 right-0 w-80 h-80 md:w-[600px] md:h-[600px] rounded-full blur-[100px] -mr-20 -mt-20 md:-mr-40 md:-mt-40 transition-colors duration-1000 ${progress.isBetaEnabled ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}></div>
        </section>

        <section className="lg:col-span-5 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.growthMatrix}</h4>
            <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full"></span>
          </div>
          
          <div className="space-y-6">
            {progress.isBetaEnabled ? (
              <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-rose-300"><Icons.Lab /></div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300/80">{t.betaLab}</p>
                    </div>
                    <h4 className="text-2xl font-black mb-4 tracking-tight">{t.advancedAI}</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                       {progress.uiLanguage === 'en' ? 'Your production is being analyzed by our high-rigor reasoning kernel.' : 'Tu producción está siendo analizada por nuestro núcleo de razonamiento de alto rigor.'}
                    </p>
                 </div>
                 <div className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-125 transition-transform duration-1000">
                    <Icons.Logo />
                 </div>
              </div>
            ) : (
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                 <h4 className="text-lg font-black text-slate-900 mb-2">{progress.uiLanguage === 'en' ? 'Standard Protocol' : 'Protocolo Estándar'}</h4>
                 <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                   {progress.uiLanguage === 'en' ? 'Communicative competence focused reasoning. Structural rigor is balanced for initial acquisition.' : 'Razonamiento enfocado en la competencia comunicativa. El rigor estructural está balanceado para la adquisición inicial.'}
                 </p>
                 <div className="flex gap-2">
                    <div className="h-1 flex-grow bg-slate-100 rounded-full"></div>
                    <div className="h-1 flex-grow bg-slate-100 rounded-full"></div>
                    <div className="h-1 flex-grow bg-slate-100 rounded-full"></div>
                 </div>
              </div>
            )}

            {progress.flaggedTopics && progress.flaggedTopics.length > 0 ? (
              <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100/50">
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-rose-400 rounded-full"></span> {t.reviewRecommended}
                 </p>
                 <p className="text-slate-800 text-sm font-bold leading-relaxed italic">
                    {progress.uiLanguage === 'en' ? 'Focus on' : 'Foco en'}: {progress.flaggedTopics.slice(-1)[0]}
                 </p>
              </div>
            ) : (
              <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100/50">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full"></span> {t.performanceOptimized}
                 </p>
                 <p className="text-slate-800 text-sm font-bold leading-relaxed">
                    {progress.uiLanguage === 'en' ? 'Consistent accuracy levels detected.' : 'Niveles de precisión consistentes detectados.'}
                 </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
