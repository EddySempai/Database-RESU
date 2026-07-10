import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replaceInFile = (filePath, replacements) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
};

// 1. Add animations to index.css
const cssPath = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('@keyframes float')) {
  cssContent += `

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0px); }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(0.98); }
}
.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes card-shine {
  0% { transform: translateX(-150%) rotate(45deg); opacity: 0; }
  20% { opacity: 0.15; }
  100% { transform: translateX(150%) rotate(45deg); opacity: 0; }
}
.card-shine {
  position: relative;
  overflow: hidden;
}
.card-shine::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to right,
    rgba(255,255,255,0) 0%,
    rgba(255, 215, 0, 0.2) 50%,
    rgba(255,255,255,0) 100%
  );
  transform: translateX(-150%) rotate(45deg);
  animation: card-shine 3.5s infinite;
  pointer-events: none;
  z-index: 10;
}
`;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
}

// 2. Modify Operativos.tsx
const opsPath = path.join(__dirname, 'src', 'pages', 'Operativos.tsx');
replaceInFile(opsPath, [
  [
    `const isLegendary = (rarity: string) => rarity?.toLowerCase().includes('legen') || rarity?.includes('レジェン');`,
    `const isLegendary = (rarity: string) => rarity?.toLowerCase().includes('legen') || rarity?.includes('レジェン');\nconst isEpic = (rarity: string) => rarity?.toLowerCase().includes('epic') || rarity?.toLowerCase().includes('épic') || rarity?.includes('エピック');\nconst isCommon = (rarity: string) => rarity?.toLowerCase().includes('com') || rarity?.includes('コモン');`
  ],
  [
    `<Shield size={14} />`,
    `<Shield size={14} className="animate-float" />`
  ],
  [
    `<Sword size={14} />`,
    `<Sword size={14} className="animate-float" />`
  ],
  [
    `<Crosshair size={14} />`,
    `<Crosshair size={14} className="animate-float" />`
  ],
  [
    `isLegendary(op.rarity) ? 'border-yellow-600/30 hover:border-yellow-500/80 shadow-[0_0_10px_rgba(202,138,4,0.05)] hover:shadow-[0_0_15px_rgba(202,138,4,0.2)]' : 'border-gray-800 hover:border-neon-red'} overflow-hidden`,
    `isLegendary(op.rarity) ? 'border-yellow-600/30 hover:border-yellow-500/80 shadow-[0_0_10px_rgba(202,138,4,0.05)] hover:shadow-[0_0_15px_rgba(202,138,4,0.2)] card-shine' : (isCommon(op.rarity) ? 'border-blue-900/50 hover:border-blue-500/80' : 'border-purple-900/50 hover:border-purple-500/80')} overflow-hidden`
  ],
  [
    `isLegendary(op.rarity) ? 'from-[#1a1400] to-[#111]' : 'from-[#0a0a0a] to-[#111]'} relative overflow-hidden`,
    `isLegendary(op.rarity) ? 'from-[#1a1400] to-[#111]' : (isCommon(op.rarity) ? 'from-[#000a1a] to-[#111]' : 'from-[#1a001a] to-[#111]')} relative overflow-hidden`
  ],
  [
    `Target className="text-neon-red" size={32}`,
    `Target className="text-neon-red animate-float" size={32}`
  ]
]);

// 3. Modify Hero.tsx buttons to pulse
const heroPath = path.join(__dirname, 'src', 'components', 'Hero.tsx');
replaceInFile(heroPath, [
  [
    `className="bg-blood-red hover:bg-neon-red text-white font-bebas text-xl tracking-widest px-8 py-3 transition-colors duration-300 shadow-[0_0_15px_rgba(158,0,0,0.4)]"`,
    `className="bg-blood-red hover:bg-neon-red text-white font-bebas text-xl tracking-widest px-8 py-3 transition-colors duration-300 shadow-[0_0_15px_rgba(158,0,0,0.4)] animate-pulse-slow"`
  ]
]);

console.log('Animations and rarities applied!');
