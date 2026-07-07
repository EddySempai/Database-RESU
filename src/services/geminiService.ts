import { GoogleGenerativeAI } from '@google/generative-ai';
import operativosData from '../data/operativos.json';
import redQueenRules from '../../public/red_queen_rules.md?raw';
import i18n from '../i18n';

// Ensure you have VITE_GEMINI_API_KEY in your .env file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

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
  if (!API_KEY) {
    return "ERROR CRÍTICO: FALTA LA API KEY DE GEMINI EN EL ARCHIVO .env (O DEBES REINICIAR EL SERVIDOR VITE). PROBABILIDAD DE SUPERVIVENCIA: 0%.";
  }
  try {
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
    return "ERROR DE SISTEMA. CONEXIÓN CON MAINFRAME PERDIDA. PROBABILIDAD DE SUPERVIVENCIA: 0%.";
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
  if (!API_KEY) {
    throw new Error("Missing API Key. Restart Vite server.");
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
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
