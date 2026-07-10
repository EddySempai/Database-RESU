import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replaceInFile = (filePath, replacements) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    // using split join to replace all occurrences if passed as strings
    if (typeof search === 'string') {
      content = content.split(search).join(replace);
    } else {
      content = content.replace(search, replace);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
};

const componentsDir = path.join(__dirname, 'src', 'components');

// 1. Hero.tsx
replaceInFile(path.join(componentsDir, 'Hero.tsx'), [
  [`viewport={{ once: true }}`, `viewport={{ once: false, amount: 0.2 }}`],
  [`variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}`, `variants={{ hidden: { opacity: 0, y: 50, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}`],
  [`variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}`, `variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' } } }}`]
]);

// 2. NewsSection.tsx
replaceInFile(path.join(componentsDir, 'NewsSection.tsx'), [
  [`viewport={{ once: true }}`, `viewport={{ once: false, amount: 0.2 }}`],
  [`variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}`, `variants={{ hidden: { opacity: 0, y: 60, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 70, damping: 20 } } }}`]
]);

// 3. QuickLinks.tsx
replaceInFile(path.join(componentsDir, 'QuickLinks.tsx'), [
  [`viewport={{ once: true }}`, `viewport={{ once: false, amount: 0.2 }}`],
  [`variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}`, `variants={{ hidden: { opacity: 0, y: 50, rotateX: 30, scale: 0.9 }, visible: { opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } } }}`]
]);

// 4. OperativesShowcase.tsx
replaceInFile(path.join(componentsDir, 'OperativesShowcase.tsx'), [
  [`viewport={{ once: true }}`, `viewport={{ once: false, amount: 0.1 }}`],
  [`variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}`, `variants={{ hidden: { opacity: 0, y: 80, scale: 0.8 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } } }}`],
  [`variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}`, `variants={{ hidden: { opacity: 0, x: -50, scale: 0.9 }, visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 100 } } }}`],
  [`variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}`, `variants={{ hidden: { opacity: 0, scale: 0.5, rotate: -5 }, visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 120, damping: 15 } } }}`]
]);

console.log('Scroll animations updated successfully!');
