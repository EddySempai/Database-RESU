import * as xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const workbook = xlsx.readFile(path.join(__dirname, 'raw-data', 'Base_Datos_Habilidades_Resident_Evil.xlsx'));
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  fs.writeFileSync(path.join(__dirname, 'raw-data', 'habilidades_dump.json'), JSON.stringify(data, null, 2));
  console.log('Successfully wrote to scripts/raw-data/habilidades_dump.json');
} catch (e) {
  console.error('Error reading excel:', e);
}
