import fs from 'fs';

const ops = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));

// 1. Chris Redfield
const chris = ops.find(o => o.id === 'chris');
if (chris) {
  chris.skills = [
    {
      type: 'Exploración',
      name: 'Furia Imparable',
      description: 'Chris carga hacia adelante y propina un poderoso puñetazo que causa daño equivalente al 1420% del ataque al objetivo principal y aturde a los enemigos cercanos durante 2 s.',
      iconUrl: chris.skills[0]?.iconUrl || '/icons/skill/Icon_Skill_110001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Mira de Punto Rojo',
      description: 'Aumenta el poder de ataque de los infantes y tropas aliadas en combate en un 35% y mejora la precisión táctica.',
      iconUrl: chris.skills[1]?.iconUrl || '/icons/skill/Icon_Field_Skill_210001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Disparo Pesado',
      description: 'Dispara una ráfaga con su fusil táctico infligiendo 480% de daño continuo a todos los objetivos en un cono frontal.',
      iconUrl: chris.skills[2]?.iconUrl || '/icons/skill/Icon_Skill_120001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Liderazgo BSAA',
      description: 'Las unidades aliadas que incluyen a este héroe aumentan su salud y defensa en combate en 25%.',
      iconUrl: chris.skills[3]?.iconUrl || '/icons/skill/Icon_Field_Skill_220001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Lanzagranadas Táctico',
      description: 'Dispara una granada de alto impacto que inflige daño masivo de área equivalente al 1850% del ataque.',
      iconUrl: chris.skills[4]?.iconUrl || '/icons/skill/Icon_Skill_130001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Voluntad Indomable',
      description: 'Cuando la salud de la unidad desciende por debajo del 30%, reduce el daño recibido en un 40% durante 5 s.',
      iconUrl: chris.skills[5]?.iconUrl || '/icons/skill/Icon_Field_Skill_230001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Desata el poder destructivo de su equipamiento exclusivo de la BSAA causando daño demoledor.',
      iconUrl: chris.skills[6]?.iconUrl || '/icons/skill/Icon_Vip_Skill_01.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Incrementa el ataque y la letalidad de todas las divisiones aliadas en un porcentaje pasivo permanente.',
      iconUrl: chris.skills[7]?.iconUrl || '/icons/skill/Icon_Field_Skill_210001.webp',
      isArmaEspecial: true,
      isVipSkill: true
    }
  ];
}

// 2. Rebecca Chambers
const rebecca = ops.find(o => o.id === 'rebecca');
if (rebecca) {
  rebecca.skills = [
    {
      type: 'Exploración',
      name: 'Activador',
      description: 'En combate, al atacar, las unidades aliadas que incluyen a este héroe tienen un 25% de probabilidad de aumentar 140% el daño infligido al enemigo.',
      iconUrl: rebecca.skills[0]?.iconUrl || '/icons/skill/Icon_Skill_110004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Conocimientos de Medicina Militar',
      description: 'En combate, el ataque de las unidades aliadas que incluyen a este héroe aumenta 15% y su defensa aumenta 10% (6% atk / 4% def base).',
      iconUrl: rebecca.skills[1]?.iconUrl || '/icons/skill/Icon_Field_Skill_210004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Spray de Primeros Auxilios',
      description: 'Rocía spray medicinal curando a todos los aliados cercanos un 45% de su salud máxima y eliminando estados alterados negativos.',
      iconUrl: rebecca.skills[2]?.iconUrl || '/icons/skill/Icon_Skill_120004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Sedante',
      description: 'Las unidades aliadas que incluyen a este héroe tienen un 40% de probabilidad de reducir 25% el daño recibido de los enemigos en combate.',
      iconUrl: rebecca.skills[3]?.iconUrl || '/icons/skill/Icon_Field_Skill_220004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Terapia de Estimulantes',
      description: 'Aumenta la velocidad de ataque y movimiento de todas las tropas aliadas un 30% durante 8 s.',
      iconUrl: rebecca.skills[4]?.iconUrl || '/icons/skill/Icon_Skill_130004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Especialista en Triaje',
      description: 'Aumenta la capacidad de curación y la velocidad de tratamiento hospitalario de heridos en un 50%.',
      iconUrl: rebecca.skills[5]?.iconUrl || '/icons/skill/Icon_Field_Skill_230004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Suministro médico avanzado de alta tecnología que regenera salud continua y otorga escudo protector a los aliados.',
      iconUrl: rebecca.skills[6]?.iconUrl || '/icons/skill/Icon_Vip_Skill_04.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Potenciación táctica médica pasiva que incrementa la vitalidad y resistencia global del ejército.',
      iconUrl: rebecca.skills[7]?.iconUrl || '/icons/skill/Icon_Field_Skill_210004.webp',
      isArmaEspecial: true,
      isVipSkill: true
    }
  ];
}

