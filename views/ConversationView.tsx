
import React, { useState, useRef, useEffect } from 'react';
import { UserProgress, Message } from '../types';
import { generateRoleplayResponse, isQuotaError } from '../services/geminiService';
import AnnotatedSpanish from '../components/AnnotatedSpanish';
import TTSButton from '../components/TTSButton';
import { UI_STRINGS, Icons } from '../constants';

const SCENARIOS = [
  { id: 'art', icon: '🎨' },
  { id: 'tech', icon: '💻' },
  { id: 'culinary', icon: '🍷' },
];

// Added setAiState to the props interface and Destructured it to fix TypeScript error in App.tsx
const ConversationView: React.FC<{ 
  progress: UserProgress, 
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>,
  setAiState: (s: boolean) => void
}> = ({ progress, setProgress, setAiState }) => {
  const t = UI_STRINGS[progress.uiLanguage];
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAiLocked = progress.usage.isQuotaExceeded || progress.usage.tokensRemaining <= 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const activeScenario = scenarioId ? {
    ...SCENARIOS.find(s => s.id === scenarioId),
    ...t.scenarios[scenarioId]
  } : null;

  const startScenario = async (id: string) => {
    setScenarioId(id);
    setMessages([{ role: 'model', content: `Hola. Bienvenido a ${t.scenarios[id].title}.`, annotations: [] }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !scenarioId || isAiLocked) {
      if (isAiLocked) setError(t.quotaReached);
      return;
    }
    const userMessage: Message = { role: 'user', content: input };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setLoading(true);
    // Notify global state that AI processing has started
    setAiState(true);
    setError(null);

    try {
      const response = await generateRoleplayResponse(history, progress.currentLevel, t.scenarios[scenarioId].title, progress.uiLanguage);
      setMessages([...history, { role: 'model', content: response.data.reply, annotations: response.data.keywords }]);
      const tokensConsumed = response.usage?.totalTokenCount || 1000;
      setProgress(prev => {
        const currentData = prev.levelData[prev.currentLevel];
        return { 
          ...prev, 
          levelData: { ...prev.levelData, [prev.currentLevel]: { ...currentData, conversations: currentData.conversations + 1, score: currentData.score + 2 } },
          usage: { ...prev.usage, tokensRemaining: Math.max(0, prev.usage.tokensRemaining - tokensConsumed), isQuotaExceeded: false }
        };
      });
    } catch (err: any) {
      if (isQuotaError(err)) {
        setProgress(prev => ({ ...prev, usage: { ...prev.usage, isQuotaExceeded: true, tokensRemaining: 0 } }));
        setError(t.quotaReached);
      } else {
        setError('Connection failed.');
      }
    } finally {
      setLoading(false);
      // Reset global AI processing state
      setAiState(false);
    }
  };

  if (!scenarioId) {
    return (
      <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {SCENARIOS.map(s => {
          const meta = t.scenarios[s.id];
          return (
            <button key={s.id} onClick={() => startScenario(s.id)} className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-left group">
              <span className="text-3xl md:text-5xl mb-4 md:mb-6 block group-hover:scale-110 transition-transform">{s.icon}</span>
              <h4 className="text-base md:text-xl font-bold mb-1 md:mb-2">{meta.title}</h4>
              <p className="text-slate-500 text-[10px] md:text-sm leading-relaxed">{meta.desc}</p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-12rem)] md:h-[calc(100dvh-8rem)] flex flex-col animate-fade-in bg-white border border-slate-100 rounded-2xl md:rounded-[3rem] shadow-xl overflow-hidden mb-4">
        <div className="flex items-center gap-3 p-4 md:p-6 border-b border-slate-50 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
           <button onClick={() => setScenarioId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           </button>
           <div>
              <h3 className="text-sm md:text-lg font-black leading-tight">{t.scenarios[scenarioId].title}</h3>
              <p className="text-[8px] md:text-[10px] font-black uppercase text-indigo-400 tracking-widest">{progress.uiLanguage === 'en' ? 'Active Roleplay Turn' : 'Turno de Roleplay Activo'}</p>
           </div>
           {isAiLocked && <span className="ml-auto px-2 py-0.5 bg-rose-50 text-rose-500 text-[8px] font-black uppercase tracking-widest rounded-lg">Offline</span>}
        </div>

        <div ref={scrollRef} className="flex-grow p-4 md:p-10 overflow-y-auto space-y-6 md:space-y-8 bg-[#FAFAFA]/30 scroll-smooth">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[70%] p-4 md:p-6 rounded-2xl md:rounded-[2rem] relative ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none shadow-md shadow-indigo-900/10' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'}`}>
                <div className={`text-xs md:text-base leading-relaxed ${m.role === 'model' ? 'spanish-text italic md:pr-12' : 'font-medium'}`}>
                  {m.role === 'model' ? <AnnotatedSpanish text={m.content} keywords={m.annotations || []} /> : m.content}
                </div>
                {m.role === 'model' && !isAiLocked && (
                  <div className="mt-3 md:mt-0 md:absolute md:top-4 md:right-4 flex justify-end">
                    <TTSButton text={m.content} size="sm" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none animate-pulse flex items-center gap-3">
                <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.analyzing}</span>
              </div>
            </div>
          )}
          {error === t.quotaReached && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-[9px] font-black uppercase tracking-widest text-center shadow-sm">
               {progress.uiLanguage === 'en' ? 'Tokens exhausted. Interaction suspended.' : 'Tokens agotados. Interacción suspendida.'}
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 bg-white border-t border-slate-50">
          <div className="flex gap-2 md:gap-4 max-w-4xl mx-auto w-full items-center">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
              disabled={isAiLocked || loading} 
              placeholder={isAiLocked ? (progress.uiLanguage === 'en' ? "IA disabled..." : "IA deshabilitada...") : (progress.uiLanguage === 'en' ? "Speak in Spanish..." : "Habla en español...")} 
              className={`flex-grow bg-[#F8FAFC] px-5 py-4 md:px-8 md:py-5 rounded-xl md:rounded-2xl border-2 transition-all text-sm md:text-base font-serif italic ${isAiLocked ? 'border-slate-100 opacity-50 grayscale' : 'border-slate-100 focus:border-indigo-600 focus:outline-none focus:bg-white'}`} 
            />
            <button 
              onClick={sendMessage} 
              disabled={loading || !input.trim() || isAiLocked} 
              className={`w-14 h-14 md:w-auto md:px-10 md:h-[64px] rounded-xl md:rounded-2xl font-black shadow-lg transition-all flex items-center justify-center ${isAiLocked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              <span className="hidden md:inline">{progress.uiLanguage === 'en' ? 'Send' : 'Enviar'}</span>
              <span className="md:hidden">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </span>
            </button>
          </div>
        </div>
    </div>
  );
};

export default ConversationView;
