import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureKeys = (lang) => {
  const p = path.join(__dirname, '..', 'src', 'locales', lang, 'translation.json');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  if (!data.op_detail) data.op_detail = {};
  
  if (lang === 'es') {
    data.op_detail.rarity_desc_1 = 'Este operativo es de rareza';
    data.op_detail.rarity_desc_2 = ', por lo que dispone de';
    data.op_detail.rarity_desc_3 = ' habilidades activas y pasivas en total. (Datos específicos de habilidad se añadirán pronto).';
  } else if (lang === 'en') {
    data.op_detail.rarity_desc_1 = 'This operative is of';
    data.op_detail.rarity_desc_2 = ' rarity, therefore they have';
    data.op_detail.rarity_desc_3 = ' active and passive skills in total. (Specific skill data will be added soon).';
  } else if (lang === 'ja') {
    data.op_detail.rarity_desc_1 = 'このオペレーターのレアリティは';
    data.op_detail.rarity_desc_2 = 'です。合計';
    data.op_detail.rarity_desc_3 = 'のパッシブスキルおよびアクティブスキルを持っています。（詳細は後日追加予定）。';
  }
  
  // also check comparador.skill_archives
  if (!data.comparador) data.comparador = {};
  if (lang === 'es') data.comparador.skill_archives = 'Archivos de Habilidad';
  if (lang === 'en') data.comparador.skill_archives = 'Skill Archives';
  if (lang === 'ja') data.comparador.skill_archives = 'スキルアーカイブ';
  
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

ensureKeys('es');
ensureKeys('en');
ensureKeys('ja');
console.log('Ensured rarity_desc and skill_archives keys.');
