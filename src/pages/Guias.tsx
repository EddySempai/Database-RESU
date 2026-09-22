import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Zap, 
  Clock, 
  ChevronRight, 
  X, 
  Search, 
  ArrowUpRight, 
  Flame, 
  Award, 
  Scale, 
  Calculator, 
  Skull,
  Key,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Gem,
  Radio,
  Sparkle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { GUIAS_DATA, type GuideDossier } from '../data/guiasData';
import { useSound } from '../contexts/SoundContext';

export default function Guias() {
  const { t } = useTranslation();
  const { playHover, playClick } = useSound();

  // Filter States (No difficulty as requested)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyBookmarks, setOnlyBookmarks] = useState<boolean>(false);
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);

  // Bookmarks stored in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('resu_bookmarked_guides');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playClick();
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('resu_bookmarked_guides', JSON.stringify(next));
      } catch (err) {
        console.warn('Could not save bookmark to localStorage:', err);
      }
      return next;
    });
  };

  // Top spotlight candidates (priority guides like Mortem or Cumbre)
  const spotlightGuides = useMemo(() => {
    return GUIAS_DATA.filter(g => g.isHero || g.id === 7 || g.id === 8);
  }, []);

  const currentSpotlight = spotlightGuides[spotlightIndex] || GUIAS_DATA[0];

  const categories = [
    { id: 'all', label: t('guides.category_all', 'Todos los Dossiers'), icon: BookOpen },
    { id: 'events', label: t('guides.category_events', 'Eventos & Jefes'), icon: Skull },
    { id: 'combat', label: t('guides.category_combat', 'Combate & PvP'), icon: Target },
    { id: 'optimization', label: t('guides.category_optimization', 'Optimización & Equipo'), icon: Zap },
    { id: 'beginner', label: t('guides.category_beginner', 'Principiante'), icon: Flame },
    { id: 'tools', label: t('guides.category_tools', 'Herramientas'), icon: Calculator }
  ];

  const quickObjectives = [
    { label: 'Derrotar a Mortem', query: 'Mortem', category: 'events' },
    { label: 'Cumbre de Ases', query: 'Cumbre', category: 'events' },
    { label: 'Dominar Llaveros', query: 'Llaveros', category: 'optimization' },
    { label: 'Guerra de Hierbas', query: 'Hierbas', category: 'events' },
    { label: 'Guía Primeros 7 Días', query: 'Primeros 7 Días', category: 'beginner' }
  ];

  // Filtered Guides logic
  const filteredGuides = useMemo(() => {
    return GUIAS_DATA.filter((guide: GuideDossier) => {
      if (selectedCategory !== 'all' && selectedCategory !== 'tools' && guide.category !== selectedCategory) {
        return false;
      }
      if (selectedCategory === 'tools') {
        return false;
      }
      if (onlyBookmarks && !bookmarkedIds.includes(guide.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = guide.title.toLowerCase().includes(q);
        const descMatch = guide.desc.toLowerCase().includes(q);
        const badgeMatch = guide.badge.toLowerCase().includes(q);
        const catMatch = guide.categoryLabel.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !badgeMatch && !catMatch) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, searchQuery, onlyBookmarks, bookmarkedIds]);

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery !== '' || onlyBookmarks;

  const resetFilters = () => {
    playClick();
    setSelectedCategory('all');
    setSearchQuery('');
    setOnlyBookmarks(false);
  };

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return GUIAS_DATA.length;
    if (catId === 'tools') return 6;
    return GUIAS_DATA.filter(g => g.category === catId).length;
  };

  return (
    <div className="pt-28 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1540px] mx-auto min-h-screen relative z-10 flex flex-col min-w-0 w-full overflow-x-hidden">
      <Helmet>
        <title>Centro de Guías Tácticas y Eventos | Resident Evil: Survival Unit Wiki</title>
        <meta name="description" content="Guías completas de eventos para Resident Evil: Survival Unit. Protocolos de combate para Repeler a Mortem, fases de Cumbre de Ases, Asalto al Laboratorio, defensa de alianza y guía para principiantes." />
        <link rel="canonical" href="https://resudb.com/guias" />
        <meta property="og:title" content="Guías Tácticas de Eventos | Resident Evil: Survival Unit Wiki" />
        <meta property="og:description" content="Protocolos de combate de eventos de alianza, jefes mundiales y optimización táctica." />
        <meta property="og:url" content="https://resudb.com/guias" />
        <meta property="og:image" content="https://resudb.com/metadata-img.png" />
      </Helmet>
      
      {/* Subtle Ambient HUD Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* =========================================================
          1. HEADER & INTEL TELEMETRY
         ========================================================= */}
      <header className="mb-6 pb-6 border-b border-white/[0.08] relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-2"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span className="font-mono text-[11px] sm:text-xs text-red-400 tracking-[0.2em] uppercase font-bold">
                UMBRELLA ARCHIVES // INTEL DOSSIERS
              </span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-baseline gap-3"
            >
              <h1 className="font-bebas text-4xl sm:text-6xl lg:text-7xl text-white tracking-wider drop-shadow-[0_0_20px_rgba(255,42,42,0.3)] m-0">
                {t('guides.title', 'CENTRO DE GUÍAS')}
              </h1>
              <span className="font-mono text-xs text-gray-400">
                ({GUIAS_DATA.length} {t('guides.intel_count', 'DOSSIERS DISPONIBLES')})
              </span>
            </motion.div>

            <p className="font-inter text-xs sm:text-sm text-gray-400 max-w-2xl mt-1.5 leading-relaxed">
              {t('guides.subtitle', 'Estrategias de combate, protocolos de eventos mundiales y optimización táctica verificadas por oficiales.')}
            </p>
          </div>

          {/* Quick Search & Saved Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            {/* Quick Bookmark Toggle */}
            <button
              onClick={() => {
                playClick();
                setOnlyBookmarks(!onlyBookmarks);
              }}
              onMouseEnter={playHover}
              className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                onlyBookmarks 
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-gray-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              <Bookmark size={14} className={onlyBookmarks ? 'fill-yellow-400 text-yellow-400' : ''} />
              <span>Guardados</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-gray-300">
                {bookmarkedIds.length}
              </span>
            </button>

            {/* Clean Modern Search Bar */}
            <div className="w-full sm:w-72 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={15} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('guides.search_placeholder', 'Buscar guía o estrategia...')}
                className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black border border-white/[0.08] focus:border-red-500/70 text-white text-xs font-mono pl-10 pr-8 py-2 rounded-lg outline-none transition-all placeholder:text-gray-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Objectives Interactive Bar */}
        <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] text-gray-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkle size={12} className="text-neon-red" /> Asistente Rápido:
          </span>
          {quickObjectives.map(obj => (
            <button
              key={obj.label}
              onClick={() => {
                playClick();
                setSearchQuery(obj.query);
                if (obj.category) setSelectedCategory(obj.category);
              }}
              onMouseEnter={playHover}
              className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/[0.03] hover:bg-red-500/15 text-gray-300 hover:text-red-300 border border-white/[0.05] hover:border-red-500/30 transition-all cursor-pointer"
            >
              {obj.label}
            </button>
          ))}
        </div>
      </header>

      {/* =========================================================
          2. FEATURED SPOTLIGHT HERO (High-Color Full Visual Impact)
         ========================================================= */}
      {selectedCategory === 'all' && !searchQuery && !onlyBookmarks && currentSpotlight && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          {/* Priority Switcher Tabs */}
          {spotlightGuides.length > 1 && (
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                <Radio size={11} className="text-red-500 animate-pulse" /> OPERACIÓN:
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {spotlightGuides.map((guide, idx) => (
                  <button
                    key={guide.id}
                    onClick={() => {
                      playClick();
                      setSpotlightIndex(idx);
                    }}
                    onMouseEnter={playHover}
                    className={`font-mono text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      spotlightIndex === idx
                        ? 'bg-red-600 text-white font-bold shadow-[0_0_10px_rgba(255,42,42,0.4)]'
                        : 'text-gray-400 hover:text-white bg-white/[0.03]'
                    }`}
                  >
                    0{idx + 1} {guide.title.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seamless Integrated Hero Container with Vivid Full-Color Artwork */}
          <div className="relative rounded-2xl overflow-hidden bg-[#070709] border border-white/[0.08] hover:border-red-500/30 transition-colors p-4 sm:p-8 lg:p-10 shadow-2xl group">
            
            {/* Top Specular Destello de Luz */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            {/* Ambient Corner Flare */}
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

            {/* Seamless Vivid Boss/Event Artwork */}
            {currentSpotlight.image && (
              <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[58%] pointer-events-none overflow-hidden flex items-center justify-end">
                <img 
                  src={currentSpotlight.image} 
                  alt={currentSpotlight.title}
                  className="h-full w-full object-contain lg:object-cover object-right opacity-65 lg:opacity-90 transform group-hover:scale-105 group-hover:saturate-[1.2] transition-all duration-700 select-none"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, black 75%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, black 75%)'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/40 pointer-events-none" />
                
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-2.5 py-0.5 rounded font-mono text-[9px] text-red-400/90 tracking-widest uppercase">
                  [REF: UMB-00{currentSpotlight.id}]
                </div>
              </div>
            )}

            {/* Content Container (Layered on top of background) */}
            <div className="relative z-10 max-w-2xl">
              
              {/* Meta Row */}
              <div className="flex items-center gap-2.5 flex-wrap mb-3 text-xs font-mono">
                <span className="text-neon-red font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  OPERACIÓN DESTACADA
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 flex items-center gap-1">
                  <Clock size={12} className="text-yellow-400" /> {currentSpotlight.readTime}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-bebas text-2xl sm:text-4xl lg:text-6xl text-white tracking-wide leading-tight mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] break-words">
                {currentSpotlight.title}
              </h2>

              {/* Description */}
              <p className="font-inter text-sm sm:text-base text-gray-300 leading-relaxed mb-6 drop-shadow-md">
                {currentSpotlight.desc}
              </p>

              {/* Clean Takeaways Checklist */}
              {currentSpotlight.takeaways && currentSpotlight.takeaways.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-6 pt-4 border-t border-white/[0.06]">
                  {currentSpotlight.takeaways.slice(0, 4).map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs text-gray-300 drop-shadow-sm">
                      <CheckCircle2 size={15} className="text-neon-red shrink-0 mt-0.5" />
                      <span className="leading-snug text-gray-300">{pt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/guias/${currentSpotlight.slug}`}
                  onClick={playClick}
                  onMouseEnter={playHover}
                  className="inline-flex items-center gap-2 bg-blood-red hover:bg-red-600 text-white font-mono text-xs uppercase tracking-widest px-5 py-3 rounded-lg font-bold shadow-[0_0_15px_rgba(255,42,42,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>ABRIR EXPEDIENTE COMPLETO</span>
                  <ChevronRight size={16} />
                </Link>

                <button
                  onClick={(e) => toggleBookmark(currentSpotlight.id, e)}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    bookmarkedIds.includes(currentSpotlight.id)
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white'
                  }`}
                >
                  <Bookmark size={15} className={bookmarkedIds.includes(currentSpotlight.id) ? 'fill-yellow-400 text-yellow-400' : ''} />
                  <span>{bookmarkedIds.includes(currentSpotlight.id) ? 'Guardado' : 'Guardar'}</span>
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      )}

      {/* =========================================================
          3. TACTICAL CATEGORY TABS (Clean, Streamlined)
         ========================================================= */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 touch-pan-x w-full max-w-full min-w-0">
          {categories.map(cat => {
            const Icon = cat.icon;
            const count = getCategoryCount(cat.id);
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  playClick();
                  setSelectedCategory(cat.id);
                }}
                onMouseEnter={playHover}
                className={`shrink-0 flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-blood-red text-white font-bold shadow-[0_0_12px_rgba(255,42,42,0.35)]'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-white' : 'text-gray-500'} />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1 rounded font-mono ${
                  isSelected ? 'bg-black/30 text-white' : 'text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result count & reset */}
        <div className="flex items-center gap-3 text-xs font-mono self-end sm:self-center">
          <span className="text-gray-400">
            Mostrando <strong className="text-white">{filteredGuides.length}</strong> expedientes
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              onMouseEnter={playHover}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          4. DOSSIER CARDS GRID (Full Color Images + Minimal Text)
         ========================================================= */}
      {selectedCategory !== 'tools' && (
        <>
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr mb-14">
              <AnimatePresence>
                {filteredGuides.map((guide: GuideDossier, index: number) => {
                  const isBookmarked = bookmarkedIds.includes(guide.id);

                  return (
                    <motion.div
                      key={guide.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="flex flex-col h-full"
                    >
                      <Link
                        to={`/guias/${guide.slug}`}
                        onClick={playClick}
                        onMouseEnter={playHover}
                        className="group relative rounded-2xl overflow-hidden bg-[#070709] border border-white/[0.08] hover:border-red-500/50 p-6 flex flex-col justify-between h-full min-h-[260px] transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_12px_35px_rgba(0,0,0,0.8)] block"
                      >
                        {/* 1. Full-Color Vivid Background Artwork */}
                        {guide.image ? (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <img 
                              src={guide.image} 
                              alt={guide.title} 
                              className="w-full h-full object-cover object-center transform group-hover:scale-105 group-hover:saturate-[1.2] transition-all duration-500 opacity-70 group-hover:opacity-95" 
                            />
                            {/* Subtle dark gradient overlay ONLY at the bottom to protect text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/75 to-transparent" />
                          </div>
                        ) : (
                          <div className={`absolute inset-0 bg-gradient-to-br ${guide.color} opacity-30 pointer-events-none`} />
                        )}

                        {/* 2. Top Specular Destello de Luz */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 group-hover:via-red-500/60 to-transparent transition-colors duration-500" />
                        
                        {/* 3. Ambient Corner Flare on Hover */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/[0.02] group-hover:bg-red-500/15 blur-2xl transition-all duration-500 pointer-events-none" />

                        {/* 4. Top Tag Bar */}
                        <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neon-red font-bold drop-shadow-sm">
                              {guide.badge}
                            </span>
                            <span className="text-gray-500 font-mono text-[10px]">•</span>
                            <span className="font-mono text-[10px] text-gray-300 flex items-center gap-1">
                              <Clock size={10} className="text-yellow-400" />
                              {guide.readTime}
                            </span>
                          </div>

                          <button
                            onClick={(e) => toggleBookmark(guide.id, e)}
                            className="p-1 rounded text-gray-400 hover:text-yellow-400 transition-colors"
                            title={isBookmarked ? 'Quitar de guardados' : 'Guardar expediente'}
                          >
                            <Bookmark size={14} className={isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''} />
                          </button>
                        </div>

                        {/* 5. Clean Title (No text clutter / No paragraphs) */}
                        <div className="relative z-10 mt-auto">
                          <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide group-hover:text-neon-red transition-colors leading-tight mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            {guide.title}
                          </h3>

                          {/* Link Row */}
                          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                            <span className="font-mono text-[10px] text-gray-400">
                              [UMB-00{guide.id}]
                            </span>

                            <div className="flex items-center gap-1 font-mono text-xs text-neon-red font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                              <span>{t('guides.view_full_dossier', 'VER EXPEDIENTE')}</span>
                              <ChevronRight size={14} />
                            </div>
                          </div>
                        </div>

                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            /* Radar Empty State */
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-12 text-center my-8 flex flex-col items-center justify-center">
              <Radio size={32} className="text-red-500 animate-pulse mb-3" />
              <h3 className="font-bebas text-3xl text-white tracking-wider mb-1">
                {t('guides.no_results_title', 'Sin coincidencias en los archivos')}
              </h3>
              <p className="font-inter text-xs text-gray-400 max-w-md mx-auto mb-5 leading-relaxed">
                {t('guides.no_results_desc', 'No se encontraron expedientes con los filtros aplicados.')}
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 bg-blood-red hover:bg-red-600 text-white font-mono text-xs uppercase px-4 py-2 rounded-lg font-bold transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Restablecer Filtros</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* =========================================================
          5. TACTICAL TOOLS (Clean Cards With Specular Edge Destellos)
         ========================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'tools') && (
        <section className="mt-6 pt-8 border-t border-white/[0.06]">
          <div className="mb-5">
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider font-bold">
              SUITE TÁCTICA // SIMULADORES
            </span>
            <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide">
              HERRAMIENTAS DEL OFICIAL
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Tool 1: Calculadora de Tropas */}
            <Link
              to="/calculadoras"
              onClick={playClick}
              onMouseEnter={playHover}
              className="group relative rounded-xl bg-[#08080a] hover:bg-[#0c0d12] border border-white/[0.06] hover:border-cyan-500/50 transition-all p-5 flex flex-col justify-between overflow-hidden shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-cyan-500/10 blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                    CALCULADORA DE TROPAS
                  </span>
                  <Calculator size={16} className="text-cyan-400" />
                </div>
                <h3 className="font-bebas text-2xl text-white group-hover:text-cyan-400 transition-colors mb-1">
                  Planificador de Tropas & Cumbres
                </h3>
                <p className="font-inter text-xs text-gray-400 leading-relaxed mb-3">
                  Puntos exactos para Cumbre de Ases, aceleradores y entrenamiento de tropas.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400 pt-2 border-t border-white/[0.04]">
                <span>Acceder</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tool 2: Tesoros & Joyas */}
            <Link
              to="/calculadoras"
              onClick={playClick}
              onMouseEnter={playHover}
              className="group relative rounded-xl bg-[#08080a] hover:bg-[#100e08] border border-white/[0.06] hover:border-yellow-500/50 transition-all p-5 flex flex-col justify-between overflow-hidden shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-yellow-500/10 blur-xl pointer-events-none group-hover:bg-yellow-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-yellow-400">
                    TESOROS & JOYAS
                  </span>
                  <Gem size={16} className="text-yellow-400" />
                </div>
                <h3 className="font-bebas text-2xl text-white group-hover:text-yellow-400 transition-colors mb-1">
                  Calculadora de Tesoros & Gemas
                </h3>
                <p className="font-inter text-xs text-gray-400 leading-relaxed mb-3">
                  Simula costes de mejora para Tesoros Míticos y Joyas.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-yellow-400 pt-2 border-t border-white/[0.04]">
                <span>Acceder</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tool 3: Luminio */}
            <Link
              to="/calculadoras"
              onClick={playClick}
              onMouseEnter={playHover}
              className="group relative rounded-xl bg-[#08080a] hover:bg-[#08100a] border border-white/[0.06] hover:border-emerald-500/50 transition-all p-5 flex flex-col justify-between overflow-hidden shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                    INVESTIGACIÓN
                  </span>
                  <Zap size={16} className="text-emerald-400" />
                </div>
                <h3 className="font-bebas text-2xl text-white group-hover:text-emerald-400 transition-colors mb-1">
                  Árbol de Investigación de Luminio
                </h3>
                <p className="font-inter text-xs text-gray-400 leading-relaxed mb-3">
                  Simula la asignación de polvo de luminio en Atacante, Defensor y Ranger.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 pt-2 border-t border-white/[0.04]">
                <span>Acceder</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tool 4: Comparador de Héroes */}
            <Link
              to="/comparador"
              onClick={playClick}
              onMouseEnter={playHover}
              className="group relative rounded-xl bg-[#08080a] hover:bg-[#100810] border border-white/[0.06] hover:border-purple-500/50 transition-all p-5 flex flex-col justify-between overflow-hidden shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-purple-500/10 blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-purple-400">
                    ANÁLISIS
                  </span>
                  <Scale size={16} className="text-purple-400" />
                </div>
                <h3 className="font-bebas text-2xl text-white group-hover:text-purple-400 transition-colors mb-1">
                  Comparador de Operativos
                </h3>
                <p className="font-inter text-xs text-gray-400 leading-relaxed mb-3">
                  Compara dos operativos para contrastar atributos y armas exclusivas.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-purple-400 pt-2 border-t border-white/[0.04]">
                <span>Abrir</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tool 5: Tier List */}
            <Link
              to="/tier-list"
              onClick={playClick}
              onMouseEnter={playHover}
              className="group relative rounded-xl bg-[#08080a] hover:bg-[#120808] border border-white/[0.06] hover:border-red-500/50 transition-all p-5 flex flex-col justify-between overflow-hidden shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-red-500/10 blur-xl pointer-events-none group-hover:bg-red-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neon-red">
                    RANKING
                  </span>
                  <Award size={16} className="text-neon-red" />
                </div>
                <h3 className="font-bebas text-2xl text-white group-hover:text-neon-red transition-colors mb-1">
                  Tier List & Formaciones Meta
                </h3>
                <p className="font-inter text-xs text-gray-400 leading-relaxed mb-3">
                  Equipos 5v5 de vanguardia/retaguardia y tiers de héroes actualizados.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-neon-red pt-2 border-t border-white/[0.04]">
                <span>Ver Ranking</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tool 6: Llaveros */}
            <Link
              to="/llaveros"
              onClick={playClick}
              onMouseEnter={playHover}
              className="group relative rounded-xl bg-[#08080a] hover:bg-[#100c06] border border-white/[0.06] hover:border-amber-500/50 transition-all p-5 flex flex-col justify-between overflow-hidden shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
                    BASE DE DATOS
                  </span>
                  <Key size={16} className="text-amber-400" />
                </div>
                <h3 className="font-bebas text-2xl text-white group-hover:text-amber-400 transition-colors mb-1">
                  Catálogo de 42 Llaveros
                </h3>
                <p className="font-inter text-xs text-gray-400 leading-relaxed mb-3">
                  Efectos pasivos permanentes y sub-estadísticas activas por rareza.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-amber-400 pt-2 border-t border-white/[0.04]">
                <span>Ver Catálogo</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

          </div>
        </section>
      )}

    </div>
  );
}
