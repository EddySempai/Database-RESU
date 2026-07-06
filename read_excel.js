import * as xlsx from 'xlsx';
import fs from 'fs';

try {
  const workbook = xlsx.readFile('src/Base_Datos_Habilidades_Resident_Evil.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);

  fs.writeFileSync('src/habilidades_dump.json', JSON.stringify(data, null, 2));
  console.log('Successfully wrote to src/habilidades_dump.json');
} catch (e) {
  console.error('Error reading excel:', e);
}
