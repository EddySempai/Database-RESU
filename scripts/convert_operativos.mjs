import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicOpsDir = path.resolve(__dirname, '../public/operativos');
const dataFiles = [
  path.resolve(__dirname, '../src/data/operativos.json'),
  path.resolve(__dirname, '../src/locales/es/operativos.json'),
  path.resolve(__dirname, '../src/locales/en/operativos.json'),
  path.resolve(__dirname, '../src/locales/ja/operativos.json'),
];

async function run() {
  console.log('--- 1. Convertir imágenes PNG a WebP ---');
  if (!fs.existsSync(publicOpsDir)) {
    console.error(`La carpeta ${publicOpsDir} no existe.`);
    process.exit(1);
  }

  const files = fs.readdirSync(publicOpsDir);
  const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

  console.log(`Se encontraron ${pngFiles.length} imágenes PNG para convertir.`);

  for (const file of pngFiles) {
    const srcPath = path.join(publicOpsDir, file);
    const destName = file.substring(0, file.lastIndexOf('.')) + '.webp';
    const destPath = path.join(publicOpsDir, destName);

    try {
      console.log(`Convirtiendo: ${file} -> ${destName}`);
      await sharp(srcPath)
        .webp({ quality: 85 })
        .toFile(destPath);
      
      // Eliminar el PNG original para ahorrar espacio
      fs.unlinkSync(srcPath);
      console.log(`Eliminado original: ${file}`);
    } catch (err) {
      console.error(`Error al procesar ${file}:`, err);
    }
  }

  console.log('\n--- 2. Actualizar referencias en archivos JSON ---');
  const urlRegex = /https:\/\/www\.residentevil-survivalunit\.com\/assets\/images\/common\/(character-[\w-]+-visual)\.(png|webp)/g;

  for (const dataPath of dataFiles) {
    if (!fs.existsSync(dataPath)) {
      console.warn(`Archivo no encontrado: ${dataPath}`);
      continue;
    }

    console.log(`Procesando archivo: ${path.basename(dataPath)}`);
    let content = fs.readFileSync(dataPath, 'utf8');

    // Reemplazar la URL remota de PNG/WebP con la ruta local WebP
    const updatedContent = content.replace(urlRegex, '/operativos/$1.webp');

    if (content !== updatedContent) {
      fs.writeFileSync(dataPath, updatedContent, 'utf8');
      console.log(`¡Referencias actualizadas con éxito en ${path.basename(dataPath)}!`);
    } else {
      console.log(`No se encontraron referencias externas para actualizar en ${path.basename(dataPath)}.`);
    }
  }

  console.log('\nProceso completado.');
}

run().catch(console.error);
