import fs from 'fs';

const esOps = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));
const enOps = JSON.parse(fs.readFileSync('src/locales/en/operativos.json', 'utf8'));
const jaOps = JSON.parse(fs.readFileSync('src/locales/ja/operativos.json', 'utf8'));

function syncLocale(targetOps) {
  const targetMap = new Map(targetOps.map(o => [o.id, o]));
  return esOps.map(esOp => {
    const tOp = targetMap.get(esOp.id) || {};
    const tSkills = tOp.skills || [];
    const skills = (esOp.skills || []).map((esSkill, idx) => {
      const tSkill = tSkills[idx] || {};
      return {
        type: esSkill.type,
        name: tSkill.name || esSkill.name,
        description: tSkill.description || esSkill.description,
        iconUrl: esSkill.iconUrl,
        isArmaEspecial: esSkill.isArmaEspecial || false,
        isVipSkill: esSkill.isVipSkill || false
      };
    });

    return {
      id: esOp.id,
      name: tOp.name || esOp.name,
      rarity: tOp.rarity || esOp.rarity,
      unitType: tOp.unitType || esOp.unitType,
      imageUrl: esOp.imageUrl,
      iconUrl: esOp.iconUrl,
      stats: esOp.stats,
      fieldStats: esOp.fieldStats,
      skills
    };
  });
}

const newEn = syncLocale(enOps);
const newJa = syncLocale(jaOps);

fs.writeFileSync('src/locales/en/operativos.json', JSON.stringify(newEn, null, 2), 'utf8');
fs.writeFileSync('src/locales/ja/operativos.json', JSON.stringify(newJa, null, 2), 'utf8');

console.log('✅ Locales EN y JA sincronizados perfectamente con ES.');
