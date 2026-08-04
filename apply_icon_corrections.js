import fs from 'fs';
import path from 'path';

// 1. Read existing operatives.json
const ops = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));

// 2. Read any user-filled data from Habilidades_Operativos.xls or csv
const userPMap = new Map();

try {
  const xlsContent = fs.readFileSync('Habilidades_Operativos.xls', 'utf8');
  const rowRegex = /<Row[^>]*>([\s\S]*?)<\/Row>/g;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(xlsContent)) !== null) {
    const rowXml = rowMatch[1];
    const cells = [];
    const cellRegex = /<Cell[^>]*>(?:<Data[^>]*>([\s\S]*?)<\/Data>)?<\/Cell>/g;
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowXml)) !== null) {
      cells.push(cellMatch[1] || '');
    }
    if (cells.length > 13) {
      const opId = cells[1];
      const slot = cells[5];
      const p1 = cells[13];
      const p2 = cells[14];
      const p3 = cells[15];
      const p4 = cells[16];
      const p5 = cells[17];
      const notes = cells[18] || '';
      if (p1 || p2 || p3 || p4 || p5 || notes) {
        userPMap.set(`${opId}_${slot}`, { p1, p2, p3, p4, p5, notes });
      }
    }
  }
} catch (e) {
  console.log('Info user data:', e.message);
}

const availableIcons = new Set(fs.readdirSync('public/icons/skill'));

function getIcon(filename) {
  if (!filename) return '';
  if (availableIcons.has(filename)) return `/icons/skill/${filename}`;
  for (const f of availableIcons) {
    if (f.toLowerCase() === filename.toLowerCase()) return `/icons/skill/${f}`;
  }
  return '';
}

// Full Master Map of all Heroes and their Tier / Code number
const HERO_CONFIG = {
  // Legendary (Tier 3)
  'leon': { tier: 3, num: '000', name: 'Leon S. Kennedy', rarity: 'Legendario', unitType: 'Defensor', vip: 'Icon_Vip_Skill_02.webp' },
  'claire': { tier: 3, num: '001', name: 'Claire Redfield', rarity: 'Legendario', unitType: 'Atacante' },
  'carlos': { tier: 3, num: '002', name: 'Carlos Oliveira', rarity: 'Legendario', unitType: 'Defensor' },
  'ada': { tier: 3, num: '003', name: 'Ada Wong', rarity: 'Legendario', unitType: 'Atacante' },
  'jill': { tier: 3, num: '004', name: 'Jill Valentine', rarity: 'Legendario', unitType: 'Ranger', vip: 'Icon_Vip_Skill_01.webp' },
  'chris': { tier: 3, num: '005', name: 'Chris Redfield', rarity: 'Legendario', unitType: 'Defensor' },
  'rebecca': { tier: 3, num: '006', name: 'Rebecca Chambers', rarity: 'Legendario', unitType: 'Atacante' },
  'billy': { tier: 3, num: '007', name: 'Billy Coen', rarity: 'Legendario', unitType: 'Ranger' },
  'jack': { tier: 3, num: '008', name: 'Jack Krauser', rarity: 'Legendario', unitType: 'Defensor' },
  'luis': { tier: 3, num: '009', name: 'Luis Serra Navarro', rarity: 'Legendario', unitType: 'Atacante' },
  'ashley': { tier: 3, num: '010', name: 'Ashley Graham', rarity: 'Legendario', unitType: 'Ranger' },
  'jake': { tier: 3, num: '011', name: 'Jake Muller', rarity: 'Legendario', unitType: 'Defensor' },
  'sherry': { tier: 3, num: '012', name: 'Sherry Birkin', rarity: 'Legendario', unitType: 'Atacante' },
  'piers': { tier: 3, num: '013', name: 'Piers Nivans', rarity: 'Legendario', unitType: 'Ranger' },
  'cazador': { tier: 3, num: '014', name: 'Cazador (Rathalos)', rarity: 'Legendario', unitType: 'Defensor', vip: 'Icon_Vip_Skill_03.webp' },
  'cazadora': { tier: 3, num: '015', name: 'Cazadora (Rathalos)', rarity: 'Legendario', unitType: 'Ranger', vip: 'Icon_Vip_Skill_03.webp' },

  // Epic (Tier 2)
  'tyrone': { tier: 2, num: '000', name: 'Tyrone Henry', rarity: 'Épico', unitType: 'Defensor', namedSkill2: 'tecleo de hombro (tyrone).webp' },
  'robert': { tier: 2, num: '002', name: 'Robert Kendo', rarity: 'Épico', unitType: 'Defensor', namedSkill2: 'Experto en modificacion (robert).webp' },
  'barry': { tier: 2, num: '004', name: 'Barry Burton', rarity: 'Épico', unitType: 'Ranger', namedSkill2: 'Entrenamiento Fisico (barry).webp' },
  'mikhail': { tier: 2, num: '006', name: 'Mikhail Victor', rarity: 'Épico', unitType: 'Atacante', namedSkill2: 'Experiencia del veterano (mikhail).webp' },
  'tyrell': { tier: 2, num: '007', name: 'Tyrell Patrick', rarity: 'Épico', unitType: 'Ranger', namedSkill2: 'Analisi de puntos debiles (tyrell).webp' },
  'marvin': { tier: 2, num: '008', name: 'Marvin Branagh', rarity: 'Épico', unitType: 'Defensor', namedSkill2: 'Instinto Policial (Marvin).webp' },
  'alyssa': { tier: 2, num: '009', name: 'Alyssa Ashcroft', rarity: 'Épico', unitType: 'Ranger', namedSkill2: 'deteccion de crisis (alyssa).webp' },
  'mark': { tier: 2, num: '010', name: 'Mark Wilkins', rarity: 'Épico', unitType: 'Defensor', namedSkill2: 'Desarrollo muscular (bulk up) - (mark).webp' },
  'katherine': { tier: 2, num: '012', name: 'Katherine Warren', rarity: 'Épico', unitType: 'Atacante', namedSkill2: 'Instinto de supervivencia (katherine).webp' },
  'becca': { tier: 2, num: '014', name: 'Becca Woolett', rarity: 'Épico', unitType: 'Ranger', namedSkill2: 'trance total (becca).webp' },

  // Common (Tier 1)
  'murphy': { tier: 1, num: '000', name: 'Murphy Seeker', rarity: 'Común', unitType: 'Atacante', customSlot1: 'Dios de la puntería (Murphy Seeker) .webp', customSlot2: 'Icon_Skill_111000.webp' },
  'brad': { tier: 1, num: '001', name: 'Brad Vickers', rarity: 'Común', unitType: 'Ranger', namedSkill2: 'Contrataque inesperado (Brad) .webp' }
};

