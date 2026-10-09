export type PrestigeLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type BuildingId =
  | 'mansion'
  | 'lab'
  | 'barracks'
  | 'garage'
  | 'range'
  | 'command'
  | 'hospital'
  | 'alliance'
  | 'hero_center';

export interface BuildingLevelData {
  level: Exclude<PrestigeLevel, 0>; // 1..10 (Lumi Level 1 .. Lumi Level 10)
  stepCost: number; // "Per Level" / "Starting Cost" (Costo por cada una de las 5 sub-etapas)
  luminioCost: number; // "Total" / "Full Level Total" (Costo total del nivel completo)
  compositeCost: number; // "Luminium Composite" / "Composite Total" (Requerido desde P6 hasta P10)
  prerequisites: {
    buildingId: BuildingId;
    requiredLevel: PrestigeLevel;
  }[];
  unlockNote?: string;
}

export interface SettlementBuildingConfig {
  id: BuildingId;
  name: string;
  excelName: string;
  shortName: string;
  category: 'core' | 'troops' | 'support';
  sprite: string;
  description: string;
  // Coordenadas exactas (en %) sobre Territory_Ground.webp para el Mini-Mapa Interactivo
  mapPos: {
    x: number;
    y: number;
    widthPct: number;
  };
  levels: Record<Exclude<PrestigeLevel, 0>, BuildingLevelData>;
}

export const PRESTIGE_LABELS: Record<PrestigeLevel, string> = {
  0: 'Nv. 30 (Base)',
  1: 'P1 (Lumi 1)',
  2: 'P2 (Lumi 2)',
  3: 'P3 (Lumi 3)',
  4: 'P4 (Lumi 4)',
  5: 'P5 (Lumi 5)',
  6: 'P6 (Lumi 6)',
  7: 'P7 (Lumi 7)',
  8: 'P8 (Lumi 8)',
  9: 'P9 (Lumi 9)',
  10: 'P10 (Lumi 10)'
};

export const SHORT_PRESTIGE_LABELS: Record<PrestigeLevel, string> = {
  0: 'Nv.30',
  1: 'P1',
  2: 'P2',
  3: 'P3',
  4: 'P4',
  5: 'P5',
  6: 'P6',
  7: 'P7',
  8: 'P8',
  9: 'P9',
  10: 'P10'
};

/**
 * Marcos dorados oficiales según el rango de nivel de Mansión / Edificio:
 * - Luminium_Level01.webp: Niveles 1 a 3
 * - Luminium_Level02.webp: Niveles 4 a 5
 * - Luminium_Level03.webp: Niveles 6 a 8
 * - Luminium_Level04.webp: Niveles 9 a 10
 */
export const PRESTIGE_BADGE_ICONS: Record<Exclude<PrestigeLevel, 0>, string> = {
  1: '/edificios/Luminium_Level01.webp',
  2: '/edificios/Luminium_Level01.webp',
  3: '/edificios/Luminium_Level01.webp',
  4: '/edificios/Luminium_Level02.webp',
  5: '/edificios/Luminium_Level02.webp',
  6: '/edificios/Luminium_Level03.webp',
  7: '/edificios/Luminium_Level03.webp',
  8: '/edificios/Luminium_Level03.webp',
  9: '/edificios/Luminium_Level04.webp',
  10: '/edificios/Luminium_Level04.webp'
};

export const getPrestigeFrameUrl = (level: PrestigeLevel): string => {
  if (level <= 3) return '/edificios/Luminium_Level01.webp';
  if (level <= 5) return '/edificios/Luminium_Level02.webp';
  if (level <= 8) return '/edificios/Luminium_Level03.webp';
  return '/edificios/Luminium_Level04.webp';
};

const TRAINING_LEVELS: Record<Exclude<PrestigeLevel, 0>, BuildingLevelData> = {
  1: { level: 1, stepCost: 59, luminioCost: 295, compositeCost: 0, prerequisites: [] },
  2: { level: 2, stepCost: 71, luminioCost: 355, compositeCost: 0, prerequisites: [] },
  3: { level: 3, stepCost: 107, luminioCost: 535, compositeCost: 0, prerequisites: [] },
  4: { level: 4, stepCost: 126, luminioCost: 630, compositeCost: 0, prerequisites: [] },
  5: { level: 5, stepCost: 150, luminioCost: 750, compositeCost: 0, prerequisites: [] },
  6: { level: 6, stepCost: 180, luminioCost: 810, compositeCost: 50, prerequisites: [] },
  7: { level: 7, stepCost: 216, luminioCost: 972, compositeCost: 74, prerequisites: [] },
  8: { level: 8, stepCost: 216, luminioCost: 972, compositeCost: 110, prerequisites: [] },
  9: { level: 9, stepCost: 252, luminioCost: 1134, compositeCost: 158, prerequisites: [] },
  10: { level: 10, stepCost: 314, luminioCost: 1412, compositeCost: 374, prerequisites: [] }
};

