export interface GuideSection {
  title: string;
  points: string[];
}

export interface GuideDossier {
  id: number;
  slug: string;
  category: 'beginner' | 'combat' | 'economy' | 'optimization' | 'events';
  categoryLabel: string;
  badge: string;
  badgeColor: string;
  title: string;
  desc: string;
  image?: string;
  readTime: string;
  difficulty: string;
  difficultyLevel: 'Recluta' | 'Avanzado' | 'Experto';
  color: string;
  borderColor: string;
  glowColor: string;
  iconBg: string;
  iconName: string;
  gridSpan: string;
  isHero?: boolean;
  takeaways: string[];
  sections: GuideSection[];
  mistakes: string[];
}

export const GUIAS_DATA: GuideDossier[] = [
  {
    id: 7,
    slug: 'repeler-a-mortem',
    category: 'events',
    categoryLabel: 'Eventos de Alianza',
    badge: 'JEFE DE ALIANZA',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    title: 'Repeler a Mortem: Guía de Jefe Mundial',
    desc: 'Estrategia completa para el evento cooperativo de alianza: fases de radar, invocación R4/R5, ruptura de defensa y ventana de aturdimiento.',
    image: '/guias/Event_WorldBoss_Mortem.webp',
    readTime: '5 min',
    difficulty: 'Avanzado',
    difficultyLevel: 'Avanzado',
    color: 'from-red-950/60 via-[#100a0a] to-[#050505]',
    borderColor: 'border-red-600/40 hover:border-red-500',
    glowColor: 'group-hover:shadow-[0_0_35px_rgba(239,68,68,0.2)]',
    iconBg: 'bg-red-500/20 text-red-400 border-red-500/40',
    iconName: 'Skull',
    gridSpan: 'col-span-12 lg:col-span-8 min-h-[320px]',
    isHero: true,
    takeaways: [
      'Día 1-2: Completa las misiones de radar de Huellas de Mortem para acumular bufo de daño para toda la alianza.',
      'Solo líderes R4 y R5 pueden invocar a Mortem; asegúrate de coordinar la colmena a menos de 15s de marcha.',
      'Ataca con Concentraciones (Rallies) mientras su escudo esté activo para agotar el medidor de defensa.',
      'Cuando entre en Estado de Aturdimiento (Stun), lanza todas tus marchas individuales en ráfaga.'
    ],
    sections: [
      {
        title: '1. Fase de Preparación y Bufo de Alianza',
        points: [
          'Durante los 2 días previos al combate, rastrea las Huellas de Mortem en el radar diario.',
          'Entrega todas las Muestras de Tejido Infectado para subir el multiplicador de daño contra Mortem de todo tu clan.',
          'Reubica tu base formando un círculo cerrado alrededor de las coordenadas de invocación designadas por R4/R5.'
        ]
      },
      {
        title: '2. Mecánica de Combate: Escudo vs Aturdimiento',
        points: [
          'Fase de Escudo: Los ataques individuales hacen daño nulo. Los jugadores con mayor embajada deben abrir rallies continuos para romper la defensa.',
          'Fase de Aturdimiento: Una vez drenada la barra, el jefe queda inmóvil. Es la ventana de oro para mandar ataques individuales masivos y escalar en el ranking.',
          'Rotación de Formas: Mortem evoluciona en 3 fases progresivas (1.ª, 2.ª y 3.ª forma en Saint Vale) con mayor resistencia y daño de área.'
        ]
      },
      {
        title: '3. Formación de Héroes Recomendada',
        points: [
          'Líder de Rally: Héroes de expansión de capacidad de concentración y daño de tropas.',
          'Ataque Individual: Héroes de alta Letalidad y daño a objetivo único (Cazadores / Rangers).'
        ]
      }
    ],
    mistakes: [
      'Lanzar ataques individuales rápidos cuando el jefe todavía tiene el medidor de defensa lleno.',
      'Invocar a Mortem lejos de la colmena de la alianza, perdiendo minutos en marchas lentas.'
    ]
  },
  {
    id: 8,
    slug: 'cumbre-de-ases',
    category: 'events',
    categoryLabel: 'Eventos Semanales',
    badge: 'EVENTO SEMANAL',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    title: 'Cumbre de Ases (Ace Commander): Las 6 Fases',
    desc: 'Plan semanal para dominar el evento competitivo: cómo acumular recursos, preparación del domingo y optimización de aceleradores.',
    image: '/og-image.png',
    readTime: '6 min',
    difficulty: 'Experto',
    difficultyLevel: 'Experto',
    color: 'from-amber-950/50 via-[#0e0a05] to-[#050505]',
    borderColor: 'border-yellow-500/30 hover:border-yellow-500/70',
    glowColor: 'group-hover:shadow-[0_0_35px_rgba(234,179,8,0.2)]',
    iconBg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    iconName: 'Trophy',
    gridSpan: 'col-span-12 lg:col-span-4 min-h-[320px]',
    takeaways: [
      'El Truco del Domingo: Envía tus tropas a recolectar a nodos Nv. 6/7 el domingo para que regresen tras el reset del lunes.',
      'Ahorro estricto: Nunca uses fragmentos de héroe, boletos dorados ni aceleradores de tropa fuera de su día correspondiente.',
      'Ascenso de Tropas: Ascender tropas de T8 a T9 el viernes da más puntos por minuto de acelerador que entrenar desde cero.',
      'Guerra PvP (Fin de semana): Mantén burbuja de 24h activa si no vas a luchar activamente para proteger tus reservas.'
    ],
    sections: [
      {
        title: 'Calendario Semanal de Fases',
        points: [
          'Lunes (Fase 1): Recolección masiva de Petróleo, Hierro y Madera en el mapa con bufo de 50% velocidad.',
          'Martes (Fase 2): Finalización de edificios clave y tecnologías largas consumiendo aceleradores de desarrollo.',
          'Miércoles (Fase 3): Gasto de estamina contra mutantes en el mapa y concentraciones de Armas Biológicas B.O.W.',
          'Jueves (Fase 4): Consumo de boletos de reclutamiento avanzados y subida de estrellas de héroes con fragmentos.',
          'Viernes (Fase 5): Entrenamiento y ascenso de tropas al máximo tier disponible.',
          'Sábado / Domingo (Fase 6): Eliminación de unidades enemigas (Kill Event) en el mapa y guerra de servidores.'
        ]
      }
    ],
    mistakes: [
      'Gastar aceleradores de tropa o boletos de héroe entre semana sin evento activo.',
      'Olvidar poner escudo de paz el sábado por la noche y perder todo el ejército en asaltos.'
    ]
  },
  {
    id: 9,
    slug: 'asalto-laboratorio-vacunas',
    category: 'events',
    categoryLabel: 'Eventos de Alianza',
    badge: 'GvG DE ALIANZA',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    title: 'Asalto al Laboratorio de Vacunas (Vaccine Lab Raid)',
    desc: 'Guía de combate GvG entre dos alianzas: control del Laboratorio Central, captura de protovacunas y distribución de roles.',
    image: '/guias/herb/UI_Herb_Lab.webp',
    readTime: '5 min',
    difficulty: 'Avanzado',
    difficultyLevel: 'Avanzado',
    color: 'from-emerald-950/50 via-[#06100a] to-[#050505]',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    glowColor: 'group-hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    iconName: 'Zap',
    gridSpan: 'col-span-12 lg:col-span-6 min-h-[300px]',
    takeaways: [
      'Requisito de entrada: Hospital curado a cero y ninguna marcha activa en el mapa exterior.',
      'El Laboratorio Central es el edificio con mayor generación pasiva de puntos de victoria.',
      'Los Depósitos de Protovacunas otorgan picos masivos de puntos individuales; manda tropas rápidas.',
      'Usa el traslado de base táctico para ubicarte inmediatamente junto a los objetivos en disputa.'
    ],
    sections: [
      {
        title: 'Estrategia de Escuadrones (3 Grupos)',
        points: [
          'Grupo de Asalto: Jugadores de mayor poder chocan y retienen el Laboratorio Central.',
          'Grupo de Flanqueo: Marchas rápidas patrullan y capturan los depósitos de protovacunas al aparecer.',
          'Grupo de Control: Aseguran Helipuerto y Centros de Energía para dar bufos pasivos al clan.'
        ]
      }
    ],
    mistakes: [
      'Entrar con heridos en el hospital o tropas marchando en el mapa exterior.',
      'Abandonar el Laboratorio Central para perseguir objetivos secundarios sin dejar relevos de guarnición.'
    ]
  },
  {
    id: 10,
    slug: 'defensa-de-la-alianza',
    category: 'events',
    categoryLabel: 'Eventos de Alianza',
    badge: 'DEFENSA COOPERATIVA',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    title: 'Defensa de la Alianza: Proyecto Wesker: Legión',
    desc: 'Sobrevive a las 20 oleadas de mutantes que atacan las bases de los miembros y defiende el Cuartel General de la Alianza en rondas 10 y 20.',
    image: '/guias/ally_defence/Event_AllyMissionbg.webp',
    readTime: '5 min',
    difficulty: 'Avanzado',
    difficultyLevel: 'Avanzado',
    color: 'from-blue-950/50 via-[#060a10] to-[#050505]',
    borderColor: 'border-blue-500/40 hover:border-blue-400',
    glowColor: 'group-hover:shadow-[0_0_35px_rgba(59,130,246,0.2)]',
    iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    iconName: 'Shield',
    gridSpan: 'col-span-12 lg:col-span-6 min-h-[300px]',
    takeaways: [
      'El Cuartel General de la Alianza es atacado en las rondas 10 y 20; todos deben enviar tropas.',
      'Truco de Puntuación: Enviar refuerzos a compañeros da hasta el doble de puntos que defenderte a ti mismo.',
      'Límite de 2 derrotas: Si te queman dos veces, no te atacan más, pero aún puedes ganar puntos reforzando a otros.',
      'No muevas tu base durante el evento o las criaturas cancelarán las marchas hacia ti.'
    ],
    sections: [
      {
        title: 'Protocolo de las 20 Rondas',
        points: [
          'Rondas 1-9: Asalto a bases de miembros conectados. Aplica el sistema de parejas de refuerzo.',
          'Ronda 10: Asalto al Cuartel General de la Alianza. Toda la alianza debe llenar el cuartel.',
          'Rondas 11-19: Oleadas con mutantes de élite contra bases individuales.',
          'Ronda 20: Oleada final contra el Cuartel General. Reúne a todos los defensores disponibles.'
        ]
      }
    ],
    mistakes: [
      'Quedarse con todas las tropas en tu propia base sin reforzar a compañeros.',
      'Dejar el Cuartel General sin tropas de apoyo antes del inicio de la ronda 10.'
    ]
  },
  {
    id: 11,
    slug: 'en-busca-de-hierbas',
    category: 'events',
    categoryLabel: 'Eventos Competitivos',
    badge: 'BATALLA TÁCTICA',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    title: 'En Busca de Hierbas & Laboratorio Central',
    desc: 'Campo de batalla especial: sin bajas de tropas permanentes, árbol de talentos in-game, captura de plantaciones y asalto al Laboratorio de Umbrella.',
    image: '/guias/herb/Event_HerbWar.webp',
    readTime: '5 min',
    difficulty: 'Avanzado',
    difficultyLevel: 'Avanzado',
    color: 'from-emerald-950/60 via-[#09150e] to-[#050505]',
    borderColor: 'border-emerald-600/40 hover:border-emerald-500',
    glowColor: 'group-hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    iconName: 'Compass',
    gridSpan: 'col-span-12 lg:col-span-6 min-h-[300px]',
    takeaways: [
      'Sin Bajas Permanentes: Tus tropas no mueren en combate y se actualizan al nivel más alto que puedas entrenar.',
      'Árbol de Talentos: Mata mutantes para subir de nivel y elegir entre Amplificación de Daño (+66%) o Recolección Rápida (+50%).',
      'Depósitos Temporales: Brotan aleatoriamente durante 5 minutos y se extraen a 200/s (¡máxima prioridad!).',
      'Salto de Base Táctico: Tienes un teletransporte de base gratis cada 360 segundos (6 minutos).'
    ],
    sections: [
      {
        title: 'Jerarquía de Plantaciones y Puntos de Extracción',
        points: [
          'Plantación Nv. 1: 8/s (capacidad 8,640). Defendida por hiedras débiles, ideal para conseguir EXP inicial sin riesgo.',
          'Plantación Nv. 2: 16/s (capacidad 17,280). Excelente balance de rendimiento para oficiales de nivel medio.',
          'Plantación Nv. 3: 32/s (capacidad 34,560). Custodiada por hiedras pesadas, clave para asegurar puntos antes del laboratorio.',
          'Depósito de Hierbas: 200/s (capacidad 4,000). Surge de improviso por 5 min. Agótalo con marchas veloces antes que los rivales.',
          'Laboratorio Central: 600/s (+1,080/min). Se abre a mitad de la sesión. Solo 1 tropa por oficial; quien lo retenga domina el podio.'
        ]
      },
      {
        title: 'Árbol de Habilidades In-Game Recomendado',
        points: [
          'Nivel 1: Elige "Recolección Rápida" (+50% velocidad x 60s) para juego pacífico/rápido, o "Amplificación de Ataque" (+66% daño x 60s) si vas a disputar el núcleo.',
          'Nivel 2: Selecciona "Capacidad de Marcha (+12,000)" para aumentar tu volumen defensivo frente a ataques rivales.',
          'Nivel 3: Elige "Botín de Hiedra" (+1,500 hierbas inmediatas por hiedra derrotada) para mantener la puntuación en ascenso constante.'
        ]
      }
    ],
    mistakes: [
      'Marchar a pie a través de todo el mapa en vez de aprovechar el traslado de base gratuito de 360 segundos.',
      'Ignorar los avisos del sistema cuando un Depósito Temporal brota en el cuadrante.',
      'Dejar tropas inactivas en la base por temor a bajas; en este modo las tropas no mueren.'
    ]
  },
  {
    id: 1,
    slug: 'protocolo-primeros-7-dias',
    category: 'beginner',
    categoryLabel: 'Principiante',
    badge: 'PRIORIDAD VITAL',
    badgeColor: 'bg-blood-red/20 text-neon-red border-blood-red/40',
    title: 'Protocolo de Inicio: Los Primeros 7 Días',
    desc: 'Cómo maximizar el crecimiento de tu base, evitar errores costosos y dominar la economía desde el primer minuto.',
    image: '/guias/ally_defence/FM_AllyHQ_01.webp',
    readTime: '6 min',
    difficulty: 'Recluta',
    difficultyLevel: 'Recluta',
    color: 'from-red-950/40 via-[#0a0a0a] to-[#050505]',
    borderColor: 'border-blood-red/30 hover:border-blood-red/70',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(255,42,42,0.15)]',
    iconBg: 'bg-blood-red/20 text-neon-red border-blood-red/40',
    iconName: 'Flame',
    gridSpan: 'col-span-12 sm:col-span-6 lg:col-span-6 min-h-[240px]',
    takeaways: [
      'Día 1 a 3: Enfócate en subir el Cuartel General y desbloquear slots de tropas.',
      'No distribuyas experiencia entre más de 5 héroes principales al inicio.',
      'Ahorra aceleradores para eventos con recompensas por uso de velocidad.',
      'Completa todas las misiones diarias antes del reset para maximizar pases.'
    ],
    sections: [
      {
        title: 'Plan de Arranque',
        points: [
          'Día 1-2: Concéntrate en la campaña principal hasta desbloquear la Torre y la Arena.',
          'Día 3-4: Únete a una Alianza activa para recibir ayudas de construcción y bonus de recursos.',
          'Día 5-7: Estabiliza tu producción de Hierro y Comida, y refina el equipo de tus 2 mejores atacantes.'
        ]
      }
    ],
    mistakes: [
      'Gastar libros dorados en héroes de rareza inferior a Épica/Legendaria.',
      'Dejar construcciones inactivas durante la noche sin planificar tiempos largos.'
    ]
  },
  {
    id: 2,
    slug: 'optimizacion-equipamiento',
    category: 'combat',
    categoryLabel: 'Combate',
    badge: 'META GEAR',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    title: 'Optimización de Equipamiento y Sets de Combate',
    desc: 'Jerarquía de estadísticas secundarias, combinaciones de sets de 4 piezas y prioridades de mejora.',
    image: '/hero_bg.webp',
    readTime: '4 min',
    difficulty: 'Avanzado',
    difficultyLevel: 'Avanzado',
    color: 'from-purple-950/40 via-[#0a0a0a] to-[#050505]',
    borderColor: 'border-purple-500/30 hover:border-purple-500/70',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    iconName: 'Target',
    gridSpan: 'col-span-12 sm:col-span-6 lg:col-span-6 min-h-[240px]',
    takeaways: [
      'Prioriza Ataque % en Rangers y Especialistas de daño.',
      'Los sets de 4 piezas otorgan bonificaciones de sinergia superiores a piezas sueltas.',
      'La Reducción de Daño en Tanques escala mejor que la Defensa plana en late-game.'
    ],
    sections: [
      {
        title: 'Jerarquía de Atributos',
        points: [
          'Tier S: Ataque %, Probabilidad Crítica %, Daño Crítico %.',
          'Tier A: Penetración de Armadura, Reducción de Daño %.',
          'Tier B: Salud plana, Defensa plana.'
        ]
      }
    ],
    mistakes: [
      'Mejorar accesorios grises o verdes más allá de nivel 5.',
      'Romper un set de 4 piezas por una pieza individual con stats ligeramente mejores.'
    ]
  }
  ,
  {
    id: 12,
    slug: 'guia-maestra-llaveros',
    category: 'optimization',
    categoryLabel: 'Optimización y Equipo',
    badge: 'KEYRINGS',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    title: 'Guía Maestra: Sistema de Llaveros (Keyrings)',
    desc: 'Descubre cómo maximizar el potencial de tus llaveros, cómo desbloquear las 3 ranuras y cómo funcionan las estadísticas base vs las sub-estadísticas equipadas.',
    image: '/llaveros/Item_KeyRing_42.webp',
    readTime: '5 min',
    difficulty: 'Avanzado',
    difficultyLevel: 'Avanzado',
    color: 'from-yellow-950/40 via-[#0e0a05] to-[#050505]',
    borderColor: 'border-yellow-500/30 hover:border-yellow-500/70',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]',
    iconBg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    iconName: 'Key',
    gridSpan: 'col-span-12 sm:col-span-6 lg:col-span-6 min-h-[240px]',
    takeaways: [
      'Los efectos principales son pasivos y permanentes una vez obtenidos.',
      'Solo necesitas equipar un llavero para activar sus sub-estadísticas.',
      'El progreso requiere jugar el nuevo modo 5v5 (Oleadas) y alcanzar el Nivel 200.'
    ],
    sections: [
      {
        title: 'Desbloqueo de Ranuras (Slots)',
        points: [
          '**Ranura 1:** Se desbloquea automáticamente al completar el primer nivel del nuevo modo de juego de oleadas (2 equipos de 5 operativos).',
          '**Ranura 2:** Se desbloquea al superar el nivel 200 en las mecánicas principales.',
          '**Ranura 3:** Es premium. Se desbloquea al adquirir el paquete específico de $5 USD en la tienda del juego.'
        ]
      },
      {
        title: 'Efectos Principales vs Sub-estadísticas',
        points: [
          '**Efectos Principales (Pasivos):** Se activan automáticamente solo por tener el llavero en tu inventario. **NO necesitas equiparlo** para recibir este beneficio.',
          '**Restricción de Duplicados:** Los efectos principales de los llaveros idénticos no se acumulan. Solo puedes tener repetidos si son de diferente tipo (diferente rareza/variante).',
          '**Sub-estadísticas (Activas):** Son las ÚNICAS que requieren que el llavero esté equipado en una de tus 3 ranuras para funcionar. Estas varían drásticamente dependiendo del nivel y la calidad del llavero.'
        ]
      },
      {
        title: 'Estrategia de Equipamiento',
        points: [
          'Dado que los efectos principales ya están activos de forma pasiva, elige qué llavero equipar basándote **exclusivamente en sus sub-estadísticas**.',
          'Intenta buscar sub-estadísticas que complementen la clase de tus operativos principales (Daño para Rangers, Salud para Defensores, etc.).',
          'Mantén siempre tu inventario de llaveros diversificado para acumular la mayor cantidad de efectos principales pasivos posibles.'
        ]
      }
    ],
    mistakes: [
      'Equipar un llavero solo por su efecto principal (recuerda que el efecto principal siempre está activo, lo equipes o no).',
      'Ignorar el modo de oleadas 5v5 perdiendo la oportunidad de desbloquear el primer slot gratuito.',
      'Intentar acumular el mismo llavero exacto esperando que el efecto principal se duplique.'
    ]
  }
];