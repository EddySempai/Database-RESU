const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const heroes = [
  { id: 'bsaa-chris', name: 'BSAA Chris Redfield', key: 'BsaaChrisRedfield', type: 'Atacante' },
  { id: 'sheva', name: 'Sheva Alomar', key: 'ShevaAlomar', type: 'Ranger' },
  { id: 'excella', name: 'Excella Gionne', key: 'ExcellaGionne', type: 'Defensor' }
];

const downloadImage = async (url, dest) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  await sharp(Buffer.from(arrayBuffer)).webp().toFile(dest);
};

(async () => {
  const dataPath = path.join(__dirname, 'src/data/operativos.json');
  let operativos = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  for (const hero of heroes) {
    const visualUrl = `https://residentevil-survivalunit.com/assets/images/common/character-${hero.key}-visual.png`;
    const thumbUrl = `https://residentevil-survivalunit.com/assets/images/common/character-${hero.key}-thumb.png`;

    const visualDest = path.join(__dirname, `public/operativos/character-${hero.key}-visual.webp`);
    const thumbDest = path.join(__dirname, `public/portraits/PortraitBust_${hero.key}.webp`);

    console.log(`Downloading ${hero.name}...`);
    try {
      await downloadImage(visualUrl, visualDest);
      await downloadImage(thumbUrl, thumbDest);
      
      if (!operativos.find(o => o.id === hero.id)) {
        operativos.push({
          id: hero.id,
          name: hero.name,
          imageUrl: `/operativos/character-${hero.key}-visual.webp`,
          iconUrl: `/portraits/PortraitBust_${hero.key}.webp`,
          stats: {
            health: 150000,
            attack: 4000,
            defense: 2000,
            troops: 13000
          },
          fieldStats: [
            { label: `Poder de ataque de ${hero.type}`, value: "200.00%" }
          ],
          unitType: hero.type,
          rarity: "Legendario",
          skills: []
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(operativos, null, 2));
  console.log('Done!');
})();