export const SETTLEMENT_BUILDINGS: SettlementBuildingConfig[] = [
  {
    id: 'mansion',
    name: 'Mansión (Mansion)',
    excelName: 'Mansion',
    shortName: 'Mansión',
    category: 'core',
    sprite: '/edificios/UI_L_Headquarter_01.webp',
    description:
      'Edificio central del asentamiento. Define el nivel máximo de Luminio (P1–P10) de tus tropas y demás estructuras.',
    mapPos: { x: 50.2, y: 45.8, widthPct: 14.5 },
    levels: {
      1: {
        level: 1,
        stepCost: 132,
        luminioCost: 660,
        compositeCost: 0,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 0 },
          { buildingId: 'lab', requiredLevel: 0 }
        ],
        unlockNote: 'Desbloquea Lumi Level 1 (P1). Requiere Centro de Alianza Nv.30 y Laboratorio Nv.30.'
      },
      2: {
        level: 2,
        stepCost: 158,
        luminioCost: 790,
        compositeCost: 0,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 1 },
          { buildingId: 'range', requiredLevel: 1 }
        ],
        unlockNote: 'Desbloquea Lumi Level 2 (P2). Requiere Centro de Alianza P1 y Campo de Tiro P1.'
      },
      3: {
        level: 3,
        stepCost: 238,
        luminioCost: 1190,
        compositeCost: 0,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 2 },
          { buildingId: 'barracks', requiredLevel: 2 }
        ],
        unlockNote: 'Desbloquea Lumi Level 3 (P3). Requiere Centro de Alianza P2 y Cuartel de Infantería P2.'
      },
      4: {
        level: 4,
        stepCost: 280,
        luminioCost: 1400,
        compositeCost: 0,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 3 },
          { buildingId: 'garage', requiredLevel: 3 }
        ],
        unlockNote: 'Desbloquea Lumi Level 4 (P4). Requiere Centro de Alianza P3 y Taller Pesado P3.'
      },
      5: {
        level: 5,
        stepCost: 350,
        luminioCost: 1750,
        compositeCost: 0,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 4 },
          { buildingId: 'range', requiredLevel: 4 }
        ],
        unlockNote: 'Desbloquea Lumi Level 5 (P5). Requiere Centro de Alianza P4 y Campo de Tiro P4.'
      },
      6: {
        level: 6,
        stepCost: 400,
        luminioCost: 1800,
        compositeCost: 120,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 5 },
          { buildingId: 'barracks', requiredLevel: 5 }
        ],
        unlockNote: 'Desbloquea Lumi Level 6 (P6). Requiere Centro de Alianza P5 y Cuartel de Infantería P5.'
      },
      7: {
        level: 7,
        stepCost: 480,
        luminioCost: 2160,
        compositeCost: 180,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 6 },
          { buildingId: 'garage', requiredLevel: 6 }
        ],
        unlockNote: 'Desbloquea Lumi Level 7 (P7). Requiere Centro de Alianza P6 y Taller Pesado P6.'
      },
      8: {
        level: 8,
        stepCost: 480,
        luminioCost: 2160,
        compositeCost: 240,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 7 },
          { buildingId: 'range', requiredLevel: 7 }
        ],
        unlockNote: 'Desbloquea Lumi Level 8 (P8). Requiere Centro de Alianza P7 y Campo de Tiro P7.'
      },
      9: {
        level: 9,
        stepCost: 560,
        luminioCost: 2520,
        compositeCost: 360,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 8 },
          { buildingId: 'barracks', requiredLevel: 8 }
        ],
        unlockNote: 'Desbloquea Lumi Level 9 (P9). Requiere Centro de Alianza P8 y Cuartel de Infantería P8.'
      },
      10: {
        level: 10,
        stepCost: 700,
        luminioCost: 3150,
        compositeCost: 840,
        prerequisites: [
          { buildingId: 'alliance', requiredLevel: 9 },
          { buildingId: 'garage', requiredLevel: 9 }
        ],
        unlockNote: 'Desbloquea Lumi Level 10 (P10). Requiere Centro de Alianza P9 y Taller Pesado P9.'
      }
    }
  },
  {
    id: 'lab',
    name: 'Laboratorio de Luminio (Lumi Lab)',
    excelName: 'Lumi Lab',
    shortName: 'Lumi Lab',
    category: 'core',
    sprite: '/edificios/UI_L_Research_Lab_01.webp',
    description:
      'Requisito obligatorio para subir la Mansión en cada grado. Desbloquea investigaciones avanzadas de Luminio.',
    mapPos: { x: 47.0, y: 28.5, widthPct: 16.0 },
    levels: {
      1: { level: 1, stepCost: 71, luminioCost: 355, compositeCost: 0, prerequisites: [] },
      2: { level: 2, stepCost: 71, luminioCost: 355, compositeCost: 0, prerequisites: [] },
      3: { level: 3, stepCost: 107, luminioCost: 535, compositeCost: 0, prerequisites: [] },
      4: { level: 4, stepCost: 126, luminioCost: 630, compositeCost: 0, prerequisites: [] },
      5: { level: 5, stepCost: 150, luminioCost: 750, compositeCost: 0, prerequisites: [] },
      6: { level: 6, stepCost: 180, luminioCost: 810, compositeCost: 50, prerequisites: [] },
      7: { level: 7, stepCost: 216, luminioCost: 972, compositeCost: 74, prerequisites: [] },
      8: { level: 8, stepCost: 216, luminioCost: 988, compositeCost: 110, prerequisites: [] },
      9: { level: 9, stepCost: 252, luminioCost: 1134, compositeCost: 158, prerequisites: [] },
      10: { level: 10, stepCost: 314, luminioCost: 1412, compositeCost: 374, prerequisites: [] }
    }
  },
  {
    id: 'barracks',
    name: 'Cuartel de Infantería (Training #1)',
    excelName: 'Training (Infantería)',
    shortName: 'Infantería',
    category: 'troops',
    sprite: '/edificios/UI_L_Barracks_01.webp',
    description:
      'Uno de los 3 edificios de entrenamiento (Training). Mejora a los Defensores (Infantería / Escudo) de P1 a P10.',
    mapPos: { x: 31.2, y: 44.6, widthPct: 13.5 },
    levels: TRAINING_LEVELS
  },
  {
    id: 'garage',
    name: 'Taller Pesado (Training #2)',
    excelName: 'Training (Atacantes)',
    shortName: 'Atacantes',
    category: 'troops',
    sprite: '/edificios/UI_L_Garage_01.webp',
    description:
      'Uno de los 3 edificios de entrenamiento (Training). Mejora a los Atacantes (Armamento Pesado) de P1 a P10.',
    mapPos: { x: 39.2, y: 39.8, widthPct: 13.0 },
    levels: TRAINING_LEVELS
  },
  {
    id: 'range',
    name: 'Campo de Tiro (Training #3)',
    excelName: 'Training (Rangers)',
    shortName: 'Rangers',
    category: 'troops',
    sprite: '/edificios/UI_L_Range_01.webp',
    description:
      'Uno de los 3 edificios de entrenamiento (Training). Mejora a los Rangers (Tiradores / Rifles) de P1 a P10.',
    mapPos: { x: 23.2, y: 50.4, widthPct: 14.5 },
    levels: TRAINING_LEVELS
  },
  {
    id: 'alliance',
    name: 'Centro de Alianza (Alliance)',
    excelName: 'Alliance',
    shortName: 'Alliance',
    category: 'support',
    sprite: '/edificios/UI_L_AllianceCenter_01.webp',
    description:
      'Aumenta el límite de ayudas de alianza, capacidad de refuerzos aliados y bonificaciones cooperativas.',
    mapPos: { x: 75.5, y: 56.2, widthPct: 14.5 },
    levels: {
      1: { level: 1, stepCost: 33, luminioCost: 165, compositeCost: 0, prerequisites: [] },
      2: { level: 2, stepCost: 39, luminioCost: 195, compositeCost: 0, prerequisites: [] },
      3: { level: 3, stepCost: 59, luminioCost: 295, compositeCost: 0, prerequisites: [] },
      4: { level: 4, stepCost: 70, luminioCost: 350, compositeCost: 0, prerequisites: [] },
      5: { level: 5, stepCost: 83, luminioCost: 415, compositeCost: 0, prerequisites: [] },
      6: { level: 6, stepCost: 100, luminioCost: 450, compositeCost: 26, prerequisites: [] },
      7: { level: 7, stepCost: 120, luminioCost: 540, compositeCost: 38, prerequisites: [] },
      8: { level: 8, stepCost: 120, luminioCost: 540, compositeCost: 60, prerequisites: [] },
      9: { level: 9, stepCost: 140, luminioCost: 630, compositeCost: 86, prerequisites: [] },
      10: { level: 10, stepCost: 174, luminioCost: 782, compositeCost: 206, prerequisites: [] }
    }
  },
  {
    id: 'hero_center',
    name: 'Helipuerto / C. Héroes (Helipad)',
    excelName: 'Helipad',
    shortName: 'Helipad',
    category: 'support',
    sprite: '/edificios/UI_L_Hero_Center_01.webp',
    description:
      'Helipuerto táctico y Centro de Héroes. Incrementa las estadísticas de despliegue de tus operativos.',
    mapPos: { x: 62.0, y: 52.8, widthPct: 13.5 },
    levels: {
      1: { level: 1, stepCost: 33, luminioCost: 165, compositeCost: 0, prerequisites: [] },
      2: { level: 2, stepCost: 39, luminioCost: 195, compositeCost: 0, prerequisites: [] },
      3: { level: 3, stepCost: 59, luminioCost: 295, compositeCost: 0, prerequisites: [] },
      4: { level: 4, stepCost: 70, luminioCost: 350, compositeCost: 0, prerequisites: [] },
      5: { level: 5, stepCost: 83, luminioCost: 415, compositeCost: 0, prerequisites: [] },
      6: { level: 6, stepCost: 100, luminioCost: 450, compositeCost: 26, prerequisites: [] },
      7: { level: 7, stepCost: 120, luminioCost: 540, compositeCost: 38, prerequisites: [] },
      8: { level: 8, stepCost: 120, luminioCost: 540, compositeCost: 60, prerequisites: [] },
      9: { level: 9, stepCost: 140, luminioCost: 630, compositeCost: 86, prerequisites: [] },
      10: { level: 10, stepCost: 174, luminioCost: 782, compositeCost: 206, prerequisites: [] }
    }
  },
  {
    id: 'command',
    name: 'Centro de Mando (Command)',
    excelName: 'Command',
    shortName: 'Command',
    category: 'support',
    sprite: '/edificios/UI_L_Command_Center_01.webp',
    description:
      'Incrementa la capacidad de concentración (Rally) y el tamaño máximo de marcha de tus escuadrones.',
    mapPos: { x: 13.5, y: 41.2, widthPct: 14.5 },
    levels: {
      1: { level: 1, stepCost: 26, luminioCost: 130, compositeCost: 0, prerequisites: [{ buildingId: 'alliance', requiredLevel: 1 }] },
      2: { level: 2, stepCost: 31, luminioCost: 155, compositeCost: 0, prerequisites: [{ buildingId: 'alliance', requiredLevel: 2 }] },
      3: { level: 3, stepCost: 47, luminioCost: 235, compositeCost: 0, prerequisites: [{ buildingId: 'alliance', requiredLevel: 3 }] },
      4: { level: 4, stepCost: 56, luminioCost: 280, compositeCost: 0, prerequisites: [{ buildingId: 'alliance', requiredLevel: 4 }] },
      5: { level: 5, stepCost: 66, luminioCost: 330, compositeCost: 0, prerequisites: [{ buildingId: 'alliance', requiredLevel: 5 }] },
      6: { level: 6, stepCost: 80, luminioCost: 360, compositeCost: 24, prerequisites: [{ buildingId: 'alliance', requiredLevel: 6 }] },
      7: { level: 7, stepCost: 96, luminioCost: 432, compositeCost: 36, prerequisites: [{ buildingId: 'alliance', requiredLevel: 7 }] },
      8: { level: 8, stepCost: 96, luminioCost: 432, compositeCost: 48, prerequisites: [{ buildingId: 'alliance', requiredLevel: 8 }] },
      9: { level: 9, stepCost: 112, luminioCost: 504, compositeCost: 72, prerequisites: [{ buildingId: 'alliance', requiredLevel: 9 }] },
      10: { level: 10, stepCost: 140, luminioCost: 630, compositeCost: 168, prerequisites: [{ buildingId: 'alliance', requiredLevel: 10 }] }
    }
  },
  {
    id: 'hospital',
    name: 'Hospital Militar (Hospital)',
    excelName: 'Hospital',
    shortName: 'Hospital',
    category: 'support',
    sprite: '/edificios/UI_L_Hospital_01.webp',
    description:
      'Aumenta la capacidad máxima de camas para tropas heridas y la eficiencia médica en combate.',
    mapPos: { x: 26.8, y: 33.6, widthPct: 16.0 },
    levels: {
      1: { level: 1, stepCost: 26, luminioCost: 130, compositeCost: 0, prerequisites: [] },
      2: { level: 2, stepCost: 31, luminioCost: 155, compositeCost: 0, prerequisites: [] },
      3: { level: 3, stepCost: 47, luminioCost: 235, compositeCost: 0, prerequisites: [] },
      4: { level: 4, stepCost: 56, luminioCost: 280, compositeCost: 0, prerequisites: [] },
      5: { level: 5, stepCost: 66, luminioCost: 330, compositeCost: 0, prerequisites: [] },
      6: { level: 6, stepCost: 80, luminioCost: 360, compositeCost: 24, prerequisites: [] },
      7: { level: 7, stepCost: 96, luminioCost: 432, compositeCost: 36, prerequisites: [] },
      8: { level: 8, stepCost: 96, luminioCost: 432, compositeCost: 48, prerequisites: [] },
      9: { level: 9, stepCost: 112, luminioCost: 504, compositeCost: 72, prerequisites: [] },
      10: { level: 10, stepCost: 140, luminioCost: 630, compositeCost: 168, prerequisites: [] }
    }
  }
];

