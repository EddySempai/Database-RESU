import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = 'D:\\Proyecto de juego\\cosas\\Sprite\\PortraitBust';
const destDir = path.join(__dirname, 'public', 'portraits');

// Ensure destination exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 1. Copy files and get list
let availableIcons = [];
if (fs.existsSync(sourceDir)) {
  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    if (file.endsWith('.webp') || file.endsWith('.png')) {
      fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, file));
      availableIcons.push(file);
    }
  }
}

console.log(`Copied ${availableIcons.length} icons to public/portraits`);

// 2. Map icons to operatives in JSON
const mapIconsToJson = (jsonPath) => {
  if (!fs.existsSync(jsonPath)) return;
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  data.forEach(op => {
    // Basic fuzzy match: name vs filename
    // Extract first name (e.g. "Leon S. Kennedy" -> "Leon")
    let firstName = op.name.split(' ')[0].toUpperCase();
    
    // Some exceptions handling (e.g. Brad Vickers -> BRAD, Hunk -> HUNTER? No HUNK is different)
    // We will just look for the firstName in the file name
    let matchedIcon = availableIcons.find(icon => icon.includes(firstName));
    
    if (matchedIcon) {
      op.iconUrl = `/portraits/${matchedIcon}`;
    } else {
      // Fallback
      op.iconUrl = op.imageUrl; 
    }
  });

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
};

mapIconsToJson(path.join(__dirname, 'src', 'data', 'operativos.json'));
mapIconsToJson(path.join(__dirname, 'src', 'locales', 'en', 'operativos.json'));
mapIconsToJson(path.join(__dirname, 'src', 'locales', 'ja', 'operativos.json'));

console.log('JSON files updated with iconUrl');
