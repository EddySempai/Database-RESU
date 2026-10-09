import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronRight, Radio } from 'lucide-react';
import { type SupportedLang } from '../data/newsData';
import { useNews } from '../hooks/useNews';
import { useSound } from '../contexts/SoundContext';

const NewsSection = () => {
  const { t, i18n } = useTranslation();
  const { playHover, playClick } = useSound();
  const { articles } = useNews();

  const lang: SupportedLang = useMemo(() => {
    const code = i18n.language?.slice(0, 2).toLowerCase();
    if (code === 'en' || code === 'ja') return code;
    return 'es';
  }, [i18n.language]);

  const latestNews = useMemo(() => articles.slice(0, 3), [articles]);

  const readLabel = {
    es: 'Leer informe',
    en: 'Read report',
    ja: '詳細を読む'
  }[lang];

  return (
    <section className="relative z-10 py-16 px-6 md:px-12 max-w-7xl mx-auto bg-black/40">
      <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Radio className="text-neon-red animate-pulse hidden sm:block" size={24} />
          <h2 className="font-bebas text-4xl text-white tracking-widest">{t('home.news_title')}</h2>
        </div>
        <Link
          to="/noticias"
          onMouseEnter={playHover}
          onClick={playClick}
          className="font-mono text-sm text-blood-red hover:text-neon-red transition-colors uppercase tracking-widest"
        >
          {t('home.view_all')}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {latestNews.map((item, idx) => (
          <Link
            key={item.id}
            to={`/noticias/${item.id}`}
            onMouseEnter={playHover}
            onClick={playClick}
            className="block group"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: idx * 0.1 }}
              className="h-full flex flex-col justify-between bg-[#0a0a0a] border border-gray-900 border-l-2 border-l-gray-800 group-hover:border-gray-800 group-hover:border-l-blood-red p-6 transition-all duration-300 group-hover:-translate-y-1 shadow-md group-hover:shadow-[0_8px_25px_rgba(220,38,38,0.12)]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-3">
                  <span className="font-mono text-xs text-gray-500">{item.date}</span>
                  <span
                    className={`px-2 py-0.5 border font-mono text-[10px] uppercase tracking-wider ${item.badgeColor}`}
                  >
                    {item.tag[lang]}
                  </span>
                  {item.version && (
                    <span className="px-1.5 py-0.5 bg-white/10 text-white font-mono text-[10px] font-bold rounded-sm">
                      {item.version}
                    </span>
                  )}
                </div>
                <h3 className="font-bebas text-xl text-white group-hover:text-neon-red tracking-wide mb-3 leading-tight transition-colors">
                  {item.title[lang]}
                </h3>
                <p className="font-inter text-sm text-gray-400 line-clamp-3 mb-4">
                  {item.excerpt[lang]}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-900/80 flex items-center justify-between font-mono text-[11px] text-gray-500 group-hover:text-white uppercase tracking-widest transition-colors">
                <span>{readLabel}</span>
                <ChevronRight
                  size={14}
                  className="text-neon-red transform group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;
