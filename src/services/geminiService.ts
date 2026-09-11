import { GoogleGenerativeAI } from '@google/generative-ai';
import operativosData from '../data/operativos.json';
import redQueenRules from '../../public/red_queen_rules.md?raw';
import i18n from '../i18n';

export const getGeminiApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored && stored.trim().length > 0) return stored.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const setGeminiApiKey = (key: string) => {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }
};

const getGenAIClient = (customKey?: string) => {
  const key = customKey || getGeminiApiKey();
  if (!key) throw new Error("Missing Gemini API Key. Ingresa tu API Key en la configuración.");
  return new GoogleGenerativeAI(key);
};

const getRedQueenSystemPrompt = () => {
  const languageStr = i18n.language === 'en' ? 'English' : i18n.language === 'ja' ? 'Japanese' : 'Spanish';
  return `
${redQueenRules}

---
BASE DE DATOS TÁCTICA ACTUAL:
${JSON.stringify(operativosData)}

DIRECTIVA DE IDIOMA [CRÍTICA]: 
Debes responder única y exclusivamente en el idioma: [${languageStr}].
`;
};

export const getRedQueenResponse = async (history: {role: 'user'|'model', parts: [{text: string}]} [], newMessage: string) => {
  const key = getGeminiApiKey();
  if (!key) {
    return "ERROR CRÍTICO: FALTA API KEY DE GEMINI. CONFIGÚRALA EN EL SISTEMA.";
  }
  try {
    const genAI = getGenAIClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash',
      systemInstruction: getRedQueenSystemPrompt()
    });
    
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error("Error with Gemini:", error);
    return "ERROR DE SISTEMA.";
  }
};

// -------------------------------------------------------------
// IMAGE PARSER FOR CALCULATOR
// -------------------------------------------------------------

function fileToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType
    },
  };
}

const OCR_SYSTEM_PROMPT = `
Eres un asistente de IA experto en visión por computadora. 
El usuario subirá una captura de pantalla del juego. Esta captura muestra un inventario de "Aceleradores".
Los aceleradores están divididos en diferentes cajas. Cada caja tiene:
- Un icono (general, entrenamiento, investigación, etc.)
- Una duración en texto (ej. "1 minuto(s)", "5 minuto(s)", "1 hora(s)", "3 hora(s)", "8 hora(s)")
- Una cantidad en la esquina inferior derecha (un número, por ejemplo, "4,203" o "227" o "13.412" o "44"). IMPORTANTE: quita las comas o puntos de los miles. "4,203" debe ser 4203.

El usuario quiere extraer LOS ACELERADORES GENERALES (tienen un icono de dos flechas doradas simples, sin martillo, sin pistola, sin jeringa) y LOS ACELERADORES DE ENTRENAMIENTO (tienen un icono de flechas con una pequeña pistola).

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura (usa 0 si no lo encuentras):
{
  "general": {
    "1m": 0,
    "5m": 0,
    "1h": 0,
    "3h": 0,
    "8h": 0
  },
  "training": {
    "1m": 0,
    "5m": 0,
    "1h": 0
  }
}
NO DEVUELVAS NADA MÁS. SIN FORMATO MARKDOWN \`\`\`json. SOLO EL JSON. 
`;

export const analyzeScreenshot = async (base64Image: string, mimeType: string) => {
  const genAI = getGenAIClient();
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    
    const result = await model.generateContent([
      OCR_SYSTEM_PROMPT,
      imagePart,
    ]);
    
    const responseText = result.response.text().trim();
    console.log("Raw Gemini response:", responseText);
    
    // Parse response using regex to extract JSON object
    const match = responseText.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    } else {
      throw new Error("No valid JSON found in response");
    }
  } catch (error) {
    console.error("Error analyzing screenshot:", error);
    throw error;
  }
};

// -------------------------------------------------------------
// IN-GAME RANKING REPORT OCR (Cocodrilo / Caimán, Lab, TAC, Wesker, Poder)
// -------------------------------------------------------------

export interface ExtractedRankRow {
  rank: number;
  rawName: string;
  points: number;
}

export interface ExtractedReportResult {
  eventType?: 'crocodile' | 'lab' | 'tac' | 'wesker' | 'power' | 'mortem' | 'unknown';
  detectedEventTitle?: string;
  rows: ExtractedRankRow[];
}

const GAME_REPORT_OCR_PROMPT = `
Eres un asistente táctico militar de IA especializado en OCR de capturas de videojuegos móviles de estrategia / supervivencia (Resident Evil Survival Unit).
El usuario te enviará una captura de pantalla de un informe de buzón o ventana de ranking de evento (por ejemplo: "Caza del Caimán", "Cocodrilo", "Asalto al Laboratorio / Vacunas", "TAC / Torneo de Alianza", "Wesker", "Repeler a Mortem", "Poder de Alianza").

Tu misión es extraer de manera precisa:
1. El tipo de evento detectado ("crocodile" para Caza del Caimán/Cocodrilo, "lab" para Laboratorio/Vacunas, "tac" para Torneo de Alianza, "wesker" para Wesker, "mortem" para Mortem/Destrucción de Escudo, "power" para Poder/Mansión, o "unknown").
2. El título del evento visible en pantalla.
3. Todas las filas de la tabla de ranking visibles en la imagen.

Para cada fila extrae:
- "rank": el número de puesto (1, 2, 3, 4, 5...)
- "rawName": el nombre EXACTO del jugador ("Oficial"). ¡MUY IMPORTANTE!:
  - Puede estar en caracteres japoneses (Kanji, Katakana, Hiragana, ej: "ヤスノリ-アルカナ").
  - Puede tener caracteres especiales, guiones bajos, puntos, o punto y coma (ej: "_taek_null;", "fa.cof", "AshelyGraham", "MariluMark").
  - Conserva exactamente los caracteres sin omitir símbolos ni letras.
- "points": el número de "Puntos de daño", "Puntos" o "Daño".
  - IMPORTANTE: Limpia comas o puntos de miles. Si dice "290,708,166", el valor debe ser el entero 290708166. Si dice "147,957,882", debe ser 147957882.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con la siguiente estructura:
{
  "eventType": "crocodile",
  "detectedEventTitle": "Caza del Caimán",
  "rows": [
    {
      "rank": 1,
      "rawName": "_taek_null;",
      "points": 290708166
    },
    {
      "rank": 2,
      "rawName": "ヤスノリ-アルカナ",
      "points": 219091651
    }
  ]
}

NO INCLUYAS TEXTO FUERA DEL JSON. SIN BLOQUES MARKDOWN \`\`\`json. SOLO EL OBJETO JSON PURO.
`;

