const fs = require('fs');

const rawData = `
0-1 / 10
1-2/ 15
2-3/ 20
3-4 / 25
4-5 / 30
5-6 / 35
6-7 / 40
7-8 / 45
8-9 / 50
9-10 / 55
10-11 / 60
11-12 / 65
12-13 / 70
13-14 / 75
14-15 / 80
15-16 / 85
16-17 / 90
17-18 / 95
18-19 / 100
19-20 / 105
20-21 / 110
21-22 / 115
22-23 / 120
23-24 / 125
24-25 / 130
25-26 / 135
26-27 / 140
27-28 / 145
28-29 / 150
29-30 / 160
30-31 / 170
31-32 / 180
32-33 / 190
33-34 / 200
34-35 / 210
35-36 / 220
36-37 / 230
37-38 / 240
38-39 / 250
39-40 / 270
40-41 / 290
41-42 / 310
42-43 / 330
43-44 / 350
44-45 / 370
45-46 / 390
46-47 / 410
47-48 / 430
48-49 / 450
49-50 / 470
50-51 / 490
51-52 / 510
52-53 / 530
53-54 / 550
54-55 / 570
55-56 / 590
56-57 / 610
57-58-/ 630
58-59 / 650
59-60 / 680
60-61 / 710
61-62 / 740
62-63 / 770
63-64 / 800
64-65 / 830
65-66 / 860
66-67 / 890
67-68 / 920
68-69 / 950
69-70 / 990
70-71 / 1030
71-72 / 1070
72-73 / 1110
73-74 / 1150
74-75 / 1190
75-76 / 1230
76-77 / 1270
77-78 / 1310
78-79 / 1350
79-80 / 1400
80-81 / 1450
81-82 / 1500
82-83 / 1550
83-84 / 1600
84-85 / 1650
85-86 / 1700
86-87 / 1750
87-88 / 1800
88-89 / 1850
89-90 / 1900
90-91 / 1950
91-92 / 2000
92-93 / 2050
93-94 / 2100
94-95 / 2150
95-96 / 2200
96-97 / 2250
97-98 / 2300
98-99 / 2350
99-100 / 2400
`;

const lines = rawData.trim().split('\\n');
const weaponExpPerLevel = {};

lines.forEach(line => {
  const [rangeStr, expStr] = line.split('/');
  if (!rangeStr || !expStr) return;
  const startLvl = parseInt(rangeStr.trim().split('-')[0].trim());
  const exp = parseInt(expStr.trim());
  if (!isNaN(startLvl) && !isNaN(exp)) {
    weaponExpPerLevel[startLvl] = exp;
  }
});

const newCode = \`

// 4. Calculadoras de Equipamiento de Armas

export const weaponExpPerLevel: Record<number, number> = \${JSON.stringify(weaponExpPerLevel, null, 2)};

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
\`;

fs.appendFileSync('src/utils/calculators.ts', newCode);
console.log("Calculadoras de armas añadidas a src/utils/calculators.ts");
