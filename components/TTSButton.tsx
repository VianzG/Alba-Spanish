
import React, { useState } from 'react';
import { generateSpeechWithUsage, isQuotaError } from '../services/geminiService';

interface TTSButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const TTSButton: React.FC<TTSButtonProps> = ({ text, className = "", size = 'md', disabled = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying || disabled) return;
    setIsPlaying(true);
    try {
      await generateSpeechWithUsage(text);
    } catch (error) {
      if (isQuotaError(error)) {
        // We handle this silently or it is reflected in global state via other components
        console.warn("TTS Quota Exceeded");
      }
    } finally {
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const sizeClasses = { sm: 'p-1.5', md: 'p-2.5', lg: 'p-4' };

  return (
    <button 
      onClick={handlePlay} 
      disabled={isPlaying || disabled} 
      className={`rounded-xl transition-all shadow-sm flex items-center justify-center ${disabled ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-40' : (isPlaying ? 'bg-indigo-50 text-indigo-400 cursor-wait' : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100 active:scale-95')} ${sizeClasses[size]} ${className}`} 
      title={disabled ? "AI Unavailable" : "Listen"}
    >
      {isPlaying ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      )}
    </button>
  );
};

export default TTSButton;
