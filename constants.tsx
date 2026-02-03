
import React from 'react';
import { Difficulty, CurricularUnit, UILanguage, PracticeTask } from './types';

export const APP_NAME = "Alba Spanish";
export const APP_VERSION = "2.5.0-premium";
export const CREDITS = "Andrés — Guatemala (GT), 2026";
export const DAILY_TOKEN_CAP = 15000;
export const BETA_CODE = "KzG0A4";
export const AUTHORIZED_NAMES = ["Maddie", "Madelyn"];

export const LEVEL_CONFIG = {
  [Difficulty.EASY]: {
    label: 'Fundamental',
    labelEs: 'Fundamental',
    description: 'Master the sonic architecture and high-frequency patterns.',
    descriptionEs: 'Domina la arquitectura sonora y patrones de alta frecuencia.',
    color: 'bg-emerald-500',
    accent: 'text-emerald-600',
    tolerance: 'High'
  },
  [Difficulty.INTERMEDIATE]: {
    label: 'Conversational',
    labelEs: 'Conversacional',
    description: 'Navigate past events and express abstract opinions.',
    descriptionEs: 'Navega eventos pasados y expresa opiniones abstractas.',
    color: 'bg-indigo-500',
    accent: 'text-indigo-600',
    tolerance: 'Moderate'
  },
  [Difficulty.COMPLEX]: {
    label: 'Advanced',
    labelEs: 'Avanzado',
    description: 'Engage with subjunctive nuances and formal discourse.',
    descriptionEs: 'Domina los matices del subjuntivo y el discurso formal.',
    color: 'bg-violet-600',
    accent: 'text-violet-700',
    tolerance: 'Academic'
  }
};

export const UI_STRINGS: Record<UILanguage, any> = {
  en: {
    dashboard: 'Nexus',
    theory: 'Acquisitions',
    practice: 'Active Output',
    roleplay: 'Immersion',
    settings: 'Core Settings',
    xp: 'Proficiency Score',
    verifications: 'Milestones',
    roleplays: 'Scenarios',
    resume: 'Resume Journey',
    resumeDesc: 'Restore your previous session state.',
    growthMatrix: 'Evolution Matrix',
    performanceOptimized: 'Peak Efficiency',
    reviewRecommended: 'Interference Detected',
    syllabusUnits: 'Curricular Core',
    selectUnit: 'Select a pillar of study',
    pedagogicalObjective: 'Session Goal',
    verifyProduction: 'Authenticate Input',
    analyzing: 'Synthesizing response...',
    evaluating: 'Validating production...',
    dailyQuota: 'Intelligence Pool',
    quotaReached: 'IA Quota Saturated',
    quotaWait: 'Wait for replenishment.',
    resetProgress: 'Purge Local Progress',
    betaLab: 'Alba Intelligence Lab',
    advancedAI: 'Behavior Controls',
    betaStatus: 'Experimental Mode',
    errorTolerance: 'Correction Strictness',
    feedbackDepth: 'Logic Depth',
    grammaticalRigor: 'Syntactic Rigor',
    correctionStyle: 'Analysis Focus',
    semantic: 'Intent',
    structural: 'Form',
    reconnecting: 'Reconnecting to core...',
    refreshSession: 'Refresh Context',
    welcome: 'Welcome',
    experiencePremium: 'Experience premium acquisition on the',
    continueJourney: 'Continue Your Alba Journey',
    trackLevel: 'Level Tracks',
    curriculumUnits: 'Curriculum Units',
    developedBy: 'Developed by',
    createdBy: 'Created by',
    inTechnicalPreview: 'In technical preview',
    earlyAccessPortal: 'Early Access Portal',
    identityPermissions: 'Identity & Permissions',
    scenarios: {
      art: { title: 'Gallery Opening', desc: 'Discussing contemporary aesthetics.' },
      tech: { title: 'Tech Strategy', desc: 'Innovation and digital transformation.' },
      culinary: { title: 'Wine Pairing', desc: 'Ordering and critiquing a menu.' }
    }
  },
  es: {
    dashboard: 'Nexus',
    theory: 'Adquisiciones',
    practice: 'Producción Activa',
    roleplay: 'Inmersión',
    settings: 'Ajustes Base',
    xp: 'Nivel de Maestría',
    verifications: 'Hitos',
    roleplays: 'Escenarios',
    resume: 'Retomar Viaje',
    resumeDesc: 'Restaurar estado de sesión previo.',
    growthMatrix: 'Matriz de Evolución',
    performanceOptimized: 'Eficiencia Pico',
    reviewRecommended: 'Interferencias Detectadas',
    syllabusUnits: 'Núcleo Curricular',
    selectUnit: 'Selecciona un pilar de estudio',
    pedagogicalObjective: 'Meta de la Sesión',
    verifyProduction: 'Autenticar Entrada',
    analyzing: 'Sintetizando respuesta...',
    evaluating: 'Validando producción...',
    dailyQuota: 'Reserva de Inteligencia',
    quotaReached: 'Cuota de IA Saturada',
    quotaWait: 'Espera la reposición.',
    resetProgress: 'Purgar Progreso Local',
    betaLab: 'Lab de Inteligencia Alba',
    advancedAI: 'Controles de Comportamiento',
    betaStatus: 'Modo Experimental',
    errorTolerance: 'Exigencia de Corrección',
    feedbackDepth: 'Profundidad Lógica',
    grammaticalRigor: 'Rigor Sintáctico',
    correctionStyle: 'Foco de Análisis',
    semantic: 'Intención',
    structural: 'Forma',
    reconnecting: 'Reconectando al núcleo...',
    refreshSession: 'Refrescar Contexto',
    welcome: 'Bienvenido',
    experiencePremium: 'Vive una adquisición premium en la vía',
    continueJourney: 'Continúa tu viaje en Alba',
    trackLevel: 'Vías de Nivel',
    curriculumUnits: 'Unidades del Currículo',
    developedBy: 'Desarrollado por',
    createdBy: 'Creado por',
    inTechnicalPreview: 'En vista previa técnica',
    earlyAccessPortal: 'Portal de Acceso Anticipado',
    identityPermissions: 'Identidad y Permisos',
    scenarios: {
      art: { title: 'Inauguración de Galería', desc: 'Discutiendo estética contemporánea.' },
      tech: { title: 'Estrategia Tecnológica', desc: 'Innovación y transformación digital.' },
      culinary: { title: 'Maridaje de Vinos', desc: 'Pidiendo y criticando un menú.' }
    }
  }
};

