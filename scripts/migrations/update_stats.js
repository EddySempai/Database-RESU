import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const statsData = {
  "luis": { health: 101335, attack: 10134, defense: 2253, combatPower: 730878 },
  "carlos": { health: 136400, attack: 3400, defense: 1980, combatPower: 921020 },
  "billy": { health: 93000, attack: 11530, defense: 570, combatPower: 1149720 },
  "chris": { health: 154500, attack: 5040, defense: 1680, combatPower: 1036302 },
  "jill": { health: 88000, attack: 10710, defense: 770, combatPower: 240125 },
  "jake": { health: 150796, attack: 9606, defense: 3101, combatPower: null },
  "sherry": { health: 114312, attack: 12160, defense: 3039, combatPower: null },
  "jack": { health: 112593, attack: 6757, defense: 4505, combatPower: 318512 },
  "ashley": { health: 92329, attack: 11261, defense: 2028, combatPower: 386336 },
  "rebecca": { health: 84600, attack: 11690, defense: 855, combatPower: 451360 },
  "ada": { health: 121000, attack: 6460, defense: 770, combatPower: 482615 },
  "leon": { health: 176000, attack: 4590, defense: 1980, combatPower: 481530 },
  "murphy": { health: 61600, attack: 4811, defense: 242, combatPower: 506619 },
  "brad": { health: 52799, attack: 5508, defense: 237, combatPower: 506994 },
  "piers": { health: 99719, attack: 14714, defense: 2979, combatPower: 511617 },
  "katherine": { health: 41800, attack: 8840, defense: 330, combatPower: 522162 },
  "robert": { health: 92400, attack: 3400, defense: 1320, combatPower: 736907 },
  "alyssa": { health: 70400, attack: 5780, defense: 880, combatPower: 599617 },
  "tyrone": { health: 101200, attack: 1700, defense: 1980, combatPower: 590347 },
  "mikhail": { health: 74800, attack: 5755, defense: 880, combatPower: 754073 },
  "becca": { health: 74800, attack: 6205, defense: 385, combatPower: 755225 },
  "mark": { health: 118800, attack: 1700, defense: 1100, combatPower: 772130 },
  "barry": { health: 66000, attack: 6800, defense: 440, combatPower: 945130 },
  "marvin": { health: 88000, attack: 4335, defense: 935, combatPower: 772880 },
  "tyrell": { health: 70400, attack: 6120, defense: 660, combatPower: 772505 },
  "claire": { health: 88000, attack: 9265, defense: 605, combatPower: 1440957 }
};

const dataPath = path.join(__dirname, '..', 'src', 'data', 'operativos.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

const updatedData = data.map(op => {
  const stats = statsData[op.id];
  if (stats) {
    return { ...op, stats };
  }
  return op;
});

fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));
console.log("Stats updated successfully!");
