import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Key, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  AlertTriangle, 
  Download, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle,
  Copy,
  Check,
  Shield,
  HeartPulse,
  Swords,
  Target,
  Hammer,
  FlaskConical,
  Users,
  Zap,
  Pickaxe,
  Flame,
  Heart,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import llaverosData from '../data/llaveros.json';
import llaverosSubstatsData from '../data/llaverosSubstats.json';
import { 
  KEYRING_COMBAT_POWER, 
  KEYRING_EXP_MILESTONES 
} from '../data/llaverosProgression';
import type { KeyringCombatPowerStats } from '../data/llaverosProgression';

interface KeyringStats {
  isPercent: boolean;
  epicCandidates: string[];
  epicGrowthPerLv: string;
  epicLv10Range: string;
  epicLv10Candidates: string[];
  epicLv30Range: string;
  epicLv30Candidates: string[];
  legendCandidates: string[];
  legendGrowthPerLv: string;
  legendLv10Range: string;
  legendLv10Candidates: string[];
  legendLv30Range: string;
  legendLv30Candidates: string[];
}

interface Keyring {
  id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  icon: string;
  mainStat: string;
  mainStatEn?: string;
  mainStatJa?: string;
  type: string;
  unitIcon?: string;
  stats?: KeyringStats;
}

interface SubstatRecord {
  id: string;
  tier: string;
  name: string;
  nameJa: string;
  nameEs: string;
  category: string;
  categoryLabel: string;
  chance: number;
  startV1: number;
  startV5: number;
  startCandidates: number[];
  lv30V1: number;
  lv30V5: number;
  lv30Candidates: number[];
}

// Función para simplificar y limpiar el texto del efecto en cualquier idioma
const formatMainStat = (stat: string, lang = 'es'): string => {
  if (!stat || stat === 'Aún sin agregar al juego' || stat === 'Not yet added to the game' || stat === 'ゲーム内未実装') {
    return lang === 'en' ? 'Coming Soon in Update' : lang === 'ja' ? 'アップデートで実装予定' : 'Próximamente en el juego';
  }
  if (lang === 'ja') {
    return stat;
  }
  if (lang === 'en') {
    return stat
      .replace(/^Increases Hospital Healing Speed$/i, 'Hospital Healing Speed')
      .replace(/^Increases Training Speed for All Troops$/i, 'Troop Training Speed')
      .replace(/^Increases Marching Speed When Battling Creatures$/i, 'March Speed (Creatures)')
      .replace(/^Increases Marching Speed$/i, 'March Speed')
      .replace(/^Increases All Troops Trained per Session$/i, 'Troops Trained per Session')
      .replace(/^Increases\s+Building Construction Speed$/i, 'Construction Speed')
      .replace(/^Increases Research Lab Speed$/i, 'Research Speed (Lab)')
      .replace(/^All Resources Gathering Speed$/i, 'Gathering (All Resources)')
      .replace(/^Food Gathering Speed$/i, 'Food Gathering Speed')
      .replace(/^Lumber Gathering Speed$/i, 'Lumber Gathering Speed')
      .replace(/^Iron Gathering Speed$/i, 'Iron Gathering Speed')
      .replace(/^Oil Gathering Speed$/i, 'Oil Gathering Speed');
  }
  return stat
    .replace(/^Aumento de la velocidad de tratamiento en el hospital$/i, 'Velocidad de Tratamiento (Hospital)')
    .replace(/^Aumento de la velocidad de entrenamiento de todas las tropas$/i, 'Velocidad de Entrenamiento (Tropas)')
    .replace(/^Aumento de la velocidad de despliegue en combates contra criaturas$/i, 'Velocidad Despliegue (Criaturas)')
    .replace(/^Aumento de la velocidad de despliegue$/i, 'Velocidad de Despliegue')
    .replace(/^Aumento en el número de tropas entrenadas por sesión$/i, 'Capacidad de Tropas por Sesión')
    .replace(/^Aumento de la velocidad de construcción$/i, 'Velocidad de Construcción')
    .replace(/^Aumento de la velocidad de investigación en el laboratorio$/i, 'Velocidad de Investigación (Lab)')
    .replace(/^Velocidad de recolección de todos los recursos$/i, 'Recolección (Todos los Recursos)')
    .replace(/^Velocidad de recolección de alimento$/i, 'Recolección de Alimento')
    .replace(/^Velocidad de recolección de madera$/i, 'Recolección de Madera')
    .replace(/^Velocidad de recolección de hierro$/i, 'Recolección de Hierro')
    .replace(/^Velocidad de recolección de petróleo$/i, 'Recolección de Petróleo')
    .replace(/^Poder de penetración de/i, 'Penetración de')
    .replace(/^Poder de defensa de/i, 'Defensa de');
};