export const PRACTICE_SEED_BANK: Record<Difficulty, PracticeTask[]> = {
  [Difficulty.EASY]: [
    { id: 'seed_e1', type: 'DIRECT_INSTRUCTION', instruction: 'Say "Hello, how are you?"', context: 'Meeting a neighbor.' },
    { id: 'seed_e2', type: 'SENTENCE_CONSTRUCTION', instruction: 'Use "manzana" and "roja".', context: 'Describing fruit.' },
    { id: 'seed_e3', type: 'CONTEXTUAL_COMPLETION', instruction: 'Complete: "Yo ____ de Guatemala."', context: 'Introducing yourself.' }
  ],
  [Difficulty.INTERMEDIATE]: [
    { id: 'seed_i1', type: 'REFORMULATION', instruction: 'Change to preterite: "Yo estudio español."', context: 'Talking about last year.' },
    { id: 'seed_i2', type: 'ERROR_CORRECTION', instruction: 'Fix: "Mañana yo fui a la casa."', context: 'Past tense error.' }
  ],
  [Difficulty.COMPLEX]: [
    { id: 'seed_c1', type: 'FREE_PRODUCTION', instruction: 'Discuss cultural identity using the subjunctive.', context: 'Formal presentation.' },
    { id: 'seed_beta_c1', type: 'COMPARATIVE_REFORMULATION', instruction: 'Elevate this phrase: "Espero que vengas pronto."', context: 'Formal letter.', isBetaOnly: true }
  ]
};

export const CURRICULUM: Record<Difficulty, CurricularUnit[]> = {
  [Difficulty.EASY]: [
    {
      id: 'e_alphabet',
      title: 'Phonetic Core',
      topic: 'Stress & Sound',
      description: 'The sonic foundation of the language.',
      objective: 'Master unique phonemes (ñ, r) and initial stress patterns.',
      grammarFocus: ['Phonetics', 'Rules of Accentuation'],
      vocabularyFocus: ['ABC', 'Cognates'],
      betaInsights: {
        linguisticDeepDive: "Spanish is a syllable-timed language, unlike English which is stress-timed. This creates the machine-gun like rhythm learners must adapt to.",
        culturalNote: "The tilde on the 'ñ' is a medieval abbreviation for a double 'nn'."
      }
    }
  ],
  [Difficulty.INTERMEDIATE]: [
    {
      id: 'i_past',
      title: 'Narrative Past',
      topic: 'Preterite Architecture',
      description: 'Encoding events in time.',
      objective: 'Differentiate between completed and ongoing actions with precision.',
      grammarFocus: ['Preterite vs Imperfect'],
      vocabularyFocus: ['Time markers', 'Travel'],
      betaInsights: {
        linguisticDeepDive: "The distinction depends on how the speaker frames the event, not just the nature of the event itself.",
        culturalNote: "Regional preferences for 'he ido' vs 'fui' vary significantly across the Spanish-speaking world."
      }
    }
  ],
  [Difficulty.COMPLEX]: [
    {
      id: 'c_subjunctive',
      title: 'Subjective Moods',
      topic: 'Subjunctive Realities',
      description: 'Managing uncertainty and desire.',
      objective: 'Navigate abstract clauses with 90%+ grammatical accuracy.',
      grammarFocus: ['Present Subjunctive', 'Mood selection'],
      vocabularyFocus: ['Hypotheses', 'Politics'],
      betaInsights: {
        linguisticDeepDive: "The Subjunctive marks the boundary between objective reality and the speaker's internal processing.",
        culturalNote: "Mastering the subjunctive is often considered the 'gateway' to native-level social integration."
      }
    }
  ]
};

export const Icons = {
  Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Chat: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  Chart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Energy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Lab: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.5"></path><path d="M14 2v7.5"></path><path d="M8.5 2h7"></path><path d="M14 11.5c1.5 1.5 3 4.5 3 7.5a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3c0-3 1.5-6 3-7.5"></path><path d="M9 16h6"></path></svg>,
  Logo: () => (
    <svg viewBox="0 0 40 40" className="w-8 h-8">
      <rect width="40" height="40" rx="10" fill="#4f46e5" />
      <path d="M20 10 L30 30 H10 Z" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="20" cy="22" r="3" fill="white" />
    </svg>
  )
};
