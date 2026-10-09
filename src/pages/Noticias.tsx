import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { type SupportedLang } from '../data/newsData';
import { useNews } from '../hooks/useNews';
import { useSound } from '../contexts/SoundContext';

export default function Noticias() {
  const { i18n } = useTranslation();
  const { playHover, playClick } = useSound();
  const { articles } = useNews();

  const lang: SupportedLang = useMemo(() => {
    const code = i18n.language?.slice(0, 2).toLowerCase();
    if (code === 'en' || code === 'ja') return code;
    return 'es';
  }, [i18n.language]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const uiText = {
    es: {
      eyebrow: 'ARCHIVO EDITORIAL',
      title: 'Noticias y Notas de Parche',
      desc: 'Actualizaciones del juego, cambios en el meta y mejoras de la base de datos en un formato de lectura limpio.',
      searchPlaceholder: 'Buscar por versión o tema...',
      catAll: 'Todos',
      catPatch: 'Parches',
      catMeta: 'Meta',
      catTools: 'Herramientas',
      catGuides: 'Guías',
      latestLabel: 'ÚLTIMAS NOTICIAS',
      readTimeSuffix: 'de lectura',
      readMore: 'Leer boletín',
      noResults: 'No se encontraron publicaciones para esta búsqueda.',
      resetFilters: 'Ver todas las publicaciones'
    },
    en: {
      eyebrow: 'EDITORIAL ARCHIVE',
      title: 'News & Patch Notes',
      desc: 'Game updates, meta shifts, and database improvements in a clean, distraction-free reading format.',
      searchPlaceholder: 'Search version or topic...',
      catAll: 'All',
      catPatch: 'Patches',
      catMeta: 'Meta',
      catTools: 'Tools',
      catGuides: 'Guides',
      latestLabel: 'LATEST DISPATCHES',
      readTimeSuffix: 'read',
      readMore: 'Read issue',
      noResults: 'No publications matched your search.',
      resetFilters: 'View all publications'
    },
    ja: {
      eyebrow: 'アーカイブ',
      title: 'ニュース＆パッチノート',
      desc: 'ゲームのアップデート情報やメタの変動、データベースの更新履歴をシンプルにまとめています。',
      searchPlaceholder: 'バージョンやキーワードで検索...',
      catAll: 'すべて',
      catPatch: 'パッチ',
      catMeta: 'メタ',
      catTools: 'ツール',
      catGuides: 'ガイド',
      latestLabel: '最新ニュース',
      readTimeSuffix: 'で読めます',
      readMore: '記事を読む',
      noResults: '該当する記事が見つかりませんでした。',
      resetFilters: 'すべて表示'
    }
  }[lang];

  const categories = [
    { id: 'all', label: uiText.catAll },
    { id: 'patch', label: uiText.catPatch },
    { id: 'meta', label: uiText.catMeta },
    { id: 'tools', label: uiText.catTools },
    { id: 'guides', label: uiText.catGuides }
  ];

  // Top carousel slides (up to 4 most recent articles, prioritizing featured first)
  const carouselArticles = useMemo(() => {
    const sorted = [...articles].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    return sorted.slice(0, Math.min(4, sorted.length));
  }, [articles]);

  // Automatic carousel timer (every 5.5s when not hovered)
  useEffect(() => {
    if (carouselArticles.length <= 1 || isCarouselHovered) return;
    const timer = setInterval(() => {
      setActiveSlideIdx(prev => (prev + 1) % carouselArticles.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [carouselArticles.length, isCarouselHovered]);

  const currentSlide = carouselArticles[activeSlideIdx] || carouselArticles[0];

  const filteredNews = useMemo(() => {
    return articles.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title[lang].toLowerCase().includes(q);
        const matchExcerpt = item.excerpt[lang].toLowerCase().includes(q);
        const matchVersion = item.version?.toLowerCase().includes(q);
        return matchTitle || matchExcerpt || matchVersion;
      }
      return true;
    });
  }, [articles, selectedCategory, searchQuery, lang]);

  const showCarousel =
    selectedCategory === 'all' && searchQuery.trim() === '' && carouselArticles.length > 0;

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 max-w-4xl mx-auto min-h-screen relative z-10 w-full">
      <Helmet>
        <title>Noticias y Notas de Parche | Resident Evil: Survival Unit Wiki</title>
        <meta
          name="description"
          content="Boletines y notas de parche de Resident Evil: Survival Unit en formato minimalista de lectura rápida."
        />
        <link rel="canonical" href="https://resudb.com/noticias" />
      </Helmet>

      {/* Minimalist Editorial Header */}
      <header className="mb-8 pb-6 border-b border-white/[0.08]">
        <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-[0.2em] mb-2">
          {uiText.eyebrow}
        </p>
        <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide leading-none mb-2.5">
          {uiText.title}
        </h1>
        <p className="text-neutral-400 font-inter text-sm sm:text-base max-w-xl leading-relaxed">
          {uiText.desc}
        </p>
      </header>

      {/* Automatic Hero Carousel of Latest News */}
      {showCarousel && currentSlide && (
        <div
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
          className="relative rounded-2xl border border-white/[0.1] bg-[#09090c] overflow-hidden mb-10 transition-colors hover:border-white/[0.18]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative"
            >
              {/* Seamless Faded Background Image on the Right (No Box Frame) */}
              {currentSlide.image && (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 w-full md:w-3/5 pointer-events-none select-none overflow-hidden"
                >
                  <img
                    src={currentSlide.image}
                    alt=""
                    className="w-full h-full object-cover object-center opacity-35 sm:opacity-45 scale-105"
                    style={{
                      maskImage:
                        'linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.45) 50%, transparent 95%)',
                      WebkitMaskImage:
                        'linear-gradient(to left, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.45) 50%, transparent 95%)'
                    }}
                  />
                </div>
              )}

              <Link
                to={`/noticias/${currentSlide.id}`}
                onClick={() => {
                  sessionStorage.setItem('resu_morph_src', 'carousel');
                  playClick();
                }}
                onMouseEnter={playHover}
                className="relative z-10 block p-6 sm:p-8 md:p-9 group"
              >
                <div className="max-w-2xl space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                    <span className="text-blood-red font-semibold uppercase tracking-wider">
                      {uiText.latestLabel}
                    </span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-neutral-400">{currentSlide.date}</span>
                    {currentSlide.version && (
                      <>
                        <span className="text-neutral-600">·</span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.07] text-neutral-200 text-[11px]">
                          {currentSlide.version}
                        </span>
                      </>
                    )}
                    <motion.span
                      layoutId={`news-badge-carousel-${currentSlide.id}`}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className={`px-2.5 py-0.5 rounded border font-mono text-[10px] uppercase tracking-wider inline-block ${currentSlide.badgeColor}`}
                    >
                      {currentSlide.tag[lang]}
                    </motion.span>
                  </div>

                  <motion.h2
                    layoutId={`news-title-carousel-${currentSlide.id}`}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="font-bebas text-3xl sm:text-4xl md:text-[42px] text-white tracking-wide leading-[1.06] group-hover:text-neutral-200 transition-colors w-fit"
                  >
                    {currentSlide.title[lang]}
                  </motion.h2>

                  <p className="text-neutral-300/90 font-inter text-sm sm:text-base leading-relaxed line-clamp-2 max-w-xl">
                    {currentSlide.excerpt[lang]}
                  </p>

                  <div className="pt-1 inline-flex items-center gap-1.5 text-xs font-inter font-medium text-white group-hover:text-blood-red transition-colors">
                    <span>{uiText.readMore}</span>
                    <ArrowUpRight
                      size={14}
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Minimal Carousel Controls Bar */}
          {carouselArticles.length > 1 && (
            <div className="relative z-10 px-6 sm:px-8 pb-4 pt-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {carouselArticles.map((slide, idx) => {
                  const isCurrent = idx === activeSlideIdx;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => {
                        playClick();
                        setActiveSlideIdx(idx);
                      }}
                      aria-label={`Ir a noticia ${idx + 1}`}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? 'w-7 bg-blood-red'
                          : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    playClick();
                    setActiveSlideIdx(
                      prev => (prev - 1 + carouselArticles.length) % carouselArticles.length
                    );
                  }}
                  aria-label="Anterior"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setActiveSlideIdx(prev => (prev + 1) % carouselArticles.length);
                  }}
                  aria-label="Siguiente"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Minimal Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onMouseEnter={playHover}
                onClick={() => {
                  playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-md font-inter text-xs transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white text-black font-medium'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-60">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={uiText.searchPlaceholder}
            className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-white/25 rounded-md pl-8 pr-8 py-1.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors font-inter"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* News List — Colored Category Badges + Left-Side Faded Background Image */}
      {filteredNews.length === 0 ? (
        <div className="py-16 text-center border border-white/[0.06] rounded-xl bg-white/[0.01]">
          <p className="text-neutral-400 font-inter text-sm mb-4">{uiText.noResults}</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-md bg-white/[0.07] hover:bg-white/[0.12] text-white font-inter text-xs transition-colors"
          >
            {uiText.resetFilters}
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNews.map(item => (
            <Link
              key={item.id}
              to={`/noticias/${item.id}`}
              onMouseEnter={playHover}
              onClick={() => {
                sessionStorage.setItem('resu_morph_src', 'list');
                playClick();
              }}
              className="group relative block rounded-xl border border-white/[0.08] hover:border-white/[0.18] bg-[#09090c] overflow-hidden p-5 sm:p-6 transition-all"
            >
              {/* Left-Side Faded Background Image (Fades transparently into text, no box) */}
              {item.image && (
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-3/4 sm:w-1/2 pointer-events-none select-none overflow-hidden"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover object-center opacity-25 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                    style={{
                      maskImage:
                        'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, transparent 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, transparent 100%)'
                    }}
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    {/* Colored Category Tag */}
                    <motion.span
                      layoutId={`news-badge-list-${item.id}`}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className={`px-2.5 py-0.5 rounded border font-mono text-[10px] uppercase tracking-wider inline-block ${item.badgeColor}`}
                    >
                      {item.tag[lang]}
                    </motion.span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-neutral-400">{item.date}</span>
                    {item.version && (
                      <>
                        <span className="text-neutral-600">·</span>
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-200 text-[11px]">
                          {item.version}
                        </span>
                      </>
                    )}
                    {item.readTime && (
                      <>
                        <span className="text-neutral-600">·</span>
                        <span className="text-neutral-500">
                          {item.readTime} {uiText.readTimeSuffix}
                        </span>
                      </>
                    )}
                  </div>

                  <motion.h3
                    layoutId={`news-title-list-${item.id}`}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="font-bebas text-2xl sm:text-[26px] text-white tracking-wide leading-snug group-hover:text-blood-red transition-colors w-fit"
                  >
                    {item.title[lang]}
                  </motion.h3>

                  <p className="font-inter text-sm text-neutral-300/85 leading-relaxed line-clamp-2">
                    {item.excerpt[lang]}
                  </p>
                </div>

                <div className="flex items-center shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-inter text-neutral-400 group-hover:text-white transition-colors">
                    <span>{uiText.readMore}</span>
                    <ArrowUpRight
                      size={15}
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
