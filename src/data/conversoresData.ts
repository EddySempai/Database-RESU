// src/data/conversoresData.ts
// Datos oficiales y modelos para el Hub de Conversores Tácticos (resudb.com)

export type TreasureItemType = 'blueprint' | 'polish' | 'advancePolish' | 'goldFrag';

export interface TreasureItemMeta {
  id: TreasureItemType;
  name: string;
  nameEn: string;
  rarity: 'gold' | 'purple' | 'red';
  color: string;
  iconBg: string;
  description: string;
}

export const TREASURE_ITEMS: Record<TreasureItemType, TreasureItemMeta> = {
  blueprint: {
    id: 'blueprint',
    name: 'Plano de Tesoro (Blueprint)',
    nameEn: 'Treasure Blueprint',
    rarity: 'gold',
    color: '#f59e0b',
    iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    description: 'Material legendario para desbloquear y ascender tesoros míticos.'
  },
  polish: {
    id: 'polish',
    name: 'Pulidor de Tesoro (Polish)',
    nameEn: 'Treasure Polish',
    rarity: 'purple',
    color: '#a855f7',
    iconBg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    description: 'Compuesto refinador utilizado en mejoras intermedias de artefactos.'
  },
  advancePolish: {
    id: 'advancePolish',
    name: 'Pulidor Avanzado (Advance Polish)',
    nameEn: 'Advance Polish',
    rarity: 'red',
    color: '#ef4444',
    iconBg: 'bg-red-500/20 border-red-500/40 text-red-300',
    description: 'Material mítico supremo requerido para los rangos más altos de Tesoro Mítico.'
  },
  goldFrag: {
    id: 'goldFrag',
    name: 'Fragmento Dorado (Gold Frag)',
    nameEn: 'Gold Fragment',
    rarity: 'gold',
    color: '#eab308',
    iconBg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    description: 'Base fundamental de intercambio y ascensión de joyas y tesoros.'
  }
};

export interface TreasureExchangeRule {
  id: string;
  inputItem: TreasureItemType;
  outputItem: TreasureItemType;
  inputAmount: number;
  outputAmount: number;
  weeklyLimit: number; // Máximo de operaciones o de output por semana según el juego
  efficiencyNote: string;
}

// Matriz oficial extraída del datamine / wiki (Cheat Sheet R23-R30)
export const TREASURE_EXCHANGE_RULES: TreasureExchangeRule[] = [
  {
    id: 'bp_to_adv_polish',
    inputItem: 'blueprint',
    outputItem: 'advancePolish',
    inputAmount: 10,
    outputAmount: 1,
    weeklyLimit: 500,
    efficiencyNote: 'Ruta obligatoria para piezas de grado Mítico. Requiere 10 Planos por unidad.'
  },
  {
    id: 'bp_to_polish',
    inputItem: 'blueprint',
    outputItem: 'polish',
    inputAmount: 1,
    outputAmount: 3,
    weeklyLimit: 500,
    efficiencyNote: 'Otorga 3 Pulidores por Plano. Útil si te sobran planos y te falta pulidor para subir tiers.'
  },
  {
    id: 'bp_to_gold_frag',
    inputItem: 'blueprint',
    outputItem: 'goldFrag',
    inputAmount: 1,
    outputAmount: 300,
    weeklyLimit: 500,
    efficiencyNote: 'Rendimiento alto (300 Fragmentos por Plano). Mucho más eficiente que pasar por pulidor intermedio.'
  },
  {
    id: 'polish_to_bp',
    inputItem: 'polish',
    outputItem: 'blueprint',
    inputAmount: 10,
    outputAmount: 1,
    weeklyLimit: 50,
    efficiencyNote: 'Tasa con depreciación (10:1). Solo recomendado si necesitas urgentemente completar un plano para un ascenso.'
  },
  {
    id: 'polish_to_gold_frag',
    inputItem: 'polish',
    outputItem: 'goldFrag',
    inputAmount: 1,
    outputAmount: 50,
    weeklyLimit: 1000,
    efficiencyNote: 'Otorga 50 Fragmentos por unidad de Pulidor. Límite semanal generoso de 1,000 unidades.'
  },
  {
    id: 'gold_frag_to_bp',
    inputItem: 'goldFrag',
    outputItem: 'blueprint',
    inputAmount: 1000,
    outputAmount: 1,
    weeklyLimit: 50,
    efficiencyNote: 'Costo elevado (1,000 Fragmentos por Plano) pero excelente para quemar excedente masivo de oro en planos escasos.'
  },
  {
    id: 'gold_frag_to_polish',
    inputItem: 'goldFrag',
    outputItem: 'polish',
    inputAmount: 200,
    outputAmount: 1,
    weeklyLimit: 500,
    efficiencyNote: '200 Fragmentos por Pulidor. Mucho más económico que comprar planos primero para luego convertirlos en pulidor.'
  }
];

// --- SPEEDUPS / ACELERADORES ---

export type SpeedupCategory = 'universal' | 'building' | 'research' | 'training' | 'healing';

export interface SpeedupCategoryMeta {
  id: SpeedupCategory;
  name: string;
  nameEn: string;
  iconName: string;
  color: string;
  accent: string;
  badge: string;
  description: string;
}

