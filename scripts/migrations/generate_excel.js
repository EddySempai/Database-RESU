import fs from 'fs';
import path from 'path';

const operativesPath = path.resolve('src/data/operativos.json');
const iconsDir = path.resolve('public/icons/skill');

const operatives = JSON.parse(fs.readFileSync(operativesPath, 'utf8'));
const allIconFiles = fs.readdirSync(iconsDir);

// Helper to extract digits / code from icon filename
function extractIconDigits(filename) {
  if (!filename) return '';
  const base = path.basename(filename, path.extname(filename));
  // Match 6 digits like 113000, 221000
  const matchDigits = base.match(/\d{5,6}/);
  if (matchDigits) return matchDigits[0];
  
  // Match VIP
  const matchVip = base.match(/Vip_Skill_(\d+)/i);
  if (matchVip) return `VIP_${matchVip[1]}`;

  // Match Herb
  const matchHerb = base.match(/Herb_Skill_(.+)/i);
  if (matchHerb) return `Herb_${matchHerb[1]}`;

  return base;
}

const usedIcons = new Set();
const allRows = [];

// 1. Process all skills currently in operatives.json
operatives.forEach(op => {
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

    let iconFilename = '';
    let iconDigits = '';
    if (skill.iconUrl) {
      iconFilename = path.basename(skill.iconUrl);
      iconDigits = extractIconDigits(iconFilename);
      usedIcons.add(iconFilename.toLowerCase());
    }

    allRows.push({
      status: 'ASIGNADO',
      opId: op.id,
      opName: op.name,
      rarity: op.rarity || '',
      unitType: op.unitType || '',
      slot: `Habilidad ${idx + 1}`,
      skillName: skill.name || '',
      skillType: tipoDetallado,
      iconFile: iconFilename,
      iconDigits: iconDigits,
      isArmaEspecial: skill.isArmaEspecial ? 'SÍ' : 'NO',
      isVipSkill: skill.isVipSkill ? 'SÍ' : 'NO',
      description: skill.description || '',
      p1: '',
      p2: '',
      p3: '',
      p4: '',
      p5: '',
      notes: ''
    });
  });
});

// 2. Process all unused skill icons found in public/icons/skill
const unusedIcons = allIconFiles.filter(f => !usedIcons.has(f.toLowerCase()));

// Sort unused icons by digits
unusedIcons.sort((a, b) => a.localeCompare(b));

unusedIcons.forEach(iconFile => {
  const digits = extractIconDigits(iconFile);
  
  // Guess skill type from filename if possible
  let tipoGuess = 'Desconocido';
  if (iconFile.startsWith('Icon_Field_') || digits.startsWith('2')) {
    tipoGuess = 'Campo (Pasiva)';
  } else if (iconFile.startsWith('Icon_Skill_1') || digits.startsWith('1')) {
    tipoGuess = 'Exploración (Activa)';
  } else if (iconFile.includes('Vip')) {
    tipoGuess = 'VIP / Especial';
  } else if (iconFile.includes('Herb')) {
    tipoGuess = 'Hierba / Especial';
  }

  // Guess character name if embedded in filename (e.g. "Brad", "Barry", "Marvin")
  let charGuess = '[SIN PERSONAJE / DISPONIBLE]';
  const matchChar = iconFile.match(/\(([^)]+)\)/);
  if (matchChar) {
    charGuess = `[Pendiente: ${matchChar[1].trim()}]`;
  }

  allRows.push({
    status: 'SIN ASIGNAR (ÍCONO ENCONTRADO)',
    opId: '',
    opName: charGuess,
    rarity: '',
    unitType: '',
    slot: 'Por Definir',
    skillName: path.basename(iconFile, path.extname(iconFile)),
    skillType: tipoGuess,
    iconFile: iconFile,
    iconDigits: digits,
    isArmaEspecial: digits.startsWith('14') || digits.startsWith('24') ? 'Posible Arma Especial' : 'NO',
    isVipSkill: iconFile.includes('Vip') ? 'SÍ' : 'NO',
    description: '',
    p1: '',
    p2: '',
    p3: '',
    p4: '',
    p5: '',
    notes: 'Ícono disponible en public/icons/skill/'
  });
});

console.log(`Total habilidades asignadas: ${operatives.reduce((acc, o) => acc + (o.skills?.length || 0), 0)}`);
console.log(`Total íconos sin asignar encontrados: ${unusedIcons.length}`);
console.log(`Total general en la tabla: ${allRows.length}`);

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
allRows.forEach(r => {
  csvRows.push([
    r.status,
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

// Generate Excel XML (.xls)
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

allRows.forEach(r => {
  const isUnassigned = r.status.includes('SIN ASIGNAR');
  const styleAttr = isUnassigned ? ' ss:StyleID="PendingStyle"' : '';
  
  xmlRows.push(`
   <Row${styleAttr}>
     <Cell><Data ss:Type="String">${escapeXML(r.status)}</Data></Cell>
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
  <Style ss:ID="PendingStyle">
   <Interior ss:Color="#FFFDF0" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Todas_Las_Habilidades">
  <Table>
   <Column ss:Width="160"/>
   <Column ss:Width="90"/>
   <Column ss:Width="150"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="170"/>
   <Column ss:Width="140"/>
   <Column ss:Width="210"/>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="320"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Column ss:Width="200"/>
   ${xmlRows.join('')}
  </Table>
 </Worksheet>
</Workbook>`;

fs.writeFileSync('Habilidades_Operativos.xls', excelXML, 'utf8');
console.log('✅ Archivos actualizados exitosamente.');
