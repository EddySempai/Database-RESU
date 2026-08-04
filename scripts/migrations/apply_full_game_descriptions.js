import fs from 'fs';

const ops = JSON.parse(fs.readFileSync('src/data/operativos.json', 'utf8'));

// 1. Katherine Warren
const katherine = ops.find(o => o.id === 'katherine');
if (katherine) {
  katherine.skills = [
    {
      type: 'Exploración',
      name: 'Lanzallamas',
      description: 'Saca el lanzallamas, causando daño equivalente al 65,5% del poder de ataque a todos los enemigos en un área cónica durante 3 segundos.',
      iconUrl: '/icons/skill/Icon_Skill_112010.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Instinto de supervivencia',
      description: 'El daño que reciben de los enemigos las unidades aliadas que incluyen a este héroe se reduce.',
      iconUrl: '/icons/skill/Instinto de supervivencia (katherine).webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Municiones de alto rendimiento',
      description: 'Aumenta el daño infligido de los ataques comunes en un porcentaje.',
      iconUrl: '/icons/skill/Icon_Skill_122010.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Recolectar madera',
      description: 'Al desplegar una unidad que incluya a este héroe, la velocidad de recolección de madera aumenta.',
      iconUrl: '/icons/skill/Icon_Field_Skill_222010.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Apoyo',
      description: 'Aumenta el poder de defensa de todos los aliados.',
      iconUrl: '/icons/skill/Icon_Skill_132010.webp',
      isArmaEspecial: false
    }
  ];
}

// 2. Alyssa Ashcroft
const alyssa = ops.find(o => o.id === 'alyssa');
if (alyssa) {
  alyssa.skills = [
    {
      type: 'Exploración',
      name: 'Lanzamiento de V-JOLT',
      description: 'Lanza un frasco de solución especial V-JOLT que inflige daño de ataque a los enemigos en el área y los ralentiza.',
      iconUrl: '/icons/skill/Icon_Skill_112014.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Detección de crisis',
      description: 'Las unidades aliadas que incluyen a este héroe reducen el daño infligido por los enemigos.',
      iconUrl: '/icons/skill/deteccion de crisis (alyssa).webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Disparo aturdidor',
      description: 'Dispara con la pistola taser aturdiendo a los objetivos.',
      iconUrl: '/icons/skill/Icon_Skill_122014.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Paso ágil',
      description: 'Al desplegar una unidad que incluya a este héroe, la velocidad de marcha aumenta.',
      iconUrl: '/icons/skill/Icon_Field_Skill_222014.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Instinto de reportero',
      description: 'Al desplegar una unidad que incluya a este héroe, la velocidad de desplazamiento e información aumenta.',
      iconUrl: '/icons/skill/Icon_Skill_132014.webp',
      isArmaEspecial: false
    }
  ];
}

// 3. Robert Kendo
const robert = ops.find(o => o.id === 'robert');
if (robert) {
  robert.skills = [
    {
      type: 'Exploración',
      name: 'Municiones de detención',
      description: 'Dispara un potente tiro de escopeta personalizada que repele a los enemigos.',
      iconUrl: '/icons/skill/Icon_Skill_112004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Experto en modificación',
      description: 'Aumenta el poder de ataque y la capacidad de modificación de armas de las tropas.',
      iconUrl: '/icons/skill/Experto en modificacion (robert).webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: '¡Toma esto!',
      description: 'Coloca una carga explosiva temporizada. El enemigo repelido queda aturdido por 2 segundos y luego explota.',
      iconUrl: '/icons/skill/Icon_Skill_122004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Conocimiento de forja',
      description: 'Aumenta la defensa y resistencia de las unidades en combate.',
      iconUrl: '/icons/skill/Icon_Field_Skill_222004.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Apoyo de fuego',
      description: 'Suministra cajas de munición que aumentan el daño y recarga de los aliados cercanos.',
      iconUrl: '/icons/skill/Icon_Skill_132004.webp',
      isArmaEspecial: false
    }
  ];
}

// 4. Marvin Branagh
const marvin = ops.find(o => o.id === 'marvin');
if (marvin) {
  marvin.skills = [
    {
      type: 'Exploración',
      name: 'Barricada',
      description: 'Coloca una barricada policial que bloquea el paso de los enemigos y absorbe daño.',
      iconUrl: '/icons/skill/Icon_Skill_112002.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Instinto policial',
      description: 'Aumenta la defensa y moral de las unidades aliadas en combate.',
      iconUrl: '/icons/skill/Instinto Policial (Marvin).webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Disparo a la pierna',
      description: 'Dispara a la pierna del objetivo causando daño de ataque y reduciendo su velocidad de movimiento.',
      iconUrl: '/icons/skill/Icon_Skill_122002.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Desarme táctico',
      description: 'Reduce el daño de ataque que infligen las unidades enemigas.',
      iconUrl: '/icons/skill/Icon_Field_Skill_222002.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Empujón defensivo',
      description: 'Empuja a los atacantes cercanos para proteger la posición defensiva.',
      iconUrl: '/icons/skill/Icon_Skill_132002.webp',
      isArmaEspecial: false
    }
  ];
}