export const SPEEDUP_CATEGORIES: Record<SpeedupCategory, SpeedupCategoryMeta> = {
  universal: {
    id: 'universal',
    name: 'Universal',
    nameEn: 'Universal',
    iconName: 'Zap',
    color: '#f97316',
    accent: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    description: 'Aplica a cualquier actividad (Construcción, Investigación, Tropa o Curación).'
  },
  building: {
    id: 'building',
    name: 'Construcción',
    nameEn: 'Building',
    iconName: 'Hammer',
    color: '#eab308',
    accent: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Exclusivo para subir Mansión, Alianza, Garaje, Barracones y edificios.'
  },
  research: {
    id: 'research',
    name: 'Investigación',
    nameEn: 'Research',
    iconName: 'FlaskConical',
    color: '#06b6d4',
    accent: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Exclusivo para tecnologías de Laboratorio y Árbol de Luminio.'
  },
  training: {
    id: 'training',
    name: 'Entrenamiento',
    nameEn: 'Training',
    iconName: 'Swords',
    color: '#ef4444',
    accent: 'border-red-500/40 bg-red-500/10 text-red-400',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    description: 'Esencial para Cumbre de Ases (Ace Summit) y reclutar tropas masivas.'
  },
  healing: {
    id: 'healing',
    name: 'Curación / Hospital',
    nameEn: 'Healing',
    iconName: 'HeartPulse',
    color: '#10b981',
    accent: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Vital para guerras SvS, Guerra de Hierbas y recuperación de bajas.'
  }
};

export interface SpeedupDenomination {
  minutes: number;
  label: string;
}

export const SPEEDUP_DENOMINATIONS: SpeedupDenomination[] = [
  { minutes: 1, label: '1m' },
  { minutes: 5, label: '5m' },
  { minutes: 15, label: '15m' },
  { minutes: 30, label: '30m' },
  { minutes: 60, label: '1h' },
  { minutes: 180, label: '3h' },
  { minutes: 480, label: '8h' },
  { minutes: 900, label: '15h' },
  { minutes: 1440, label: '24h' },
  { minutes: 4320, label: '3d' }
];

export interface FormattedDuration {
  days: number;
  hours: number;
  minutes: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  formattedString: string;
}

export function formatMinutesToDuration(totalMinutes: number): FormattedDuration {
  const days = Math.floor(totalMinutes / 1440);
  const remainingAfterDays = totalMinutes % 1440;
  const hours = Math.floor(remainingAfterDays / 60);
  const minutes = remainingAfterDays % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return {
    days,
    hours,
    minutes,
    totalMinutes,
    totalHours: Number((totalMinutes / 60).toFixed(2)),
    totalDays: Number((totalMinutes / 1440).toFixed(2)),
    formattedString: parts.join(' ')
  };
}

// --- RESOURCE BAGS / MOCHILA DE RECURSOS PROTEGIDOS ---

export type ResourceType = 'food' | 'wood' | 'iron' | 'oil' | 'choice';

export interface ResourceMeta {
  id: ResourceType;
  name: string;
  nameEn: string;
  icon: string;
  image?: string;
  color: string;
  badgeBg: string;
  borderColor: string;
}

export const RESOURCE_TYPES: Record<ResourceType, ResourceMeta> = {
  food: {
    id: 'food',
    name: 'Comida',
    nameEn: 'Food',
    icon: '🌾',
    image: '/recursos/Item_Food.webp',
    color: '#84cc16',
    badgeBg: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
    borderColor: '#84cc16'
  },
  wood: {
    id: 'wood',
    name: 'Madera',
    nameEn: 'Wood',
    icon: '🪵',
    image: '/recursos/Item_Wood.webp',
    color: '#d97706',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: '#d97706'
  },
  iron: {
    id: 'iron',
    name: 'Hierro',
    nameEn: 'Iron',
    icon: '⛓️',
    image: '/recursos/Item_Iron.webp',
    color: '#94a3b8',
    badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    borderColor: '#94a3b8'
  },
  oil: {
    id: 'oil',
    name: 'Petróleo',
    nameEn: 'Oil',
    icon: '🛢️',
    image: '/recursos/Item_Oil.webp',
    color: '#38bdf8',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: '#38bdf8'
  },
  choice: {
    id: 'choice',
    name: 'Maletín Selección (Cualquiera)',
    nameEn: 'Resource Choice Chest',
    icon: '🎁',
    color: '#a855f7',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: '#a855f7'
  }
};

export interface ResourceDenomination {
  amount: number;
  label: string;
}

export const RESOURCE_DENOMINATIONS: ResourceDenomination[] = [
  { amount: 1_000, label: '1K' },
  { amount: 10_000, label: '10K' },
  { amount: 50_000, label: '50K' },
  { amount: 150_000, label: '150K' },
  { amount: 500_000, label: '500K' },
  { amount: 1_500_000, label: '1.5M' },
  { amount: 5_000_000, label: '5M' }
];

export function formatResourceNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

// --- LUMINIO CONVERTER ---

export const LUMINIO_POWDER_TO_STONE_RATIO = 1.3;

export function convertPowderToStones(powder: number): { stones: number; exact: number } {
  const exact = powder / LUMINIO_POWDER_TO_STONE_RATIO;
  return {
    stones: Math.floor(exact),
    exact: Number(exact.toFixed(2))
  };
}

export function convertStonesToPowder(stones: number): { powder: number; exact: number } {
  const exact = stones * LUMINIO_POWDER_TO_STONE_RATIO;
  return {
    powder: Math.round(exact),
    exact: Number(exact.toFixed(2))
  };
}

// Cajas estándar de Luminio
export const LUMINIO_BOX_PRESETS = [50, 100, 250, 500, 1000, 2500, 5000];
