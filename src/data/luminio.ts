export type LuminioBranch = 'blue' | 'red' | 'green';

export interface LuminioNodeConfig {
  id: string;
  branch: LuminioBranch;
  nameKey: string;
  defaultName: string;
  maxLevel: number;
  icon: string;
  row: number; // 0 to 4
  col: number; // -1, 0, or 1 (relative to center of its branch column)
  dependencies: string[];
  costType: 'normal' | 'advanced';
  powderCosts: number[];
}

const COST_LEADER = [16, 25, 41, 74, 108];
const COST_PRECISION_HP = [25, 56, 74, 102, 136, 184, 248, 334];
const COST_TROOPS = [83, 102, 125, 150, 184, 225, 276, 334, 418, 502, 602, 744];
const COST_FOCUSED_ARMOR = [54, 66, 81, 97, 118, 145, 178, 216, 470, 324, 388, 489];
const COST_TIER_11 = [2236];
const COST_RECOVERY = Array(10).fill(102);
const COST_HEALING = Array(10).fill(51);
const COST_TRAINING = Array(10).fill(102);

export const LUMINIO_NODES: LuminioNodeConfig[] = [
  // --- BLUE BRANCH (Atacante) ---
  { id: 'b_lider', branch: 'blue', nameKey: 'luminio.skills.b_lider', defaultName: 'Entrenamiento de Líder', maxLevel: 5, icon: 'Research_Luminium_AttackerSkill01.webp', row: 0, col: 0, dependencies: [], costType: 'normal', powderCosts: COST_LEADER },
  { id: 'b_disparo', branch: 'blue', nameKey: 'luminio.skills.b_disparo', defaultName: 'Disparo Preciso', maxLevel: 8, icon: 'Research_Luminium_AttackerSkill02.webp', row: 1, col: -1, dependencies: ['b_lider'], costType: 'normal', powderCosts: COST_PRECISION_HP },
  { id: 'b_salud', branch: 'blue', nameKey: 'luminio.skills.b_salud', defaultName: 'Aumento de Salud de Atacante', maxLevel: 8, icon: 'Research_Luminium_AttackerSkill03.webp', row: 1, col: 1, dependencies: ['b_lider'], costType: 'normal', powderCosts: COST_PRECISION_HP },
  { id: 'b_disparo_conc', branch: 'blue', nameKey: 'luminio.skills.b_disparo_conc', defaultName: 'Disparo Concentrado', maxLevel: 12, icon: 'Research_Luminium_AttackerSkill04.webp', row: 2, col: -1, dependencies: ['b_disparo'], costType: 'normal', powderCosts: COST_FOCUSED_ARMOR },
  { id: 'b_unidad', branch: 'blue', nameKey: 'luminio.skills.b_unidad', defaultName: 'Unidad de Luminio', maxLevel: 12, icon: 'Research_Luminium_AttackerSkill05.webp', row: 2, col: 0, dependencies: ['b_disparo', 'b_salud'], costType: 'normal', powderCosts: COST_TROOPS },
  { id: 'b_armadura', branch: 'blue', nameKey: 'luminio.skills.b_armadura', defaultName: 'Mejora de Armadura Ligera', maxLevel: 12, icon: 'Research_Luminium_AttackerSkill06.webp', row: 2, col: 1, dependencies: ['b_salud'], costType: 'normal', powderCosts: COST_FOCUSED_ARMOR },
  { id: 'b_atacante', branch: 'blue', nameKey: 'luminio.skills.b_atacante', defaultName: 'Atacante de Luminio', maxLevel: 1, icon: 'Research_Luminium_AttackerSkill07.webp', row: 3, col: 0, dependencies: ['b_disparo_conc', 'b_unidad', 'b_armadura'], costType: 'advanced', powderCosts: COST_TIER_11 },
  { id: 'b_recuperacion', branch: 'blue', nameKey: 'luminio.skills.b_recuperacion', defaultName: 'Recuperación de Atacante', maxLevel: 10, icon: 'Research_Luminium_AttackerSkill08.webp', row: 4, col: -1, dependencies: ['b_atacante'], costType: 'advanced', powderCosts: COST_RECOVERY },
  { id: 'b_tratamiento', branch: 'blue', nameKey: 'luminio.skills.b_tratamiento', defaultName: 'Tratamiento de Atacante', maxLevel: 10, icon: 'Research_Luminium_AttackerSkill09.webp', row: 4, col: 0, dependencies: ['b_atacante'], costType: 'advanced', powderCosts: COST_HEALING },
  { id: 'b_entrenamiento', branch: 'blue', nameKey: 'luminio.skills.b_entrenamiento', defaultName: 'Entrenamiento de Atacante', maxLevel: 10, icon: 'Research_Luminium_AttackerSkill10.webp', row: 4, col: 1, dependencies: ['b_atacante'], costType: 'advanced', powderCosts: COST_TRAINING },

  // --- GREEN BRANCH (Defensor) ---
  { id: 'g_lider', branch: 'green', nameKey: 'luminio.skills.g_lider', defaultName: 'Entrenamiento de Líder', maxLevel: 5, icon: 'Research_Luminium_DefenderSkill01.webp', row: 0, col: 0, dependencies: [], costType: 'normal', powderCosts: COST_LEADER },
  { id: 'g_golpe', branch: 'green', nameKey: 'luminio.skills.g_golpe', defaultName: 'Golpe Preciso', maxLevel: 8, icon: 'Research_Luminium_DefenderSkill02.webp', row: 1, col: -1, dependencies: ['g_lider'], costType: 'normal', powderCosts: COST_PRECISION_HP },
  { id: 'g_salud', branch: 'green', nameKey: 'luminio.skills.g_salud', defaultName: 'Aumento de Salud de Defensor', maxLevel: 8, icon: 'Research_Luminium_DefenderSkill03.webp', row: 1, col: 1, dependencies: ['g_lider'], costType: 'normal', powderCosts: COST_PRECISION_HP },
  { id: 'g_ataque_conc', branch: 'green', nameKey: 'luminio.skills.g_ataque_conc', defaultName: 'Ataque Concentrado', maxLevel: 12, icon: 'Research_Luminium_DefenderSkill04.webp', row: 2, col: -1, dependencies: ['g_golpe'], costType: 'normal', powderCosts: COST_FOCUSED_ARMOR },
  { id: 'g_unidad', branch: 'green', nameKey: 'luminio.skills.g_unidad', defaultName: 'Unidad de Luminio', maxLevel: 12, icon: 'Research_Luminium_DefenderSkill05.webp', row: 2, col: 0, dependencies: ['g_golpe', 'g_salud'], costType: 'normal', powderCosts: COST_TROOPS },
  { id: 'g_escudo', branch: 'green', nameKey: 'luminio.skills.g_escudo', defaultName: 'Refuerzo de escudo', maxLevel: 12, icon: 'Research_Luminium_DefenderSkill06.webp', row: 2, col: 1, dependencies: ['g_salud'], costType: 'normal', powderCosts: COST_FOCUSED_ARMOR },
  { id: 'g_defensor', branch: 'green', nameKey: 'luminio.skills.g_defensor', defaultName: 'Defensor de Luminio', maxLevel: 1, icon: 'Research_Luminium_DefenderSkill07.webp', row: 3, col: 0, dependencies: ['g_ataque_conc', 'g_unidad', 'g_escudo'], costType: 'advanced', powderCosts: COST_TIER_11 },
  { id: 'g_recuperacion', branch: 'green', nameKey: 'luminio.skills.g_recuperacion', defaultName: 'Recuperación de Defensor', maxLevel: 10, icon: 'Research_Luminium_DefenderSkill08.webp', row: 4, col: -1, dependencies: ['g_defensor'], costType: 'advanced', powderCosts: COST_RECOVERY },
  { id: 'g_tratamiento', branch: 'green', nameKey: 'luminio.skills.g_tratamiento', defaultName: 'Tratamiento de Defensor', maxLevel: 10, icon: 'Research_Luminium_DefenderSkill09.webp', row: 4, col: 0, dependencies: ['g_defensor'], costType: 'advanced', powderCosts: COST_HEALING },
  { id: 'g_entrenamiento', branch: 'green', nameKey: 'luminio.skills.g_entrenamiento', defaultName: 'Entrenamiento de Defensor', maxLevel: 10, icon: 'Research_Luminium_DefenderSkill10.webp', row: 4, col: 1, dependencies: ['g_defensor'], costType: 'advanced', powderCosts: COST_TRAINING },

  // --- RED BRANCH (Ranger) ---
  { id: 'r_lider', branch: 'red', nameKey: 'luminio.skills.r_lider', defaultName: 'Entrenamiento de Líder', maxLevel: 5, icon: 'Research_Luminium_RangerSkill01.webp', row: 0, col: 0, dependencies: [], costType: 'normal', powderCosts: COST_LEADER },
  { id: 'r_bombardeo', branch: 'red', nameKey: 'luminio.skills.r_bombardeo', defaultName: 'Bombardeo Preciso', maxLevel: 8, icon: 'Research_Luminium_RangerSkill02.webp', row: 1, col: -1, dependencies: ['r_lider'], costType: 'normal', powderCosts: COST_PRECISION_HP },
  { id: 'r_salud', branch: 'red', nameKey: 'luminio.skills.r_salud', defaultName: 'Aumento de Salud de Ranger', maxLevel: 8, icon: 'Research_Luminium_RangerSkill03.webp', row: 1, col: 1, dependencies: ['r_lider'], costType: 'normal', powderCosts: COST_PRECISION_HP },
  { id: 'r_bombardeo_est', branch: 'red', nameKey: 'luminio.skills.r_bombardeo_est', defaultName: 'Bombardeo Estratégico', maxLevel: 12, icon: 'Research_Luminium_RangerSkill04.webp', row: 2, col: -1, dependencies: ['r_bombardeo'], costType: 'normal', powderCosts: COST_FOCUSED_ARMOR },
  { id: 'r_unidad', branch: 'red', nameKey: 'luminio.skills.r_unidad', defaultName: 'Unidad de Luminio', maxLevel: 12, icon: 'Research_Luminium_RangerSkill05.webp', row: 2, col: 0, dependencies: ['r_bombardeo', 'r_salud'], costType: 'normal', powderCosts: COST_TROOPS },
  { id: 'r_armadura', branch: 'red', nameKey: 'luminio.skills.r_armadura', defaultName: 'Mejora de Armadura Pesada', maxLevel: 12, icon: 'Research_Luminium_RangerSkill06.webp', row: 2, col: 1, dependencies: ['r_salud'], costType: 'normal', powderCosts: COST_FOCUSED_ARMOR },
  { id: 'r_ranger', branch: 'red', nameKey: 'luminio.skills.r_ranger', defaultName: 'Ranger de Luminio', maxLevel: 1, icon: 'Research_Luminium_RangerSkill07.webp', row: 3, col: 0, dependencies: ['r_bombardeo_est', 'r_unidad', 'r_armadura'], costType: 'advanced', powderCosts: COST_TIER_11 },
  { id: 'r_recuperacion', branch: 'red', nameKey: 'luminio.skills.r_recuperacion', defaultName: 'Recuperación de Ranger', maxLevel: 10, icon: 'Research_Luminium_RangerSkill08.webp', row: 4, col: -1, dependencies: ['r_ranger'], costType: 'advanced', powderCosts: COST_RECOVERY },
  { id: 'r_tratamiento', branch: 'red', nameKey: 'luminio.skills.r_tratamiento', defaultName: 'Tratamiento de Ranger', maxLevel: 10, icon: 'Research_Luminium_RangerSkill09.webp', row: 4, col: 0, dependencies: ['r_ranger'], costType: 'advanced', powderCosts: COST_HEALING },
  { id: 'r_entrenamiento', branch: 'red', nameKey: 'luminio.skills.r_entrenamiento', defaultName: 'Entrenamiento de Ranger', maxLevel: 10, icon: 'Research_Luminium_RangerSkill010.webp', row: 4, col: 1, dependencies: ['r_ranger'], costType: 'advanced', powderCosts: COST_TRAINING }
];

export interface LuminioLevelCost {
  level: number;
  resourceA: number;
  resourceB: number;
}

export const LUMINIO_COSTS = {
  normal: [] as LuminioLevelCost[],
  advanced: [] as LuminioLevelCost[]
};
