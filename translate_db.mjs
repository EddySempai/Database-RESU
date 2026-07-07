import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Since we use ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file for API KEY
const envPath = join(__dirname, '.env');
let apiKey = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
  if (match) apiKey = match[1].trim();
}

if (!apiKey) {
  console.error("API KEY NOT FOUND");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

const operativosPath = join(__dirname, 'src', 'data', 'operativos.json');
const data = JSON.parse(fs.readFileSync(operativosPath, 'utf8'));

async function translateTo(targetLang, outputPath) {
  console.log(`Translating to ${targetLang}...`);
  const prompt = `
You are an expert translator. 
Translate the following JSON array of game characters into ${targetLang}.
ONLY translate the following string fields:
- "name"
- "unitType" (Atacante -> Attacker/アタッカー, Defensor -> Defender/ディフェンダー, Ranger -> Ranger/レンジャー)
- "rarity" (Legendario -> Legendary/レジェンダリー)
- "label" inside "fieldStats"
- "name" inside "skills"
- "description" inside "skills"

DO NOT translate "id", "imageUrl", or any keys. KEEP THE EXACT JSON STRUCTURE. 
Output ONLY the raw valid JSON array, no markdown formatting.
  `;
  
  try {
    const result = await model.generateContent([
      prompt,
      JSON.stringify(data)
    ]);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    fs.writeFileSync(outputPath, text);
    console.log(`Saved ${outputPath}`);
  } catch(e) {
    console.error(`Error translating to ${targetLang}:`, e);
  }
}

async function main() {
  await translateTo('English', join(__dirname, 'src', 'locales', 'en', 'operativos.json'));
  await translateTo('Japanese', join(__dirname, 'src', 'locales', 'ja', 'operativos.json'));
}

main();
