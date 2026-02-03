
import React, { useState } from 'react';
import { Difficulty, UserProgress, UILanguage, BetaSettings } from '../types';
import { LEVEL_CONFIG, UI_STRINGS, AUTHORIZED_NAMES, BETA_CODE, Icons, APP_NAME } from '../constants';

const SettingsView: React.FC<{ 
  progress: UserProgress, 
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>,
  updateLevel: (l: Difficulty) => void, 
  updateUILanguage: (l: UILanguage) => void 
}> = ({ progress, setProgress, updateLevel, updateUILanguage }) => {
  const t = UI_STRINGS[progress.uiLanguage];
  const [userNameInput, setUserNameInput] = useState(progress.userName);
  const [betaCodeInput, setBetaCodeInput] = useState('');
  const [betaStatus, setBetaStatus] = useState<'none' | 'success' | 'error'>('none');

  const isNameAuthorized = AUTHORIZED_NAMES.some(name => 
    name.toLowerCase() === userNameInput.trim().toLowerCase()
  );

  const handleNameChange = (val: string) => {
    setUserNameInput(val);
    setProgress(prev => ({ ...prev, userName: val }));
  };

  const handleUnlockBeta = () => {
    if (isNameAuthorized && betaCodeInput === BETA_CODE) {
      setProgress(prev => ({ ...prev, isBetaEnabled: true }));
      setBetaStatus('success');
    } else {
      setBetaStatus('error');
    }
  };

  const updateBetaSetting = (key: keyof BetaSettings, val: any) => {
    setProgress(prev => ({
      ...prev,
      betaSettings: { ...prev.betaSettings, [key]: val }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-up pb-20">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{t.settings}</h2>
        <p className="text-slate-400 font-medium">
          {progress.uiLanguage === 'en' ? 'Configure your personal language kernel and lab access.' : 'Configura tu núcleo personal de lenguaje y acceso al laboratorio.'}
        </p>
      </header>

      <div className="space-y-10">
        
        {/* Identity & Beta Section */}
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">{t.identityPermissions}</p>
          <div className="max-w-xl">
            <input 
              type="text" 
              value={userNameInput}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t.enterUserName}
              className="w-full bg-slate-50 px-10 py-6 rounded-3xl border-2 border-slate-100 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all font-black text-2xl tracking-tight"
            />
            
            {isNameAuthorized && !progress.isBetaEnabled && (
              <div className="mt-10 p-10 bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] animate-fade-up">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Icons.Lab /></div>
                   <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{progress.uiLanguage === 'en' ? 'Early Access Portal' : 'Portal de Acceso Anticipado'}</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    value={betaCodeInput}
                    onChange={(e) => setBetaCodeInput(e.target.value)}
                    placeholder={progress.uiLanguage === 'en' ? 'Enter key' : 'Ingresar clave'}
                    className="flex-grow bg-white px-8 py-5 rounded-2xl border border-indigo-200 focus:border-indigo-600 focus:outline-none transition-all font-mono text-base tracking-[0.3em] uppercase"
                  />
                  <button 
                    onClick={handleUnlockBeta}
                    className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    {progress.uiLanguage === 'en' ? 'Authenticate' : 'Autenticar'}
                  </button>
                </div>
                {betaStatus === 'error' && <p className="text-rose-500 text-[10px] font-black mt-4 uppercase tracking-widest">{progress.uiLanguage === 'en' ? 'Identity credentials rejected' : 'Credenciales de identidad rechazadas'}</p>}
              </div>
            )}
            
            {progress.isBetaEnabled && (
               <div className="mt-12 space-y-10 animate-in fade-in zoom-in-95 duration-700">
                  <div className="bg-slate-900 p-10 md:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                       <Icons.Logo />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-10">
                         <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-rose-400"><Icons.Lab /></div>
                         <div>
                            <h4 className="text-2xl font-black tracking-tighter text-rose-300">{t.advancedAI}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t.betaLab}</p>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-12">
                         <div className="space-y-6">
                            <div className="flex justify-between items-center px-1">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.errorTolerance}</label>
                               <span className="text-xs font-black text-rose-400">{progress.betaSettings.tolerance}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={progress.betaSettings.tolerance} onChange={(e) => updateBetaSetting('tolerance', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-rose-500 cursor-pointer" />
                         </div>

                         <div className="space-y-6">
                            <div className="flex justify-between items-center px-1">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.feedbackDepth}</label>
                               <span className="text-xs font-black text-rose-400">{progress.betaSettings.feedbackDepth}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={progress.betaSettings.feedbackDepth} onChange={(e) => updateBetaSetting('feedbackDepth', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-rose-500 cursor-pointer" />
                         </div>

                         <div className="space-y-6">
                            <div className="flex justify-between items-center px-1">
                               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.grammaticalRigor}</label>
                               <span className="text-xs font-black text-rose-400">{progress.betaSettings.rigor}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={progress.betaSettings.rigor} onChange={(e) => updateBetaSetting('rigor', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-rose-500 cursor-pointer" />
                         </div>

                         <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-6 px-1 tracking-widest">{t.correctionStyle}</label>
                            <div className="flex gap-4">
                               <button onClick={() => updateBetaSetting('correctionType', 'semantic')} className={`flex-grow py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${progress.betaSettings.correctionType === 'semantic' ? 'border-rose-500 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-900/20' : 'border-slate-800 text-slate-600'}`}>{t.semantic}</button>
                               <button onClick={() => updateBetaSetting('correctionType', 'structural')} className={`flex-grow py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${progress.betaSettings.correctionType === 'structural' ? 'border-rose-500 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-900/20' : 'border-slate-800 text-slate-600'}`}>{t.structural}</button>
                            </div>
                         </div>
                      </div>
                      <div className="p-6 bg-slate-800/50 rounded-3xl border border-white/5 text-center">
                         <p className="text-[11px] text-slate-400 italic font-medium leading-relaxed">{t.strictnessDesc}</p>
                      </div>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Global Track Selection */}
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">{t.immersionLevel}</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map(key => {
                const val = Difficulty[key];
                const config = LEVEL_CONFIG[val];
                const isActive = progress.currentLevel === val;
                return (
                  <button key={val} onClick={() => updateLevel(val)} className={`text-left p-8 rounded-[2.5rem] border-2 transition-all group flex flex-col justify-between min-h-[220px] ${isActive ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-900/5' : 'border-slate-50 bg-slate-50/50 opacity-60 hover:opacity-100 hover:border-slate-200'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl ${config.color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform mb-6`}>{val.charAt(0).toUpperCase()}</div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xl tracking-tighter mb-2">{progress.uiLanguage === 'en' ? config.label : config.labelEs}</h4>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed">{progress.uiLanguage === 'en' ? config.description : config.descriptionEs}</p>
                    </div>
                  </button>
                );
             })}
           </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{t.uiLanguage}</p>
              <div className="flex gap-4">
                 <button onClick={() => updateUILanguage('en')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${progress.uiLanguage === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-900'}`}>English</button>
                 <button onClick={() => updateUILanguage('es')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${progress.uiLanguage === 'es' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-900'}`}>Español</button>
              </div>
           </div>
           
           <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-10 py-5 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm">
              {t.resetProgress}
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
