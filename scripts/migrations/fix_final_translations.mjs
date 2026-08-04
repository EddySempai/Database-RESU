import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replaceInFile = (filePath, searchReplaceList) => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of searchReplaceList) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
};

// 1. Fix Operativos.tsx
const opsPath = path.join(__dirname, '..', 'src', 'pages', 'Operativos.tsx');
replaceInFile(opsPath, [
  [
    `const getUnitIcon = (type: string) => {
  switch(type) {
    case 'Defensor': return <Shield size={14} />;
    case 'Atacante': return <Sword size={14} />;
    case 'Ranger': return <Crosshair size={14} />;
    default: return null;
  }
};`,
    `const isDefender = (type: string) => type?.toLowerCase().includes('defen') || type?.includes('ディフェン');
const isAttacker = (type: string) => type?.toLowerCase().includes('atac') || type?.toLowerCase().includes('attack') || type?.includes('アタッカー');
const isRanger = (type: string) => type?.toLowerCase().includes('rang') || type?.includes('レンジャー');
const isLegendary = (rarity: string) => rarity?.toLowerCase().includes('legen') || rarity?.includes('レジェン');

const getUnitIcon = (type: string) => {
  if (isDefender(type)) return <Shield size={14} />;
  if (isAttacker(type)) return <Sword size={14} />;
  if (isRanger(type)) return <Crosshair size={14} />;
  return null;
};`
  ],
  [
    `const getUnitColor = (type: string) => {
  switch(type) {
    case 'Defensor': return 'text-blue-400 bg-blue-900/40 border-blue-500/50';
    case 'Atacante': return 'text-blood-red bg-blood-red/20 border-blood-red/50';
    case 'Ranger': return 'text-green-400 bg-green-900/40 border-green-500/50';
    default: return 'text-gray-400 bg-gray-800 border-gray-600';
  }
};`,
    `const getUnitColor = (type: string) => {
  if (isDefender(type)) return 'text-blue-400 bg-blue-900/40 border-blue-500/50';
  if (isAttacker(type)) return 'text-blood-red bg-blood-red/20 border-blood-red/50';
  if (isRanger(type)) return 'text-green-400 bg-green-900/40 border-green-500/50';
  return 'text-gray-400 bg-gray-800 border-gray-600';
};`
  ],
  [
    `{['Todos', 'Atacante', 'Defensor', 'Ranger'].map(type => (`,
    `{['Todos', ...Array.from(new Set(operativosData.map((o:any) => o.unitType).filter(t => t && !t.includes('Desconocido') && !t.includes('Unknown') && !t.includes('不明'))))].map(type => (`
  ],
  [
    `{['Todos', 'Legendario', 'Épico'].map(rarity => (`,
    `{['Todos', ...Array.from(new Set(operativosData.map((o:any) => getRarity(o))))].map(rarity => (`
  ],
  [
    `op.rarity === 'Legendario'`,
    `isLegendary(op.rarity)`
  ],
  [
    `op.rarity === 'Legendario'`,
    `isLegendary(op.rarity)`
  ]
]);

// 2. Fix OperativoDetalle.tsx
const opDetallePath = path.join(__dirname, '..', 'src', 'pages', 'OperativoDetalle.tsx');
replaceInFile(opDetallePath, [
  [
    `const getUnitIcon = (type: string) => {
  switch(type) {
    case 'Defensor': return <Shield size={14} />;
    case 'Atacante': return <Sword size={14} />;
    case 'Ranger': return <Crosshair size={14} />;
    default: return null;
  }
};`,
    `const isDefender = (type: string) => type?.toLowerCase().includes('defen') || type?.includes('ディフェン');
const isAttacker = (type: string) => type?.toLowerCase().includes('atac') || type?.toLowerCase().includes('attack') || type?.includes('アタッカー');
const isRanger = (type: string) => type?.toLowerCase().includes('rang') || type?.includes('レンジャー');
const isLegendary = (rarity: string) => rarity?.toLowerCase().includes('legen') || rarity?.includes('レジェン');

const getUnitIcon = (type: string) => {
  if (isDefender(type)) return <Shield size={14} />;
  if (isAttacker(type)) return <Sword size={14} />;
  if (isRanger(type)) return <Crosshair size={14} />;
  return null;
};`
  ],
  [
    `const getUnitColor = (type: string) => {
  switch(type) {
    case 'Defensor': return 'text-blue-400 bg-blue-900/40 border-blue-500/50';
    case 'Atacante': return 'text-blood-red bg-blood-red/20 border-blood-red/50';
    case 'Ranger': return 'text-green-400 bg-green-900/40 border-green-500/50';
    default: return 'text-gray-400 bg-gray-800 border-gray-600';
  }
};`,
    `const getUnitColor = (type: string) => {
  if (isDefender(type)) return 'text-blue-400 bg-blue-900/40 border-blue-500/50';
  if (isAttacker(type)) return 'text-blood-red bg-blood-red/20 border-blood-red/50';
  if (isRanger(type)) return 'text-green-400 bg-green-900/40 border-green-500/50';
  return 'text-gray-400 bg-gray-800 border-gray-600';
};`
  ]
]);

