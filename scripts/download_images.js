import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '..', 'src', 'data', 'operativos.json');
const outDir = path.join(__dirname, '..', 'src', 'assets', 'operativos');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`Downloading ${data.length} images to ${outDir}...`);

let completed = 0;

data.forEach((op) => {
  const filename = op.imageUrl.split('/').pop();
  const destPath = path.join(outDir, filename);
  
  const file = fs.createWriteStream(destPath);
  https.get(op.imageUrl, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      completed++;
      console.log(`[${completed}/${data.length}] Downloaded ${filename}`);
    });
  }).on('error', (err) => {
    fs.unlink(destPath, () => {});
    console.error(`Error downloading ${filename}: ${err.message}`);
  });
});