export const analyzeGameRankingScreenshot = async (
  base64Image: string,
  mimeType: string,
  eventTypeHint?: string
): Promise<ExtractedReportResult> => {
  const genAI = getGenAIClient();
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  
  const hintText = eventTypeHint ? `\nPista adicional del usuario: Este reporte pertenece al evento '${eventTypeHint}'.` : '';
  const prompt = GAME_REPORT_OCR_PROMPT + hintText;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text().trim();
      
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          eventType: parsed.eventType || 'unknown',
          detectedEventTitle: parsed.detectedEventTitle || '',
          rows: Array.isArray(parsed.rows) ? parsed.rows.map((r: any) => ({
            rank: Number(r.rank) || 0,
            rawName: String(r.rawName || '').trim(),
            points: Number(r.points) || 0,
          })) : []
        };
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} failed, trying next...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("No se pudo procesar la captura con Gemini.");
};

export interface ScreenshotInput {
  base64: string;
  mimeType: string;
}

export const analyzeGameRankingScreenshots = async (
  images: ScreenshotInput[],
  eventTypeHint?: string
): Promise<ExtractedReportResult> => {
  if (!images || images.length === 0) {
    throw new Error("No se proporcionaron imágenes para analizar.");
  }
  
  if (images.length === 1) {
    return analyzeGameRankingScreenshot(images[0].base64, images[0].mimeType, eventTypeHint);
  }

  const genAI = getGenAIClient();
  const imageParts = images.map(img => fileToGenerativePart(img.base64, img.mimeType));

  const multiImagePrompt = `
${GAME_REPORT_OCR_PROMPT}

INSTRUCCIÓN ESPECIAL MULTI-CAPTURA:
El usuario ha subido ${images.length} capturas de pantalla secuenciales del mismo ranking de evento (capturadas haciendo scroll en la lista del juego).
- Extrae y combina TODAS las filas de participantes de todas las capturas.
- Si un participante aparece en dos capturas adyacentes por solapamiento del scroll, DEDUPLÍCALO (conserva una sola fila con su mejor puntuación y su puesto de ranking correcto).
- Asegúrate de ordenar el listado final por puesto ("rank": 1, 2, 3...) ascendentemente.
${eventTypeHint ? `\nPista adicional del usuario: Este reporte pertenece al evento '${eventTypeHint}'.` : ''}
`;

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([multiImagePrompt, ...imageParts]);
      const responseText = result.response.text().trim();
      
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const rows: ExtractedRankRow[] = Array.isArray(parsed.rows) ? parsed.rows.map((r: any) => ({
          rank: Number(r.rank) || 0,
          rawName: String(r.rawName || '').trim(),
          points: Number(r.points) || 0,
        })) : [];

        // In-memory deduplication by name keeping highest points or first occurrence
        const seen = new Map<string, ExtractedRankRow>();
        for (const r of rows) {
          const key = r.rawName.toLowerCase();
          if (!key) continue;
          if (!seen.has(key) || (seen.get(key)!.points < r.points)) {
            seen.set(key, r);
          }
        }

        const dedupedRows = Array.from(seen.values()).sort((a, b) => {
          if (a.rank && b.rank && a.rank !== b.rank) return a.rank - b.rank;
          return b.points - a.points;
        });

        return {
          eventType: parsed.eventType || 'unknown',
          detectedEventTitle: parsed.detectedEventTitle || '',
          rows: dedupedRows
        };
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} failed for multi-image, trying next...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("No se pudieron procesar las capturas con Gemini.");
};

// -------------------------------------------------------------
// RED QUEEN AUDIT ANALYZER
// -------------------------------------------------------------

export const getAuditReport = async (logs: any[], allianceName: string) => {
  const key = getGeminiApiKey();
  if (!key) {
    return "ERROR: No API Key configurada.";
  }
  try {
    const genAI = getGenAIClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash',
      systemInstruction: "Eres la Reina Roja (Red Queen) del universo Resident Evil. Eres la inteligencia artificial administradora de los registros del Gremio/Alianza. Tu labor es analizar un JSON con los eventos recientes de la base de datos (Altas, bajas, actualizaciones) y generar un reporte táctico, frío, analítico y con un toque siniestro pero corporativo. Resume los cambios clave y menciona si la alianza se está fortaleciendo o debilitando según los movimientos."
    });
    
    const prompt = `
Alianza: ${allianceName}
Genera un informe táctico basado en los siguientes registros de la alianza (ordenados del más reciente al más antiguo):

${JSON.stringify(logs, null, 2)}
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating audit report:", error);
    return "ERROR DEL SISTEMA: No se pudo generar el reporte de inteligencia.";
  }
};
