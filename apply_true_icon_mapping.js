import fs from 'fs';

const ops = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));

const CORRECT_HERO_NUMS = {
  'tyrone': { num: '2000', named: 'tecleo de hombro (tyrone).webp' },
  'marvin': { num: '2002', named: 'Instinto Policial (Marvin).webp' },
  'robert': { num: '2004', named: 'Experto en modificacion (robert).webp' },
  'becca': { num: '2006', named: 'trance total (becca).webp' },
  'barry': { num: '2007', named: 'Entrenamiento Fisico (barry).webp' },
  'tyrell': { num: '2008', named: 'Analisi de puntos debiles (tyrell).webp' },
  'mikhail': { num: '2009', named: 'Experiencia del veterano (mikhail).webp' },
  'katherine': { num: '2010', named: 'Instinto de supervivencia (katherine).webp' },
  'mark': { num: '2012', named: 'Desarrollo muscular (bulk up) - (mark).webp' },
  'alyssa': { num: '2014', named: 'deteccion de crisis (alyssa).webp' },
  
  'murphy': { num: '1000', custom1: 'Dios de la puntería (Murphy Seeker) .webp', custom2: 'Icon_Skill_111000.webp' },
  'brad': { num: '1001', named: 'Contrataque inesperado (Brad) .webp' }
};

ops.forEach(op => {
  const conf = CORRECT_HERO_NUMS[op.id];
  if (!conf) return;

  const existingSkills = op.skills || [];

  if (op.id === 'murphy') {
    op.skills = [
      {
        type: 'Exploración',
        name: existingSkills[0]?.name || 'Dios de la puntería',
        description: existingSkills[0]?.description || '',
        iconUrl: `/icons/skill/${conf.custom1}`,
        isArmaEspecial: false
      },
      {
        type: 'Campo',
        name: existingSkills[1]?.name || 'Disparo decisivo',
        description: existingSkills[1]?.description || '',
        iconUrl: `/icons/skill/${conf.custom2}`,
        isArmaEspecial: false
      },
      {
        type: 'Exploración',
        name: existingSkills[2]?.name || 'Disparo a la cabeza',
        description: existingSkills[2]?.description || '',
        iconUrl: `/icons/skill/Icon_Skill_12${conf.num}.webp`,
        isArmaEspecial: false
      },
      {
        type: 'Campo',
        name: existingSkills[3]?.name || 'Habilidad de recolección',
        description: existingSkills[3]?.description || '',
        iconUrl: `/icons/skill/Icon_Field_Skill_22${conf.num}.webp`,
        isArmaEspecial: false
      },
      {
        type: 'Exploración',
        name: existingSkills[4]?.name || 'Tiro penetrante',
        description: existingSkills[4]?.description || '',
        iconUrl: `/icons/skill/Icon_Skill_13${conf.num}.webp`,
        isArmaEspecial: false
      }
    ];
    return;
  }

  // Common Brad or Epic 1-5
  const slot1 = `/icons/skill/Icon_Skill_11${conf.num}.webp`;
  const slot2 = `/icons/skill/${conf.named}`;
  const slot3 = `/icons/skill/Icon_Skill_12${conf.num}.webp`;
  const slot4 = `/icons/skill/Icon_Field_Skill_22${conf.num}.webp`;
  const slot5 = `/icons/skill/Icon_Skill_13${conf.num}.webp`;

  op.skills = [
    {
      type: existingSkills[0]?.type || 'Exploración',
      name: existingSkills[0]?.name || 'Habilidad Activa 1',
      description: existingSkills[0]?.description || 'Descripción pendiente de ingresar...',
      iconUrl: slot1,
      isArmaEspecial: false
    },
    {
      type: existingSkills[1]?.type || 'Campo',
      name: existingSkills[1]?.name || 'Habilidad Pasiva 1',
      description: existingSkills[1]?.description || 'Descripción pendiente de ingresar...',
      iconUrl: slot2,
      isArmaEspecial: false
    },
    {
      type: existingSkills[2]?.type || 'Exploración',
      name: existingSkills[2]?.name || 'Habilidad Activa 2',
      description: existingSkills[2]?.description || 'Descripción pendiente de ingresar...',
      iconUrl: slot3,
      isArmaEspecial: false
    },
    {
      type: existingSkills[3]?.type || 'Campo',
      name: existingSkills[3]?.name || 'Habilidad Pasiva 2',
      description: existingSkills[3]?.description || 'Descripción pendiente de ingresar...',
      iconUrl: slot4,
      isArmaEspecial: false
    },
    {
      type: existingSkills[4]?.type || 'Exploración',
      name: existingSkills[4]?.name || 'Habilidad Activa 3',
      description: existingSkills[4]?.description || 'Descripción pendiente de ingresar...',
      iconUrl: slot5,
      isArmaEspecial: false
    }
  ];
});

fs.writeFileSync('src/data/operativos.json', JSON.stringify(ops, null, 2), 'utf8');
console.log('✅ src/data/operativos.json actualizado con la correspondencia visual 100% REAL de cada héroe.');
