import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '..', 'src', 'data', 'operativos.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.forEach(op => {
  if (op.fieldStats && op.fieldStats.length > 0) {
    const label = op.fieldStats[0].label.toLowerCase();
    if (label.includes('defensor')) {
      op.unitType = 'Defensor';
    } else if (label.includes('atacante')) {
      op.unitType = 'Atacante';
    } else if (label.includes('ranger') || label.includes('rango')) {
      op.unitType = 'Ranger';
    } else {
      op.unitType = 'Desconocido';
    }
  } else {
    op.unitType = 'Desconocido';
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Unit types derived and added to operativos.json');