// 3. Billy Coen
const billy = ops.find(o => o.id === 'billy');
if (billy) {
  billy.skills = [
    {
      type: 'Exploración',
      name: 'Pistolero',
      description: 'Dispara rápidamente con ambas pistolas a los enemigos marcados; tras 1 segundo, reciben daño equivalente al 543% (hasta 1250%) del poder de ataque.',
      iconUrl: billy.skills[0]?.iconUrl || '/icons/skill/Icon_Skill_110005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Condena Militar',
      description: 'Aumenta el daño que infligen los atacantes aliados de la unidad contra tropas y monstruos enemigos en un 25%.',
      iconUrl: billy.skills[1]?.iconUrl || '/icons/skill/Icon_Field_Skill_210005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Cuchillo de Combate',
      description: 'Blande un cuchillo militar a corta distancia causando 420% de daño perforante y provocando hemorragia continua.',
      iconUrl: billy.skills[2]?.iconUrl || '/icons/skill/Icon_Skill_120005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Espíritu Indomable',
      description: 'Cuando la salud de la unidad cae por debajo del 50%, la defensa y el ataque aumentan en un 30% hasta el fin del combate.',
      iconUrl: billy.skills[3]?.iconUrl || '/icons/skill/Icon_Field_Skill_220005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Fuerza Bruta',
      description: 'Realiza un potente disparo que rompe la guardia enemiga e inflige daño crítico masivo a las defensas.',
      iconUrl: billy.skills[4]?.iconUrl || '/icons/skill/Icon_Skill_130005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Tácticas de Supervivencia',
      description: 'Reduce el costo de energía y el daño recibido por las unidades aliadas al explorar o marchar.',
      iconUrl: billy.skills[5]?.iconUrl || '/icons/skill/Icon_Field_Skill_230005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Despliega armamento pesado militar personalizado que arrasa con las líneas enemigas frontales.',
      iconUrl: billy.skills[6]?.iconUrl || '/icons/skill/Icon_Vip_Skill_05.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Aumento pasivo permanente del daño crítico y la perforación de armadura de todas las tropas.',
      iconUrl: billy.skills[7]?.iconUrl || '/icons/skill/Icon_Field_Skill_210005.webp',
      isArmaEspecial: true,
      isVipSkill: true
    }
  ];
}

