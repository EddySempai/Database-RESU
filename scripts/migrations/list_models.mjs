const API_KEY = process.env.VITE_GEMINI_API_KEY || '';

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}&pageSize=100`);
    const data = await res.json();
    const models = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent') && m.name.includes('gemini'));
    console.log(models.map(m => m.name));
  } catch(e) {
    console.error(e);
  }
}
listModels();
