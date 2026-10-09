import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Check,
  ArrowUpRight,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNews } from '../hooks/useNews';
import { type SupportedLang } from '../data/newsData';
import { SmartText } from '../components/SmartText';
import { useSound } from '../contexts/SoundContext';

export default function NoticiaDetalle() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const { articles } = useNews();
  const { playHover, playClick } = useSound();
  const [copied, setCopied] = useState(false);

  const morphSrc = useMemo(() => {
    try {
      return sessionStorage.getItem('resu_morph_src') || 'list';
    } catch {
      return 'list';
    }
  }, [id]);

  const lang: SupportedLang = useMemo(() => {
    const code = i18n.language?.slice(0, 2).toLowerCase();
    if (code === 'en' || code === 'ja') return code;
    return 'es';
  }, [i18n.language]);

  const article = useMemo(() => articles.find(a => a.id === id), [articles, id]);
  const relatedArticles = useMemo(
    () => articles.filter(a => a.id !== id).slice(0, 3),
    [articles, id]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    // Route focus to the heading for accessibility without jumping scroll
    const heading = document.getElementById('detail-heading');
    heading?.focus({ preventScroll: true });
  }, [id]);

  const handleCopyLink = () => {
    playClick();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const ui = {
    es: {
      backToNews: 'Volver a noticias',
      notFoundTitle: 'Boletín no encontrado',
      notFoundDesc: 'La publicación solicitada no existe o fue movida.',
      shareBtn: 'Compartir',
      copiedBtn: 'Enlace copiado',
      summaryTitle: 'PUNTOS CLAVE',
      hudStatus: 'SYS.HUD // MONITOREO ACTIVO',
      galleryTitle: 'Imágenes de referencia',
      relatedTitle: 'Publicaciones recientes',
      readArticle: 'Leer'
    },
    en: {
      backToNews: 'Back to news',
      notFoundTitle: 'Issue not found',
      notFoundDesc: 'The requested article does not exist or has been moved.',
      shareBtn: 'Share',
      copiedBtn: 'Link copied',
      summaryTitle: 'KEY TAKEAWAYS',
      hudStatus: 'SYS.HUD // ACTIVE TELEMETRY',
      galleryTitle: 'Reference images',
      relatedTitle: 'Recent publications',
      readArticle: 'Read'
    },
    ja: {
      backToNews: 'ニュース一覧へ',
      notFoundTitle: '記事が見つかりません',
      notFoundDesc: '指定された記事は存在しないか移動されました。',
      shareBtn: '共有',
      copiedBtn: 'コピー完了',
      summaryTitle: '主なポイント',
      hudStatus: 'SYS.HUD // ステータス有効',
      galleryTitle: '参考画像',
      relatedTitle: '最新の記事',
      readArticle: '読む'
    }
  }[lang];

  if (!article) {
    return (
      <div className="pt-36 pb-20 px-4 max-w-3xl mx-auto min-h-screen text-center flex flex-col items-center justify-center">
        <h1 className="font-bebas text-4xl text-white mb-2">{ui.notFoundTitle}</h1>
        <p className="text-neutral-400 font-inter text-sm mb-6">{ui.notFoundDesc}</p>
        <Link
          to="/noticias"
          onClick={playClick}
          className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] text-white font-inter text-xs px-4 py-2.5 rounded-md transition-colors"
        >
          <ArrowLeft size={15} /> {ui.backToNews}
        </Link>
      </div>
    );
  }

  const bgSceneUrl = article.image || '/guias/Event_WorldBoss_Mortem.webp';

  return (
    <div className="min-h-screen relative bg-[#080809] text-white overflow-hidden">
      <Helmet>
        <title>{`${article.title[lang]} | Resident Evil: Survival Unit`}</title>
        <meta name="description" content={article.excerpt[lang]} />
        <link rel="canonical" href={`https://resudb.com/noticias/${article.id}`} />
      </Helmet>

      {/* 1. Atmospheric Game Scene Background + 85% Dark Overlay + Blur(20px) + Animated Downward Tactical Grid + Refined Horizon Vignette */}
      <style>{`
        @keyframes tacticalGridDown {
          0% { background-position: 0px 0px; }
          100% { background-position: 0px 32px; }
        }
      `}</style>
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0">
        {/* Game Scene Image Underneath */}
        <img
          src={bgSceneUrl}
          alt=""
          className="w-full h-full object-cover object-center opacity-30 scale-110"
        />

        {/* 88% Dark Overlay with backdrop-filter: blur(20px) */}
        <div className="absolute inset-0 bg-[#080809]/88 backdrop-blur-[20px]" />

        {/* Animated Downward Tactical Millimeter Grid (#141418 over #080809) */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            animation: 'tacticalGridDown 3s linear infinite',
            maskImage:
              'radial-gradient(ellipse 80% 75% at 50% 35%, rgba(0,0,0,1) 20%, rgba(0,0,0,0.35) 70%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 75% at 50% 35%, rgba(0,0,0,1) 20%, rgba(0,0,0,0.35) 70%, transparent 100%)'
          }}
        />

        {/* Refined Horizon Ambient Gradient + Soft Edge Vignette (No awkward corner blob) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(180, 18, 18, 0.11) 0%, transparent 70%), radial-gradient(circle at 50% 50%, transparent 45%, rgba(4, 4, 5, 0.85) 100%)'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 pt-28 pb-24">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Clean Inline Top Action Row (No full-width black strip cutting the background) */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              to="/noticias"
              onMouseEnter={playHover}
              onClick={playClick}
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-white font-inter text-xs transition-colors"
            >
              <ArrowLeft size={14} className="text-[#ff3333]" />
              <span>{ui.backToNews}</span>
            </Link>

            <button
              onClick={handleCopyLink}
              onMouseEnter={playHover}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-neutral-300 hover:text-white font-inter text-xs transition-colors"
            >
              {copied ? (
                <Check size={13} className="text-emerald-400" />
              ) : (
                <Share2 size={13} className="text-[#ff3333]" />
              )}
              <span>{copied ? ui.copiedBtn : ui.shareBtn}</span>
            </button>
          </div>
          {/* Article Header */}
          <header className="pb-8 border-b border-white/[0.07]">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-neutral-400 mb-4">
              <motion.span
                layoutId={`news-badge-${morphSrc}-${article.id}`}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={`px-2.5 py-0.5 rounded border font-mono text-[10px] uppercase tracking-wider inline-block ${article.badgeColor}`}
              >
                {article.tag[lang]}
              </motion.span>
              <span className="text-neutral-600">·</span>
              <span>{article.date}</span>
              {article.version && (
                <>
                  <span className="text-neutral-600">·</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-200">
                    {article.version}
                  </span>
                </>
              )}
              {article.readTime && (
                <>
                  <span className="text-neutral-600">·</span>
                  <span>{article.readTime}</span>
                </>
              )}
            </div>

            <motion.h1
              id="detail-heading"
              tabIndex={-1}
              layoutId={`news-title-${morphSrc}-${article.id}`}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-bebas text-4xl sm:text-5xl text-white tracking-wide leading-[1.08] mb-4 outline-none w-fit"
            >
              {article.title[lang]}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="font-inter text-base sm:text-lg text-neutral-300 leading-relaxed"
            >
              <SmartText text={article.excerpt[lang]} />
            </motion.p>
          </header>

          {/* Cover Image */}
          {article.image && (
            <motion.figure
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="my-8 rounded-xl overflow-hidden border border-[#26262b] bg-[#0a0a0c]/90 shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
            >
              <img
                src={article.image}
                alt={article.title[lang]}
                className="w-full max-h-[380px] object-cover object-center"
              />
            </motion.figure>
          )}

          {/* Editorial Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="py-6 space-y-10"
          >
            {/* Editorial Intro */}
            {article.intro?.[lang] && (
              <p className="font-inter text-base text-neutral-300 leading-relaxed">
                <SmartText text={article.intro[lang]} />
              </p>
            )}

            {/* "Data HUD" Military Monitoring Panel for Key Takeaways (PUNTOS CLAVE) */}
            {article.highlights[lang] && article.highlights[lang].length > 0 && (
              <div className="relative">
                {/* Volumetric Radial Glow Behind Key Card */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 rounded-3xl pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 50%, rgba(128, 10, 10, 0.14) 0%, transparent 70%)'
                  }}
                />

                <div
                  className="relative bg-[#0c0c0f]/90 backdrop-blur-md border border-[#26262b] p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                  style={{
                    clipPath:
                      'polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
                  }}
                >
                  {/* Angular Tactical Corner Accents */}
                  <span
                    aria-hidden="true"
                    className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff3333] pointer-events-none"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff3333] pointer-events-none"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-neutral-600 pointer-events-none"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-neutral-600 pointer-events-none"
                  />

                  {/* Data HUD Top Status Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#26262b]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ff3333] shadow-[0_0_8px_#ff3333]" />
                      <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-white font-semibold">
                        {ui.summaryTitle}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      <span>{ui.hudStatus}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {article.highlights[lang].map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm sm:text-base text-neutral-200 font-inter leading-relaxed"
                      >
                        <span className="font-mono text-[11px] text-[#ff3333] font-bold mt-1 shrink-0">
                          0{i + 1}
                        </span>
                        <div>
                          <SmartText text={point} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Structured Sections */}
            {article.sections.map((sec, idx) => (
              <section key={idx} className="space-y-4 pt-2">
                <h2 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide">
                  {sec.title[lang]}
                </h2>

                {sec.description?.[lang] && (
                  <p className="font-inter text-sm sm:text-base text-neutral-400 leading-relaxed">
                    <SmartText text={sec.description[lang]} />
                  </p>
                )}

                {sec.image && (
                  <figure className="rounded-lg overflow-hidden border border-[#26262b] bg-[#0a0a0c]/80 my-4">
                    <img
                      src={sec.image}
                      alt={sec.title[lang]}
                      className="w-full max-h-80 object-cover"
                    />
                    {sec.imageCaption?.[lang] && (
                      <figcaption className="px-4 py-2 text-xs text-neutral-400 text-center border-t border-[#26262b]">
                        <SmartText text={sec.imageCaption[lang]} />
                      </figcaption>
                    )}
                  </figure>
                )}

                <ul className="space-y-3 pt-1">
                  {sec.items[lang].map((itemText, j) => {
                    const colonIdx = itemText.indexOf(':');
                    const hasLead = colonIdx > 0 && colonIdx < 48;
                    const lead = hasLead ? itemText.slice(0, colonIdx) : null;
                    const rest = hasLead ? itemText.slice(colonIdx + 1).trim() : itemText;

                    return (
                      <li
                        key={j}
                        className="pl-4 border-l-2 border-[#26262b] hover:border-[#ff3333]/60 transition-colors font-inter text-sm sm:text-base text-neutral-300 leading-relaxed"
                      >
                        {lead ? (
                          <>
                            <strong className="text-white font-medium mr-1.5">
                              <SmartText text={lead} />:
                            </strong>
                            <SmartText text={rest} />
                          </>
                        ) : (
                          <SmartText text={itemText} />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            {/* Custom Visual Editor Blocks */}
            {article.customBlocks && article.customBlocks.length > 0 && (
              <div className="space-y-6 pt-2">
                {article.customBlocks.map(block => {
                  if (block.type === 'heading') {
                    return (
                      <div key={block.id} className="pt-2">
                        <h2 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide">
                          {block.title?.[lang] || block.title?.es}
                        </h2>
                        {(block.content?.[lang] || block.content?.es) && (
                          <p className="font-inter text-sm sm:text-base text-neutral-400 mt-1">
                            <SmartText text={block.content?.[lang] || block.content?.es || ''} />
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={block.id}
                        className="font-inter text-base text-neutral-300 leading-relaxed whitespace-pre-line"
                      >
                        <SmartText text={block.content?.[lang] || block.content?.es || ''} />
                      </p>
                    );
                  }

                  if (block.type === 'image' && block.imageUrl) {
                    return (
                      <figure
                        key={block.id}
                        className="rounded-xl overflow-hidden border border-[#26262b] bg-[#0a0a0c]/80 my-4"
                      >
                        <img
                          src={block.imageUrl}
                          alt={block.caption?.[lang] || block.caption?.es || ''}
                          className="w-full max-h-[420px] object-contain mx-auto"
                        />
                        {(block.caption?.[lang] || block.caption?.es) && (
                          <figcaption className="px-4 py-2.5 border-t border-[#26262b] text-xs text-neutral-400 text-center">
                            <SmartText text={block.caption?.[lang] || block.caption?.es || ''} />
                          </figcaption>
                        )}
                      </figure>
                    );
                  }

                  if (block.type === 'callout') {
                    const isWarn = block.calloutStyle === 'warning';
                    return (
                      <div
                        key={block.id}
                        className={`rounded-lg p-4 border flex items-start gap-3 ${
                          isWarn
                            ? 'bg-amber-950/15 border-amber-500/30 text-amber-200'
                            : 'bg-[#0c0c0f]/90 border-[#26262b] text-neutral-200'
                        }`}
                      >
                        {isWarn ? (
                          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <Info size={18} className="text-[#ff3333] shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1 font-inter text-sm leading-relaxed">
                          {(block.title?.[lang] || block.title?.es) && (
                            <div className="font-medium text-white">
                              {block.title?.[lang] || block.title?.es}
                            </div>
                          )}
                          <div>
                            <SmartText text={block.content?.[lang] || block.content?.es || ''} />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (block.type === 'list') {
                    const listItems = block.items?.[lang] || block.items?.es || [];
                    return (
                      <div key={block.id} className="space-y-2.5">
                        {(block.title?.[lang] || block.title?.es) && (
                          <h3 className="font-bebas text-2xl text-white tracking-wide">
                            {block.title?.[lang] || block.title?.es}
                          </h3>
                        )}
                        <ul className="space-y-2">
                          {listItems.map((li, k) => (
                            <li
                              key={k}
                              className="pl-4 border-l-2 border-[#26262b] text-sm sm:text-base text-neutral-300 font-inter"
                            >
                              <SmartText text={li} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* Gallery */}
            {article.gallery && article.gallery.length > 0 && (
              <section className="pt-4">
                <h2 className="font-bebas text-2xl text-white tracking-wide mb-4">
                  {ui.galleryTitle}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {article.gallery.map((g, i) => (
                    <figure
                      key={i}
                      className="bg-[#0c0c0f]/80 border border-[#26262b] rounded-lg p-4 flex flex-col items-center text-center justify-between"
                    >
                      <img
                        src={g.src}
                        alt={g.caption[lang]}
                        className="h-36 object-contain mb-3"
                      />
                      <figcaption className="font-inter text-xs text-neutral-400 leading-snug">
                        <SmartText text={g.caption[lang]} />
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {/* Minimal Action Link */}
            {article.actionLink && (
              <div className="pt-4 border-t border-white/[0.07] flex items-center justify-between gap-4">
                <Link
                  to={article.actionLink.href}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className="inline-flex items-center gap-2 text-sm font-inter font-medium text-[#ff3333] hover:text-white transition-colors"
                >
                  <span>{article.actionLink.label[lang]}</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/[0.07]">
              <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">
                {ui.relatedTitle}
              </h3>
              <div className="divide-y divide-white/[0.06]">
                {relatedArticles.map(rel => (
                  <Link
                    key={rel.id}
                    to={`/noticias/${rel.id}`}
                    onMouseEnter={playHover}
                    onClick={playClick}
                    className="group py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-neutral-500 mb-0.5">
                        {rel.date} {rel.version ? `· ${rel.version}` : ''}
                      </div>
                      <h4 className="font-inter text-sm font-medium text-neutral-200 group-hover:text-white truncate transition-colors">
                        {rel.title[lang]}
                      </h4>
                    </div>
                    <span className="text-xs font-inter text-neutral-500 group-hover:text-[#ff3333] inline-flex items-center gap-1 shrink-0 transition-colors">
                      {ui.readArticle}
                      <ArrowUpRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
