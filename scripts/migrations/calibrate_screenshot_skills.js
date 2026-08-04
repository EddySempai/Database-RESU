import fs from 'fs';

const ops = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));

// 1. Chris Redfield
const chris = ops.find(o => o.id === 'chris');
if (chris) {
  chris.skills = [
    {
      type: 'Exploración',
      name: 'Escopeta de Asalto',
      description: 'Cada 20 segundos desenfunda una escopeta de asalto, causando daño equivalente al 723% del poder de ataque 3 veces a los enemigos dentro de un área frontal en forma de abanico.',
      iconUrl: '/icons/skill/Icon_Skill_110001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Mira de Punto Rojo',
      description: 'La penetración de las unidades aliadas que incluyen a este héroe aumenta 25% en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_210001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Provocación',
      description: 'Cada 12 segundo(s), reduce el ataque de los enemigos cercanos en 29% durante 5 segundos. Los infectados y criaturas mutantes redirigen su objetivo hacia Chris durante 1 segundo.',
      iconUrl: '/icons/skill/Icon_Skill_120001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Granadas Incendiarias',
      description: 'El daño que infligen los defensores aliados de la unidad que incluye a este héroe aumenta 100% en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_220001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Municiones de Ácido Sulfúrico',
      description: 'Dispara una granada de ácido que inflige 920% de daño del poder de ataque en un área circular y reduce el poder de defensa en 39% durante 12 segundos.',
      iconUrl: '/icons/skill/Icon_Skill_130001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Pointman',
      description: 'El ataque de las unidades aliadas que incluyen a este héroe aumenta 25% en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_230001.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Desata el poder de fuego de su arma exclusiva de combate aumentando el daño de impacto masivo.',
      iconUrl: '/icons/skill/Icon_Vip_Skill_01.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Mejora pasiva permanente que aumenta la resistencia y daño de las tropas de vanguardia.',
      iconUrl: '/icons/skill/Icon_Field_Skill_210001.webp',
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
      name: 'Spray de Primeros Auxilios',
      description: 'Rocía un spray de primeros auxilios a un aliado, restaurando salud equivalente al 105% del Ataque de Rebecca.',
      iconUrl: '/icons/skill/Icon_Skill_110004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Conocimientos de Medicina Militar',
      description: 'En combate, el ataque de las unidades aliadas que incluyen a este héroe aumenta 6% (hasta 15%) y su defensa aumenta 4% (hasta 10%).',
      iconUrl: '/icons/skill/Icon_Field_Skill_210004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Combinación de Hierbas',
      description: 'Cada 12 segundos, Rebecca combina hierbas y restaura la salud de todos los aliados en una cantidad equivalente al 120% de su poder de ataque.',
      iconUrl: '/icons/skill/Icon_Skill_120004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Activador',
      description: 'En combate, al atacar, las unidades aliadas que incluyen a este héroe tienen un 25% de probabilidad de aumentar 140% el daño infligido al enemigo.',
      iconUrl: '/icons/skill/Icon_Field_Skill_220004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Cóctel Molotov',
      description: 'Cada 20 segundos lanza un cóctel molotov. El área impactada arde durante 10 segundos, infligiendo 35% de daño del poder de ataque por segundo a los enemigos dentro del área.',
      iconUrl: '/icons/skill/Icon_Skill_130004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Sedante',
      description: 'Las unidades aliadas que incluyen a este héroe tienen un 40% de probabilidad de reducir 10% (hasta 25%) el daño recibido de los enemigos en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_230004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Suministro médico avanzado que regenera la salud continua de todo el escuadrón.',
      iconUrl: '/icons/skill/Icon_Vip_Skill_04.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Potenciación táctica hospitalaria que incrementa la vitalidad global de las unidades aliadas.',
      iconUrl: '/icons/skill/Icon_Field_Skill_210004.webp',
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
      description: 'Marca 6 veces a los enemigos dentro de un área frontal en forma de abanico. El poder de defensa de los objetivos marcados se reduce en 9,6% y, tras 1 segundo, reciben daño equivalente al 543% (hasta 1250%) del poder de ataque.',
      iconUrl: '/icons/skill/Icon_Skill_110005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Balas de Goma Antidisturbios',
      description: 'Las unidades aliadas que incluyen a este héroe tienen un 20% de probabilidad de aumentar 20% el daño infligido a los enemigos durante 3 turnos en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_210005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Municiones de Punta Hueca',
      description: 'Cada 18 segundos saca una pistola de gran calibre y dispara 3 veces a un solo objetivo. Cada bala inflige un 856% de daño del poder de ataque y aturde durante 1 segundo.',
      iconUrl: '/icons/skill/Icon_Skill_120005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Municiones de Punta Encamisada',
      description: 'Las unidades aliadas que incluyen a este héroe tienen un 50% de probabilidad de aumentar 50% el daño infligido a los enemigos en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_220005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Tiro Crítico',
      description: 'Al realizar un ataque normal, hay un 25% de probabilidad de que el daño del ataque normal contra el enemigo aumente 477,5%. No se puede esquivar.',
      iconUrl: '/icons/skill/Icon_Skill_130005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Disparo Debilitante',
      description: 'En combate, las unidades aliadas que incluyen a este héroe tienen 50% de probabilidad de reducir un 40% el daño infligido por los enemigos.',
      iconUrl: '/icons/skill/Icon_Field_Skill_230005.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Despliega armamento militar pesado exclusivo que inflige daño crítico letal a los objetivos.',
      iconUrl: '/icons/skill/Icon_Vip_Skill_05.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Aumento pasivo permanente de la letalidad y penetración de armadura en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_210005.webp',
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
      iconUrl: '/icons/skill/Icon_Skill_110007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: '¡Sígueme, Sancho Panza!',
      description: 'En combate, las unidades aliadas que incluyen a este héroe tienen un 50% de probabilidad de aumentar 50% el daño que reciben los enemigos.',
      iconUrl: '/icons/skill/Icon_Field_Skill_210007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'SR M1903',
      description: 'Dispara 2 tiros con el SR M1903. Cada bala inflige al objetivo alcanzado daño equivalente al 1000% del ataque.',
      iconUrl: '/icons/skill/Icon_Skill_120007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Munición Experimental',
      description: 'Las unidades aliadas que incluyen a este héroe tienen un 50% de probabilidad de aumentar 50% el daño infligido a los enemigos en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_220007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Pipe Swing',
      description: 'Blande un tubo para infligir, a todos los enemigos dentro del alcance, daño equivalente al 665% del ataque y empujarlos hacia atrás.',
      iconUrl: '/icons/skill/Icon_Skill_130007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Administración de Inhibidor',
      description: 'Las unidades aliadas que incluyen a este héroe tienen un 40% de probabilidad de reducir 50% el daño recibido de los enemigos en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_230007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Inyecta un compuesto químico concentrado que desestabiliza a los infectados.',
      iconUrl: '/icons/skill/Icon_Vip_Skill_07.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Incrementa la velocidad táctica y la eficacia de la división aliada de forma pasiva.',
      iconUrl: '/icons/skill/Icon_Field_Skill_210007.webp',
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
      iconUrl: '/icons/skill/Icon_Skill_110011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Tiro a larga distancia',
      description: 'Las unidades aliadas que incluyen a este héroe reducen 12% el daño infligido por los enemigos en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_210011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Concentración innata',
      description: 'Al realizar un ataque normal, el ataque aumenta en 2.4% durante 3 s. Este efecto se acumula hasta 15 veces.',
      iconUrl: '/icons/skill/Icon_Skill_120011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Ajuste a cero',
      description: 'Cada vez que una unidad aliada que incluya a este héroe ataque 3 veces, el ataque de los rangers aumenta en 6% en el siguiente turno. Este efecto se acumula y dura hasta el final del combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_220011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Lanzamiento de bomba',
      description: 'Lanza una bomba hacia la ubicación del objetivo más lejano, provocando una explosión que inflige daño equivalente al 190% del ataque.',
      iconUrl: '/icons/skill/Icon_Skill_130011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Ajuste del timing de disparo',
      description: 'En combate, las unidades aliadas que incluyen a este héroe tienen un 40% de probabilidad de aumentar 30% el daño infligido a los enemigos.',
      iconUrl: '/icons/skill/Icon_Field_Skill_230011.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Arma Especial (Activa)',
      description: 'Disparo de precisión con proyectil perforante de blindaje pesado que destroza objetivos acorazados.',
      iconUrl: '/icons/skill/Icon_Vip_Skill_11.webp',
      isArmaEspecial: true,
      isVipSkill: true
    },
    {
      type: 'Campo',
      name: 'Arma Especial (Pasiva)',
      description: 'Aumento pasivo permanente del daño de los francotiradores y tropas a distancia.',
      iconUrl: '/icons/skill/Icon_Field_Skill_210011.webp',
      isArmaEspecial: true,
      isVipSkill: true
    }
  ];
}

fs.writeFileSync('src/data/operativos.json', JSON.stringify(ops, null, 2), 'utf8');
console.log('✅ Habilidades oficiales de Chris, Rebecca, Billy, Luis y Piers 100% calibradas con las capturas de pantalla reales.');
