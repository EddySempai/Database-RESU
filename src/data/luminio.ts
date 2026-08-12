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
}

export const LUMINIO_NODES: LuminioNodeConfig[] = [
  // --- BLUE BRANCH (Atacante) ---
  { id: 'b_lider', branch: 'blue', nameKey: 'luminio.skills.b_lider', defaultName: 'Entrenamiento de Líder', maxLevel: 5, icon: 'Users', row: 0, col: 0, dependencies: [], costType: 'normal' },
  { id: 'b_disparo', branch: 'blue', nameKey: 'luminio.skills.b_disparo', defaultName: 'Disparo Preciso', maxLevel: 8, icon: 'Target', row: 1, col: -1, dependencies: ['b_lider'], costType: 'normal' },
  { id: 'b_salud', branch: 'blue', nameKey: 'luminio.skills.b_salud', defaultName: 'Aumento de Salud de Atacante', maxLevel: 8, icon: 'Heart', row: 1, col: 1, dependencies: ['b_lider'], costType: 'normal' },
  { id: 'b_disparo_conc', branch: 'blue', nameKey: 'luminio.skills.b_disparo_conc', defaultName: 'Disparo Concentrado', maxLevel: 12, icon: 'Zap', row: 2, col: -1, dependencies: ['b_disparo'], costType: 'normal' },
  { id: 'b_unidad', branch: 'blue', nameKey: 'luminio.skills.b_unidad', defaultName: 'Unidad de Luminio', maxLevel: 12, icon: 'MapPin', row: 2, col: 0, dependencies: ['b_disparo', 'b_salud'], costType: 'normal' },
  { id: 'b_armadura', branch: 'blue', nameKey: 'luminio.skills.b_armadura', defaultName: 'Mejora de Armadura Ligera', maxLevel: 12, icon: 'Shield', row: 2, col: 1, dependencies: ['b_salud'], costType: 'normal' },
  { id: 'b_atacante', branch: 'blue', nameKey: 'luminio.skills.b_atacante', defaultName: 'Atacante de Luminio', maxLevel: 1, icon: 'Swords', row: 3, col: 0, dependencies: ['b_disparo_conc', 'b_unidad', 'b_armadura'], costType: 'advanced' },
  { id: 'b_recuperacion', branch: 'blue', nameKey: 'luminio.skills.b_recuperacion', defaultName: 'Recuperación de Atacante', maxLevel: 10, icon: 'Activity', row: 4, col: -1, dependencies: ['b_atacante'], costType: 'advanced' },
  { id: 'b_tratamiento', branch: 'blue', nameKey: 'luminio.skills.b_tratamiento', defaultName: 'Tratamiento de Atacante', maxLevel: 10, icon: 'PlusSquare', row: 4, col: 0, dependencies: ['b_atacante'], costType: 'advanced' },
  { id: 'b_entrenamiento', branch: 'blue', nameKey: 'luminio.skills.b_entrenamiento', defaultName: 'Entrenamiento de Atacante', maxLevel: 10, icon: 'Dumbbell', row: 4, col: 1, dependencies: ['b_atacante'], costType: 'advanced' },

  // --- GREEN BRANCH (Defensor) ---
  { id: 'g_lider', branch: 'green', nameKey: 'luminio.skills.g_lider', defaultName: 'Entrenamiento de Líder', maxLevel: 5, icon: 'Users', row: 0, col: 0, dependencies: [], costType: 'normal' },
  { id: 'g_golpe', branch: 'green', nameKey: 'luminio.skills.g_golpe', defaultName: 'Golpe Preciso', maxLevel: 8, icon: 'Crosshair', row: 1, col: -1, dependencies: ['g_lider'], costType: 'normal' },
  { id: 'g_salud', branch: 'green', nameKey: 'luminio.skills.g_salud', defaultName: 'Aumento de Salud de Defensor', maxLevel: 8, icon: 'Heart', row: 1, col: 1, dependencies: ['g_lider'], costType: 'normal' },
  { id: 'g_ataque_conc', branch: 'green', nameKey: 'luminio.skills.g_ataque_conc', defaultName: 'Ataque Concentrado', maxLevel: 12, icon: 'Zap', row: 2, col: -1, dependencies: ['g_golpe'], costType: 'normal' },
  { id: 'g_unidad', branch: 'green', nameKey: 'luminio.skills.g_unidad', defaultName: 'Unidad de Luminio', maxLevel: 12, icon: 'MapPin', row: 2, col: 0, dependencies: ['g_golpe', 'g_salud'], costType: 'normal' },
  { id: 'g_escudo', branch: 'green', nameKey: 'luminio.skills.g_escudo', defaultName: 'Refuerzo de escudo', maxLevel: 12, icon: 'Shield', row: 2, col: 1, dependencies: ['g_salud'], costType: 'normal' },
  { id: 'g_defensor', branch: 'green', nameKey: 'luminio.skills.g_defensor', defaultName: 'Defensor de Luminio', maxLevel: 1, icon: 'ShieldAlert', row: 3, col: 0, dependencies: ['g_ataque_conc', 'g_unidad', 'g_escudo'], costType: 'advanced' },
  { id: 'g_recuperacion', branch: 'green', nameKey: 'luminio.skills.g_recuperacion', defaultName: 'Recuperación de Defensor', maxLevel: 10, icon: 'Activity', row: 4, col: -1, dependencies: ['g_defensor'], costType: 'advanced' },
  { id: 'g_tratamiento', branch: 'green', nameKey: 'luminio.skills.g_tratamiento', defaultName: 'Tratamiento de Defensor', maxLevel: 10, icon: 'PlusSquare', row: 4, col: 0, dependencies: ['g_defensor'], costType: 'advanced' },
  { id: 'g_entrenamiento', branch: 'green', nameKey: 'luminio.skills.g_entrenamiento', defaultName: 'Entrenamiento de Defensor', maxLevel: 10, icon: 'Dumbbell', row: 4, col: 1, dependencies: ['g_defensor'], costType: 'advanced' },

  // --- RED BRANCH (Ranger) ---
  { id: 'r_lider', branch: 'red', nameKey: 'luminio.skills.r_lider', defaultName: 'Entrenamiento de Líder', maxLevel: 5, icon: 'Users', row: 0, col: 0, dependencies: [], costType: 'normal' },
  { id: 'r_bombardeo', branch: 'red', nameKey: 'luminio.skills.r_bombardeo', defaultName: 'Bombardeo Preciso', maxLevel: 8, icon: 'Target', row: 1, col: -1, dependencies: ['r_lider'], costType: 'normal' },
  { id: 'r_salud', branch: 'red', nameKey: 'luminio.skills.r_salud', defaultName: 'Aumento de Salud de Ranger', maxLevel: 8, icon: 'Heart', row: 1, col: 1, dependencies: ['r_lider'], costType: 'normal' },
  { id: 'r_bombardeo_est', branch: 'red', nameKey: 'luminio.skills.r_bombardeo_est', defaultName: 'Bombardeo Estratégico', maxLevel: 12, icon: 'Crosshair', row: 2, col: -1, dependencies: ['r_bombardeo'], costType: 'normal' },
  { id: 'r_unidad', branch: 'red', nameKey: 'luminio.skills.r_unidad', defaultName: 'Unidad de Luminio', maxLevel: 12, icon: 'MapPin', row: 2, col: 0, dependencies: ['r_bombardeo', 'r_salud'], costType: 'normal' },
  { id: 'r_armadura', branch: 'red', nameKey: 'luminio.skills.r_armadura', defaultName: 'Mejora de Armadura Pesada', maxLevel: 12, icon: 'Shield', row: 2, col: 1, dependencies: ['r_salud'], costType: 'normal' },
  { id: 'r_ranger', branch: 'red', nameKey: 'luminio.skills.r_ranger', defaultName: 'Ranger de Luminio', maxLevel: 1, icon: 'Crosshair', row: 3, col: 0, dependencies: ['r_bombardeo_est', 'r_unidad', 'r_armadura'], costType: 'advanced' },
  { id: 'r_recuperacion', branch: 'red', nameKey: 'luminio.skills.r_recuperacion', defaultName: 'Recuperación de Ranger', maxLevel: 10, icon: 'Activity', row: 4, col: -1, dependencies: ['r_ranger'], costType: 'advanced' },
  { id: 'r_tratamiento', branch: 'red', nameKey: 'luminio.skills.r_tratamiento', defaultName: 'Tratamiento de Ranger', maxLevel: 10, icon: 'PlusSquare', row: 4, col: 0, dependencies: ['r_ranger'], costType: 'advanced' },
  { id: 'r_entrenamiento', branch: 'red', nameKey: 'luminio.skills.r_entrenamiento', defaultName: 'Entrenamiento de Ranger', maxLevel: 10, icon: 'Dumbbell', row: 4, col: 1, dependencies: ['r_ranger'], costType: 'advanced' }
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
