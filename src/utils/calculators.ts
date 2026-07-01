// calculadoras de progresión de operativos

// 1. Calculadora de Experiencia
const expPerLevel: Record<number, number> = {
  1: 480, 2: 690, 3: 920, 4: 1200, 5: 1500, 6: 1800, 7: 2200, 8: 2600, 9: 3100, 10: 3650,
  11: 4300, 12: 5100, 13: 6000, 14: 7000, 15: 8000, 16: 9000, 17: 10000, 18: 11000, 19: 12000, 20: 13000,
  21: 14000, 22: 15000, 23: 16000, 24: 17000, 25: 19000, 26: 21000, 27: 23000, 28: 25000, 29: 27000, 30: 29000,
  31: 31000, 32: 33000, 33: 35000, 34: 39000, 35: 43000, 36: 47000, 37: 51000, 38: 55000, 39: 61000, 40: 67000,
  41: 73000, 42: 79000, 43: 85000, 44: 93000, 45: 101000, 46: 110000, 47: 120000, 48: 130000, 49: 140000, 50: 150000,
  51: 160000, 52: 170000, 53: 180000, 54: 200000, 55: 220000, 56: 240000, 57: 260000, 58: 280000, 59: 310000, 60: 340000,
  61: 370000, 62: 400000, 63: 440000, 64: 490000, 65: 540000, 66: 590000, 67: 640000, 68: 690000, 69: 750000, 70: 820000,
  71: 900000, 72: 1000000, 73: 1100000, 74: 1300000, 75: 1500000, 76: 1700000, 77: 1900000, 78: 2100000, 79: 2400000, 80: 0
};

export const calculateRequiredExp = (currentLevel: number, targetLevel: number): number => {
  if (currentLevel >= targetLevel || currentLevel < 1 || targetLevel > 80) return 0;
  
  let totalExp = 0;
  for (let i = currentLevel; i < targetLevel; i++) {
    totalExp += expPerLevel[i];
  }
  return totalExp;
};

// 2. Calculadora de Contratos (Estrellas)
// La estructura es un array de estrellas (de 1 a 6)
// Cada estrella tiene un array de 5 elementos que representan el costo de cada "asta" o nodo.
const starCosts = [
  // 0 estrellas -> 1 estrella (8 total)
  [1, 1, 2, 2, 2], 
  // 1 estrella -> 2 estrellas (22 total)
  [2, 5, 5, 5, 5], 
  // 2 estrellas -> 3 estrellas (65 total)
  [5, 15, 15, 15, 15], 
  // 3 estrellas -> 4 estrellas (175 total)
  [15, 40, 40, 40, 40], 
  // 4 estrellas -> 5 estrellas (320 total)
  [40, 40, 40, 100, 100], 
  // 5 estrellas -> 6 estrellas (500 total)
  [100, 100, 100, 100, 100]
];

export const calculateRequiredContracts = (
  currentStar: number, currentNode: number, 
  targetStar: number, targetNode: number
): number => {
  // Convertir (Estrella, Asta) a un índice absoluto lineal para facilitar el cálculo
  // currentStar va de 0 a 6 (0 = sin estrellas, 6 = máximo)
  // currentNode va de 0 a 5 (0 = 0 astas en la estrella actual, 5 = completó las 5 astas y pasa a la sig. estrella)
  
  const getAbsoluteIndex = (star: number, node: number) => (star * 5) + node;
  
  const currentIndex = getAbsoluteIndex(currentStar, currentNode);
  const targetIndex = getAbsoluteIndex(targetStar, targetNode);
  
  if (currentIndex >= targetIndex || targetIndex > 30) return 0; // max es 6 estrellas * 5 = 30
  
  let totalContracts = 0;
  // Aplanar el array de costos
  const flatCosts = starCosts.flat();
  
  for (let i = currentIndex; i < targetIndex; i++) {
    totalContracts += flatCosts[i];
  }
  
  return totalContracts;
};

// 3. Calculadora de Libros de Habilidades
const skillUpgradeCost: Record<number, number> = {
  // Nivel actual -> Costo para subir al siguiente
  1: 10,
  2: 30,
  3: 50,
  4: 75,
  5: 0 // Máximo
};

export const calculateSkillBooks = (currentLevel: number, targetLevel: number): number => {
  if (currentLevel >= targetLevel || currentLevel < 1 || targetLevel > 5) return 0;
  
  let totalBooks = 0;
  for (let i = currentLevel; i < targetLevel; i++) {
    totalBooks += skillUpgradeCost[i];
  }
  return totalBooks;
};

export const getMaxSkillsByRarity = (rarity: string): number => {
  return rarity.toLowerCase() === 'legendario' ? 6 : 5;
};