// 5. Barry Burton
const barry = ops.find(o => o.id === 'barry');
if (barry) {
  barry.skills = [
    {
      type: 'Exploración',
      name: 'Disparo de Magnum',
      description: 'Dispara una potente bala Magnum de gran calibre que causa un daño masivo.',
      iconUrl: '/icons/skill/Icon_Skill_112007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Entrenamiento físico',
      description: 'Reducción del consumo de energía y aumento de la salud de las tropas aliadas.',
      iconUrl: '/icons/skill/Entrenamiento Fisico (barry).webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Tiro Certero',
      description: 'Barry apunta cuidadosamente infligiendo daño crítico a un objetivo.',
      iconUrl: '/icons/skill/Icon_Skill_122007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Balística pesada',
      description: 'Aumenta el poder de fuego de los atacantes aliados de la unidad.',
      iconUrl: '/icons/skill/Icon_Field_Skill_222007.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Fuego de cobertura',
      description: 'Dispara una ráfaga que protege a sus compañeros mientras se reagrupan.',
      iconUrl: '/icons/skill/Icon_Skill_132007.webp',
      isArmaEspecial: false
    }
  ];
}

// 6. Mikhail Victor
const mikhail = ops.find(o => o.id === 'mikhail');
if (mikhail) {
  mikhail.skills = [
    {
      type: 'Exploración',
      name: 'Barril de combustible',
      description: 'Detona un barril de combustible explosivo causando daño masivo en área y quemando a los enemigos.',
      iconUrl: '/icons/skill/Icon_Skill_112009.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Experiencia del veterano',
      description: 'La experiencia militar de Mikhail aumenta el ataque y reduce el daño recibido de las tropas.',
      iconUrl: '/icons/skill/Experiencia del veterano (mikhail).webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Posición táctica',
      description: 'Se agacha en cobertura aumentando su puntería y daño continuo con el rifle militar.',
      iconUrl: '/icons/skill/Icon_Skill_122009.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Disciplina U.B.C.S.',
      description: 'Aumenta la velocidad de ataque y letalidad de los atacantes aliados.',
      iconUrl: '/icons/skill/Icon_Field_Skill_222009.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Último recurso',
      description: 'Mikhail se mantiene firme disparando una ráfaga devastadora contra todos los enemigos frente a él.',
      iconUrl: '/icons/skill/Icon_Skill_132009.webp',
      isArmaEspecial: false
    }
  ];
}

// 7. Mark Wilkins
const mark = ops.find(o => o.id === 'mark');
if (mark) {
  mark.skills = [
    {
      type: 'Exploración',
      name: 'Golpe demoledor',
      description: 'Blande un objeto pesado causando daño contundente y aturdiendo a los enemigos.',
      iconUrl: '/icons/skill/Icon_Skill_112012.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Desarrollo muscular (Bulk Up)',
      description: 'Aumenta la salud máxima y la resistencia al daño de los defensores aliados.',
      iconUrl: '/icons/skill/Desarrollo muscular (bulk up) - (mark).webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Guardia férrea',
      description: 'Adopta una postura defensiva que reduce enormemente el daño recibido durante varios segundos.',
      iconUrl: '/icons/skill/Icon_Skill_122012.webp',
      isArmaEspecial: false
    },
    {
      type: 'Campo',
      name: 'Constitución robusta',
      description: 'Aumenta la defensa general de las unidades de la tropa.',
      iconUrl: '/icons/skill/Icon_Field_Skill_222012.webp',
      isArmaEspecial: false
    },
    {
      type: 'Exploración',
      name: 'Embestida de choque',
      description: 'Avanza con fuerza apartando a los enemigos que se interponen en su camino.',
      iconUrl: '/icons/skill/Icon_Skill_132012.webp',
      isArmaEspecial: false
    }
  ];
}

// Clean Jake Muller leading comma if present
const jake = ops.find(o => o.id === 'jake');
if (jake && jake.skills) {
  jake.skills.forEach(s => {
    if (s.name.startsWith(',')) s.name = s.name.substring(1).trim();
  });
}

fs.writeFileSync('src/data/operativos.json', JSON.stringify(ops, null, 2), 'utf8');
console.log('✅ Habilidades y descripciones completadas con los textos reales del juego.');