// Skill names definition for Tyrell Patrick
const TYRELL_SKILLS = [
  { name: "Ametralladora automática", type: "Exploración", description: "Instala una ametralladora automática que ataca de forma autónoma a los enemigos en el área. La ametralladora tiene un poder de ataque equivalente al según el poder de ataque de Tyrell Patrick y una durabilidad igual a de su salud máxima." },
  { name: "Análisis de puntos débiles", type: "Campo", description: "El daño que infligen a los enemigos las unidades aliadas que incluyen a este héroe aumenta en combate." },
  { name: "Configuración de base", type: "Exploración", description: "Aumenta el poder de ataque de los aliados cercanos a la ametralladora automática en . Este efecto no se acumula." },
  { name: "Inteligencia del hacker", type: "Campo", description: "Aumenta la velocidad de investigación del laboratorio en ." },
  { name: "Campo electromagnético", type: "Exploración", description: "La ametralladora automática emite un pulso eléctrico hacia un enemigo cercano, inflige de daño de ataque a los enemigos alcanzados y los aturde durante segundos." }
];

// Reconstruct skills for every operative with verified icons
ops.forEach(op => {
  const cfg = HERO_CONFIG[op.id];
  if (!cfg) return;

  if (op.id === 'tyrell') {
    op.skills = TYRELL_SKILLS.map((s, idx) => {
      let icon = '';
      if (idx === 0) icon = getIcon('Icon_Skill_112007.webp');
      if (idx === 1) icon = getIcon('Analisi de puntos debiles (tyrell).webp');
      if (idx === 2) icon = getIcon('Icon_Skill_122007.webp');
      if (idx === 3) icon = getIcon('Icon_Field_Skill_222007.webp');
      if (idx === 4) icon = getIcon('Icon_Skill_132007.webp');
      return {
        type: s.type,
        name: s.name,
        description: s.description,
        iconUrl: icon,
        isArmaEspecial: false
      };
    });
    return;
  }

  if (op.id === 'alyssa') {
    op.skills = [
      { type: 'Exploración', name: 'Detección de crisis', description: 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Skill_112009.webp'), isArmaEspecial: false },
      { type: 'Campo', name: 'Prensa investigativa', description: 'Descripción pendiente de ingresar...', iconUrl: getIcon('deteccion de crisis (alyssa).webp'), isArmaEspecial: false },
      { type: 'Exploración', name: 'Disparo aturdidor', description: 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Skill_122009.webp'), isArmaEspecial: false },
      { type: 'Campo', name: 'Paso ágil', description: 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Field_Skill_222009.webp'), isArmaEspecial: false },
      { type: 'Exploración', name: 'Fuego rápido de apoyo', description: 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Skill_132009.webp'), isArmaEspecial: false }
    ];
    return;
  }

  if (op.id === 'murphy') {
    op.skills = [
      { type: 'Exploración', name: 'Dios de la puntería', description: 'Apunta a las piernas de todos los enemigos dentro de un área en forma de abanico, infligiendo daño equivalente al {0} del poder de ataque y reduciendo su velocidad de movimiento en un 30%. (Durante 5 segundos)', iconUrl: getIcon('Dios de la puntería (Murphy Seeker) .webp'), isArmaEspecial: false },
      { type: 'Campo', name: 'Disparo decisivo', description: 'Cada 4 turnos, los atacantes aliados de la unidad con este héroe tienen {0} de probabilidad de aturdir al tipo de tropa objetivo durante 1 turno. (Máx. 3 intentos de aturdimiento por objetivo cada turno).', iconUrl: getIcon('Icon_Skill_111000.webp'), isArmaEspecial: false },
      { type: 'Exploración', name: 'Disparo a la cabeza', description: 'Cada 24 segundos, inflige daño equivalente al {0} del poder de ataque y aturde a los enemigos durante 2 segundos.', iconUrl: getIcon('Icon_Skill_121000.webp'), isArmaEspecial: false },
      { type: 'Campo', name: 'Habilidad de recolección', description: 'Al desplegar una unidad que incluya a este héroe, la velocidad de recolección de alimentos aumenta {0}.', iconUrl: getIcon('Icon_Field_Skill_221000.webp'), isArmaEspecial: false },
      { type: 'Exploración', name: 'Tiro penetrante', description: 'Cada 4 ataques normales, dispara un tiro penetrante que inflige {0} más de daño de ataque normal.', iconUrl: getIcon('Icon_Skill_131000.webp'), isArmaEspecial: false }
    ];
    return;
  }

  if (op.id === 'becca') {
    const existing = op.skills || [];
    op.skills = [
      { type: 'Exploración', name: existing[0]?.name || 'Habilidad Activa 1', description: existing[0]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Skill_112014.webp'), isArmaEspecial: false },
      { type: 'Campo', name: existing[1]?.name || 'Trance total', description: existing[1]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('trance total (becca).webp'), isArmaEspecial: false },
      { type: 'Exploración', name: existing[2]?.name || 'Habilidad Activa 2', description: existing[2]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Skill_122014.webp'), isArmaEspecial: false },
      { type: 'Campo', name: existing[3]?.name || 'Habilidad Pasiva 2', description: existing[3]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Field_Skill_222014.webp'), isArmaEspecial: false },
      { type: 'Exploración', name: existing[4]?.name || 'Habilidad Activa 3', description: existing[4]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Skill_132014.webp'), isArmaEspecial: false }
    ];
    return;
  }

  if (op.id === 'mikhail') {
    const existing = op.skills || [];
    op.skills = [
      { type: 'Exploración', name: existing[0]?.name || 'Habilidad Activa 1', description: existing[0]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Skill_112006.webp'), isArmaEspecial: false },
      { type: 'Campo', name: existing[1]?.name || 'Experiencia del veterano', description: existing[1]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('Experiencia del veterano (mikhail).webp'), isArmaEspecial: false },
      { type: 'Exploración', name: existing[2]?.name || 'Habilidad Activa 2', description: existing[2]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Skill_122006.webp'), isArmaEspecial: false },
      { type: 'Campo', name: existing[3]?.name || 'Habilidad Pasiva 2', description: existing[3]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Field_Skill_222006.webp'), isArmaEspecial: false },
      { type: 'Exploración', name: existing[4]?.name || 'Habilidad Activa 3', description: existing[4]?.description || 'Descripción pendiente de ingresar...', iconUrl: getIcon('Icon_Skill_132006.webp'), isArmaEspecial: false }
    ];
    return;
  }

  if (cfg.tier === 3) {
    let slot2Icon = getIcon(`Icon_Field_Skill_213${cfg.num}.webp`) || getIcon(`Icon_Skill_213${cfg.num}.webp`);
    if (cfg.num === '000') slot2Icon = getIcon('Disparo al punto debil (leon).webp') || slot2Icon;
    if (cfg.num === '001') slot2Icon = getIcon('Fuego de supresion (claire).webp') || slot2Icon;
    if (cfg.num === '002') slot2Icon = getIcon('Granada cegadora (carlos).webp') || slot2Icon;

    let slot4Icon = getIcon(`Icon_Field_Skill_223${cfg.num}.webp`) || getIcon(`Icon_Skill_223${cfg.num}.webp`);
    let slot6Icon = getIcon(`Icon_Field_Skill_233${cfg.num}.webp`) || getIcon(`Icon_Skill_233${cfg.num}.webp`);
    let slot7Icon = getIcon(`Icon_Skill_143${cfg.num}.webp`);
    let slot8Icon = getIcon(`Icon_Skill_243${cfg.num}.webp`);

    const standardSlots = [
      { slot: 1, type: 'Exploración', isArmaEspecial: false, isVip: false, icon: getIcon(`Icon_Skill_113${cfg.num}.webp`), defaultName: 'Habilidad Activa 1' },
      { slot: 2, type: 'Campo', isArmaEspecial: false, isVip: false, icon: slot2Icon, defaultName: 'Habilidad Pasiva 1' },
      { slot: 3, type: 'Exploración', isArmaEspecial: false, isVip: false, icon: getIcon(`Icon_Skill_123${cfg.num}.webp`), defaultName: 'Habilidad Activa 2' },
      { slot: 4, type: 'Campo', isArmaEspecial: false, isVip: false, icon: slot4Icon, defaultName: 'Habilidad Pasiva 2' },
      { slot: 5, type: 'Exploración', isArmaEspecial: false, isVip: false, icon: getIcon(`Icon_Skill_133${cfg.num}.webp`), defaultName: 'Habilidad Activa 3' },
      { slot: 6, type: 'Campo', isArmaEspecial: false, isVip: false, icon: slot6Icon, defaultName: 'Habilidad Pasiva 3' },
      { slot: 7, type: 'Exploración', isArmaEspecial: true, isVip: false, icon: slot7Icon, defaultName: 'Arma Especial (Activa)' },
      { slot: 8, type: 'Campo', isArmaEspecial: true, isVip: false, icon: slot8Icon, defaultName: 'Arma Especial (Pasiva)' },
    ];

    if (cfg.vip) {
      standardSlots.push({
        slot: 9,
        type: 'Campo',
        isArmaEspecial: false,
        isVip: true,
        icon: getIcon(cfg.vip),
        defaultName: 'Habilidad VIP'
      });
    }

    const existingSkills = op.skills || [];
    op.skills = standardSlots.map((def, idx) => {
      const existing = existingSkills[idx];
      return {
        type: existing?.type || def.type,
        name: existing?.name || def.defaultName,
        description: existing?.description || 'Descripción pendiente de ingresar...',
        iconUrl: def.icon || existing?.iconUrl || '',
        isArmaEspecial: def.isArmaEspecial,
        isVipSkill: def.isVip || existing?.isVipSkill || false
      };
    });

  } else if (cfg.tier === 2) {
    const slot2Icon = cfg.namedSkill2 ? getIcon(cfg.namedSkill2) : '';
    const standardSlots = [
      { slot: 1, type: 'Exploración', isArmaEspecial: false, icon: getIcon(`Icon_Skill_112${cfg.num}.webp`), defaultName: 'Habilidad Activa 1' },
      { slot: 2, type: 'Campo', isArmaEspecial: false, icon: slot2Icon, defaultName: 'Habilidad Pasiva 1' },
      { slot: 3, type: 'Exploración', isArmaEspecial: false, icon: getIcon(`Icon_Skill_122${cfg.num}.webp`), defaultName: 'Habilidad Activa 2' },
      { slot: 4, type: 'Campo', isArmaEspecial: false, icon: getIcon(`Icon_Field_Skill_222${cfg.num}.webp`), defaultName: 'Habilidad Pasiva 2' },
      { slot: 5, type: 'Exploración', isArmaEspecial: false, icon: getIcon(`Icon_Skill_132${cfg.num}.webp`), defaultName: 'Habilidad Activa 3' },
    ];

    const existingSkills = op.skills || [];
    op.skills = standardSlots.map((def, idx) => {
      const existing = existingSkills[idx];
      return {
        type: existing?.type || def.type,
        name: existing?.name || def.defaultName,
        description: existing?.description || 'Descripción pendiente de ingresar...',
        iconUrl: def.icon || existing?.iconUrl || '',
        isArmaEspecial: false
      };
    });

  } else if (cfg.tier === 1) {
    const slot1Icon = cfg.customSlot1 ? getIcon(cfg.customSlot1) : getIcon(`Icon_Skill_111${cfg.num}.webp`);
    const slot2Icon = cfg.customSlot2 ? getIcon(cfg.customSlot2) : (cfg.namedSkill2 ? getIcon(cfg.namedSkill2) : '');

    const standardSlots = [
      { slot: 1, type: 'Exploración', isArmaEspecial: false, icon: slot1Icon, defaultName: 'Habilidad Activa 1' },
      { slot: 2, type: 'Campo', isArmaEspecial: false, icon: slot2Icon, defaultName: 'Habilidad Pasiva 1' },
      { slot: 3, type: 'Exploración', isArmaEspecial: false, icon: getIcon(`Icon_Skill_121${cfg.num}.webp`), defaultName: 'Habilidad Activa 2' },
      { slot: 4, type: 'Campo', isArmaEspecial: false, icon: getIcon(`Icon_Field_Skill_221${cfg.num}.webp`), defaultName: 'Habilidad Pasiva 2' },
      { slot: 5, type: 'Exploración', isArmaEspecial: false, icon: getIcon(`Icon_Skill_131${cfg.num}.webp`), defaultName: 'Habilidad Activa 3' },
    ];

    const existingSkills = op.skills || [];
    op.skills = standardSlots.map((def, idx) => {
      const existing = existingSkills[idx];
      return {
        type: existing?.type || def.type,
        name: existing?.name || def.defaultName,
        description: existing?.description || 'Descripción pendiente de ingresar...',
        iconUrl: def.icon || existing?.iconUrl || '',
        isArmaEspecial: false
      };
    });
  }
});

// Save updated operativos.json
fs.writeFileSync('src/data/operativos.json', JSON.stringify(ops, null, 2), 'utf8');

// Build Master Rows
const masterRows = [];

ops.forEach(op => {
  const cfg = HERO_CONFIG[op.id];
  const skills = op.skills || [];
  
  skills.forEach((skill, idx) => {
    let tipoDetallado = skill.type || 'General';
    if (skill.isVipSkill) {
      tipoDetallado = 'VIP / Arma Especial';
    } else if (skill.isArmaEspecial) {
      tipoDetallado = `${skill.type || ''} (Arma Especial)`.trim();
    } else if (skill.type === 'Exploración') {
      tipoDetallado = 'Exploración (Activa)';
    } else if (skill.type === 'Campo') {
      tipoDetallado = 'Campo (Pasiva)';
    }

    const iconFile = skill.iconUrl ? path.basename(skill.iconUrl) : '';
    
    let digits = '';
    const matchDigits = iconFile.match(/\d{5,6}/);
    if (matchDigits) {
      digits = matchDigits[0];
    } else if (iconFile.includes('Vip_Skill_')) {
      digits = `VIP_${iconFile.match(/(\d+)/)?.[1] || '01'}`;
    } else if (iconFile) {
      digits = path.basename(iconFile, path.extname(iconFile));
    }

    const key = `${op.id}_Habilidad ${idx + 1}`;
    const userVals = userPMap.get(key) || { p1: '', p2: '', p3: '', p4: '', p5: '', notes: '' };

    masterRows.push({
      estado: 'HEROE ASIGNADO',
      opId: op.id,
      opName: op.name,
      rarity: op.rarity,
      unitType: op.unitType,
      slot: `Habilidad ${idx + 1}`,
      skillName: skill.name,
      skillType: tipoDetallado,
      iconFile: iconFile,
      iconDigits: digits,
      isArmaEspecial: skill.isArmaEspecial ? 'SÍ' : 'NO',
      isVipSkill: skill.isVipSkill ? 'SÍ' : 'NO',
      description: skill.description || '',
      p1: userVals.p1,
      p2: userVals.p2,
      p3: userVals.p3,
      p4: userVals.p4,
      p5: userVals.p5,
      notes: userVals.notes
    });
  });
});

// Generate CSV
const headers = [
  'Estado',
  'ID_Operativo',
  'Nombre_Personaje',
  'Rareza',
  'Tipo_Unidad',
  'Slot_Habilidad',
  'Nombre_Habilidad',
  'Tipo_Habilidad',
  'Nombre_Archivo_Icono',
  'Digitos_Icono',
  'Es_Arma_Especial',
  'Es_Habilidad_VIP',
  'Descripcion_Actual',
  'Porcentaje_Nivel_1',
  'Porcentaje_Nivel_2',
  'Porcentaje_Nivel_3',
  'Porcentaje_Nivel_4',
  'Porcentaje_Nivel_5_Max',
  'Notas_Efectos_Adicionales'
];

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

const csvRows = [headers.map(escapeCSV).join(';')];
masterRows.forEach(r => {
  csvRows.push([
    r.estado,
    r.opId,
    r.opName,
    r.rarity,
    r.unitType,
    r.slot,
    r.skillName,
    r.skillType,
    r.iconFile,
    r.iconDigits,
    r.isArmaEspecial,
    r.isVipSkill,
    r.description,
    r.p1,
    r.p2,
    r.p3,
    r.p4,
    r.p5,
    r.notes
  ].map(escapeCSV).join(';'));
});

fs.writeFileSync('Habilidades_Operativos.csv', '\uFEFF' + csvRows.join('\r\n'), 'utf8');

// Generate Excel XML
function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const xmlRows = [];

xmlRows.push(`
   <Row ss:StyleID="HeaderStyle">
     ${headers.map(h => `<Cell><Data ss:Type="String">${escapeXML(h.replace(/_/g, ' '))}</Data></Cell>`).join('')}
   </Row>
`);

masterRows.forEach(r => {
  xmlRows.push(`
   <Row>
     <Cell><Data ss:Type="String">${escapeXML(r.estado)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.opId)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.opName)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.rarity)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.unitType)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.slot)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.skillName)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.skillType)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.iconFile)}</Data></Cell>
     <Cell ss:StyleID="DigitsStyle"><Data ss:Type="String">${escapeXML(r.iconDigits)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.isArmaEspecial)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.isVipSkill)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.description)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.p1)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.p2)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.p3)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.p4)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.p5)}</Data></Cell>
     <Cell><Data ss:Type="String">${escapeXML(r.notes)}</Data></Cell>
   </Row>
  `);
});

const excelXML = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#990000"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#8B0000" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DigitsStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Consolas" x:Family="Modern" ss:Size="11" ss:Color="#990000" ss:Bold="1"/>
   <Interior ss:Color="#FFF5F5" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Habilidades_Por_Heroe">
  <Table>
   <Column ss:Width="130"/>
   <Column ss:Width="80"/>
   <Column ss:Width="160"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="180"/>
   <Column ss:Width="150"/>
   <Column ss:Width="230"/>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="340"/>
   <Column ss:Width="160"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="200"/>
   ${xmlRows.join('')}
  </Table>
 </Worksheet>
</Workbook>`;

fs.writeFileSync('Habilidades_Operativos_Maestro.xls', excelXML, 'utf8');
try {
  fs.writeFileSync('Habilidades_Operativos.xls', excelXML, 'utf8');
} catch (e) {}

console.log('✅ Corrección de íconos aplicada con éxito en todos los archivos.');
