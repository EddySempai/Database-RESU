import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative h-[80vh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden z-10 pt-20">
      {/* Background Image & Vignette */}
      <div 
        className="absolute inset-0 z-0 opacity-50 bg-cover bg-top bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/hero_bg.webp)',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
        }}
      />
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
        transition={{ staggerChildren: 0.2 }}
        className="relative z-10 text-center flex flex-col items-center px-4 mt-10"
      >
        <motion.span 
          variants={{ hidden: { opacity: 0, y: 50, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
          className="font-mono text-neon-red text-sm tracking-[0.3em] uppercase mb-4 border border-neon-red/30 bg-black/50 px-4 py-1"
        >
          {t('hero.tag')}
        </motion.span>
        <motion.h1 
          variants={{ hidden: { opacity: 0, y: 50, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
          className="font-bebas text-6xl md:text-8xl tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,42,42,0.2)] mb-2 uppercase"
        >
          RE: Survival Unit
        </motion.h1>
        <motion.div 
          variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' } } }}
          className="h-[2px] w-full max-w-sm bg-gradient-to-r from-transparent via-blood-red to-transparent mb-6" 
        />
        
        <motion.p 
          variants={{ hidden: { opacity: 0, y: 50, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
          className="font-inter text-gray-300 max-w-2xl text-base md:text-lg mb-10 leading-relaxed"
        >
          {t('hero.desc')}
        </motion.p>

        <motion.div 
          variants={{ hidden: { opacity: 0, y: 50, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/guias" className="bg-blood-red hover:bg-neon-red text-white font-bebas text-xl tracking-widest px-8 py-3 transition-colors duration-300 shadow-[0_0_15px_rgba(158,0,0,0.4)] animate-pulse-slow">
            {t('hero.btn_guides')}
          </Link>
          <Link to="/tier-list" className="bg-transparent border border-gray-600 hover:border-white text-white font-bebas text-xl tracking-widest px-8 py-3 transition-colors duration-300">
            {t('hero.btn_tierlist')}
          </Link>
          <a href="https://ko-fi.com/eddsempai" target="_blank" rel="noreferrer" className="bg-transparent border border-neon-red hover:bg-neon-red/10 text-neon-red font-bebas text-xl tracking-widest px-8 py-3 transition-colors duration-300 shadow-[0_0_15px_rgba(255,42,42,0.2)]">
            {t('hero.btn_donate')}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
