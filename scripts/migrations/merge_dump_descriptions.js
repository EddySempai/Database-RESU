import fs from 'fs';

const ops = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));
const dump = JSON.parse(fs.readFileSync('scripts/raw-data/habilidades_dump.json', 'utf8'));

// Dump headers: ['Personaje', 'Rareza', 'Tipo de Habilidad', 'Nombre Habilidad', 'Nivel', 'Descripción', 'Estado']
const dumpRows = dump.slice(1);

// Map of hero name to id
const HERO_NAME_TO_ID = {
  'leon s. kennedy': 'leon',
  'leon': 'leon',
  'claire redfield': 'claire',
  'claire': 'claire',
  'carlos oliveira': 'carlos',
  'carlos': 'carlos',
  'ada wong': 'ada',
  'ada': 'ada',
  'jill valentine': 'jill',
  'jill': 'jill',
  'chris redfield': 'chris',
  'chris': 'chris',
  'rebecca chambers': 'rebecca',
  'rebecca': 'rebecca',
  'billy coen': 'billy',
  'billy': 'billy',
  'jack krauser': 'jack',
  'jack': 'jack',
  'luis serra navarro': 'luis',
  'luis': 'luis',
  'ashley graham': 'ashley',
  'ashley': 'ashley',
  'jake muller': 'jake',
  'jake': 'jake',
  'sherry birkin': 'sherry',
  'sherry': 'sherry',
  'piers nivans': 'piers',
  'piers': 'piers',
  'cazador': 'cazador',
  'cazador (rathalos)': 'cazador',
  'cazadora': 'cazadora',
  'cazadora (rathalos)': 'cazadora',
  'tyrone henry': 'tyrone',
  'tyrone': 'tyrone',
  'marvin branagh': 'marvin',
  'marvin': 'marvin',
  'robert kendo': 'robert',
  'robert': 'robert',
  'becca woolett': 'becca',
  'becca woollett': 'becca',
  'becca': 'becca',
  'barry burton': 'barry',
  'barry': 'barry',
  'tyrell patrick': 'tyrell',
  'tyrell': 'tyrell',
  'mikhail victor': 'mikhail',
  'mikhail': 'mikhail',
  'katherine warren': 'katherine',
  'katherine': 'katherine',
  'mark wilkins': 'mark',
  'mark': 'mark',
  'alyssa ashcroft': 'alyssa',
  'alyssa': 'alyssa',
  'murphy seeker': 'murphy',
  'murphy': 'murphy',
  'brad vickers': 'brad',
  'brad': 'brad'
};

function normalize(s) {
  return (s || '').toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

let matchedCount = 0;

dumpRows.forEach(r => {
  const heroRaw = r[0];
  const typeRaw = r[2];
  const skillNameRaw = r[3];
  const descRaw = r[5];

  if (!descRaw || descRaw.trim() === '' || descRaw.startsWith('Poder de Combate')) return;

  const heroId = HERO_NAME_TO_ID[heroRaw.toLowerCase().trim()];
  if (!heroId) return;

  const op = ops.find(o => o.id === heroId);
  if (!op || !op.skills) return;

  const normSkill = normalize(skillNameRaw);

  // Find matching skill in op
  let skill = op.skills.find(s => normalize(s.name) === normSkill);

  // If not found by name, try contains or partial match
  if (!skill) {
    skill = op.skills.find(s => normalize(s.name).includes(normSkill) || normSkill.includes(normalize(s.name)));
  }

  if (skill) {
    if (!skill.description || skill.description.includes('pendiente') || skill.description.length < descRaw.length) {
      skill.description = descRaw.trim();
      if (!skill.name || skill.name.startsWith('Habilidad')) {
        skill.name = skillNameRaw.trim();
      }
      matchedCount++;
    }
  }
});

console.log(`Matched and updated ${matchedCount} skill descriptions from dump!`);

fs.writeFileSync('src/data/operativos.json', JSON.stringify(ops, null, 2), 'utf8');
