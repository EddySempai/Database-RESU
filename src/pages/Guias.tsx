import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Shield, Cpu, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Guias() {
  const { t } = useTranslation();

  const GUIDES = [
    {
      id: 1,
      title: t('guides.g1_title'),
      description: t('guides.g1_desc'),
      icon: <BookOpen className="text-white" size={24} />,
      image: "/guias/beginner.jpg",
      color: "from-blue-900/80 to-black",
      span: "md:col-span-2 md:row-span-2"
    },
    {
      id: 2,
      title: t('guides.g2_title'),
      description: t('guides.g2_desc'),
      icon: <Target className="text-white" size={24} />,
      image: "/guias/artifacts.jpg",
      color: "from-purple-900/80 to-black",
      span: "md:col-span-1 md:row-span-1"
    },
    {
      id: 3,
      title: t('guides.g3_title'),
      description: t('guides.g3_desc'),
      icon: <Shield className="text-white" size={24} />,
      image: "/guias/pvp.jpg",
      color: "from-red-900/80 to-black",
      span: "md:col-span-1 md:row-span-2"
    },
    {
      id: 4,
      title: t('guides.g4_title'),
      description: t('guides.g4_desc'),
      icon: <Cpu className="text-white" size={24} />,
      image: "/guias/farm.jpg",
      color: "from-green-900/80 to-black",
      span: "md:col-span-2 md:row-span-1"
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen relative z-10">
      
      {/* Header */}
      <div className="mb-12 border-b border-gray-800 pb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <BookOpen className="text-neon-red" size={32} />
          <span className="font-mono text-neon-red text-sm md:text-base tracking-[0.3em] uppercase">{t('guides.intel_files')}</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bebas text-5xl md:text-7xl text-white tracking-widest drop-shadow-md"
        >
          {t('guides.title')}
        </motion.h1>
      </div>

      {/* Masonry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[250px] gap-6">
        {GUIDES.map((guide, index) => (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, zIndex: 20 }}
            className={`relative rounded-2xl overflow-hidden group cursor-pointer border border-gray-800/60 shadow-2xl ${guide.span}`}
          >
            {/* Background Image (Mockup until real images) */}
            <div className="absolute inset-0 bg-gray-900 overflow-hidden">
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500 scale-105 group-hover:scale-110 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')` }} />
            </div>
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${guide.color} opacity-90 group-hover:opacity-80 transition-opacity`} />
            
            {/* Content */}
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
              <div className="bg-black/50 p-3 rounded-full w-fit mb-4 border border-white/10 backdrop-blur-md">
                {guide.icon}
              </div>
              <h3 className="font-bebas text-3xl md:text-4xl text-white tracking-wide mb-2 group-hover:text-neon-red transition-colors">
                {guide.title}
              </h3>
              <p className="font-inter text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3">
                {guide.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
