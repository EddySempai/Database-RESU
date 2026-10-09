const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildKeyringsComposite() {
  const canvasWidth = 660;
  const canvasHeight = 350;

  // Correct files:
  // 1. Far Left: Blue Rock -> Item_KeyRing_16.webp
  // 2. Mid Left: Yellow Rock -> Item_KeyRing_14.webp
  // 3. Center: Leon -> Item_KeyRing_17.webp
  // 4. Mid Right: Claire -> Item_KeyRing_18.webp
  // 5. Far Right: Diamond -> Item_KeyRing_15.webp

  const kBlueRock = path.join(__dirname, '..', 'public', 'llaveros', 'Item_KeyRing_16.webp');
  const kYellowRock = path.join(__dirname, '..', 'public', 'llaveros', 'Item_KeyRing_14.webp');
  const kLeon = path.join(__dirname, '..', 'public', 'llaveros', 'Item_KeyRing_17.webp');
  const kClaire = path.join(__dirname, '..', 'public', 'llaveros', 'Item_KeyRing_18.webp');
  const kDiamond = path.join(__dirname, '..', 'public', 'llaveros', 'Item_KeyRing_15.webp');

  // Resizing keyrings
  const leonBuf = await sharp(kLeon).resize({ height: 285 }).toBuffer();
  const claireBuf = await sharp(kClaire).resize({ height: 250 }).toBuffer();
  const yellowBuf = await sharp(kYellowRock).resize({ height: 255 }).toBuffer();
  const blueBuf = await sharp(kBlueRock).resize({ height: 235 }).toBuffer();
  const diamondBuf = await sharp(kDiamond).resize({ height: 240 }).toBuffer();

  const leonMeta = await sharp(leonBuf).metadata();
  const claireMeta = await sharp(claireBuf).metadata();
  const yellowMeta = await sharp(yellowBuf).metadata();
  const blueMeta = await sharp(blueBuf).metadata();
  const diamondMeta = await sharp(diamondBuf).metadata();

  // Positions (Canvas center X = 330)
  const leonLeft = Math.round(318 - leonMeta.width / 2);
  const leonTop = 15;

  const yellowLeft = Math.round(leonLeft - yellowMeta.width * 0.74);
  const yellowTop = 45;

  const blueLeft = Math.round(yellowLeft - blueMeta.width * 0.75);
  const blueTop = 68;

  const claireLeft = Math.round(leonLeft + leonMeta.width * 0.88);
  const claireTop = 48;

  const diamondLeft = Math.round(claireLeft + claireMeta.width * 0.70);
  const diamondTop = 60;

  // Background Red Atmosphere (Crimson glow behind characters)
  const svgBackdrop = `
  <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="redGlowCenter" cx="50%" cy="54%" r="48%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.65" />
        <stop offset="25%" stop-color="#dc2626" stop-opacity="0.5" />
        <stop offset="55%" stop-color="#991b1b" stop-opacity="0.25" />
        <stop offset="80%" stop-color="#450a0a" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="325" cy="185" rx="270" ry="145" fill="url(#redGlowCenter)" />
  </svg>
  `;

  // Arrow X positions - exactly aligned with the keyrings
  const a1X = blueLeft + 22;                                       // Blue Rock
  const a2X = yellowLeft + Math.round(yellowMeta.width * 0.44);    // Yellow Rock (straight through front)
  const a3X = 318;                                                 // Leon Center
  const a4X = claireLeft + claireMeta.width + 12;                  // Claire side
  const a5X = diamondLeft + diamondMeta.width - 15;                // Diamond

  // Green Upgrade Arrows - RENDERED POR ENCIMA (IN FRONT) with rich neon glow & visible shafts
  const svgForegroundArrows = `
  <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Intense neon bloom -->
      <filter id="intenseNeon" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur3" />
        <feMerge>
          <feMergeNode in="blur3" />
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Gradient for arrow shafts - fully visible from bottom to top -->
      <linearGradient id="beamGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#059669" stop-opacity="0.1" />
        <stop offset="35%" stop-color="#10b981" stop-opacity="0.7" />
        <stop offset="80%" stop-color="#34d399" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#a7f3d0" stop-opacity="1" />
      </linearGradient>

      <!-- Gradient for arrow head fill -->
      <linearGradient id="headFill" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#059669" stop-opacity="0.5" />
        <stop offset="50%" stop-color="#10b981" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#bbf7d0" stop-opacity="0.95" />
      </linearGradient>
    </defs>

    <!-- ARROW 1 (Blue Rock) -->
    <g filter="url(#intenseNeon)">
      <line x1="${a1X}" y1="260" x2="${a1X}" y2="78" stroke="url(#beamGrad)" stroke-width="3.5" stroke-linecap="round" />
      <path d="M ${a1X - 18} 112 L ${a1X} 68 L ${a1X + 18} 112 L ${a1X} 98 Z" 
        fill="url(#headFill)" stroke="#4ade80" stroke-width="2.5" stroke-linejoin="round" />
      <circle cx="${a1X}" cy="165" r="2.2" fill="#86efac" />
      <circle cx="${a1X - 4}" cy="220" r="1.6" fill="#86efac" opacity="0.85" />
    </g>

    <!-- ARROW 2 (Yellow Rock - Directly over front) -->
    <g filter="url(#intenseNeon)">
      <line x1="${a2X}" y1="275" x2="${a2X}" y2="52" stroke="url(#beamGrad)" stroke-width="4" stroke-linecap="round" />
      <path d="M ${a2X - 22} 94 L ${a2X} 44 L ${a2X + 22} 94 L ${a2X} 80 Z" 
        fill="url(#headFill)" stroke="#4ade80" stroke-width="3" stroke-linejoin="round" />
      <circle cx="${a2X + 6}" cy="140" r="2.5" fill="#86efac" />
      <circle cx="${a2X - 6}" cy="210" r="1.8" fill="#86efac" opacity="0.85" />
    </g>

    <!-- ARROW 3 (Center / Leon - Tallest Heroic Arrow, visible right in front of ring) -->
    <g filter="url(#intenseNeon)">
      <line x1="${a3X}" y1="285" x2="${a3X}" y2="12" stroke="url(#beamGrad)" stroke-width="4.5" stroke-linecap="round" />
      <path d="M ${a3X - 26} 58 L ${a3X} 5 L ${a3X + 26} 58 L ${a3X} 44 Z" 
        fill="url(#headFill)" stroke="#86efac" stroke-width="3.5" stroke-linejoin="round" />
      <circle cx="${a3X - 8}" cy="110" r="2.8" fill="#a7f3d0" />
      <circle cx="${a3X + 10}" cy="180" r="2" fill="#a7f3d0" opacity="0.85" />
    </g>

    <!-- ARROW 4 (Claire side) -->
    <g filter="url(#intenseNeon)">
      <line x1="${a4X}" y1="275" x2="${a4X}" y2="52" stroke="url(#beamGrad)" stroke-width="4" stroke-linecap="round" />
      <path d="M ${a4X - 22} 94 L ${a4X} 44 L ${a4X + 22} 94 L ${a4X} 80 Z" 
        fill="url(#headFill)" stroke="#4ade80" stroke-width="3" stroke-linejoin="round" />
      <circle cx="${a4X - 6}" cy="145" r="2.5" fill="#86efac" />
      <circle cx="${a4X + 7}" cy="215" r="1.8" fill="#86efac" opacity="0.85" />
    </g>

    <!-- ARROW 5 (Diamond) -->
    <g filter="url(#intenseNeon)">
      <line x1="${a5X}" y1="260" x2="${a5X}" y2="78" stroke="url(#beamGrad)" stroke-width="3.5" stroke-linecap="round" />
      <path d="M ${a5X - 18} 112 L ${a5X} 68 L ${a5X + 18} 112 L ${a5X} 98 Z" 
        fill="url(#headFill)" stroke="#4ade80" stroke-width="2.5" stroke-linejoin="round" />
      <circle cx="${a5X}" cy="165" r="2.2" fill="#86efac" />
      <circle cx="${a5X + 5}" cy="225" r="1.6" fill="#86efac" opacity="0.85" />
    </g>
  </svg>
  `;

  const backdropBuf = await sharp(Buffer.from(svgBackdrop)).toBuffer();
  const fgArrowsBuf = await sharp(Buffer.from(svgForegroundArrows)).toBuffer();

  // Create 100% transparent base canvas
  const transparentCanvas = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).png().toBuffer();

  // Composite order:
  // 1. Red Backdrop Glow (BEHIND EVERYTHING)
  // 2. Blue Rock & Diamond (Back flank)
  // 3. Claire & Yellow Rock (Mid flank)
  // 4. Leon (Centerpiece hero)
  // 5. Green Upgrade Arrows (POR ENCIMA / ON TOP OF EVERYTHING!)
  const compositePipeline = sharp(transparentCanvas)
    .composite([
      { input: backdropBuf, left: 0, top: 0 },
      { input: blueBuf, left: blueLeft, top: blueTop },
      { input: diamondBuf, left: diamondLeft, top: diamondTop },
      { input: yellowBuf, left: yellowLeft, top: yellowTop },
      { input: claireBuf, left: claireLeft, top: claireTop },
      { input: leonBuf, left: leonLeft, top: leonTop },
      { input: fgArrowsBuf, left: 0, top: 0 } // POR ENCIMA!
    ]);

  // Output as PNG
  const pngDest = path.join(__dirname, '..', 'public', 'llaveros', 'keyrings_upgrade_showcase.png');
  await compositePipeline.clone().png({ quality: 100 }).toFile(pngDest);
  console.log('Saved PNG to:', pngDest);

  // Also output as WebP
  const webpDest = path.join(__dirname, '..', 'public', 'llaveros', 'keyrings_upgrade_showcase.webp');
  await compositePipeline.clone().webp({ quality: 95 }).toFile(webpDest);
  console.log('Saved WebP to:', webpDest);
}

buildKeyringsComposite().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
