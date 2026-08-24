const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/data/luminio.ts');
let content = fs.readFileSync(file, 'utf8');

// Blue Branch
content = content.replace(/\{ id: 'b_lider'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill01.webp'"));
content = content.replace(/\{ id: 'b_disparo'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill02.webp'"));
content = content.replace(/\{ id: 'b_salud'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill03.webp'"));
content = content.replace(/\{ id: 'b_disparo_conc'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill04.webp'"));
content = content.replace(/\{ id: 'b_unidad'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill05.webp'"));
content = content.replace(/\{ id: 'b_armadura'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill06.webp'"));
content = content.replace(/\{ id: 'b_atacante'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill07.webp'"));
content = content.replace(/\{ id: 'b_recuperacion'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill08.webp'"));
content = content.replace(/\{ id: 'b_tratamiento'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill09.webp'"));
content = content.replace(/\{ id: 'b_entrenamiento'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_AttackerSkill10.webp'"));

// Green Branch
content = content.replace(/\{ id: 'g_lider'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill01.webp'"));
content = content.replace(/\{ id: 'g_golpe'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill02.webp'"));
content = content.replace(/\{ id: 'g_salud'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill03.webp'"));
content = content.replace(/\{ id: 'g_ataque_conc'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill04.webp'"));
content = content.replace(/\{ id: 'g_unidad'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill05.webp'"));
content = content.replace(/\{ id: 'g_escudo'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill06.webp'"));
content = content.replace(/\{ id: 'g_defensor'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill07.webp'"));
content = content.replace(/\{ id: 'g_recuperacion'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill08.webp'"));
content = content.replace(/\{ id: 'g_tratamiento'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill09.webp'"));
content = content.replace(/\{ id: 'g_entrenamiento'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_DefenderSkill10.webp'"));

// Red Branch
content = content.replace(/\{ id: 'r_lider'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill01.webp'"));
content = content.replace(/\{ id: 'r_bombardeo'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill02.webp'"));
content = content.replace(/\{ id: 'r_salud'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill03.webp'"));
content = content.replace(/\{ id: 'r_bombardeo_est'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill04.webp'"));
content = content.replace(/\{ id: 'r_unidad'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill05.webp'"));
content = content.replace(/\{ id: 'r_armadura'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill06.webp'"));
content = content.replace(/\{ id: 'r_ranger'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill07.webp'"));
content = content.replace(/\{ id: 'r_recuperacion'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill08.webp'"));
content = content.replace(/\{ id: 'r_tratamiento'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill09.webp'"));
content = content.replace(/\{ id: 'r_entrenamiento'.*?icon: '[^']+'.*?\}/g, match => match.replace(/icon: '[^']+'/, "icon: 'Research_Luminium_RangerSkill010.webp'"));

fs.writeFileSync(file, content);
console.log('Done!');
