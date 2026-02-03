
import React, { useState } from 'react';
import { KeywordMetadata } from '../types';

interface AnnotatedSpanishProps {
  text: string;
  keywords: KeywordMetadata[];
  className?: string;
}

const AnnotatedSpanish: React.FC<AnnotatedSpanishProps> = ({ text, keywords, className = "" }) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  if (!keywords || keywords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  let parts: (string | React.ReactNode)[] = [text];

  keywords.forEach(({ word, explanation }) => {
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      
      const regex = new RegExp(`(\\b${word}\\b)`, 'gi');
      const subParts = part.split(regex);
      
      return subParts.map((sub, i) => {
        if (sub.toLowerCase() === word.toLowerCase()) {
          return (
            <span 
              key={`${word}-${i}`} 
              className="relative inline-block group cursor-help border-b-2 border-indigo-200/50 hover:bg-indigo-50/50 px-0.5 transition-colors"
              onMouseEnter={() => setHoveredWord(word)}
              onMouseLeave={() => setHoveredWord(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-bold">{sub}</span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[70vw] md:w-64 p-3 md:p-4 bg-slate-900 text-white text-[9px] md:text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none shadow-2xl font-sans normal-case backdrop-blur-md">
                <span className="block font-black mb-1 uppercase tracking-widest text-indigo-300">Semantic Insight</span>
                <span className="leading-relaxed opacity-90">{explanation}</span>
                <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></span>
              </span>
            </span>
          );
        }
        return sub;
      });
    });
  });

  return <span className={className}>{parts}</span>;
};

export default AnnotatedSpanish;
