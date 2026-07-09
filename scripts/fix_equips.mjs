import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replaceInFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
};

const equipPath = path.join(__dirname, '..', 'src', 'components', 'EquipamientoView.tsx');

replaceInFile(equipPath, [
  ['<span>Mat. Verde:</span>', '<span>{t(\'op_detail.mat_green\')}</span>'],
  ['<span>Mat. Morado:</span>', '<span>{t(\'op_detail.mat_purple\')}</span>'],
  ['<span>Arma Gris:</span>', '<span>{t(\'op_detail.gun_gray\')}</span>'],
  ['<span>Arma Verde:</span>', '<span>{t(\'op_detail.gun_green\')}</span>'],
  ['<span>Arma Azul:</span>', '<span>{t(\'op_detail.gun_blue\')}</span>'],
  ['<span>Arma Morada:</span>', '<span>{t(\'op_detail.gun_purple\')}</span>'],
  ['Equivalencias de EXP (Cualquiera de estas opciones te sirve):', '{t(\'op_detail.exp_equivalents\')}'],
  ['<span className="block font-mono text-xs text-gray-500 uppercase mb-1">Costo Total de Experiencia</span>', '<span className="block font-mono text-xs text-gray-500 uppercase mb-1">{t(\'op_detail.total_exp_cost\')}</span>'],
  ['<span className="block font-mono text-xs text-gray-500 uppercase mb-1">Costo Total Componentes (+)</span>', '<span className="block font-mono text-xs text-gray-500 uppercase mb-1">{t(\'op_detail.total_comp_cost\')}</span>']
]);

console.log("Fixed equipment translations.");