export interface BaseMansionLevel {
  level: number;
  timeFormatted: string;
  hours: number;
  food: number;
  wood: number;
  iron: number;
  oil: number;
  requirements: string;
  combatPower: number;
  powerGain: number;
}

export const formatResourceNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    const b = num / 1_000_000_000;
    return `${b % 1 === 0 ? b.toFixed(0) : b.toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toLocaleString();
};

export const formatHoursToDays = (hours: number): string => {
  if (hours <= 0) return '0h';
  const days = Math.floor(hours / 24);
  const remHours = Math.round(hours % 24);
  if (days === 0) return `${remHours}h`;
  if (remHours === 0) return `${days}d`;
  return `${days}d ${remHours}h`;
};

export const BASE_MANSION_LEVELS_1_TO_30: BaseMansionLevel[] = [
  { level: 1, timeFormatted: '0s', hours: 0, food: 0, wood: 0, iron: 0, oil: 0, requirements: 'Ninguno', combatPower: 2000, powerGain: 2000 },
  { level: 2, timeFormatted: '1s', hours: 0.0003, food: 180, wood: 750, iron: 0, oil: 0, requirements: 'Granja Nv.1', combatPower: 3800, powerGain: 1800 },
  { level: 3, timeFormatted: '15s', hours: 0.0042, food: 805, wood: 1000, iron: 0, oil: 0, requirements: 'Aserradero Nv.2', combatPower: 6500, powerGain: 2700 },
  { level: 4, timeFormatted: '30s', hours: 0.0083, food: 1800, wood: 1800, iron: 360, oil: 0, requirements: 'Almacén de Materiales Nv.3', combatPower: 10100, powerGain: 3600 },
  { level: 5, timeFormatted: '10m', hours: 0.17, food: 7600, wood: 7600, iron: 1500, oil: 0, requirements: 'Helipuerto Nv.1 + Granja Nv.3', combatPower: 15500, powerGain: 5400 },
  { level: 6, timeFormatted: '30m', hours: 0.5, food: 19000, wood: 19000, iron: 3800, oil: 960, requirements: 'Planta de Combustible Nv.5', combatPower: 23600, powerGain: 8100 },
  { level: 7, timeFormatted: '1h', hours: 1, food: 69000, wood: 69000, iron: 13000, oil: 3400, requirements: 'Helipuerto Nv.6 + Hospital Nv.1', combatPower: 35300, powerGain: 11700 },
  { level: 8, timeFormatted: '2h 30m', hours: 2.5, food: 120000, wood: 120000, iron: 25000, oil: 6300, requirements: 'Cuartel de Infantería Nv.7', combatPower: 47000, powerGain: 11700 },
  { level: 9, timeFormatted: '4h 30m', hours: 4.5, food: 260000, wood: 260000, iron: 52000, oil: 13000, requirements: 'Centro de Alianza Nv.8', combatPower: 58700, powerGain: 11700 },
  { level: 10, timeFormatted: '6h', hours: 6, food: 460000, wood: 460000, iron: 92000, oil: 23000, requirements: 'Taller Pesado Nv.9 + Laboratorio Nv.1', combatPower: 75700, powerGain: 17000 },
  { level: 11, timeFormatted: '7h 30m', hours: 7.5, food: 1300000, wood: 1300000, iron: 260000, oil: 65000, requirements: 'Centro de Alianza Nv.10 + Campo de Tiro Nv.10', combatPower: 92700, powerGain: 17000 },
  { level: 12, timeFormatted: '9h', hours: 9, food: 1600000, wood: 1600000, iron: 330000, oil: 84000, requirements: 'Centro de Alianza Nv.11 + Centro de Mando Nv.1', combatPower: 109700, powerGain: 17000 },
  { level: 13, timeFormatted: '11h', hours: 11, food: 2300000, wood: 2300000, iron: 470000, oil: 110000, requirements: 'Centro de Alianza Nv.12 + Cuartel de Infantería Nv.12', combatPower: 138400, powerGain: 28700 },
  { level: 14, timeFormatted: '14h', hours: 14, food: 3100000, wood: 3100000, iron: 630000, oil: 150000, requirements: 'Centro de Alianza Nv.13 + Taller Pesado Nv.13', combatPower: 167100, powerGain: 28700 },
  { level: 15, timeFormatted: '18h', hours: 18, food: 4600000, wood: 4600000, iron: 930000, oil: 230000, requirements: 'Centro de Alianza Nv.14 + Campo de Tiro Nv.14', combatPower: 195800, powerGain: 28700 },
  { level: 16, timeFormatted: '1d 6h 28m', hours: 30.5, food: 5900000, wood: 5900000, iron: 1100000, oil: 290000, requirements: 'Centro de Alianza Nv.15 + Laboratorio Nv.15', combatPower: 236200, powerGain: 40400 },
  { level: 17, timeFormatted: '1d 12h 34m', hours: 36.6, food: 9300000, wood: 9300000, iron: 1800000, oil: 460000, requirements: 'Centro de Alianza Nv.16 + Cuartel de Infantería Nv.16', combatPower: 276600, powerGain: 40400 },
  { level: 18, timeFormatted: '1d 19h 53m', hours: 43.9, food: 12000000, wood: 12000000, iron: 2500000, oil: 620000, requirements: 'Centro de Alianza Nv.17 + Taller Pesado Nv.17', combatPower: 317000, powerGain: 40400 },
  { level: 19, timeFormatted: '2d 17h 50m', hours: 65.8, food: 15000000, wood: 15000000, iron: 3100000, oil: 780000, requirements: 'Centro de Alianza Nv.18 + Campo de Tiro Nv.18', combatPower: 374400, powerGain: 57400 },
  { level: 20, timeFormatted: '3d 10h 18m', hours: 82.3, food: 21000000, wood: 21000000, iron: 4300000, oil: 1000000, requirements: 'Centro de Alianza Nv.19 + Laboratorio Nv.19', combatPower: 431800, powerGain: 57400 },
  { level: 21, timeFormatted: '4d 10h 59m', hours: 107.0, food: 27000000, wood: 27000000, iron: 5400000, oil: 1300000, requirements: 'Centro de Alianza Nv.20 + Cuartel de Infantería Nv.20', combatPower: 489200, powerGain: 57400 },
  { level: 22, timeFormatted: '6d 16h 29m', hours: 160.5, food: 36000000, wood: 36000000, iron: 7200000, oil: 1800000, requirements: 'Centro de Alianza Nv.21 + Taller Pesado Nv.21', combatPower: 575300, powerGain: 86100 },
  { level: 23, timeFormatted: '9d 8h 40m', hours: 224.7, food: 44000000, wood: 44000000, iron: 8900000, oil: 2200000, requirements: 'Centro de Alianza Nv.22 + Campo de Tiro Nv.22', combatPower: 661400, powerGain: 86100 },
  { level: 24, timeFormatted: '13d 2h 33m', hours: 314.5, food: 60000000, wood: 60000000, iron: 12000000, oil: 3000000, requirements: 'Centro de Alianza Nv.23 + Laboratorio Nv.23', combatPower: 747500, powerGain: 86100 },
  { level: 25, timeFormatted: '18d 8h 22m', hours: 440.4, food: 81000000, wood: 81000000, iron: 16000000, oil: 4000000, requirements: 'Centro de Alianza Nv.24 + Cuartel de Infantería Nv.24', combatPower: 833600, powerGain: 86100 },
  { level: 26, timeFormatted: '21d 2h 26m', hours: 506.4, food: 100000000, wood: 100000000, iron: 21000000, oil: 5200000, requirements: 'Centro de Alianza Nv.25 + Taller Pesado Nv.25', combatPower: 960100, powerGain: 126500 },
  { level: 27, timeFormatted: '25d 7h 43m', hours: 607.7, food: 140000000, wood: 140000000, iron: 24000000, oil: 7400000, requirements: 'Centro de Alianza Nv.26 + Campo de Tiro Nv.26', combatPower: 1086600, powerGain: 126500 },
  { level: 28, timeFormatted: '29d 2h 52m', hours: 698.9, food: 190000000, wood: 190000000, iron: 39000000, oil: 9900000, requirements: 'Centro de Alianza Nv.27 + Laboratorio Nv.27', combatPower: 1213100, powerGain: 126500 },
  { level: 29, timeFormatted: '33d 11h 42m', hours: 803.7, food: 240000000, wood: 240000000, iron: 49000000, oil: 12000000, requirements: 'Centro de Alianza Nv.28 + Cuartel de Infantería Nv.28', combatPower: 1339600, powerGain: 126500 },
  { level: 30, timeFormatted: '40d 4h 27m', hours: 964.5, food: 300000000, wood: 300000000, iron: 60000000, oil: 15000000, requirements: 'Centro de Alianza Nv.29 + Taller Pesado Nv.29', combatPower: 1523500, powerGain: 183900 }
];

export interface MansionLumiStats {
  food: number;
  wood: number;
  iron: number;
  oil: number;
  baseStepHours: number;
  baseTotalHours: number;
  combatPower: number;
}

export const MANSION_LUMI_STATS: Record<Exclude<PrestigeLevel, 0>, MansionLumiStats> = {
  1: { food: 335000000, wood: 335000000, iron: 65000000, oil: 16500000, baseStepHours: 168, baseTotalHours: 840, combatPower: 1995472 },
  2: { food: 360000000, wood: 360000000, iron: 70000000, oil: 18000000, baseStepHours: 216, baseTotalHours: 1080, combatPower: 2467443 },
  3: { food: 395000000, wood: 395000000, iron: 75000000, oil: 19500000, baseStepHours: 264, baseTotalHours: 1320, combatPower: 2939415 },
  4: { food: 410000000, wood: 410000000, iron: 80000000, oil: 20500000, baseStepHours: 288, baseTotalHours: 1440, combatPower: 3690231 },
  5: { food: 420000000, wood: 420000000, iron: 80000000, oil: 21000000, baseStepHours: 336, baseTotalHours: 1680, combatPower: 4441047 },
  6: { food: 960000000, wood: 960000000, iron: 190000000, oil: 48000000, baseStepHours: 720, baseTotalHours: 3600, combatPower: 5244135 },
  7: { food: 1000000000, wood: 1000000000, iron: 210000000, oil: 54000000, baseStepHours: 864, baseTotalHours: 4320, combatPower: 6047223 },
  8: { food: 1300000000, wood: 1300000000, iron: 260000000, oil: 66000000, baseStepHours: 960, baseTotalHours: 4800, combatPower: 6850311 },
  9: { food: 1400000000, wood: 1400000000, iron: 290000000, oil: 72000000, baseStepHours: 960, baseTotalHours: 4800, combatPower: 7710423 },
  10: { food: 1600000000, wood: 1600000000, iron: 330000000, oil: 84000000, baseStepHours: 960, baseTotalHours: 4800, combatPower: 8570535 }
};

export interface BuildingCommonCost {
  food: number;
  wood: number;
  iron: number;
  oil: number;
  baseHours: number;
}

export const BUILDING_LUMI_COMMON_COSTS: Record<
  'training' | 'alliance_helipad' | 'command_hospital' | 'lab',
  Record<Exclude<PrestigeLevel, 0>, BuildingCommonCost>
> = {
  training: {
    1: { food: 115000000, wood: 115000000, iron: 23500000, oil: 5500000, baseHours: 126 },
    2: { food: 125000000, wood: 125000000, iron: 25000000, oil: 6000000, baseHours: 162 },
    3: { food: 135000000, wood: 135000000, iron: 27500000, oil: 6500000, baseHours: 198 },
    4: { food: 140000000, wood: 140000000, iron: 28500000, oil: 7000000, baseHours: 216 },
    5: { food: 145000000, wood: 145000000, iron: 29500000, oil: 7000000, baseHours: 252 },
    6: { food: 330000000, wood: 330000000, iron: 67000000, oil: 16000000, baseHours: 540 },
    7: { food: 380000000, wood: 380000000, iron: 76000000, oil: 19000000, baseHours: 648 },
    8: { food: 460000000, wood: 460000000, iron: 93000000, oil: 23000000, baseHours: 720 },
    9: { food: 500000000, wood: 500000000, iron: 100000000, oil: 25000000, baseHours: 720 },
    10: { food: 590000000, wood: 590000000, iron: 110000000, oil: 29000000, baseHours: 720 }
  },
  alliance_helipad: {
    1: { food: 65000000, wood: 65000000, iron: 13500000, oil: 3350000, baseHours: 554 },
    2: { food: 70000000, wood: 70000000, iron: 14500000, oil: 3600000, baseHours: 713 },
    3: { food: 75000000, wood: 75000000, iron: 15500000, oil: 3950000, baseHours: 871 },
    4: { food: 80000000, wood: 80000000, iron: 16000000, oil: 4100000, baseHours: 950 },
    5: { food: 80000000, wood: 80000000, iron: 16500000, oil: 4200000, baseHours: 1109 },
    6: { food: 190000000, wood: 190000000, iron: 38000000, oil: 9600000, baseHours: 2376 },
    7: { food: 210000000, wood: 210000000, iron: 43000000, oil: 10000000, baseHours: 2851 },
    8: { food: 260000000, wood: 260000000, iron: 53000000, oil: 13000000, baseHours: 3168 },
    9: { food: 290000000, wood: 290000000, iron: 58000000, oil: 14000000, baseHours: 3168 },
    10: { food: 330000000, wood: 330000000, iron: 67000000, oil: 16000000, baseHours: 3168 }
  },
  command_hospital: {
    1: { food: 100000000, wood: 100000000, iron: 20000000, oil: 5000000, baseHours: 101 },
    2: { food: 105000000, wood: 105000000, iron: 21500000, oil: 5000000, baseHours: 130 },
    3: { food: 115000000, wood: 115000000, iron: 23500000, oil: 5500000, baseHours: 158 },
    4: { food: 120000000, wood: 120000000, iron: 24500000, oil: 6000000, baseHours: 173 },
    5: { food: 125000000, wood: 125000000, iron: 25000000, oil: 6000000, baseHours: 203 },
    6: { food: 290000000, wood: 290000000, iron: 58000000, oil: 14000000, baseHours: 432 },
    7: { food: 320000000, wood: 320000000, iron: 65000000, oil: 15000000, baseHours: 518 },
    8: { food: 390000000, wood: 390000000, iron: 79000000, oil: 19000000, baseHours: 576 },
    9: { food: 430000000, wood: 430000000, iron: 87000000, oil: 21000000, baseHours: 576 },
    10: { food: 500000000, wood: 500000000, iron: 100000000, oil: 25000000, baseHours: 576 }
  },
  lab: {
    1: { food: 10000, wood: 10000, iron: 10000, oil: 10000, baseHours: 0 },
    2: { food: 180000000, wood: 180000000, iron: 36000000, oil: 9000000, baseHours: 216 },
    3: { food: 195000000, wood: 195000000, iron: 39500000, oil: 9500000, baseHours: 264 },
    4: { food: 205000000, wood: 205000000, iron: 41000000, oil: 10000000, baseHours: 288 },
    5: { food: 210000000, wood: 210000000, iron: 41000000, oil: 10500000, baseHours: 336 },
    6: { food: 480000000, wood: 480000000, iron: 96000000, oil: 24000000, baseHours: 720 },
    7: { food: 540000000, wood: 540000000, iron: 100000000, oil: 27000000, baseHours: 864 },
    8: { food: 660000000, wood: 660000000, iron: 130000000, oil: 33000000, baseHours: 960 },
    9: { food: 720000000, wood: 720000000, iron: 140000000, oil: 36000000, baseHours: 960 },
    10: { food: 840000000, wood: 840000000, iron: 160000000, oil: 72000000, baseHours: 960 }
  }
};

export const getBuildingCommonCost = (
  buildingId: BuildingId,
  level: Exclude<PrestigeLevel, 0>
): BuildingCommonCost => {
  if (buildingId === 'mansion') {
    const s = MANSION_LUMI_STATS[level];
    return { food: s.food, wood: s.wood, iron: s.iron, oil: s.oil, baseHours: s.baseTotalHours };
  }
  if (buildingId === 'barracks' || buildingId === 'garage' || buildingId === 'range') {
    return BUILDING_LUMI_COMMON_COSTS.training[level];
  }
  if (buildingId === 'alliance' || buildingId === 'hero_center') {
    return BUILDING_LUMI_COMMON_COSTS.alliance_helipad[level];
  }
  if (buildingId === 'command' || buildingId === 'hospital') {
    return BUILDING_LUMI_COMMON_COSTS.command_hospital[level];
  }
  return BUILDING_LUMI_COMMON_COSTS.lab[level];
};
