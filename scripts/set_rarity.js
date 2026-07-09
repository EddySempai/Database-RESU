import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '..', 'src', 'data', 'operativos.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const legendaries = [
  "Leon S. Kennedy",
  "Claire Redfield",
  "Jill Valentine",
  "Carlos Oliveira",
  "Ada Wong",
  "Chris Redfield",
  "Rebecca Chambers",
  "Billy Coen",
  "Ashley Graham",
  "Luis Serra Navarro",
  "Jack Krauser",
  "Jake Muller",
  "Sherry Birkin",
  "Piers Nivans"
];

data.forEach(op => {
  if (legendaries.includes(op.name)) {
    op.rarity = "Legendario";
  } else {
    // Si no está en la lista de legendarios, asumo que es Épico por ahora
    // a menos que sea el genérico "Operative" o "Kate"
    if (op.id === "operative" || op.id === "kate") {
      op.rarity = "Común";
    } else {
      op.rarity = "Épico";
    }
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Rarities have been explicitly set in operativos.json');
