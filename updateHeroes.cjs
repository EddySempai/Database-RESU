const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src/data/operativos.json');
let operativos = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const updateHero = (id, newProps) => {
  const index = operativos.findIndex(o => o.id === id);
  if (index !== -1) {
    operativos[index] = { ...operativos[index], ...newProps };
  } else {
    operativos.push({ id, ...newProps });
  }
};

// BSAA CHRIS (017)
updateHero('bsaa-chris', {
  name: "BSAA Chris Redfield",
  imageUrl: "/operativos/character-BsaaChrisRedfield-visual.webp",
  iconUrl: "/portraits/PortraitBust_BsaaChrisRedfield.webp",
  backgroundUrl: "/operativos/bg/Character_bg_13.webp",
  stats: { health: 176000, attack: 4590, defense: 1980, troops: 13470 },
  fieldStats: [
    { label: "Poder de ataque de Atacante", value: "260.23%" },
    { label: "Poder de defensa de Atacante", value: "260.23%" }
  ],
  unitType: "Atacante",
  rarity: "Legendario",
  specialWeapon: {
    name: "Tactical Pistol",
    imageUrl: "/recursos/Item_Hero_Epuip_A_13017.webp"
  },
  skills: [
    {
      name: "Heavy Blow",
      description: "When things get tough, BSAA Chris Redfield punches a boulder with all his might. The boulder is sent rolling forward, dealing damage equal to x% of Attack to enemies in range and stunning them for 2 seconds. Damaged enemies have their Defense reduced by y% for 10 seconds.",
      iconUrl: "/icons/skill/Icon_Skill_113017.webp",
      type: "Exploración",
      category: "active"
    },
    {
      name: "Muzzle Control",
      description: "After every 7 normal attacks, deals x% increased normal attack damage and ignores defense against a single enemy.",
      iconUrl: "/icons/skill/Icon_Skill_123017.webp",
      type: "Exploración",
      category: "passive"
    },
    {
      name: "Right Partner",
      description: "Increases Attack by x% for 10 seconds. If deployed alongside Sheva Alomar, Sheva Alomar's Attack will increase by the same percentage.",
      iconUrl: "/icons/skill/Icon_Skill_133017.webp",
      type: "Exploración",
      category: "passive"
    },
    {
      name: "Tactical Shift",
      description: "Increases BSAA Chris Redfield's Attack Speed by x%.",
      iconUrl: "/icons/skill/Icon_Skill_143017.webp",
      type: "Exploración",
      category: "passive" // Weapon skill
    },
    {
      name: "Focused Firepower",
      description: "When an ally squad containing this hero is in battle, increases the Penetration of the squad by x%.",
      iconUrl: "/icons/skill/Icon_Field_Skill_213017.webp",
      type: "Campo",
      category: "passive"
    },
    {
      name: "Overwhelming Suppression",
      description: "When an ally squad containing this hero is in battle, after attacking 3 times, ally Attackers reduce damage taken from enemies by x% for 2 turns.",
      iconUrl: "/icons/skill/Icon_Field_Skill_223017.webp",
      type: "Campo",
      category: "passive"
    },
    {
      name: "Focused Strike",
      description: "When an ally squad containing this hero is in battle, increases damage dealt by ally Attackers to the enemy by x%.",
      iconUrl: "/icons/skill/Icon_Field_Skill_233017.webp",
      type: "Campo",
      category: "passive"
    },
    {
      name: "BSAA Defensive Tactic",
      description: "If this hero is the Garrison Leader, increases the Defense of the ally squad by x% in Garrison Battles.",
      iconUrl: "/icons/skill/Icon_Field_Skill_243017.webp",
      type: "Campo",
      category: "passive"
    }
  ]
});