// Función para asignar icono táctico representativo al efecto (multilingüe)
const getStatIcon = (stat: string, type: string) => {
  const lower = (stat || '').toLowerCase();
  if (lower.includes('hospital') || lower.includes('tratamiento') || lower.includes('healing') || lower.includes('治療')) {
    return <HeartPulse size={15} className="text-emerald-400 shrink-0" />;
  }
  if (lower.includes('construcción') || lower.includes('mansión') || lower.includes('construction') || lower.includes('建築') || lower.includes('建物')) {
    return <Hammer size={15} className="text-amber-400 shrink-0" />;
  }
  if (lower.includes('laboratorio') || lower.includes('investigación') || lower.includes('research') || lower.includes('研究')) {
    return <FlaskConical size={15} className="text-cyan-400 shrink-0" />;
  }
  if (lower.includes('entrenamiento') || lower.includes('tropas') || lower.includes('training') || lower.includes('訓練')) {
    return <Users size={15} className="text-blue-400 shrink-0" />;
  }
  if (lower.includes('despliegue') || lower.includes('marching') || lower.includes('進軍')) {
    return <Zap size={15} className="text-yellow-400 shrink-0" />;
  }
  if (lower.includes('recolección') || lower.includes('recursos') || lower.includes('alimento') || lower.includes('madera') || lower.includes('hierro') || lower.includes('petróleo') || lower.includes('gathering') || lower.includes('採集')) {
    return <Pickaxe size={15} className="text-emerald-400 shrink-0" />;
  }
  if (lower.includes('ataque') || lower.includes('attack') || lower.includes('offense') || lower.includes('攻撃')) {
    return <Swords size={15} className="text-red-400 shrink-0" />;
  }
  if (lower.includes('penetración') || lower.includes('penetration') || lower.includes('殺傷')) {
    return <Target size={15} className="text-orange-400 shrink-0" />;
  }
  if (lower.includes('salud') || lower.includes('hp') || lower.includes('体力')) {
    return <Heart size={15} className="text-rose-400 shrink-0" />;
  }
  if (lower.includes('defensa') || lower.includes('defense') || lower.includes('防御')) {
    return <Shield size={15} className="text-blue-400 shrink-0" />;
  }
  if (type === 'Combate' || type === 'Combat' || type === '戦闘') {
    return <Flame size={15} className="text-red-400 shrink-0" />;
  }
  if (type === 'Economía' || type === 'Economy' || type === '経済') {
    return <TrendingUp size={15} className="text-emerald-400 shrink-0" />;
  }
  return <Sparkles size={15} className="text-purple-400 shrink-0" />;
};

