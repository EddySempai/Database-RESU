import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Calculator, 
  Scale, 
  Award, 
  BookOpen, 
  Share2, 
  Bookmark, 
  Check, 
  ShieldAlert, 
  Key, 
  Copy, 
  Calendar, 
  Swords, 
  Shield, 
  Zap, 
  Sparkles, 
  Radio,
  Lock,
  Unlock,
  RotateCcw
} from 'lucide-react';
import { GUIAS_DATA } from '../data/guiasData';
import { useSound } from '../contexts/SoundContext';

export default function GuiaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { playHover, playClick } = useSound();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [revealedTip, setRevealedTip] = useState(false);

  // Interactive Ace Commander Day State
  const [activeAceDay, setActiveAceDay] = useState<number>(0);

  // Interactive Boss Mode State (Mortem)
  const [activeBossMode, setActiveBossMode] = useState<'shield' | 'stun'>('shield');

  // Interactive Keyring Mode State
  const [activeKeyringTab, setActiveKeyringTab] = useState<'passive' | 'active'>('passive');

  // Bookmarking
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('resu_bookmarked_guides');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const guide = GUIAS_DATA.find(g => g.slug === slug);

  // Interactive Checklist State per guide (persisted)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    if (!guide) return {};
    try {
      const saved = localStorage.getItem(`resu_guide_checklist_${guide.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reading progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setRevealedTip(false);
  }, [slug]);

  if (!guide) {
    return (
      <div className="pt-36 pb-20 px-4 max-w-4xl mx-auto min-h-screen text-center flex flex-col items-center justify-center">
        <ShieldAlert size={36} className="text-blood-red mb-3" />
        <h2 className="font-bebas text-5xl text-white mb-2">Expediente No Encontrado</h2>
        <p className="font-inter text-gray-400 text-sm mb-6">El dossier táctico solicitado no existe o ha sido reubicado.</p>
        <Link 
          to="/guias" 
          onClick={playClick}
          className="inline-flex items-center gap-2 bg-blood-red hover:bg-red-600 text-white font-mono text-xs uppercase px-5 py-2.5 rounded-lg transition-colors font-bold shadow-lg"
        >
          <ArrowLeft size={16} /> Volver al Centro de Guías
        </Link>
      </div>
    );
  }

  const isBookmarked = bookmarkedIds.includes(guide.id);

  const toggleBookmark = () => {
    playClick();
    setBookmarkedIds(prev => {
      const next = prev.includes(guide.id) ? prev.filter(id => id !== guide.id) : [...prev, guide.id];
      try {
        localStorage.setItem('resu_bookmarked_guides', JSON.stringify(next));
      } catch (e) {
        console.warn('Error saving bookmark:', e);
      }
      return next;
    });
  };

  const copyGuideLink = () => {
    playClick();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const toggleCheckItem = (key: string) => {
    playClick();
    setCheckedItems(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`resu_guide_checklist_${guide.id}`, JSON.stringify(next));
      } catch (e) {
        console.warn('Error saving checklist item:', e);
      }
      return next;
    });
  };

  const resetChecklist = () => {
    playClick();
    setCheckedItems({});
    try {
      localStorage.removeItem(`resu_guide_checklist_${guide.id}`);
    } catch (e) {
      console.warn('Error resetting checklist:', e);
    }
  };

  // Calculate Checklist Progress
  const totalTasks = (guide.takeaways ? guide.takeaways.length : 0) + 
    guide.sections.reduce((acc, sec) => acc + sec.points.length, 0);
  
  const completedTasks = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Ace Commander Daily Data
  const aceDays = [
    { day: 'LUN', title: 'Fase 1: Recolección Masiva', focus: 'Recolección de Petróleo, Hierro y Madera', speedups: 'Ninguno (Ahorra para Fase 2)', tip: 'Envía tropas a nodos Nv. 6/7 el domingo antes del reset.' },
    { day: 'MAR', title: 'Fase 2: Construcción & Tecnología', focus: 'Edificios clave y tecnologías de larga duración', speedups: 'Aceleradores de Construcción e Investigación', tip: 'Activa bufos de alianza de velocidad antes de empezar.' },
    { day: 'MIÉ', title: 'Fase 3: Caza de B.O.W. & Mutantes', focus: 'Gasto total de estamina en el mapa mundial', speedups: 'Paquetes de Estamina de mochila', tip: 'Coordina concentraciones de Armas Biológicas con tu clan.' },
    { day: 'JUE', title: 'Fase 4: Reclutamiento de Héroes', focus: 'Boletos dorados y fragmentos de ascenso de estrellas', speedups: 'Boletos de reclutamiento avanzados', tip: '⚠️ NUNCA tires boletos de héroes fuera de este día.' },
    { day: 'VIE', title: 'Fase 5: Entrenamiento & Ascenso', focus: 'Ascenso de tropas al tier más alto (T8 ➔ T9)', speedups: 'Aceleradores de Tropas y Generales', tip: 'Ascender tropas existentes da más puntos por minuto que crearlas de cero.' },
    { day: 'SÁB / DOM', title: 'Fase 6: Kill Event (PvP)', focus: 'Eliminación de tropas enemigas y guerra interservidor', speedups: 'Aceleradores de Curación', tip: 'Si no vas a pelear activamente, pon ESCUDO DE PAZ de 24h para no perder tropas.' }
  ];

  // Pre-formatted Alliance Mail Templates
  const getAllianceOrderMessage = () => {
    if (guide.slug === 'repeler-a-mortem') {
      return `📢 [ORDEN DE ALIANZA - MORTEM]\n1. Completar misiones de radar diarias para bufo de daño de clan.\n2. Reubicar bases en colmena a menos de 15s del punto de invocación.\n3. FASE DE ESCUDO: SOLO RALLIES (Ataques individuales hacen 0 daño).\n4. FASE DE ATURDIMIENTO: Lanzar todas las marchas individuales en ráfaga. ¡A ganar!`;
    }
    if (guide.slug === 'cumbre-de-ases') {
      return `📢 [ORDEN DE ALIANZA - CUMBRE DE ASES]\nRecordatorio oficial: Solo gastar aceleradores y recursos en su día correspondiente. Domingo noche enviar tropas a recolectar. ¡Mantengan escudos activos durante el fin de semana!`;
    }
    if (guide.slug === 'defensa-de-la-alianza') {
      return `📢 [ORDEN DE ALIANZA - DEFENSA DE CLAN]\n1. No muevan la base durante el evento.\n2. Enviar refuerzos a compañeros da DOBLE puntuación que defenderse solo.\n3. RONDAS 10 y 20: Todos deben enviar tropas al Cuartel General.`;
    }
    return `📢 [ORDEN TÁCTICA DE ALIANZA]\nConsulta el protocolo oficial de "${guide.title}" en la Base de Datos Táctica para coordinar el despliegue del escuadrón.`;
  };

  const copyAllianceOrder = () => {
    playClick();
    navigator.clipboard.writeText(getAllianceOrderMessage());
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2500);
  };

  const relatedGuides = GUIAS_DATA.filter(g => g.id !== guide.id).slice(0, 3);

  return (
    <div className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-screen relative z-10 w-full overflow-x-hidden min-w-0 flex flex-col">
      <Helmet>
        <title>{`${guide.title} | Resident Evil: Survival Unit Wiki`}</title>
        <meta name="description" content={guide.desc} />
        <link rel="canonical" href={`https://resudb.com/guias/${guide.slug}`} />
        <meta property="og:title" content={`${guide.title} | Resident Evil: Survival Unit Wiki`} />
        <meta property="og:description" content={guide.desc} />
        <meta property="og:url" content={`https://resudb.com/guias/${guide.slug}`} />
        <meta property="og:image" content={guide.image ? `https://resudb.com${guide.image}` : 'https://resudb.com/metadata-img.png'} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      {/* Top Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-neon-red origin-left z-50 shadow-[0_0_10px_rgba(255,42,42,0.8)]"
        style={{ scaleX }}
      />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 pb-4 border-b border-white/[0.08] min-w-0">
        
        {/* Breadcrumb trail */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs text-gray-500 flex-wrap min-w-0">
          <Link to="/" onClick={playClick} className="hover:text-white transition-colors">INICIO</Link>
          <ChevronRight size={12} className="text-gray-700 shrink-0" />
          <Link to="/guias" onClick={playClick} className="hover:text-white transition-colors">GUÍAS</Link>
          <ChevronRight size={12} className="text-gray-700 shrink-0" />
          <span className="text-neon-red uppercase font-bold truncate max-w-[180px] sm:max-w-none">
            {guide.title.split(':')[0]}
          </span>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            onMouseEnter={playHover}
            className={`inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-white/[0.03] hover:bg-white/[0.07] text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark size={13} className={isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''} />
            <span className="hidden sm:inline">{isBookmarked ? 'Guardado' : 'Guardar'}</span>
          </button>

          {/* Copy Link Button */}
          <button
            onClick={copyGuideLink}
            onMouseEnter={playHover}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span className="hidden sm:inline">Compartir</span>
              </>
            )}
          </button>

          {/* Back Button */}
          <button 
            onClick={() => {
              playClick();
              navigate('/guias');
            }}
            onMouseEnter={playHover}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-300 hover:text-white bg-blood-red/20 hover:bg-blood-red/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Volver</span>
          </button>
        </div>

      </div>

      {/* Main Guide Header (Seamless Integrated Background Image & Specular Flare) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-[#070709] border border-white/[0.08] p-4 sm:p-8 lg:p-10 mb-8 shadow-2xl"
      >
        {/* Top Specular Destello de Luz */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        
        {/* Ambient Corner Flare */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        {/* Seamless Character/Boss Artwork (Fades smoothly, NO square frame!) */}
        {guide.image && (
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[50%] pointer-events-none overflow-hidden flex items-center justify-end">
            <img 
              src={guide.image} 
              alt={guide.title}
              className="h-full w-full object-contain lg:object-cover object-right opacity-25 lg:opacity-65 select-none"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 20%, black 75%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 20%, black 75%)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/50 pointer-events-none" />
          </div>
        )}

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap mb-3 text-xs font-mono text-gray-400">
            <span className="text-neon-red font-bold uppercase tracking-widest">
              {guide.badge}
            </span>
            <span>•</span>
            <span>{guide.categoryLabel}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-yellow-400" /> {guide.readTime}
            </span>
            <span>•</span>
            <span>Dificultad: <strong className="text-white">{guide.difficulty}</strong></span>
            <span className="ml-auto text-[10px] text-gray-500 font-mono">
              [REF: UMB-00{guide.id}]
            </span>
          </div>

          <h1 className="font-bebas text-3xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-3 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] break-words">
            {guide.title}
          </h1>

          <p className="font-inter text-sm sm:text-base text-gray-300 leading-relaxed drop-shadow-sm">
            {guide.desc}
          </p>
        </div>
      </motion.div>

      {/* =========================================================
          INTERACTIVE MISSION PREPARATION METER (Gamified Checklist)
         ========================================================= */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-gray-300 font-bold">
                LISTA DE VERIFICACIÓN DE COMBATE // PREPARACIÓN TÁCTICA
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-neon-red">
              {completedTasks} de {totalTasks} ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <p className="font-inter text-[11px] text-gray-500 mt-1.5">
            {progressPercent === 100 
              ? '🎉 ¡Enhorabuena! Has repasado y verificado todos los puntos del protocolo táctico.' 
              : 'Haz clic en las casillas mientras ejecutas tu plan de juego para seguir tu progreso en vivo.'}
          </p>
        </div>

        {completedTasks > 0 && (
          <button
            onClick={resetChecklist}
            className="shrink-0 flex items-center gap-1.5 font-mono text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer self-start sm:self-center"
          >
            <RotateCcw size={12} />
            <span>Reiniciar Checklist</span>
          </button>
        )}
      </div>

      {/* =========================================================
          GUIDE-SPECIFIC INTERACTIVE WIDGETS
         ========================================================= */}
      
      {/* 1. Ace Commander: Interactive Weekly Day Navigator */}
      {guide.slug === 'cumbre-de-ases' && (
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 via-black to-black border border-yellow-500/30 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-yellow-400" />
              <h3 className="font-bebas text-2xl text-white tracking-wide m-0">
                PLANIFICADOR SEMANAL INTERACTIVO (ELIGE UN DÍA)
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
              SIMULADOR DE FASES
            </span>
          </div>

          {/* Day Pills */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 mb-5">
            {aceDays.map((item, idx) => (
              <button
                key={item.day}
                onClick={() => {
                  playClick();
                  setActiveAceDay(idx);
                }}
                className={`p-1.5 sm:p-2.5 rounded-xl font-mono text-xs uppercase text-center transition-all cursor-pointer ${
                  activeAceDay === idx
                    ? 'bg-yellow-500 text-black font-bold shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-105'
                    : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span className="block font-bold text-xs sm:text-sm truncate">{item.day}</span>
                <span className="block text-[8px] sm:text-[9px] opacity-75">Fase {idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Active Day Card */}
          <motion.div 
            key={activeAceDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/[0.03] space-y-3 border border-yellow-500/20"
          >
            <h4 className="font-bebas text-xl text-yellow-400 tracking-wide">
              {aceDays[activeAceDay].title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-inter">
              <div>
                <span className="block text-gray-500 font-mono uppercase text-[10px]">Objetivo del día</span>
                <span className="text-white font-medium">{aceDays[activeAceDay].focus}</span>
              </div>
              <div>
                <span className="block text-gray-500 font-mono uppercase text-[10px]">Aceleradores a consumir</span>
                <span className="text-emerald-400 font-mono">{aceDays[activeAceDay].speedups}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-xs text-amber-300 font-inter">
              💡 <strong>Regla Táctica:</strong> {aceDays[activeAceDay].tip}
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Repeler a Mortem: Interactive Shield vs Stun Simulator */}
      {guide.slug === 'repeler-a-mortem' && (
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-red-950/20 via-black to-black border border-red-500/30 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Swords size={18} className="text-neon-red" />
              <h3 className="font-bebas text-2xl text-white tracking-wide m-0">
                SIMULADOR DE ÓRDENES: ESCUDO VS ATURDIMIENTO
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
              COMBATE EN VIVO
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-5">
            <button
              onClick={() => {
                playClick();
                setActiveBossMode('shield');
              }}
              className={`p-2.5 sm:p-3 rounded-xl font-mono text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeBossMode === 'shield'
                  ? 'bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white'
              }`}
            >
              <Shield size={16} />
              <span>1. Fase de Escudo (Defensa)</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setActiveBossMode('stun');
              }}
              className={`p-2.5 sm:p-3 rounded-xl font-mono text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeBossMode === 'stun'
                  ? 'bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white'
              }`}
            >
              <Zap size={16} />
              <span>2. Fase de Aturdimiento (Stun)</span>
            </button>
          </div>

          {/* Active Mode Briefing */}
          <motion.div
            key={activeBossMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              activeBossMode === 'shield' ? 'border-blue-500/30 bg-blue-950/20' : 'border-red-500/30 bg-red-950/20'
            }`}
          >
            {activeBossMode === 'shield' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase">
                  <span>🛡️ PROTOCOLO DE ESCUDO: ¡SOLO RALLIES!</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-inter">
                  El medidor de defensa de Mortem reduce a <strong>0 el daño de los ataques individuales</strong>. Únicamente las concentraciones (Rallies) de los oficiales con mayor embajada desgastan el escudo. ¡Únete a los rallies y no malgastes marchas individuales!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-neon-red font-mono text-xs font-bold uppercase">
                  <span>⚡ PROTOCOLO DE ATURDIMIENTO: ¡RÁFAGA INDIVIDUAL TOTAL!</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-inter">
                  ¡El escudo ha caído! Mortem no ataca durante esta ventana. <strong>Envía todas tus tropas en marchas individuales a máxima velocidad</strong>. Aquí es donde sumarás el 90% de tus puntos para el ranking de daño.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* 3. Llaveros: Interactive 3-Slot & Passive vs Equipped Visualizer */}
      {guide.slug === 'guia-maestra-llaveros' && (
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-yellow-950/20 via-black to-black border border-yellow-500/30 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Key size={18} className="text-yellow-400" />
              <h3 className="font-bebas text-2xl text-white tracking-wide m-0">
                SIMULADOR DE SLOTS: PASIVOS VS ACTIVOS
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
              MECÁNICAS CLAVE
            </span>
          </div>

          {/* Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-5">
            <button
              onClick={() => {
                playClick();
                setActiveKeyringTab('passive');
              }}
              className={`p-2.5 sm:p-3 rounded-xl font-mono text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeKeyringTab === 'passive'
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={16} />
              <span>Efectos Principales (Pasivos)</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setActiveKeyringTab('active');
              }}
              className={`p-2.5 sm:p-3 rounded-xl font-mono text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeKeyringTab === 'active'
                  ? 'bg-yellow-500 text-black font-bold shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white'
              }`}
            >
              <Swords size={16} />
              <span>Sub-Estadísticas (Equipadas)</span>
            </button>
          </div>

          <motion.div
            key={activeKeyringTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/[0.03] border border-yellow-500/20 text-xs sm:text-sm text-gray-300 space-y-3"
          >
            {activeKeyringTab === 'passive' ? (
              <>
                <div className="font-bold text-yellow-400 font-mono">
                  ✨ ACTIVACIÓN AUTOMÁTICA EN INVENTARIO (NO NECESITAS EQUIPARLO)
                </div>
                <p className="leading-relaxed">
                  Solo con poseer el llavero en tu inventario, su efecto principal (ej. Aumento de ataque a infectados o velocidad de recolección) ya está funcionando de forma permanente. Recuerda: ¡los efectos idénticos no se duplican!
                </p>
              </>
            ) : (
              <>
                <div className="font-bold text-amber-400 font-mono">
                  ⚔️ REQUIERE EQUIPARSE EN 1 DE TUS 3 SLOTS
                </div>
                <p className="leading-relaxed">
                  Las sub-estadísticas (Vida, Letalidad, Penetración) SOLO se aplican si colocas el llavero en una de tus 3 ranuras disponibles. Elige qué llavero equipar exclusivamente basándote en la calidad de sus sub-estadísticas.
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* =========================================================
          TWO COLUMN CONTENT: MAIN PROTOCOL + SIDEBAR
         ========================================================= */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Key Takeaways with Interactive Checkboxes */}
          {guide.takeaways && guide.takeaways.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <CheckCircle2 size={18} className="text-neon-red" />
                <h3 className="font-bebas text-2xl text-white tracking-wider m-0">
                  Puntos Clave de Victoria (Toca para marcar)
                </h3>
              </div>

              <div className="space-y-2.5">
                {guide.takeaways.map((pt, idx) => {
                  const key = `takeaway_${idx}`;
                  const isChecked = !!checkedItems[key];

                  return (
                    <button
                      key={idx}
                      onClick={() => toggleCheckItem(key)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-gray-200' 
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] text-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked ? 'bg-emerald-500 text-black' : 'border border-gray-600'
                      }`}>
                        {isChecked && <Check size={13} className="stroke-[3]" />}
                      </div>
                      <span className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through opacity-80' : ''}`}>
                        {pt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Tactical Sections with Interactive Checkboxes */}
          {guide.sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-3 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-red-400 font-bold">
                  [FASE 0{sIdx + 1}]
                </span>
                <h2 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide m-0">
                  {sec.title}
                </h2>
              </div>

              <div className="space-y-2.5">
                {sec.points.map((pt, pIdx) => {
                  const key = `sec_${sIdx}_pt_${pIdx}`;
                  const isChecked = !!checkedItems[key];

                  return (
                    <button
                      key={pIdx}
                      onClick={() => toggleCheckItem(key)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-gray-200' 
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked ? 'bg-emerald-500 text-black' : 'border border-gray-600'
                      }`}>
                        {isChecked && <Check size={13} className="stroke-[3]" />}
                      </div>
                      <span className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through opacity-80' : ''}`}>
                        {pt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Mistakes to Avoid */}
          {guide.mistakes && guide.mistakes.length > 0 && (
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-blood-red" />
                <h3 className="font-bebas text-2xl text-blood-red tracking-wider m-0">
                  Errores Críticos a Evitar
                </h3>
              </div>

              <div className="space-y-2">
                {guide.mistakes.map((mis, mIdx) => (
                  <div key={mIdx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-300 p-3 rounded-lg bg-red-950/15 border border-red-900/30">
                    <span className="text-blood-red font-bold">⚠️</span>
                    <span className="leading-relaxed">{mis}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Pro-Tip Reveal Box */}
          <div className="pt-4 border-t border-white/[0.06]">
            <div 
              onClick={() => {
                playClick();
                setRevealedTip(!revealedTip);
              }}
              className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] transition-all cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-neon-red">
                  {revealedTip ? <Unlock size={16} /> : <Lock size={16} />}
                </div>
                <div>
                  <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">
                    {revealedTip ? 'INTELIGENCIA DESCLASIFICADA' : 'ARCHIVO CLASIFICADO // CLIC PARA DESBLOQUEAR'}
                  </span>
                  <span className="font-bebas text-lg text-white">
                    {revealedTip ? 'Consejo Maestro del Oficial' : 'Toca para revelar el secreto de victoria'}
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs text-neon-red uppercase font-bold">
                {revealedTip ? 'Ocultar' : 'Revelar'}
              </span>
            </div>

            <AnimatePresence>
              {revealedTip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 mt-2 text-xs sm:text-sm text-gray-200 leading-relaxed font-inter"
                >
                  🔥 <strong>Tip Avanzado de Supervivencia:</strong> Coordina siempre con los miembros de tu clan en horarios de bajo tráfico de servidores para evitar que alianzas rivales interfieran en tus marchas y capturas de objetivos.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* One-Click Alliance Broadcast Mail Copier */}
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase text-gray-300 font-bold flex items-center gap-1.5">
                  <Radio size={13} className="text-neon-red animate-pulse" /> ORDEN LISTA PARA CHAT DE ALIANZA
                </span>
                <span className="font-mono text-[10px] text-gray-500 uppercase">1-CLIC COPY</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 font-mono text-xs text-gray-300 whitespace-pre-line border border-white/[0.04] leading-relaxed break-words">
                {getAllianceOrderMessage()}
              </div>

              <button
                onClick={copyAllianceOrder}
                className="w-full flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-white font-mono text-xs uppercase tracking-wider py-2.5 rounded-lg transition-colors cursor-pointer font-bold"
              >
                {copiedOrder ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">¡Orden Copiada al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copiar Orden para Pegar en el Juego</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Column (Related Intel + Tools) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Related Intel */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <h4 className="font-bebas text-xl text-white tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
              <BookOpen size={16} className="text-neon-red" /> Expedientes Relacionados
            </h4>
            <div className="space-y-3">
              {relatedGuides.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/guias/${rel.slug}`}
                  onClick={playClick}
                  onMouseEnter={playHover}
                  className="block p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400">
                      {rel.badge}
                    </span>
                    <span className="font-mono text-[9px] text-gray-500">{rel.readTime}</span>
                  </div>
                  <h5 className="font-bebas text-lg text-white hover:text-neon-red transition-colors leading-tight mb-1">
                    {rel.title}
                  </h5>
                  <p className="font-inter text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {rel.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Tools */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <h4 className="font-bebas text-xl text-white tracking-wider mb-3 pb-2 border-b border-white/[0.06]">
              Herramientas de Apoyo
            </h4>
            <div className="space-y-2">
              <Link 
                to="/calculadoras" 
                onClick={playClick}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Calculator size={13} className="text-blood-red" /> Calculadoras Tácticas
                </span>
                <ChevronRight size={13} className="text-gray-600" />
              </Link>
              <Link 
                to="/comparador" 
                onClick={playClick}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Scale size={13} className="text-cyan-400" /> Comparador de Héroes
                </span>
                <ChevronRight size={13} className="text-gray-600" />
              </Link>
              <Link 
                to="/tier-list" 
                onClick={playClick}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Award size={13} className="text-yellow-400" /> Tier List Oficial
                </span>
                <ChevronRight size={13} className="text-gray-600" />
              </Link>
              <Link 
                to="/llaveros" 
                onClick={playClick}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] text-xs font-mono text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Key size={13} className="text-amber-400" /> Catálogo de Llaveros
                </span>
                <ChevronRight size={13} className="text-gray-600" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
