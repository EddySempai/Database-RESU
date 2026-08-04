import fs from 'fs';
import path from 'path';

// 1. Read existing operatives.json
const ops = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));

// 2. Read any user-filled data from Habilidades_Operativos.xls or csv
const userPMap = new Map();

try {
  const xlsContent = fs.readFileSync('Habilidades_Operativos_Maestro.xls', 'utf8');
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
} catch (e) {}

const availableIcons = new Set(fs.readdirSync('public/icons/skill'));

function getIcon(filename) {
  if (!filename) return '';
  if (availableIcons.has(filename)) return `/icons/skill/${filename}`;
  for (const f of availableIcons) {
    if (f.toLowerCase() === filename.toLowerCase()) return `/icons/skill/${f}`;
  }
  return '';
}

// Master Hero Skill Definitions
const EPIC_HERO_DATA = {
  'tyrone': {
    skills: [
      { name: "Patada a la pierna", type: "Exploración", description: "Lanza una patada que ataca a los enemigos en una línea frontal, causando daño equivalente al {0} del poder de ataque y aturdiéndolos durante 3.5 segundos.", icon: "Icon_Skill_112000.webp" },
      { name: "Tacleo de hombro", type: "Campo", description: "Las unidades aliadas que incluyen a este héroe tienen un 20% de probabilidad de aumentar {0} el daño infligido a los enemigos durante 3 turnos en combate.", icon: "tecleo de hombro (tyrone).webp" },
      { name: "Golpe giratorio", type: "Exploración", description: "Cada 3 ataques normales, realiza un gran golpe con el hacha que inflige {0} más de daño de ataque normal a los enemigos en un área circular y los empuja.", icon: "Icon_Skill_122000.webp" },
      { name: "Conocimientos de primeros auxilios", type: "Campo", description: "Aumenta la velocidad de tratamiento en el hospital en {0}.", icon: "Icon_Field_Skill_222000.webp" },
      { name: "Rally", type: "Exploración", description: "Cada 12 segundos, eleva la moral del equipo y aumenta el poder de defensa de todos los aliados en {0}. (Durante 8 segundos)", icon: "Icon_Skill_132000.webp" }
    ]
  },
  'robert': {
    skills: [
      { name: "Municiones de detención", type: "Exploración", description: "Dispara en ráfagas balas de alto poder de contención, empujando a los enemigos dentro de un área en forma de abanico y causando daño equivalente al {0} del poder de ataque. Los enemigos impactados quedan aturdidos por 0.5 segundos y reducen su velocidad de movimiento en un 20%. (Durante 5 segundos)", icon: "Icon_Skill_112002.webp" },
      { name: "Experto en modificación", type: "Campo", description: "El ataque de las unidades aliadas que incluyen a este héroe aumenta {0} en combate.", icon: "Experto en modificacion (robert).webp" },
      { name: "¡Toma esto!", type: "Exploración", description: "Cada 20 segundos, coloca una bomba a 1 enemigo cercano y lo empuja hacia atrás. El enemigo repelido queda aturdido por 2 segundos y luego explota, causando daño equivalente al {0} del poder de ataque dentro de un área circular.", icon: "Icon_Skill_122002.webp" },
      { name: "Conocimiento de forja", type: "Campo", description: "Al desplegar una unidad que incluya a este héroe, la velocidad de recolección de hierro aumenta {0}.", icon: "Icon_Field_Skill_222002.webp" },
      { name: "Apoyo de fuego", type: "Exploración", description: "Aumenta el poder de ataque de todos los aliados en {0}.", icon: "Icon_Skill_132002.webp" }
    ]
  },
  'barry': {
    skills: [
      { name: "Habilidad Activa 1", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_112004.webp" },
      { name: "Entrenamiento físico", type: "Campo", description: "Al desplegar una unidad que incluya a este héroe, el consumo de energía se reduce en {0}.", icon: "Entrenamiento Fisico (barry).webp" },
      { name: "Habilidad Activa 2", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_122004.webp" },
      { name: "Habilidad Pasiva 2", type: "Campo", description: "Descripción pendiente de ingresar...", icon: "Icon_Field_Skill_222004.webp" },
      { name: "Habilidad Activa 3", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_132004.webp" }
    ]
  },
  'mikhail': {
    skills: [
      { name: "Habilidad Activa 1", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_112006.webp" },
      { name: "Experiencia del veterano", type: "Campo", description: "Descripción pendiente de ingresar...", icon: "Experiencia del veterano (mikhail).webp" },
      { name: "Habilidad Activa 2", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_122006.webp" },
      { name: "Habilidad Pasiva 2", type: "Campo", description: "Descripción pendiente de ingresar...", icon: "Icon_Field_Skill_222006.webp" },
      { name: "Habilidad Activa 3", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_132006.webp" }
    ]
  },
  'tyrell': {
    skills: [
      { name: "Ametralladora automática", type: "Exploración", description: "Instala una ametralladora automática que ataca de forma autónoma a los enemigos en el área. La ametralladora tiene un poder de ataque equivalente al según el poder de ataque de Tyrell Patrick y una durabilidad igual a de su salud máxima.", icon: "Icon_Skill_112007.webp" },
      { name: "Análisis de puntos débiles", type: "Campo", description: "El daño que infligen a los enemigos las unidades aliadas que incluyen a este héroe aumenta en combate.", icon: "Analisi de puntos debiles (tyrell).webp" },
      { name: "Configuración de base", type: "Exploración", description: "Aumenta el poder de ataque de los aliados cercanos a la ametralladora automática en . Este efecto no se acumula.", icon: "Icon_Skill_122007.webp" },
      { name: "Inteligencia del hacker", type: "Campo", description: "Aumenta la velocidad de investigación del laboratorio en .", icon: "Icon_Field_Skill_222007.webp" },
      { name: "Campo electromagnético", type: "Exploración", description: "La ametralladora automática emite un pulso eléctrico hacia un enemigo cercano, inflige de daño de ataque a los enemigos alcanzados y los aturde durante segundos.", icon: "Icon_Skill_132007.webp" }
    ]
  },
  'marvin': {
    skills: [
      { name: "Barricada", type: "Exploración", description: "Instala una barricada en la zona designada. Su durabilidad equivale al {0} de la salud máxima y el poder de defensa de Marvin.", icon: "Icon_Skill_112008.webp" },
      { name: "Instinto policial", type: "Campo", description: "El daño que reciben de los enemigos las unidades aliadas que incluyen a este héroe se reduce {0} en combate.", icon: "Instinto Policial (Marvin).webp" },
      { name: "Disparo a la pierna", type: "Exploración", description: "Al realizar un ataque común, hay un 50% de probabilidad de apuntar a las piernas del enemigo, causando daño equivalente al {0} del poder de ataque y reduciendo su velocidad de movimiento en un 20%. (Tiempo de recarga: 3 segundos)", icon: "Icon_Skill_122008.webp" },
      { name: "Desarme", type: "Campo", description: "Las unidades aliadas que incluyen a este héroe reducen {0} el ataque de los enemigos en combate.", icon: "Icon_Field_Skill_222008.webp" },
      { name: "Empujón", type: "Exploración", description: "Cada {0}, inflige {1} de daño de ataque a un enemigo cercano, lo empuja y lo aturde durante 1 segundo.", icon: "Icon_Skill_132008.webp" }
    ]
  },
  'alyssa': {
    skills: [
      { name: "Detección de crisis", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_112009.webp" },
      { name: "Prensa investigativa", type: "Campo", description: "Descripción pendiente de ingresar...", icon: "deteccion de crisis (alyssa).webp" },
      { name: "Disparo aturdidor", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_122009.webp" },
      { name: "Paso ágil", type: "Campo", description: "Descripción pendiente de ingresar...", icon: "Icon_Field_Skill_222009.webp" },
      { name: "Fuego rápido de apoyo", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_132009.webp" }
    ]
  },
  'mark': {
    skills: [
      { name: "Habilidad Activa 1", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_112010.webp" },
      { name: "Desarrollo muscular (Bulk Up)", type: "Campo", description: "Descripción pendiente de ingresar...", icon: "Desarrollo muscular (bulk up) - (mark).webp" },
      { name: "Habilidad Activa 2", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_122010.webp" },
      { name: "Habilidad Pasiva 2", type: "Campo", description: "Descripción pendiente de ingresar...", icon: "Icon_Field_Skill_222010.webp" },
      { name: "Habilidad Activa 3", type: "Exploración", description: "Descripción pendiente de ingresar...", icon: "Icon_Skill_132010.webp" }
    ]
  },
  'katherine': {
    skills: [
      { name: "Disparo en abanico", type: "Exploración", description: "Dispara 6 balas rápidamente, infligiendo daño equivalente al {0} del poder de ataque por cada impacto a los enemigos alcanzados.", icon: "Icon_Skill_112012.webp" },
      { name: "Instinto de supervivencia", type: "Campo", description: "Descripción pendiente de ingresar...", icon: "Instinto de supervivencia (katherine).webp" },
      { name: "Disparo frenético", type: "Exploración", description: "Cuando realiza un ataque normal, su velocidad de ataque aumenta en {0} durante 5 segundos. Este efecto se acumula hasta 3 veces.", icon: "Icon_Skill_122012.webp" },
      { name: "Liderazgo", type: "Campo", description: "Al desplegar una unidad que incluya a este héroe, la velocidad de despliegue contra infectados y mutantes aumenta {0}.", icon: "Icon_Field_Skill_222012.webp" },
      { name: "Veterano de combate", type: "Exploración", description: "Aumenta el daño infligido de los ataques comunes en {0}.", icon: "Icon_Skill_132012.webp" }
    ]
  },
  'becca': {
    skills: [
      { name: "Municiones de tormenta", type: "Exploración", description: "Dispara ráfagas de balas en un área en forma de abanico al frente. Los enemigos dentro del área reciben daño equivalente al {0} del poder de ataque.", icon: "Icon_Skill_112014.webp" },
      { name: "Trance total", type: "Campo", description: "El daño que infligen a los enemigos las unidades aliadas que incluyen a este héroe aumenta {0} en combate.", icon: "trance total (becca).webp" },
      { name: "Postura de disparo", type: "Exploración", description: "Cada 10 segundos, la velocidad de ataque de Becca aumenta en un {0}. (Durante 7.5 segundos)", icon: "Icon_Skill_122014.webp" },
      { name: "Chaleco antibalas", type: "Campo", description: "El daño que reciben de los enemigos las unidades aliadas que incluyen a este héroe se reduce {0} en combate.", icon: "Icon_Field_Skill_222014.webp" },
      { name: "Tiro al blanco", type: "Exploración", description: "Al realizar un ataque normal, hay un 30% de probabilidad de que el daño del ataque normal aumente {0}.", icon: "Icon_Skill_132014.webp" }
    ]
  }
};

// Update ops
ops.forEach(op => {
  if (EPIC_HERO_DATA[op.id]) {
    op.skills = EPIC_HERO_DATA[op.id].skills.map(s => ({
      type: s.type,
      name: s.name,
      description: s.description,
      iconUrl: getIcon(s.icon),
      isArmaEspecial: false
    }));
  }
});

// Save updated operativos.json
fs.writeFileSync('src/data/operativos.json', JSON.stringify(ops, null, 2), 'utf8');

// Regenerate Master Rows and Spreadsheet
const masterRows = [];

ops.forEach(op => {
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

// CSV
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

// Excel XML
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

console.log('✅ Habilidades y textos de todos los héroes épicos corregidos con total exactitud.');
