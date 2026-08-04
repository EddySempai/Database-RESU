import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainStatsFile = path.join(__dirname, '..', 'src', 'data', 'operativos.json');
const extraStatsFile = path.join(__dirname, '..', 'src', 'data', 'extra_stats.json');

const mainStats = JSON.parse(fs.readFileSync(mainStatsFile, 'utf8'));
const extraStats = JSON.parse(fs.readFileSync(extraStatsFile, 'utf8'));

mainStats.forEach(op => {
  const extra = extraStats.find(e => e.name.toLowerCase() === op.name.toLowerCase());
  if (extra) {
    op.fieldStats = extra.fieldStats;
  }
});

fs.writeFileSync(mainStatsFile, JSON.stringify(mainStats, null, 2));
console.log('Merged extra stats into operativos.json');