// 4. Luis Serra Navarro
const luis = ops.find(o => o.id === 'luis');
if (luis) {
  luis.skills = [
    {
      type: 'Exploración',
      name: 'Colocación de Dinamita',
      description: 'Lanza dinamita a la ubicación designada e inflige a los enemigos cercanos daño equivalente al 1710% del ataque.',
      iconUrl: luis.skills[0]?.iconUrl || '/icons/skill/Icon_Skill_110007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: '¡Sígueme, Sancho Panza!',
      description: 'En combate, las unidades aliadas que incluyen a este héroe tienen un 50% de probabilidad de aumentar 50% el daño que reciben los enemigos.',
      iconUrl: luis.skills[1]?.iconUrl || '/icons/skill/Icon_Field_Skill_210007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Pipe Swing',
      description: 'Blande un tubo para infligir, a todos los enemigos dentro del alcance, daño equivalente al 665% del ataque y empujarlos hacia atrás.',
      iconUrl: luis.skills[2]?.iconUrl || '/icons/skill/Icon_Skill_120007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Munición Experimental',
      description: 'Las unidades aliadas que incluyen a este héroe tienen un 50% de probabilidad de aumentar 50% el daño infligido a los enemigos en combate.',
      iconUrl: luis.skills[3]?.iconUrl || '/icons/skill/Icon_Field_Skill_220007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Administración de Inhibidor',
      description: 'Las unidades aliadas que incluyen a este héroe tienen un 40% de probabilidad de reducir 50% el daño recibido de los enemigos en combate.',
      iconUrl: luis.skills[4]?.iconUrl || '/icons/skill/Icon_Skill_130007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Investigación de Parásitos',
      description: 'Aumenta el daño de las unidades contra objetivos infectados y mutaciones en un 30%.',
      iconUrl: luis.skills[5]?.iconUrl || '/icons/skill/Icon_Field_Skill_230007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Inyecta un compuesto neurotóxico que aturde y causa daño de dispersión extremo a los infectados.',
      iconUrl: luis.skills[6]?.iconUrl || '/icons/skill/Icon_Vip_Skill_07.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Incrementa la velocidad de marcha y la penetración balística de la brigada aliada de forma pasiva.',
      iconUrl: luis.skills[7]?.iconUrl || '/icons/skill/Icon_Field_Skill_210007.webp',
      isArmaEspecial: true,
      isVipSkill: true
    }
  ];
}

// 5. Piers Nivans
const piers = ops.find(o => o.id === 'piers');
if (piers) {
  piers.skills = [
    {
      type: 'Exploración',
      name: 'Rifle antimaterial',
      description: 'Nivans saca un rifle antimaterial y dispara. El proyectil atraviesa a todos los objetivos en una línea estrecha, inflige daño equivalente al 555% del ataque y los aturde durante 2 s.',
      iconUrl: piers.skills[0]?.iconUrl || '/icons/skill/Icon_Skill_110011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Tiro a larga distancia',
      description: 'Las unidades aliadas que incluyen a este héroe reducen 12% el daño infligido por los enemigos en combate.',
      iconUrl: piers.skills[1]?.iconUrl || '/icons/skill/Icon_Field_Skill_210011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Concentración innata',
      description: 'Al realizar un ataque normal, el ataque aumenta en 2.4% durante 3 s. Este efecto se acumula hasta 15 veces.',
      iconUrl: piers.skills[2]?.iconUrl || '/icons/skill/Icon_Skill_120011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Ajuste a cero',
      description: 'Cada vez que una unidad aliada que incluya a este héroe ataque 3 veces, el ataque de los rangers aumenta en 6% en el siguiente turno. Este efecto se acumula y dura hasta el final del combate.',
      iconUrl: piers.skills[3]?.iconUrl || '/icons/skill/Icon_Field_Skill_220011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Lanzamiento de bomba',
      description: 'Lanza una bomba hacia la ubicación del objetivo más lejano, provocando una explosión que inflige daño equivalente al 190% del ataque.',
      iconUrl: piers.skills[4]?.iconUrl || '/icons/skill/Icon_Skill_130011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Ojo de Francotirador',
      description: 'Aumenta el rango de ataque y el daño crítico de los rangers aliados un 20%.',
      iconUrl: piers.skills[5]?.iconUrl || '/icons/skill/Icon_Field_Skill_230011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Disparo de precisión con proyectil perforante de blindaje pesado que destroza a los jefes y enemigos acorazados.',
      iconUrl: piers.skills[6]?.iconUrl || '/icons/skill/Icon_Vip_Skill_11.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Mejora continua del daño de francotiradores y el ataque aéreo de apoyo.',
      iconUrl: piers.skills[7]?.iconUrl || '/icons/skill/Icon_Field_Skill_210011.webp',
      isArmaEspecial: true,
      isVipSkill: true
    }
  ];
}

fs.writeFileSync('src/data/operativos.json', JSON.stringify(ops, null, 2), 'utf8');
console.log('✅ Legendarios actualizados con sus descripciones y nombres reales!');
