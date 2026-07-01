// Calculadoras de Equipamiento de Armas

export const weaponExpPerLevel: Record<number, number> = {
  "0": 10,
  "1": 15,
  "2": 20,
  "3": 25,
  "4": 30,
  "5": 35,
  "6": 40,
  "7": 45,
  "8": 50,
  "9": 55,
  "10": 60,
  "11": 65,
  "12": 70,
  "13": 75,
  "14": 80,
  "15": 85,
  "16": 90,
  "17": 95,
  "18": 100,
  "19": 105,
  "20": 110,
  "21": 115,
  "22": 120,
  "23": 125,
  "24": 130,
  "25": 135,
  "26": 140,
  "27": 145,
  "28": 150,
  "29": 160,
  "30": 170,
  "31": 180,
  "32": 190,
  "33": 200,
  "34": 210,
  "35": 220,
  "36": 230,
  "37": 240,
  "38": 250,
  "39": 270,
  "40": 290,
  "41": 310,
  "42": 330,
  "43": 350,
  "44": 370,
  "45": 390,
  "46": 410,
  "47": 430,
  "48": 450,
  "49": 470,
  "50": 490,
  "51": 510,
  "52": 530,
  "53": 550,
  "54": 570,
  "55": 590,
  "56": 610,
  "57": 630,
  "58": 650,
  "59": 680,
  "60": 710,
  "61": 740,
  "62": 770,
  "63": 800,
  "64": 830,
  "65": 860,
  "66": 890,
  "67": 920,
  "68": 950,
  "69": 990,
  "70": 1030,
  "71": 1070,
  "72": 1110,
  "73": 1150,
  "74": 1190,
  "75": 1230,
  "76": 1270,
  "77": 1310,
  "78": 1350,
  "79": 1400,
  "80": 1450,
  "81": 1500,
  "82": 1550,
  "83": 1600,
  "84": 1650,
  "85": 1700,
  "86": 1750,
  "87": 1800,
  "88": 1850,
  "89": 1900,
  "90": 1950,
  "91": 2000,
  "92": 2050,
  "93": 2100,
  "94": 2150,
  "95": 2200,
  "96": 2250,
  "97": 2300,
  "98": 2350,
  "99": 2400
};

export const calculateWeaponExp = (currentLevel: number, targetLevel: number): number => {
  if (currentLevel >= targetLevel || currentLevel < 0 || targetLevel > 100) return 0;
  
  let totalExp = 0;
  for (let i = currentLevel; i < targetLevel; i++) {
    totalExp += weaponExpPerLevel[i] || 0;
  }
  return totalExp;
};

export const calculateWeaponPlus = (currentPlus: number, targetPlus: number): number => {
  if (currentPlus >= targetPlus || currentPlus < 0 || targetPlus > 20) return 0;
  
  let totalComponents = 0;
  for (let i = currentPlus; i < targetPlus; i++) {
    // Sube de 10 en 10 (lvl 1 = 10, lvl 20 = 200)
    totalComponents += (i + 1) * 10;
  }
  return totalComponents;
};

// Conversiones de materiales de arma
export const weaponExpMaterials = {
  materialVerde: 10,
  materialMorado: 100,
  armaGris: 10,
  armaVerde: 30,
  armaAzul: 60,
  armaMorada: 150
};

export const convertWeaponExpToMaterials = (totalExp: number) => {
  return {
    materialesVerdes: Math.ceil(totalExp / weaponExpMaterials.materialVerde),
    materialesMorados: Math.ceil(totalExp / weaponExpMaterials.materialMorado),
    armasGrises: Math.ceil(totalExp / weaponExpMaterials.armaGris),
    armasVerdes: Math.ceil(totalExp / weaponExpMaterials.armaVerde),
    armasAzules: Math.ceil(totalExp / weaponExpMaterials.armaAzul),
    armasMoradas: Math.ceil(totalExp / weaponExpMaterials.armaMorada),
  };
};
