import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateJsonRarities = (filePath, lang) => {
  if (!fs.existsSync(filePath)) return;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  data.forEach(op => {
    if (op.name.includes('Brad Vickers') || op.name.includes('Murphy Seeker')) {
      if (lang === 'es') op.rarity = 'Común';
      else if (lang === 'en') op.rarity = 'Common';
      else if (lang === 'ja') op.rarity = 'コモン';
    } else {
      // Ensure others are Epic unless they are Legendary
      // Looking at original data, Leon, Claire, Chris, Ada, Hunk, Wesker etc are usually Epic or Legendary.
      // The user said "epicos (morados son casi todos... y dorados)".
      // Let's not downgrade Legendary to Epic if they are already Legendary.
      if (!op.rarity?.includes('Legen') && !op.rarity?.includes('レジェン')) {
        if (lang === 'es') op.rarity = 'Épico';
        else if (lang === 'en') op.rarity = 'Epic';
        else if (lang === 'ja') op.rarity = 'エピック';
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

updateJsonRarities(path.join(__dirname, 'src', 'data', 'operativos.json'), 'es');
updateJsonRarities(path.join(__dirname, 'src', 'locales', 'en', 'operativos.json'), 'en');
updateJsonRarities(path.join(__dirname, 'src', 'locales', 'ja', 'operativos.json'), 'ja');

console.log('Rarities updated in JSON files.');
