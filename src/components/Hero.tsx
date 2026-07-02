import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative h-[80vh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden z-10 pt-20">
      {/* Background Image & Vignette */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero_bg.png)' }}
      />
      <div className="absolute inset-0 z-0 bg-radial-vignette" />
      
      {/* Static Noise Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.2 }}
        className="relative z-10 text-center flex flex-col items-center px-4 mt-10"
      >
        <motion.span 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="font-mono text-neon-red text-sm tracking-[0.3em] uppercase mb-4 border border-neon-red/30 bg-black/50 px-4 py-1"
        >
          Archivo Táctico Global
        </motion.span>
        <motion.h1 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="font-bebas text-6xl md:text-8xl tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,42,42,0.2)] mb-2 uppercase"
        >
          RE: Survival Unit
        </motion.h1>
        <motion.div 
          variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}
          className="h-[2px] w-full max-w-sm bg-gradient-to-r from-transparent via-blood-red to-transparent mb-6" 
        />
        
        <motion.p 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="font-inter text-gray-300 max-w-2xl text-base md:text-lg mb-10 leading-relaxed"
        >
          Bienvenido al hub definitivo de guías, estrategias y noticias.
          Domina la gestión de tu refugio, maximiza el poder de tus operativos y sobrevive al asedio biológico.
        </motion.p>

        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="flex gap-4"
        >
          <Link to="/guias" className="bg-blood-red hover:bg-neon-red text-white font-bebas text-xl tracking-widest px-8 py-3 transition-colors duration-300 shadow-[0_0_15px_rgba(158,0,0,0.4)]">
            Guía para Principiantes
          </Link>
          <Link to="/tier-list" className="bg-transparent border border-gray-600 hover:border-white text-white font-bebas text-xl tracking-widest px-8 py-3 transition-colors duration-300">
            Ver Tier List
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