// SHEVA (016, user said 019 but images are 016)
updateHero('sheva', {
  name: "Sheva Alomar",
  imageUrl: "/operativos/character-ShevaAlomar-visual.webp",
  iconUrl: "/portraits/PortraitBust_ShevaAlomar.webp",
  backgroundUrl: "/operativos/bg/Character_bg_13.webp",
  stats: { health: 176000, attack: 4590, defense: 1980, troops: 13470 },
  fieldStats: [
    { label: "Poder de ataque de Ranger", value: "260.23%" },
    { label: "Poder de defensa de Ranger", value: "260.23%" }
  ],
  unitType: "Ranger",
  rarity: "Legendario",
  specialWeapon: {
    name: "Longbow",
    imageUrl: "/recursos/Item_Hero_Epuip_A_13016.webp"
  },
  skills: [
    {
      name: "Longbow",
      description: "Uses her longbow to fire at an enemy in range, dealing damage equal to x% of Attack and stunning them for 3 seconds.",
      iconUrl: "/icons/skill/Icon_Skill_113016.webp",
      type: "Exploración",
      category: "active"
    },
    {
      name: "Stun Rod",
      description: "Wields a Stun Rod, dealing damage equal to x% of Attack to all enemies in range and stunning them for 2 seconds.",
      iconUrl: "/icons/skill/Icon_Skill_123016.webp",
      type: "Exploración",
      category: "passive"
    },
    {
      name: "Left Partner",
      description: "Every 18 seconds, recovers HP equal to x% of Attack if HP is under 50%. If deployed alongside BSAA Chris Redfield, BSAA Chris Redfield will heal for the same amount of HP.",
      iconUrl: "/icons/skill/Icon_Skill_133016.webp",
      type: "Exploración",
      category: "passive"
    },
    {
      name: "Shujaa's Cover Fire",
      description: "When hit by an attack, Sheva Alomar gains a shield that blocks damage equal to x% of her Max HP.",
      iconUrl: "/icons/skill/Icon_Skill_143016.webp",
      type: "Exploración",
      category: "passive"
    },
    {
      name: "Battlefield Instincts",
      description: "When an ally squad containing this hero is in battle, has a 25% chance to reduce damage dealt by the enemy to the squad by x%.",
      iconUrl: "/icons/skill/Icon_Field_Skill_213016.webp",
      type: "Campo",
      category: "passive"
    },
    {
      name: "Cover Fire",
      description: "When an ally squad containing this hero is in battle, increases damage dealt by the squad to the enemy by x%.",
      iconUrl: "/icons/skill/Icon_Field_Skill_223016.webp",
      type: "Campo",
      category: "passive"
    },
    {
      name: "Camouflage",
      description: "When an ally squad containing this hero is in battle, ally Defenders have a x% chance to dodge the enemy's attack.",
      iconUrl: "/icons/skill/Icon_Field_Skill_233016.webp",
      type: "Campo",
      category: "passive"
    },
    {
      name: "Shujaa's Honor",
      description: "If this hero is the Rally Leader, increases the HP of the ally squad by x% in Rally Battles.",
      iconUrl: "/icons/skill/Icon_Field_Skill_243016.webp",
      type: "Campo",
      category: "passive"
    }
  ]
});

// EXCELLA (018)
updateHero('excella', {
  name: "Excella Gionne",
  imageUrl: "/operativos/character-ExcellaGionne-visual.webp",
  iconUrl: "/portraits/PortraitBust_ExcellaGionne.webp",
  backgroundUrl: "/operativos/bg/Character_bg_12.webp",
  stats: { health: 176000, attack: 4590, defense: 1980, troops: 13470 },
  fieldStats: [
    { label: "Poder de ataque de Defensor", value: "260.23%" },
    { label: "Poder de defensa de Defensor", value: "260.23%" }
  ],
  unitType: "Defensor",
  rarity: "Legendario",
  specialWeapon: {
    name: "Toxicity Syringe",
    imageUrl: "/recursos/Item_Hero_Epuip_A_13018.webp"
  },
  skills: [
    {
      name: "Toxicity Test",
      description: "Blasts an enemy in range with a toxic round, dealing damage equal to x% of the enemy's Max HP and poisoning them for 10 seconds. Poisoned units take damage equal to y% of Attack every second.",
      iconUrl: "/icons/skill/Icon_Skill_113018.webp",
      type: "Exploración",
      category: "active"
    },
    {
      name: "Boost Toxicity",
      description: "Reduces the Attack of poisoned enemies by x% and Defense by y%.",
      iconUrl: "/icons/skill/Icon_Skill_123018.webp",
      type: "Exploración",
      category: "passive"
    },
    {
      name: "Evolution Research",
      description: "Increases damage dealt by allies by x% for 10 seconds.",
      iconUrl: "/icons/skill/Icon_Skill_133018.webp",
      type: "Exploración",
      category: "passive"
    },
    {
      name: "Virulent Diffusion",
      description: "When \"Toxicity Test\" is used, the toxin spreads, poisoning x% additional enemies. At Lv. 5, the skill additionally stuns poisoned targets for 1 second.",
      iconUrl: "/icons/skill/Icon_Skill_143018.webp",
      type: "Exploración",
      category: "passive"
    },
    {
      name: "Know Your Place",
      description: "When an ally squad containing this hero is in battle, reduces the Defense of the enemy by x%.",
      iconUrl: "/icons/skill/Icon_Field_Skill_213018.webp",
      type: "Campo",
      category: "passive"
    },
    {
      name: "Synapse Sever",
      description: "When an ally squad containing this hero is in battle, every 2 turns, ally Rangers have a x% chance to stun their targeted enemy type for 1 turn. (Stun attempts may be made on a target up to 3 times a turn.)",
      iconUrl: "/icons/skill/Icon_Field_Skill_223018.webp",
      type: "Campo",
      category: "passive"
    },
    {
      name: "Mark Specimen",
      description: "When an ally squad containing this hero is in battle, increases damage taken by the enemy by x%.",
      iconUrl: "/icons/skill/Icon_Field_Skill_233018.webp",
      type: "Campo",
      category: "passive"
    },
    {
      name: "Top-Down Directive",
      description: "If this hero is the Rally Leader, increases the Attack of the ally squad by x% in Rally Battles.",
      iconUrl: "/icons/skill/Icon_Field_Skill_243018.webp",
      type: "Campo",
      category: "passive"
    }
  ]
});

fs.writeFileSync(dataPath, JSON.stringify(operativos, null, 2));
console.log('Operativos actualizados');
