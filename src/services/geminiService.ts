import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODEL = 'gemini-3.6-flash';

/**
 * Obtiene la API Key de Gemini desde las variables de entorno de Vite o Node.
 */
export function getGeminiApiKey(): string | null {
  const env = (import.meta as any).env || {};
  const apiKey =
    process.env.GEMINI_API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    null;

  return apiKey && apiKey.trim().length > 0 ? apiKey.trim() : null;
}

/**
 * Retorna la API key ofuscada para mostrar de forma segura en UI (ej: AIzaSy...rjU).
 */
export function getMaskedApiKey(): string | null {
  const key = getGeminiApiKey();
  if (!key) return null;
  if (key.length <= 10) return '********';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

/**
 * Crea o retorna una instancia del cliente de GoogleGenAI.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('No se ha encontrado la clave GEMINI_API_KEY en las variables de entorno.');
  }
  return new GoogleGenAI({ apiKey });
}

export interface GeminiHealthCheckResult {
  hasKey: boolean;
  maskedKey: string | null;
  isWorking: boolean;
  model: string;
  latencyMs?: number;
  message: string;
  timestamp: string;
}

/**
 * Realiza un test de diagnóstico real contra la API de Gemini para verificar que la clave está activa y el modelo responde.
 */
export async function testGeminiConnection(): Promise<GeminiHealthCheckResult> {
  const apiKey = getGeminiApiKey();
  const timestamp = new Date().toLocaleTimeString();

  if (!apiKey) {
    return {
      hasKey: false,
      maskedKey: null,
      isWorking: false,
      model: GEMINI_MODEL,
      message: 'GEMINI_API_KEY no detectada en las variables de entorno (.env / Vercel).',
      timestamp,
    };
  }

  const startTime = performance.now();
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [{ text: 'PING' }],
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (response && response.text !== undefined) {
      return {
        hasKey: true,
        maskedKey: getMaskedApiKey(),
        isWorking: true,
        model: GEMINI_MODEL,
        latencyMs,
        message: `API conectada y operativa (${latencyMs}ms)`,
        timestamp,
      };
    } else {
      return {
        hasKey: true,
        maskedKey: getMaskedApiKey(),
        isWorking: false,
        model: GEMINI_MODEL,
        latencyMs,
        message: 'Respuesta vacía o formato inesperado de Gemini.',
        timestamp,
      };
    }
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errorMsg = err?.message || err?.toString() || 'Error desconocido';
    return {
      hasKey: true,
      maskedKey: getMaskedApiKey(),
      isWorking: false,
      model: GEMINI_MODEL,
      latencyMs,
      message: errorMsg,
      timestamp,
    };
  }
}
