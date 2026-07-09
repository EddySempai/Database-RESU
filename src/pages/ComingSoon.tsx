import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ComingSoon() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute inset-0 z-0 flex justify-center items-center opacity-20 pointer-events-none">
        <div className="w-[800px] h-[800px] bg-blood-red/10 rounded-full blur-[100px]"></div>
      </div>
      <div className="absolute top-1/2 left-0 w-full h-px bg-blood-red/10"></div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto"
      >
        <div className="w-24 h-24 rounded-full border border-blood-red/30 bg-black/50 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,42,42,0.2)]">
          <Lock className="w-10 h-10 text-blood-red" />
        </div>
        
        <h1 className="font-bebas text-5xl md:text-7xl text-white tracking-widest mb-4 drop-shadow-md">
          {t('common.restricted')} <span className="text-blood-red">{t('common.area')}</span>
        </h1>
        
        <p className="font-mono text-gray-400 mb-12 uppercase tracking-widest text-sm leading-relaxed">
          {t('common.restricted_desc')}
        </p>

        <Link 
          to="/"
          className="group relative px-8 py-4 bg-blood-red hover:bg-neon-red text-white font-bebas text-2xl tracking-[0.2em] transition-all overflow-hidden flex items-center gap-3"
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"></div>
          <ChevronLeft size={24} />
          {t('common.back_home')}
        </Link>
      </motion.div>
      
      {/* Glitch Overlay effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] mix-blend-overlay"></div>
    </div>
  );
}
