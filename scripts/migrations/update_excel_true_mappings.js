import fs from 'fs';
import path from 'path';

const ops = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));

// Build Master Rows
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
      p1: '',
      p2: '',
      p3: '',
      p4: '',
      p5: '',
      notes: ''
    });
  });
});

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

console.log('✅ Archivos Excel y CSV actualizados.');