// 3. Fix ComingSoon.tsx (Restricted Area)
const comingSoonPath = path.join(__dirname, '..', 'src', 'pages', 'ComingSoon.tsx');
let comingSoonContent = fs.readFileSync(comingSoonPath, 'utf8');
if (!comingSoonContent.includes('useTranslation')) {
  comingSoonContent = comingSoonContent.replace(
    `import { Lock, ChevronLeft } from 'lucide-react';`,
    `import { Lock, ChevronLeft } from 'lucide-react';\nimport { useTranslation } from 'react-i18next';`
  );
  comingSoonContent = comingSoonContent.replace(
    `const ComingSoon = () => {`,
    `const ComingSoon = () => {\n  const { t } = useTranslation();`
  );
  comingSoonContent = comingSoonContent.replace(
    `ÁREA <span className="text-neon-red">RESTRINGIDA</span>`,
    `{t('common.restricted')} <span className="text-neon-red">{t('common.area')}</span>`
  );
  comingSoonContent = comingSoonContent.replace(
    `ESTA SECCIÓN DE LA BASE DE DATOS SE ENCUENTRA ACTUALMENTE EN CONSTRUCCIÓN O REQUIERE UN NIVEL DE AUTORIZACIÓN SUPERIOR. VUELVE PRONTO PARA NUEVAS ACTUALIZACIONES.`,
    `{t('common.restricted_desc')}`
  );
  comingSoonContent = comingSoonContent.replace(
    `<ChevronLeft size={18} /> VOLVER AL INICIO`,
    `<ChevronLeft size={18} /> {t('common.back_home')}`
  );
  fs.writeFileSync(comingSoonPath, comingSoonContent, 'utf8');
}

// 4. Fix Comparador.tsx static texts
const compPath = path.join(__dirname, '..', 'src', 'pages', 'Comparador.tsx');
replaceInFile(compPath, [
  [
    `ANÁLISIS <span className="text-neon-red">COMPARATIVO</span>`,
    `{t('comparador.analysis')} <span className="text-neon-red">{t('comparador.comparative')}</span>`
  ],
  [
    `SIMULACIÓN DE COMBATE DIRECTO. SOLO OPERATIVOS DE LA MISMA CLASE TÁCTICA SON ELEGIBLES PARA COMPARACIÓN.`,
    `{t('comparador.sim_desc')}`
  ],
  [
    `SELECCIONAR OPERATIVO`,
    `{t('comparador.select_op')}`
  ],
  [
    `SELECCIONAR OPERATIVO`,
    `{t('comparador.select_op')}`
  ]
]);

// 5. Add translations to locales
const addTranslations = (lang, newKeys) => {
  const p = path.join(__dirname, '..', 'src', 'locales', lang, 'translation.json');
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const [key, value] of Object.entries(newKeys)) {
      const parts = key.split('.');
      let current = data;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    }
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  }
};

addTranslations('es', {
  'op_detail.rarity_info': 'Este operativo es de rareza <span className="text-white font-mono">{{rarity}}</span>, por lo que dispone de <span className="text-neon-red font-bold font-mono">{{maxSkills}}</span> habilidades activas y pasivas en total. (Datos específicos de habilidad se añadirán pronto).',
  'common.restricted': 'ÁREA',
  'common.area': 'RESTRINGIDA',
  'common.restricted_desc': 'ESTA SECCIÓN DE LA BASE DE DATOS SE ENCUENTRA ACTUALMENTE EN CONSTRUCCIÓN O REQUIERE UN NIVEL DE AUTORIZACIÓN SUPERIOR. VUELVE PRONTO PARA NUEVAS ACTUALIZACIONES.',
  'common.back_home': 'VOLVER AL INICIO'
});

addTranslations('en', {
  'op_detail.rarity_info': 'This operative is of <span className="text-white font-mono">{{rarity}}</span> rarity, therefore they have <span className="text-neon-red font-bold font-mono">{{maxSkills}}</span> active and passive skills in total. (Specific skill data will be added soon).',
  'common.restricted': 'RESTRICTED',
  'common.area': 'AREA',
  'common.restricted_desc': 'THIS SECTION OF THE DATABASE IS CURRENTLY UNDER CONSTRUCTION OR REQUIRES A HIGHER CLEARANCE LEVEL. CHECK BACK LATER FOR UPDATES.',
  'common.back_home': 'BACK TO HOME'
});

addTranslations('ja', {
  'op_detail.rarity_info': 'このオペレーターのレアリティは<span className="text-white font-mono">{{rarity}}</span>です。合計<span className="text-neon-red font-bold font-mono">{{maxSkills}}</span>のパッシブスキルおよびアクティブスキルを持っています。（詳細は後日追加予定）。',
  'common.restricted': '制限',
  'common.area': 'エリア',
  'common.restricted_desc': 'データベースのこのセクションは現在構築中であるか、より高いアクセス権限が必要です。今後の更新をお待ちください。',
  'common.back_home': 'ホームに戻る'
});

console.log('Final fixes applied successfully.');