const Llaveros: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'es';
  const llaveros: Keyring[] = llaverosData;
  const substats: SubstatRecord[] = llaverosSubstatsData as SubstatRecord[];

  // Tabs principales
  const [mainTab, setMainTab] = useState<'catalog' | 'progression' | 'substats'>('catalog');

  // Estado Tab 1: Catálogo de 42 Llaveros
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [showSubStatsExplanation, setShowSubStatsExplanation] = useState(false);

  // Estado Tab 2: Calculadora de EXP
  const [currentExpLevel, setCurrentExpLevel] = useState<number>(1);
  const [targetExpLevel, setTargetExpLevel] = useState<number>(30);

  // Estado Tab 3: Catálogo de Sub-Estadísticas
  const [selectedSubstatTier, setSelectedSubstatTier] = useState<string>('Legendary');
  const [selectedSubstatCategory, setSelectedSubstatCategory] = useState<string>('all');
  const [substatSearch, setSubstatSearch] = useState<string>('');
  const [expandedSubstats, setExpandedSubstats] = useState<Record<string, boolean>>({});
  const [copiedSubstat, setCopiedSubstat] = useState<string | null>(null);

  const types = useMemo(() => [
    { id: 'Todos', label: t('keyrings.filter_all', 'Todos') },
    { id: 'Combate', label: t('keyrings.types.combat', 'Combate') },
    { id: 'Defensa', label: t('keyrings.types.defense', 'Defensa') },
    { id: 'Economía', label: t('keyrings.types.economy', 'Economía') }
  ], [t]);

  const toggleSubstatRow = (id: string) => {
    setExpandedSubstats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return llaveros.filter(l => {
      const matchesSearch =
        l.name.toLowerCase().includes(q) ||
        (l.nameEn && l.nameEn.toLowerCase().includes(q)) ||
        (l.nameJa && l.nameJa.toLowerCase().includes(q)) ||
        l.mainStat.toLowerCase().includes(q) ||
        (l.mainStatEn && l.mainStatEn.toLowerCase().includes(q)) ||
        (l.mainStatJa && l.mainStatJa.toLowerCase().includes(q));
      const matchesType = filterType === 'Todos' || l.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [llaveros, search, filterType]);

  // Filtrado de Sub-Estadísticas
  const filteredSubstats = useMemo(() => {
    return substats.filter(s => {
      const matchesTier = s.tier.toLowerCase() === selectedSubstatTier.toLowerCase();
      const matchesCategory = selectedSubstatCategory === 'all' || s.category === selectedSubstatCategory;
      const matchesSearch = 
        substatSearch === '' ||
        s.nameEs.toLowerCase().includes(substatSearch.toLowerCase()) ||
        s.name.toLowerCase().includes(substatSearch.toLowerCase()) ||
        s.nameJa.toLowerCase().includes(substatSearch.toLowerCase());
      return matchesTier && matchesCategory && matchesSearch;
    });
  }, [substats, selectedSubstatTier, selectedSubstatCategory, substatSearch]);

  // Cálculo de EXP requerida interactivo
  const expCalculation = useMemo(() => {
    const getCumulativeExp = (lvl: number): number => {
      if (lvl <= 1) return 0;
      if (lvl <= 10) return Math.round((6480 / 9) * (lvl - 1));
      if (lvl <= 20) return Math.round(6480 + ((43600 - 6480) / 10) * (lvl - 10));
      return Math.round(43600 + ((193790 - 43600) / 10) * (lvl - 20));
    };

    const currentExp = getCumulativeExp(currentExpLevel);
    const targetExp = getCumulativeExp(Math.max(currentExpLevel, targetExpLevel));
    const expNeeded = Math.max(0, targetExp - currentExp);
    const pctTo30 = Math.min(100, Math.round((currentExp / 193790) * 100));

    return {
      currentExp,
      targetExp,
      expNeeded,
      pctTo30
    };
  }, [currentExpLevel, targetExpLevel]);

  const handleCopySubstat = (s: SubstatRecord) => {
    const isEn = currentLang === 'en';
    const isJa = currentLang === 'ja';
    const rarityLabel = isJa
      ? (s.tier === 'Legendary' ? 'レジェンダリー' : s.tier === 'Epic' ? 'エピック' : s.tier === 'Rare' ? 'レア' : s.tier === 'Advanced' ? 'アンコモン' : 'コモン')
      : isEn ? s.tier : (s.tier === 'Legendary' ? 'Legendario' : s.tier === 'Epic' ? 'Épico' : s.tier === 'Rare' ? 'Raro' : s.tier === 'Advanced' ? 'Poco Común' : 'Común');
    const nameLabel = isJa ? `${s.nameJa} (${s.name})` : isEn ? s.name : `${s.nameEs} (${s.name})`;
    const text = isJa
      ? `[RE:SU キーリング サブステータス]
レアリティ: ${rarityLabel}
名前: ${nameLabel}
出現確率: ${s.chance}%
Lv.1: +${s.startV1}% ~ +${s.startV5}% (候補: +${s.startCandidates.join('%, +')}%)
Lv.30: +${s.lv30V1}% ~ +${s.lv30V5}% (候補: +${s.lv30Candidates.join('%, +')}%)
情報元: resudb.com/llaveros`
      : isEn
      ? `[RE:SU Keyring Sub-Stat]
Rarity: ${rarityLabel}
Name: ${nameLabel}
Chance: ${s.chance}%
Lv.1: +${s.startV1}% ~ +${s.startV5}% (Rolls: +${s.startCandidates.join('%, +')}%)
Lv.30: +${s.lv30V1}% ~ +${s.lv30V5}% (Rolls: +${s.lv30Candidates.join('%, +')}%)
Source: resudb.com/llaveros`
      : `[RE:SU Sub-Estadística de Llavero]
Rareza: ${rarityLabel}
Nombre: ${nameLabel}
Categoría: ${s.categoryLabel}
Aparición: ${s.chance}%
Nv.1: +${s.startV1}% ~ +${s.startV5}% (Rolls: +${s.startCandidates.join('%, +')}%)
Nv.30: +${s.lv30V1}% ~ +${s.lv30V5}% (+${s.lv30Candidates.join('%, +')}%)
Fuente: resudb.com/llaveros`;
    navigator.clipboard.writeText(text);
    setCopiedSubstat(s.id);
    setTimeout(() => setCopiedSubstat(null), 2000);
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen w-full overflow-x-hidden">
      <Helmet>
        <title>{t('keyrings.meta_title', 'Base de Datos de Llaveros y Sub-Estadísticas | Resident Evil: Survival Unit Wiki')}</title>
        <meta
          name="description"
          content={t('keyrings.meta_desc', 'Catálogo de los llaveros de Resident Evil: Survival Unit con efectos pasivos, sub-estadísticas equipables por rareza y calculadora de EXP a Nivel 30.')}
        />
        <link rel="canonical" href="https://resudb.com/llaveros" />
        <meta property="og:title" content={`${t('nav.keyrings', 'Llaveros')} | RE:SU Database`} />
        <meta
          property="og:description"
          content={t('keyrings.meta_desc', 'Catálogo de llaveros, sub-estadísticas equipables, EXP a Nivel 30 y tabla de Poder de Combate.')}
        />
        <meta property="og:url" content="https://resudb.com/llaveros" />
      </Helmet>

      {/* HEADER HERO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-10 text-center"
      >
        <div className="inline-flex items-center justify-center p-3 bg-blood-red/10 border border-blood-red/30 rounded-full mb-4">
          <Key className="text-neon-red" size={32} />
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bebas tracking-wider sm:tracking-widest text-white mb-3 break-words">
          {t('keyrings.title', 'BASE DE DATOS: LLAVEROS')}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto font-mono text-xs sm:text-sm mb-6 leading-relaxed px-1">
          {t('keyrings.subtitle', 'Catálogo del Maletín Attaché (KeyRing) v1.10.1 (Máx: Nv. 30). Equipa hasta 3 llaveros a la vez. Los efectos de rareza Épica y Legendaria aplican pasivamente desde el inventario.')}
        </p>

        {/* ACCESOS RÁPIDOS */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/guias/guia-maestra-llaveros"
            className="inline-flex items-center justify-center text-center gap-2 px-5 py-2.5 bg-blood-red/20 text-red-400 border border-blood-red/50 hover:bg-blood-red hover:text-white rounded-full transition-all font-bebas text-sm sm:text-base tracking-wider"
          >
            {t('keyrings.guide_button', 'LEER GUÍA DE LLAVEROS')}
          </Link>
          <a
            href="/Llaveros_EXP_Poder_30_Niveles.xlsx"
            download="Llaveros_EXP_Poder_30_Niveles.xlsx"
            className="inline-flex items-center justify-center text-center gap-2 px-5 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white rounded-full transition-all font-bebas text-sm sm:text-base tracking-wider"
          >
            <Download size={16} />
            {t('keyrings.download_excel', 'DESCARGAR EXCEL (1-30)')}
          </a>
          <button
            type="button"
            onClick={() => setShowSubStatsExplanation(prev => !prev)}
            className="inline-flex items-center justify-center text-center gap-2 px-5 py-2.5 bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 rounded-full transition-all font-bebas text-sm sm:text-base tracking-wider cursor-pointer"
          >
            <HelpCircle size={16} />
            {showSubStatsExplanation ? t('keyrings.mechanics_toggle_hide', 'OCULTAR AYUDA (20%)') : t('keyrings.mechanics_toggle_show', '¿CÓMO FUNCIONA EL 20%?')}
            {showSubStatsExplanation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </motion.div>

      {/* PANEL EXPLICATIVO COMPACTO DE CANDIDATOS */}
      <AnimatePresence>
        {showSubStatsExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-[#0b0b0b] border border-amber-500/30 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/60 border border-gray-800 rounded-lg p-3.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bebas text-base tracking-wider mb-1.5">
                    <Info size={16} />
                    {t('keyrings.mechanics_title', 'LOS 5 CANDIDATOS (20% DE PROBABILIDAD C/U)')}
                  </div>
                  <p className="text-gray-300 font-mono text-xs leading-relaxed">
                    {t('keyrings.mechanics_desc', 'Al obtener un llavero, se sortea 1 de 5 candidatos iniciales (cada uno con un 20% de probabilidad fija). Al subir a Nv. 30, el crecimiento por nivel es idéntico, por lo que el candidato inicial define el rango final mínimo o máximo.')}
                  </p>
                </div>

                <div className="bg-red-950/20 border border-red-800/40 rounded-lg p-3.5">
                  <div className="flex items-center gap-2 text-red-400 font-bebas text-lg tracking-wider mb-1.5">
                    <AlertTriangle size={16} />
                    {t('keyrings.bug_title', 'BUG VISUAL DEL POPUP EN EL JUEGO (v1.10.1)')}
                  </div>
                  <p className="text-gray-300 font-mono text-xs leading-relaxed">
                    {t('keyrings.bug_desc', 'El popup interno del juego muestra erróneamente valores inflados (ej. +12,13% en lugar de +3,90% a +4,30%) porque suma sub-stats al tooltip. Los valores de esta web son los datos reales de combate del juego.')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS SUPERIORES */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8">
        <button
          onClick={() => setMainTab('catalog')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            mainTab === 'catalog'
              ? 'bg-blood-red text-white shadow-[0_0_15px_rgba(255,0,0,0.4)] border border-red-500/40 font-bold'
              : 'bg-neutral-900/80 text-gray-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Key size={16} />
          <span>{t('keyrings.tabs.catalog', 'Llaveros')}</span>
        </button>

        <button
          onClick={() => setMainTab('progression')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            mainTab === 'progression'
              ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] border border-amber-400/40 font-bold'
              : 'bg-neutral-900/80 text-gray-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <TrendingUp size={16} />
          <span>{t('keyrings.tabs.progression', 'EXP & Poder (CP)')}</span>
        </button>

        <button
          onClick={() => setMainTab('substats')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            mainTab === 'substats'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/40 font-bold'
              : 'bg-neutral-900/80 text-gray-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Sparkles size={16} />
          <span>{t('keyrings.tabs.substats', 'Sub-Estadísticas')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CATÁLOGO DE 42 LLAVEROS (DISEÑO LIMPIO Y VISUAL)                   */}
      {/* ========================================================================= */}
      {mainTab === 'catalog' && (
        <motion.div
          key="tab-catalog"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
        >
          {/* Barra de Filtros */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#0a0a0a] p-3 sm:p-4 border border-gray-800 rounded-lg w-full max-w-full min-w-0">
            <div className="relative w-full md:w-96 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              <input
                type="text"
                placeholder={t("keyrings.search_placeholder", "Buscar por nombre o estadística...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black border border-gray-700 text-white font-mono text-xs sm:text-sm py-2.5 pl-10 pr-4 rounded focus:outline-none focus:border-blood-red transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto min-w-0">
              {types.map(tItem => (
                <button
                  key={tItem.id}
                  onClick={() => setFilterType(tItem.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-xs uppercase border transition-all duration-300 rounded-sm cursor-pointer ${
                    filterType === tItem.id 
                      ? 'bg-blood-red text-white border-blood-red shadow-[0_0_10px_rgba(220,38,38,0.4)] font-semibold' 
                      : 'bg-black text-gray-400 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {tItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de 42 Llaveros - Formato Visual Limpio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
            {filtered.map((llavero, idx) => {
              const isUnreleased = !llavero.stats || llavero.mainStat.includes('Aún sin agregar');
              const displayName = currentLang === 'ja' && llavero.nameJa 
                ? llavero.nameJa 
                : currentLang === 'en' && llavero.nameEn 
                ? llavero.nameEn 
                : llavero.name;

              const rawStat = currentLang === 'ja' && llavero.mainStatJa
                ? llavero.mainStatJa
                : currentLang === 'en' && llavero.mainStatEn
                ? llavero.mainStatEn
                : llavero.mainStat;

              const simplifiedStat = formatMainStat(rawStat, currentLang);

              const typeBadgeLabel = llavero.type === 'Combate'
                ? t('keyrings.types.combat', 'Combate')
                : llavero.type === 'Defensa'
                ? t('keyrings.types.defense', 'Defensa')
                : llavero.type === 'Economía'
                ? t('keyrings.types.economy', 'Economía')
                : t('keyrings.types.unknown', 'Desconocido');

              return (
                <motion.div
                  key={llavero.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.25) }}
                  className={`group relative flex flex-col justify-between rounded-xl overflow-hidden border transition-all duration-300 ${
                    isUnreleased
                      ? 'bg-[#0d0d0d]/80 border-neutral-800/60 opacity-60'
                      : 'bg-[#0d0d0d] border-neutral-800/80 hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.12)]'
                  }`}
                >
                  {/* Badge de Categoría en esquina superior derecha */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider rounded-md font-medium border ${
                      llavero.type === 'Combate' ? 'bg-red-950/70 text-red-300 border-red-800/60' :
                      llavero.type === 'Defensa' ? 'bg-blue-950/70 text-blue-300 border-blue-800/60' :
                      llavero.type === 'Economía' ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60' :
                      'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}>
                      {typeBadgeLabel}
                    </span>
                  </div>

                  {/* Cabecera con Imagen Centrada y Brillo Sutil */}
                  <div className="pt-6 pb-4 px-4 flex flex-col items-center border-b border-neutral-800/60 bg-gradient-to-b from-white/[0.03] to-transparent">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 relative mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      <div className="absolute inset-0 rounded-full bg-white/[0.02] blur-md group-hover:bg-red-500/10 transition-colors" />
                      <img 
                        src={llavero.icon} 
                        alt={displayName} 
                        className="relative max-w-full max-h-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]" 
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/items/Keyring_Default.webp';
                        }}
                      />
                    </div>
                    <h3 className="font-bebas text-lg sm:text-xl tracking-wider text-center text-white min-h-[44px] flex items-center justify-center group-hover:text-red-400 transition-colors">
                      {displayName}
                    </h3>
                  </div>
                  
                  {/* Cuerpo: Efecto Simplificado + Caja MIN ──► MAX Nivel 30 */}
                  <div className="p-3.5 sm:p-4 bg-black/40 flex-1 flex flex-col justify-between gap-3">
                    {/* Efecto Principal Simplificado con Icono Específico */}
                    <div className="flex items-center gap-2 px-1">
                      {getStatIcon(rawStat, llavero.type)}
                      <span className="text-xs sm:text-[13px] font-medium text-gray-200 leading-snug">
                        {simplifiedStat}
                      </span>
                    </div>

                    {/* Rango de Efecto a Nivel 30 (Min: Épico ──► Max: Legendario) */}
                    {llavero.stats ? (
                      <div className="bg-neutral-950/90 border border-neutral-800 rounded-lg p-2.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1.5 pb-1 border-b border-neutral-800/70">
                          <span className="font-semibold text-gray-400">{t('keyrings.card.level_max', 'Nivel 30 (Máx)')}</span>
                          <span className="text-gray-500 text-[9px]">{t('keyrings.card.min_max', 'Min ──► Max')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center divide-x divide-neutral-800">
                          <div className="pr-1">
                            <span className="text-[10px] font-bold text-purple-400 block tracking-wide">
                              {t('keyrings.card.epic_min', '◆ ÉPICO (MIN)')}
                            </span>
                            <span className="text-xs font-semibold text-purple-200 font-mono">
                              {llavero.stats.epicLv30Range}
                            </span>
                          </div>
                          <div className="pl-1">
                            <span className="text-[10px] font-bold text-amber-400 block tracking-wide">
                              {t('keyrings.card.leg_max', '★ LEG. (MAX)')}
                            </span>
                            <span className="text-xs font-semibold text-amber-200 font-mono">
                              {llavero.stats.legendLv30Range}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-950/60 border border-neutral-800/50 rounded-lg py-3 px-2 text-center">
                        <span className="text-[11px] font-mono text-gray-500 italic">
                          {t('keyrings.card.unrevealed', 'Estadísticas no reveladas')}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 font-mono">{t('keyrings.card.not_found', 'No se encontraron llaveros que coincidan con la búsqueda.')}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROGRESIÓN, EXP Y PODER DE COMBATE (CP)                           */}
      {/* ========================================================================= */}
      {mainTab === 'progression' && (
        <motion.div
          key="tab-progression"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-8"
        >
          {/* TABLA DE PODER DE COMBATE (CP) POR RAREZA */}
          <div className="p-6 rounded-2xl bg-neutral-950/90 border border-neutral-800 shadow-xl">
            <div className="mb-4 border-b border-neutral-800 pb-3">
              <h3 className="text-xl font-bebas tracking-wide text-white flex items-center gap-2">
                <ShieldCheck size={20} className="text-amber-400" />
                {t('keyrings.progression.cp_title', 'Poder de Combate (Combat Power - CP) según Rareza y Nivel')}
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                {t('keyrings.progression.cp_desc', 'Poder neto otorgado por cada llavero al alcanzar los hitos clave de nivel.')}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-gray-400 uppercase">
                    <th className="py-3 px-3">{t('keyrings.progression.table.rarity', 'Rareza')}</th>
                    <th className="py-3 px-3">{t('keyrings.progression.table.slots', 'Ranuras Activas')}</th>
                    <th className="py-3 px-3 text-right">{t('keyrings.progression.table.cp_lv10', 'CP Nivel 10')}</th>
                    <th className="py-3 px-3 text-right">{t('keyrings.progression.table.cp_lv20', 'CP Nivel 20')}</th>
                    <th className="py-3 px-3 text-right">{t('keyrings.progression.table.cp_lv30', 'CP Nivel 30 (Máx)')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {KEYRING_COMBAT_POWER.map((row: KeyringCombatPowerStats) => (
                    <tr key={row.tier} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded text-[11px] border ${row.badge}`}>
                          {currentLang === 'ja' ? row.tierJa : currentLang === 'en' ? row.tierEn : row.tierEs} ({row.tier})
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-300">{currentLang === 'ja' ? row.slotsJa : currentLang === 'en' ? row.slotsEn : row.slots}</td>
                      <td className="py-3.5 px-3 text-right text-gray-300">{row.cpLv10.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-right text-amber-300 font-bold">{row.cpLv20.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-emerald-400 text-sm">
                        {row.cpLv30.toLocaleString()} CP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CALCULADORA DE EXP INTERACTIVA */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[#0a0a0a] border border-neutral-800 shadow-[0_4px_30px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* DESTACADO EN LAS ESQUINAS (Resplandor ambiental suave de color en las esquinas, sin recortes rígidos) */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-red-600/60 via-amber-500/50 to-transparent pointer-events-none" />

            {/* Cabecera */}
            <div className="mb-6 relative z-10 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-bebas tracking-wide text-white flex items-center gap-2.5">
                <TrendingUp className="text-amber-400" size={26} />
                <span>{t('keyrings.progression.calc_title', 'Calculadora de EXP de Llavero (Nivel 1 a 30)')}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 font-mono">
                {t('keyrings.progression.calc_desc', 'Selecciona nivel actual y objetivo para conocer la EXP necesaria.')}
              </p>
            </div>

            {/* CUERPO PRINCIPAL: 2 COLUMNAS (IZQUIERDA: SHOWCASE + INPUTS; DERECHA: RESULTADOS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* COLUMNA IZQUIERDA: ARTE DE LLAVEROS + INPUTS NUMÉRICOS */}
              <div className="lg:col-span-6 flex flex-col items-center">
                
                {/* 1. Arte de Llaveros Subiendo de Nivel (PNG con sombra roja de fondo, sin hover) */}
                <div className="relative w-full max-w-md h-52 sm:h-60 flex items-center justify-center mb-3">
                  {/* Sombra / Resplandor rojo ambiental detrás de los llaveros */}
                  <div className="absolute inset-0 bg-radial from-red-600/25 via-red-950/15 to-transparent blur-2xl rounded-full pointer-events-none" />
                  <img 
                    src="/llaveros/keyrings_upgrade_showcase.png" 
                    alt="Keyrings Level Up Showcase" 
                    className="relative max-h-full max-w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] pointer-events-none select-none"
                  />
                </div>

                {/* 2. Inputs Numéricos Normales: Nivel Actual ──► Nivel Deseado */}
                <div className="w-full max-w-md bg-black/60 border border-neutral-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm shadow-xl">
                  <div className="grid grid-cols-11 gap-2 items-center">
                    
                    {/* Caja Nivel Actual */}
                    <div className="col-span-5 flex flex-col items-center">
                      <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2 font-semibold text-center">
                        {t('keyrings.progression.current_lvl', 'Nivel Actual')}
                      </span>
                      <div className="flex items-center gap-1.5 w-full justify-center">
                        <button
                          type="button"
                          onClick={() => setCurrentExpLevel(prev => Math.max(1, prev - 1))}
                          disabled={currentExpLevel <= 1}
                          className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <div className="relative flex-1 max-w-[80px]">
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={currentExpLevel}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(30, parseInt(e.target.value) || 1));
                              setCurrentExpLevel(val);
                              if (val > targetExpLevel) setTargetExpLevel(val);
                            }}
                            className="w-full text-center font-mono text-xl sm:text-2xl font-bold text-amber-400 bg-neutral-950 border border-amber-500/40 rounded-xl py-2 px-1 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.min(30, currentExpLevel + 1);
                            setCurrentExpLevel(next);
                            if (next > targetExpLevel) setTargetExpLevel(next);
                          }}
                          disabled={currentExpLevel >= 30}
                          className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] font-mono text-gray-500 mt-1.5">
                        {expCalculation.currentExp.toLocaleString()} EXP
                      </span>
                    </div>

                    {/* Flecha Central */}
                    <div className="col-span-1 flex items-center justify-center">
                      <ArrowRight size={22} className="text-amber-400 animate-pulse" />
                    </div>

                    {/* Caja Nivel Deseado */}
                    <div className="col-span-5 flex flex-col items-center">
                      <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2 font-semibold text-center">
                        {t('keyrings.progression.target_lvl', 'Nivel Deseado')}
                      </span>
                      <div className="flex items-center gap-1.5 w-full justify-center">
                        <button
                          type="button"
                          onClick={() => setTargetExpLevel(prev => Math.max(currentExpLevel, prev - 1))}
                          disabled={targetExpLevel <= currentExpLevel}
                          className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <div className="relative flex-1 max-w-[80px]">
                          <input
                            type="number"
                            min={currentExpLevel}
                            max="30"
                            value={targetExpLevel}
                            onChange={(e) => {
                              const val = Math.max(currentExpLevel, Math.min(30, parseInt(e.target.value) || currentExpLevel));
                              setTargetExpLevel(val);
                            }}
                            className="w-full text-center font-mono text-xl sm:text-2xl font-bold text-emerald-400 bg-neutral-950 border border-emerald-500/40 rounded-xl py-2 px-1 focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setTargetExpLevel(prev => Math.min(30, prev + 1))}
                          disabled={targetExpLevel >= 30}
                          className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] font-mono text-gray-500 mt-1.5">
                        {expCalculation.targetExp.toLocaleString()} EXP
                      </span>
                    </div>

                  </div>

                  {/* Botones de Selección Rápida de Hitos (Nv 10, 20, 30) */}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-neutral-800/80">
                    <span className="text-[10px] font-mono text-gray-500 uppercase mr-1">{t('keyrings.progression.quick', 'Rápido:')}</span>
                    {[10, 20, 30].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          setTargetExpLevel(lvl);
                          if (currentExpLevel > lvl) setCurrentExpLevel(Math.max(1, lvl - 5));
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border cursor-pointer ${
                          targetExpLevel === lvl 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold' 
                            : 'bg-neutral-900 text-gray-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        {currentLang === 'es' ? `Nv. ${lvl}` : `Lv. ${lvl}`}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* COLUMNA DERECHA: RESULTADOS, BARRA DE PROGRESO Y HITOS */}
              <div className="lg:col-span-6 p-6 rounded-2xl bg-black/60 border border-neutral-800 flex flex-col justify-between space-y-6">
                
                {/* Cifra Principal de EXP Necesaria */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                      {t('keyrings.progression.exp_needed', 'EXP Requerida para subir:')}
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      {t('keyrings.progression.from_to', { from: currentExpLevel, to: targetExpLevel, defaultValue: `(De Nv. ${currentExpLevel} a Nv. ${targetExpLevel})` })}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-amber-400 tracking-tight drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      {expCalculation.expNeeded.toLocaleString()}
                    </span>
                    <span className="text-xl font-mono text-gray-400 font-bold">EXP</span>
                  </div>
                </div>

                {/* Porcentaje de avance hacia Nv. 30 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-gray-400 uppercase">{t('keyrings.progression.progress', 'Avance hacia Nv. 30:')}</span>
                    <span className="text-lg font-bold text-emerald-400">{expCalculation.pctTo30}%</span>
                  </div>

                  <div className="w-full h-3.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-300 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      style={{ width: `${expCalculation.pctTo30}%` }}
                    />
                  </div>
                </div>

                {/* Hitos clave del juego */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-800 text-center font-mono text-xs">
                  <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                    <span className="text-[10px] text-gray-500 block uppercase">
                      {t('keyrings.progression.milestone_title', { level: 10, defaultValue: 'Hito Nv. 10' })}
                    </span>
                    <strong className="text-gray-200">6,480</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                    <span className="text-[10px] text-gray-500 block uppercase">
                      {t('keyrings.progression.milestone_title', { level: 20, defaultValue: 'Hito Nv. 20' })}
                    </span>
                    <strong className="text-gray-200">43,600</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-950/80 border border-amber-500/30">
                    <span className="text-[10px] text-amber-400/80 block uppercase">
                      {t('keyrings.progression.milestone_title', { level: 30, defaultValue: 'Hito Nv. 30' })}
                    </span>
                    <strong className="text-amber-300">193,790</strong>
                  </div>
                </div>

                {/* Nota táctica */}
                <p className="text-[11px] font-mono text-gray-500 leading-relaxed italic">
                  💡 {t('keyrings.progression.calc_formula', 'Calculada según la curva oficial de 193,790 EXP acumulada a Nv.30.')}
                </p>

              </div>

            </div>
          </div>

          {/* HITOS DE EXP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {KEYRING_EXP_MILESTONES.map((m) => (
              <div key={m.level} className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {t('keyrings.progression.milestone_badge', { level: m.level, defaultValue: `HITO NV. ${m.level}` })}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    +{m.expDifference.toLocaleString()} EXP
                  </span>
                </div>
                <div className="text-lg font-mono font-bold text-white mb-1">
                  {t('keyrings.progression.milestone_total', { exp: m.cumulativeExp.toLocaleString(), defaultValue: `${m.cumulativeExp.toLocaleString()} EXP Total` })}
                </div>
                <p className="text-xs font-mono text-gray-400 leading-relaxed">
                  {currentLang === 'ja' ? m.descriptionJa : currentLang === 'en' ? m.descriptionEn : m.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CATÁLOGO DE SUB-ESTADÍSTICAS (96 BUFFS DE RANURA)                 */}
      {/* ========================================================================= */}
      {mainTab === 'substats' && (
        <motion.div
          key="tab-substats"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-6"
        >
          {/* Barra de Filtros */}
          <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            {/* Rareza */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">
                {t('keyrings.substats.filter_rarity', 'Rareza del Llavero:')}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { tier: 'Legendary', label: t('keyrings.substats.rarity_levels.legendary', 'Legendario'), color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                  { tier: 'Epic', label: t('keyrings.substats.rarity_levels.epic', 'Épico'), color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
                  { tier: 'Rare', label: t('keyrings.substats.rarity_levels.rare', 'Raro'), color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
                  { tier: 'Advanced', label: t('keyrings.substats.rarity_levels.advanced', 'Poco Común'), color: 'bg-green-500/20 text-green-300 border-green-500/40' },
                  { tier: 'Common', label: t('keyrings.substats.rarity_levels.common', 'Común'), color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' }
                ].map(tItem => (
                  <button
                    key={tItem.tier}
                    onClick={() => setSelectedSubstatTier(tItem.tier)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedSubstatTier === tItem.tier
                        ? `${tItem.color} font-bold shadow-md`
                        : 'bg-neutral-900 text-gray-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {tItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buscador y Categorías */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-neutral-900">
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder={t("keyrings.substats.search_placeholder", "Buscar sub-stat (ej. Rally, Atacar Base, Hierbas)...")}
                  value={substatSearch}
                  onChange={(e) => setSubstatSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-7 flex flex-wrap gap-1.5 items-center">
                {[
                  { id: 'all', label: t('keyrings.substats.categories.all', 'Todas') },
                  { id: 'rally', label: t('keyrings.substats.categories.rally', 'Rally') },
                  { id: 'attack_base', label: t('keyrings.substats.categories.attack_base', 'Atacar Base') },
                  { id: 'defend_base', label: t('keyrings.substats.categories.defend_base', 'Defender Base') },
                  { id: 'event_herbs', label: t('keyrings.substats.categories.herbs', 'Hierbas') },
                  { id: 'event_vaccine', label: t('keyrings.substats.categories.vaccine', 'Vacunas') },
                  { id: 'event_saint_vale', label: t('keyrings.substats.categories.saint_vale', 'Saint Vale') }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedSubstatCategory(cat.id)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer border ${
                      selectedSubstatCategory === cat.id
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-neutral-900/60 text-gray-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-1">
              <span>{t('keyrings.substats.showing_count', { count: filteredSubstats.length, defaultValue: `Mostrando ${filteredSubstats.length} sub-estadísticas` })}</span>
              <span className="text-[11px] text-emerald-400">{t('keyrings.substats.fixed_prob', 'Cada roll tiene 20% de probabilidad fija')}</span>
            </div>
          </div>

          {/* Listado de Sub-Estadísticas */}
          <div className="space-y-2.5">
            {filteredSubstats.map((s) => {
              const isExpanded = !!expandedSubstats[s.id];
              return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {currentLang === 'ja'
                            ? (s.category === 'rally' ? '集結' : s.category === 'attack_base' ? '拠点攻撃' : s.category === 'defend_base' ? '拠点防衛' : s.category === 'event_herbs' ? 'ハーブを求めて' : s.category === 'event_vaccine' ? 'ワクチン研究所' : 'SAINT VALE')
                            : currentLang === 'en'
                            ? (s.category === 'rally' ? 'Rally' : s.category === 'attack_base' ? 'Base Attack' : s.category === 'defend_base' ? 'Base Defense' : s.category === 'event_herbs' ? 'In Search of Herbs' : s.category === 'event_vaccine' ? 'Vaccine Lab' : 'Saint Vale')
                            : s.categoryLabel}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          {t('keyrings.substats.chance', 'Aparición:')} <strong className="text-amber-400">{s.chance}%</strong>
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-mono font-bold text-white">
                        {currentLang === 'ja' ? s.nameJa : currentLang === 'en' ? s.name : s.nameEs}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-500">
                        {currentLang === 'es' ? s.name : currentLang === 'ja' ? `${s.name} (${s.nameEs})` : s.nameEs}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono">
                        <div className="text-[11px] text-gray-400">
                          {t('keyrings.substats.lv1_label', 'Nv. 1:')} <strong className="text-gray-200">+{s.startV1}% ~ +{s.startV5}%</strong>
                        </div>
                        <div className="text-xs text-amber-300 font-bold">
                          {t('keyrings.substats.lv30_label', 'Nv. 30:')} +{s.lv30V1}% ~ +{s.lv30V5}%
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopySubstat(s)}
                        className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title={t('keyrings.substats.copy_button', 'Copiar datos')}
                      >
                        {copiedSubstat === s.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>

                      <button
                        onClick={() => toggleSubstatRow(s.id)}
                        className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-purple-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>{isExpanded ? t('keyrings.substats.hide_rolls', 'Ocultar') : t('keyrings.substats.show_rolls', '5 Rolls')}</span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Rolls Detallados */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2.5 pt-2.5 border-t border-neutral-900 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2.5 rounded bg-black/60 border border-neutral-800">
                            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                              {t('keyrings.substats.candidates_lv1', 'Nivel 1 (20% c/u):')}
                            </span>
                            <div className="grid grid-cols-5 gap-1 text-center">
                              {s.startCandidates.map((val, idx) => (
                                <div key={idx} className="p-1 rounded bg-neutral-950 border border-neutral-800/60">
                                  <span className="text-[9px] text-gray-500 block">V{idx + 1}</span>
                                  <span className="text-gray-200 font-bold">+{val}%</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-2.5 rounded bg-black/60 border border-neutral-800">
                            <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                              {t('keyrings.substats.candidates_lv30', 'Nivel 30 (Máx):')}
                            </span>
                            <div className="grid grid-cols-5 gap-1 text-center">
                              {s.lv30Candidates.map((val, idx) => (
                                <div key={idx} className="p-1 rounded bg-neutral-950 border border-amber-500/20">
                                  <span className="text-[9px] text-amber-400/60 block">V{idx + 1}</span>
                                  <span className="text-amber-300 font-bold">+{val}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {filteredSubstats.length === 0 && (
              <div className="text-center py-16 bg-neutral-950 rounded-2xl border border-neutral-800">
                <p className="text-gray-500 font-mono text-sm">
                  {t('keyrings.substats.not_found', 'No se encontraron sub-estadísticas con los filtros aplicados.')}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Llaveros;
