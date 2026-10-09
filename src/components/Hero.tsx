import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useSound } from '../contexts/SoundContext';

const Hero = () => {
  const { t, i18n } = useTranslation();
  const { soundEnabled } = useSound();
  const lang = i18n.language?.slice(0, 2).toLowerCase() || 'es';

  return (
    <section className="relative min-h-[85vh] md:h-[80vh] md:min-h-[620px] flex flex-col items-center justify-start md:justify-center overflow-hidden z-10 pt-24 sm:pt-28 md:pt-20 pb-16">
      {/* Background Video & Vignette */}
      <div 
        className="absolute inset-0 z-0 opacity-50"
        style={{ 
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
        }}
      >
        <video 
          autoPlay 
          loop 
          muted={!soundEnabled}
          playsInline 
          className="w-full h-full object-cover object-center"
        >
          <source src="/hero_bg.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 z-0 bg-radial-vignette opacity-80" />
      
      {/* Fade out to the page background color */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-umbrella-black to-transparent z-0 pointer-events-none" />
      
      {/* Static Noise Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        transition={{ staggerChildren: 0.15 }}
        className="relative z-10 text-center flex flex-col items-center px-4 max-w-4xl mx-auto w-full pt-4 md:pt-0"
      >
        {/* Barra de Noticias Destacada / Major Update Banner Pill */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: -15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          className="mb-3"
        >
          <Link
            to="/noticias/sistema-llaveros-exp-v1-10-1"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/20 text-amber-300 font-mono text-[10px] sm:text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-semibold tracking-wide uppercase">
              {lang === 'ja'
                ? '⚡ 最新アップデート v1.10.1: キーリング完全DB＆EXP計算機'
                : lang === 'en'
                ? '⚡ MAJOR UPDATE v1.10.1: Keyrings Database & EXP Calculator'
                : '⚡ NUEVA ACTUALIZACIÓN v1.10.1: Base de Datos de Llaveros & Calc EXP'}
            </span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform text-amber-400" />
          </Link>
        </motion.div>

        <motion.span 
          variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
          className="font-mono text-neon-red text-[11px] sm:text-xs md:text-sm tracking-wider sm:tracking-[0.2em] md:tracking-[0.25em] uppercase mb-4 border border-neon-red/30 bg-black/80 px-3.5 py-1.5 rounded-sm max-w-[92vw] text-center shadow-[0_0_12px_rgba(255,42,42,0.15)] leading-tight"
        >
          {t('hero.tag')}
        </motion.span>
        <motion.h1 
          variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
          className="font-bebas text-5xl sm:text-7xl md:text-8xl tracking-wider sm:tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,42,42,0.2)] mb-2 uppercase leading-none"
        >
          RE: Survival Unit
        </motion.h1>
        <motion.div 
          variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' } } }}
          className="h-[2px] w-full max-w-sm bg-gradient-to-r from-transparent via-blood-red to-transparent mb-6" 
        />
        
        <motion.p 
          variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
          className="font-inter text-gray-300 max-w-2xl text-sm sm:text-base md:text-lg mb-8 md:mb-10 leading-relaxed px-2"
        >
          {t('hero.desc')}
        </motion.p>

        <motion.div 
          variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-xs sm:max-w-none"
        >
          <Link to="/heroes" className="w-full sm:w-auto text-center bg-blood-red hover:bg-neon-red text-white font-bebas text-lg sm:text-xl tracking-widest px-6 sm:px-8 py-2.5 sm:py-3 transition-colors duration-300 shadow-[0_0_15px_rgba(158,0,0,0.4)] animate-pulse-slow">
            {t('hero.btn_heroes', 'Explorar Héroes')}
          </Link>
          <Link to="/tier-list" className="w-full sm:w-auto text-center bg-transparent border border-gray-600 hover:border-white text-white font-bebas text-lg sm:text-xl tracking-widest px-6 sm:px-8 py-2.5 sm:py-3 transition-colors duration-300">
            {t('hero.btn_tierlist')}
          </Link>
          <a href="https://ko-fi.com/eddsempai" target="_blank" rel="noreferrer" className="w-full sm:w-auto text-center bg-transparent border border-neon-red hover:bg-neon-red/10 text-neon-red font-bebas text-lg sm:text-xl tracking-widest px-6 sm:px-8 py-2.5 sm:py-3 transition-colors duration-300 shadow-[0_0_15px_rgba(255,42,42,0.2)]">
            {t('hero.btn_donate')}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
