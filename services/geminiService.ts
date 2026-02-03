
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Difficulty, EvaluationResult, BatchedEvaluationResult, CurricularUnit, Message, UILanguage, PracticeTask, UserProgress, AiResponse, BetaSettings } from "../types";
import { LEVEL_CONFIG } from "../constants";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Detects if an error is a "Quota Exceeded" response.
 */
export const isQuotaError = (error: any): boolean => {
  const msg = String(error).toLowerCase();
  return (
    error?.status === 429 || 
    error?.code === 429 || 
    msg.includes('quota') || 
    msg.includes('429') || 
    msg.includes('resource_exhausted') ||
    msg.includes('limit')
  );
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (isQuotaError(error)) {
      // Do not retry indefinitely on quota errors to save user bandwidth/state
      throw error; 
    }

    const isRetryable = 
      error?.status >= 500 ||
      String(error).includes('500') ||
      String(error).includes('Rpc failed') ||
      String(error).includes('xhr error');

    if (isRetryable && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay + (Math.random() * 200)));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const CREATION_MODEL = 'gemini-3-flash-preview';
const EVALUATION_MODEL = 'gemini-flash-lite-latest';
const COMPLEX_MODEL = 'gemini-3-pro-preview';

export const generateTheory = async (level: Difficulty, unit: CurricularUnit, uiLanguage: UILanguage): Promise<AiResponse<string>> => {
  return withRetry(async () => {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: CREATION_MODEL,
      contents: `Explain "${unit.topic}" in "${unit.title}". Level: ${level}. Objective: ${unit.objective}. markdown format.`,
    });
    return {
      data: response.text || '',
      usage: response.usageMetadata
    };
  });
};

export const generatePracticeTask = async (level: Difficulty, uiLanguage: UILanguage, isBeta: boolean = false): Promise<AiResponse<PracticeTask>> => {
  return withRetry(async () => {
    const ai = getGeminiClient();
    const betaModifier = isBeta ? "Advanced production tasks." : "";
    const response = await ai.models.generateContent({
      model: isBeta ? COMPLEX_MODEL : CREATION_MODEL,
      contents: `Generate a Spanish practice task for level ${level}. ${betaModifier} JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            instruction: { type: Type.STRING },
            context: { type: Type.STRING },
            targetGrammar: { type: Type.STRING },
            targetVocabulary: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "type", "instruction", "context", "targetGrammar", "targetVocabulary"]
        }
      }
    });
    return {
      data: JSON.parse(response.text.trim()),
      usage: response.usageMetadata
    };
  });
};

export const evaluateBatch = async (
  items: { task: PracticeTask, userInput: string }[],
  progress: UserProgress
): Promise<AiResponse<BatchedEvaluationResult>> => {
  return withRetry(async () => {
    const ai = getGeminiClient();
    const isBeta = progress.isBetaEnabled;
    const settings: BetaSettings | null = isBeta ? progress.betaSettings : null;

    let betaPrompt = "";
    if (settings) {
      betaPrompt = `
      AI BEHAVIOR CONTROLS (BETA):
      - Error Tolerance: ${settings.tolerance}/100
      - Feedback Depth: ${settings.feedbackDepth}/100
      - Grammatical Rigor: ${settings.rigor}/100
      - Correction Style: Focus on ${settings.correctionType}.
      `;
    }

    const prompt = `Evaluate the following ${items.length} Spanish language exercises. 
    User Level: ${progress.currentLevel}.
    ${betaPrompt}
    Return JSON format.`;

    const response = await ai.models.generateContent({
      model: isBeta ? COMPLEX_MODEL : EVALUATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                  intentValidation: { type: Type.STRING },
                  suggestedCorrection: { type: Type.STRING },
                  modelComparison: { type: Type.STRING },
                  retryHint: { type: Type.STRING },
                  pedagogicalReport: {
                    type: Type.OBJECT,
                    properties: {
                      grammarAccuracy: { type: Type.STRING },
                      vocabularyUsage: { type: Type.STRING },
                      coherence: { type: Type.STRING }
                    },
                    required: ["grammarAccuracy", "vocabularyUsage", "coherence"]
                  },
                  keywords: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        word: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                      },
                      required: ["word", "explanation"]
                    }
                  }
                },
                required: ["status", "score", "feedback", "intentValidation", "pedagogicalReport", "keywords"]
              }
            },
            overallSummary: { type: Type.STRING }
          },
          required: ["evaluations", "overallSummary"]
        }
      }
    });

    return {
      data: JSON.parse(response.text.trim()),
      usage: response.usageMetadata
    };
  });
};

export const generateRoleplayResponse = async (
  messages: Message[],
  level: Difficulty,
  scenario: string,
  uiLanguage: UILanguage
): Promise<AiResponse<any>> => {
  return withRetry(async () => {
    const ai = getGeminiClient();
    const history = messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));
    const lastMessage = messages[messages.length - 1].content;
    const response = await ai.models.generateContent({
      model: COMPLEX_MODEL,
      contents: [...history, { role: 'user', parts: [{ text: lastMessage }] }],
      config: {
        systemInstruction: `Native Spanish roleplay: ${scenario}. Level: ${level}.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { word: { type: Type.STRING }, explanation: { type: Type.STRING } },
                required: ["word", "explanation"]
              }
            }
          },
          required: ["reply", "keywords"]
        }
      }
    });
    return {
      data: JSON.parse(response.text.trim()),
      usage: response.usageMetadata
    };
  });
};

export const generateSpeechWithUsage = async (text: string): Promise<AiResponse<void>> => {
  return withRetry(async () => {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      await playRawPcm(base64Audio);
    }
    return {
      data: undefined,
      usage: response.usageMetadata
    };
  });
};

const playRawPcm = async (base64: string) => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const dataInt16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
};
