import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Zap, 
  Sparkles, 
  Compass, 
  Clock, 
  ChevronRight, 
  X, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Award,
  Scale,
  Calculator
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface GuideDossier {
  id: number;
  category: 'beginner' | 'combat' | 'economy' | 'optimization' | 'tools';
  categoryLabelKey: string;
  badge: string;
  badgeColor: string;
  titleKey: string;
  descKey: string;
  readTime: string;
  difficultyKey: string;
  color: string;
  borderColor: string;
  glowColor: string;
  iconBg: string;
  icon: React.ReactNode;
  gridSpan: string;
  isHero?: boolean;
  isToolGrid?: boolean;
  takeaways: string[];
  sections?: {
    title: string;
    points: string[];
  }[];
  mistakes?: string[];
}

export default function Guias() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDossier, setActiveDossier] = useState<GuideDossier | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const GUIDES: GuideDossier[] = [
    {
      id: 1,
      category: 'beginner',
      categoryLabelKey: 'guides.category_beginner',
      badge: 'PRIORIDAD VITAL',
      badgeColor: 'bg-blood-red/20 text-neon-red border-blood-red/40',
      titleKey: 'guides.g1_title',
      descKey: 'guides.g1_desc',
      readTime: '6',
      difficultyKey: 'guides.diff_recruit',
      color: 'from-red-950/40 via-[#0a0a0a] to-[#050505]',
      borderColor: 'border-blood-red/30 hover:border-blood-red/70',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(255,42,42,0.15)]',
      iconBg: 'bg-blood-red/20 text-neon-red border-blood-red/40',
      icon: <Flame className="text-neon-red" size={28} />,
      gridSpan: 'col-span-12 lg:col-span-8 lg:row-span-2 min-h-[380px]',
      isHero: true,
      takeaways: [
        'Día 1 a 3: Enfócate en subir el Cuartel General y desbloquear slots de tropas.',
        'No distribuyas experiencia entre más de 5 héroes principales al inicio.',
        'Ahorra aceleradores para eventos con recompensas por uso de velocidad.',
        'Completa todas las misiones diarias antes del reset para maximizar pases.'
      ],
      sections: [
        {
          title: 'Protocolo de los Primeros 7 Días',
          points: [
            'Día 1-2: Concéntrate en la campaña principal hasta desbloquear la Torre y la Arena.',
            'Día 3-4: Únete a una Alianza activa para recibir ayudas de construcción y bonus de recursos.',
            'Día 5-7: Estabiliza tu producción de Hierro y Comida, y refina el equipo de tus 2 mejores atacantes.'
          ]
        },
        {
          title: 'Gestión Eficiente de Recursos',
          points: [
            'Diamantes: Úsalos únicamente en eventos garantizados de reclutamiento o recargas de estamina.',
            'Madera y Comida: Mantén reservas en la bolsa y úsalas solo cuando vayas a construir para evitar saqueos.'
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
      category: 'combat',
      categoryLabelKey: 'guides.category_combat',
      badge: 'META GEAR',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      titleKey: 'guides.g2_title',
      descKey: 'guides.g2_desc',
      readTime: '4',
      difficultyKey: 'guides.diff_advanced',
      color: 'from-purple-950/40 via-[#0a0a0a] to-[#050505]',
      borderColor: 'border-purple-500/30 hover:border-purple-500/70',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
      iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      icon: <Target className="text-purple-400" size={24} />,
      gridSpan: 'col-span-12 sm:col-span-6 lg:col-span-4 min-h-[190px]',
      takeaways: [
        'Prioriza Ataque % en Rangers y Especialistas de daño.',
        'Los sets de 4 piezas otorgan bonificaciones de sinergia superiores a piezas sueltas.',
        'La Reducción de Daño en Tanques escala mejor que la Defensa plana en late-game.'
      ],
      sections: [
        {
          title: 'Jerarquía de Atributos Secundarios',
          points: [
            'Tier S: Ataque %, Probabilidad Crítica %, Daño Crítico %.',
            'Tier A: Penetración de Armadura, Reducción de Daño %.',
            'Tier B: Salud plana, Defensa plana (útil solo en juego temprano).'
          ]
        }
      ],
      mistakes: [
        'Mejorar accesorios grises o verdes más allá de nivel 5.',
        'Romper un set de 4 piezas por una pieza individual con stats ligeramente mejores.'
      ]
    },
    {
      id: 3,
      category: 'combat',
      categoryLabelKey: 'guides.category_combat',
      badge: 'TÁCTICA PVP',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      titleKey: 'guides.g3_title',
      descKey: 'guides.g3_desc',
      readTime: '5',
      difficultyKey: 'guides.diff_expert',
      color: 'from-rose-950/40 via-[#0a0a0a] to-[#050505]',
      borderColor: 'border-rose-500/30 hover:border-rose-500/70',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
      iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      icon: <Shield className="text-rose-400" size={24} />,
      gridSpan: 'col-span-12 sm:col-span-6 lg:col-span-4 min-h-[190px]',
      takeaways: [
        'Formación estándar 2-1-2: 2 Guardianes al frente, 1 Bruiser al centro, 2 DPS atrás.',
        'Coloca a tu héroe con mayor control de masas (CC) frente al atacante principal rival.',
        'Sincroniza escudos para mitigar las habilidades definitivas del primer ciclo.'
      ],
      sections: [
        {
          title: 'Estrategia de Posicionamiento',
          points: [
            'Vanguardia: Debe absorber el burst inicial durante los primeros 10 segundos.',
            'Línea Media: Amortigua el daño residual y aplica buffs de ataque.',
            'Retaguardia: Protegida de ataques directos para cargar definitivas sin interrupción.'
          ]
        }
      ],
      mistakes: [
        'Colocar atacantes frágiles en la misma columna que los asesinos enemigos.',
        'No ajustar el posicionamiento al revisar la defensa del oponente en la Arena.'
      ]
    },
    {
      id: 4,
      category: 'economy',
      categoryLabelKey: 'guides.category_economy',
      badge: 'EFICIENCIA',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      titleKey: 'guides.g4_title',
      descKey: 'guides.g4_desc',
      readTime: '3',
      difficultyKey: 'guides.diff_recruit',
      color: 'from-emerald-950/40 via-[#0a0a0a] to-[#050505]',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/70',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: <Zap className="text-emerald-400" size={24} />,
      gridSpan: 'col-span-12 sm:col-span-6 lg:col-span-4 min-h-[220px]',
      takeaways: [
        'Gasta estamina solo cuando haya eventos de drop x2 activos.',
        'No dejes que la estamina llegue al tope máximo (recuperación pasiva desperdiciada).',
        'Compra los 2 primeros refrescos de estamina diarios si eres jugador activo.'
      ],
      sections: [
        {
          title: 'Cronograma Diario de Energía',
          points: [
            'Mañana: Vacía estamina acumulada durante la noche en misiones de materiales.',
            'Mediodía: Reclama la recarga gratuita del almuerzo en el buzón.',
            'Noche: Invierte la estamina en bosses de alianza antes de desconectarte.'
          ]
        }
      ],
      mistakes: [
        'Comprar más de 3 refrescos de estamina por día (el coste en diamantes se dispara).'
      ]
    },
    {
      id: 5,
      category: 'optimization',
      categoryLabelKey: 'guides.category_beginner',
      badge: 'OPTIMIZACIÓN',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      titleKey: 'guides.g5_title',
      descKey: 'guides.g5_desc',
      readTime: '4',
      difficultyKey: 'guides.diff_advanced',
      color: 'from-amber-950/40 via-[#0a0a0a] to-[#050505]',
      borderColor: 'border-amber-500/30 hover:border-amber-500/70',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: <Sparkles className="text-amber-400" size={24} />,
      gridSpan: 'col-span-12 sm:col-span-6 lg:col-span-4 min-h-[220px]',
      takeaways: [
        'Habilidad Activa Principal al nivel máximo antes de tocar pasivas secundarias.',
        'Los libros dorados deben reservarse para operativos S-Tier o tu DPS principal.',
        'Usa la calculadora de libros de habilidad de la app para calcular costes exactos.'
      ],
      sections: [
        {
          title: 'Regla de Oro en Habilidades',
          points: [
            'Paso 1: Sube la habilidad 1 al nivel 3 (desbloquea efectos clave).',
            'Paso 2: Sube la pasiva de escalado de ataque al nivel 3.',
            'Paso 3: Lleva la habilidad principal a nivel 5 antes de diversificar.'
          ]
        }
      ],
      mistakes: [
        'Subir todas las habilidades a nivel 2 en lugar de concentrar poder en 1 o 2 clave.'
      ]
    },
    {
      id: 6,
      category: 'tools',
      categoryLabelKey: 'guides.category_tools',
      badge: 'SISTEMAS DATABASE',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      titleKey: 'guides.g6_title',
      descKey: 'guides.g6_desc',
      readTime: '1',
      difficultyKey: 'guides.diff_recruit',
      color: 'from-cyan-950/40 via-[#0a0a0a] to-[#050505]',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/70',
      glowColor: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      icon: <Compass className="text-cyan-400" size={24} />,
      gridSpan: 'col-span-12 lg:col-span-4 min-h-[220px]',
      isToolGrid: true,
      takeaways: []
    }
  ];

  const categories = [
    { id: 'all', label: t('guides.category_all') },
    { id: 'beginner', label: t('guides.category_beginner') },
    { id: 'combat', label: t('guides.category_combat') },
    { id: 'economy', label: t('guides.category_economy') },
    { id: 'tools', label: t('guides.category_tools') }
  ];

  const filteredGuides = GUIDES.filter(guide => {
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory || (selectedCategory === 'tools' && guide.isToolGrid);
    const title = t(guide.titleKey).toLowerCase();
    const desc = t(guide.descKey).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || title.includes(query) || desc.includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1500px] mx-auto min-h-screen relative z-10 flex flex-col min-w-0">
      
      {/* Header Section */}
      <div className="mb-8 sm:mb-10 border-b border-gray-800/80 pb-6 sm:pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3"
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
              <span className="font-mono text-yellow-400 text-xs sm:text-sm tracking-[0.25em] uppercase font-bold">
                UMBRELLA DATABASE // {t('guides.intel_files')} [{t('guides.coming_soon_badge')}]
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <h1 className="font-bebas text-4xl sm:text-6xl lg:text-7xl text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,42,42,0.3)] m-0">
                {t('guides.title')}
              </h1>
              <span className="font-mono text-xs uppercase tracking-widest px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full">
                {t('guides.coming_soon_badge')}
              </span>
            </motion.div>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('guides.search_placeholder')}
              className="w-full bg-[#080808] border border-gray-800 focus:border-blood-red text-white text-xs font-mono pl-10 pr-4 py-2.5 rounded-sm outline-none transition-colors placeholder:text-gray-600"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Coming Soon / Roadmap Notice Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 bg-yellow-950/20 border border-yellow-500/30 rounded-lg p-4 flex items-start sm:items-center gap-3.5"
        >
          <div className="p-2 rounded-md bg-yellow-500/10 border border-yellow-500/30 shrink-0 text-yellow-400">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-yellow-400 mb-0.5">
              {t('guides.coming_soon_banner_title')}
            </h4>
            <p className="font-inter text-xs text-yellow-200/80 leading-relaxed m-0">
              {t('guides.coming_soon_banner_desc')}
            </p>
          </div>
        </motion.div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mt-6 pt-2 pb-1 touch-pan-x">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-sm border transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blood-red/20 border-blood-red text-white font-bold shadow-[0_0_12px_rgba(255,42,42,0.3)]'
                  : 'bg-[#080808] border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 auto-rows-fr">
        {filteredGuides.map((guide, index) => {
          if (guide.isToolGrid) {
            return (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`relative rounded-xl overflow-hidden bg-[#070707] border ${guide.borderColor} ${guide.glowColor} p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 ${guide.gridSpan}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${guide.color} opacity-40 pointer-events-none`} />
                
                {/* Header */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${guide.badgeColor}`}>
                      {guide.badge}
                    </span>
                    <div className={`p-2 rounded-lg border ${guide.iconBg}`}>
                      {guide.icon}
                    </div>
                  </div>
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide mb-1">
                    {t(guide.titleKey)}
                  </h3>
                  <p className="font-inter text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                    {t(guide.descKey)}
                  </p>
                </div>

                {/* Quick Link Buttons */}
                <div className="relative z-10 grid grid-cols-1 gap-2 mt-auto">
                  <Link 
                    to="/calculadoras" 
                    className="flex items-center justify-between bg-black/60 hover:bg-blood-red/20 border border-gray-800 hover:border-blood-red/60 px-3.5 py-2.5 rounded-lg text-xs font-mono text-gray-300 hover:text-white transition-all group/btn"
                  >
                    <span className="flex items-center gap-2">
                      <Calculator size={14} className="text-blood-red" /> Calculadoras Tácticas
                    </span>
                    <ArrowUpRight size={14} className="text-gray-500 group-hover/btn:text-white transition-colors" />
                  </Link>

                  <Link 
                    to="/comparador" 
                    className="flex items-center justify-between bg-black/60 hover:bg-cyan-500/20 border border-gray-800 hover:border-cyan-500/60 px-3.5 py-2.5 rounded-lg text-xs font-mono text-gray-300 hover:text-white transition-all group/btn"
                  >
                    <span className="flex items-center gap-2">
                      <Scale size={14} className="text-cyan-400" /> Comparador de Héroes
                    </span>
                    <ArrowUpRight size={14} className="text-gray-500 group-hover/btn:text-white transition-colors" />
                  </Link>

                  <Link 
                    to="/tier-list" 
                    className="flex items-center justify-between bg-black/60 hover:bg-yellow-500/20 border border-gray-800 hover:border-yellow-500/60 px-3.5 py-2.5 rounded-lg text-xs font-mono text-gray-300 hover:text-white transition-all group/btn"
                  >
                    <span className="flex items-center gap-2">
                      <Award size={14} className="text-yellow-400" /> Tier List Oficial
                    </span>
                    <ArrowUpRight size={14} className="text-gray-500 group-hover/btn:text-white transition-colors" />
                  </Link>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => setActiveDossier(guide)}
              className={`group relative rounded-xl overflow-hidden bg-[#070707] border ${guide.borderColor} ${guide.glowColor} p-5 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 ${guide.gridSpan}`}
            >
              {/* Background gradient & ambient glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${guide.color} opacity-40 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none`} />
              
              {/* Tactical Mesh Pattern */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"
              />

              {/* Corner HUD Accent */}
              <div className="absolute top-2 right-2 text-gray-700/60 font-mono text-[9px] pointer-events-none select-none tracking-widest">
                [INTEL-0{guide.id}]
              </div>

              {/* Top metadata row */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${guide.badgeColor} font-bold`}>
                      {guide.badge}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-gray-400 bg-black/40 border border-gray-800 px-2 py-0.5 rounded">
                      <Clock size={11} /> {guide.readTime} {t('guides.min')}
                    </span>
                  </div>
                  
                  <div className={`p-2.5 rounded-lg border ${guide.iconBg} shadow-inner transition-transform group-hover:scale-110 duration-300`}>
                    {guide.icon}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className={`font-bebas text-white tracking-wide group-hover:text-neon-red transition-colors ${
                  guide.isHero ? 'text-3xl sm:text-4xl lg:text-5xl mb-3' : 'text-2xl sm:text-3xl mb-2'
                }`}>
                  {t(guide.titleKey)}
                </h3>

                <p className={`font-inter text-gray-300 leading-relaxed ${
                  guide.isHero ? 'text-sm sm:text-base max-w-2xl mb-6 line-clamp-3 sm:line-clamp-4' : 'text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-4'
                }`}>
                  {t(guide.descKey)}
                </p>

                {/* Hero bullet points preview */}
                {guide.isHero && guide.takeaways.length > 0 && (
                  <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-6 pt-3 border-t border-gray-800/60">
                    {guide.takeaways.slice(0, 4).map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 bg-black/40 border border-gray-800/60 p-2.5 rounded text-xs font-inter text-gray-300">
                        <CheckCircle2 size={14} className="text-neon-red shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="relative z-10 pt-4 border-t border-gray-800/60 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">{t('guides.difficulty')}</span>
                  <span className="font-mono text-[10px] text-gray-300 font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    {t(guide.difficultyKey)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs text-neon-red font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  <span>{t('guides.read_dossier')}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Dossier Modal */}
      <AnimatePresence>
        {activeDossier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDossier(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Window */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-[#080808] border border-gray-800 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col z-10"
            >
              {/* Header Banner */}
              <div className={`p-5 sm:p-7 border-b border-gray-800 bg-gradient-to-r ${activeDossier.color} relative`}>
                <button 
                  onClick={() => setActiveDossier(null)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-white bg-black/60 hover:bg-black p-2 rounded-full border border-gray-800 transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${activeDossier.badgeColor} font-bold`}>
                    {activeDossier.badge}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-xs text-gray-300 bg-black/60 border border-gray-800 px-2.5 py-1 rounded">
                    <Clock size={12} /> {activeDossier.readTime} {t('guides.min')}
                  </span>
                </div>

                <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide">
                  {t(activeDossier.titleKey)}
                </h2>
                <p className="font-inter text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
                  {t(activeDossier.descKey)}
                </p>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-gray-300 font-inter text-sm leading-relaxed scrollbar-none">
                
                {/* Key Takeaways */}
                {activeDossier.takeaways && activeDossier.takeaways.length > 0 && (
                  <div className="bg-black/50 border border-gray-800 p-4 sm:p-5 rounded-lg">
                    <h4 className="font-bebas text-xl text-neon-red tracking-wider flex items-center gap-2 mb-3">
                      <Sparkles size={18} /> {t('guides.key_takeaways')}
                    </h4>
                    <ul className="space-y-2">
                      {activeDossier.takeaways.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <CheckCircle2 size={15} className="text-neon-red shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tactical Sections */}
                {activeDossier.sections?.map((sec, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    <h4 className="font-bebas text-2xl text-white tracking-wide border-b border-gray-800 pb-1">
                      {sec.title}
                    </h4>
                    <ul className="space-y-2 mt-2">
                      {sec.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300 bg-white/5 border border-white/5 p-3 rounded">
                          <span className="font-mono text-neon-red font-bold text-xs">{pIdx + 1}.</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Common Mistakes */}
                {activeDossier.mistakes && activeDossier.mistakes.length > 0 && (
                  <div className="bg-blood-red/10 border border-blood-red/30 p-4 sm:p-5 rounded-lg">
                    <h4 className="font-bebas text-xl text-blood-red tracking-wider flex items-center gap-2 mb-3">
                      <AlertTriangle size={18} /> {t('guides.common_mistakes')}
                    </h4>
                    <ul className="space-y-2">
                      {activeDossier.mistakes.map((mis, mIdx) => (
                        <li key={mIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                          <span className="text-blood-red font-bold">⚠️</span>
                          <span>{mis}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-800 bg-[#050505] flex justify-end">
                <button
                  onClick={() => setActiveDossier(null)}
                  className="bg-black hover:bg-white/10 border border-gray-800 hover:border-gray-600 text-gray-300 font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded transition-colors"
                >
                  {t('guides.close_dossier')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
