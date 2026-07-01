import { motion } from 'framer-motion';
import { ShieldAlert, BatteryCharging, Users } from 'lucide-react';

const cards = [
  {
    title: "Defensa de Refugio",
    icon: <ShieldAlert size={32} className="text-neon-red mb-4" />,
    desc: "Fortalece las murallas e instala sistemas automatizados. Las hordas atacan al anochecer. Prioriza el blindaje perimetral.",
  },
  {
    title: "Gestión de Recursos",
    icon: <BatteryCharging size={32} className="text-neon-red mb-4" />,
    desc: "Raciona suministros. Optimiza la producción de alimentos y energía. Sin recursos, la base colapsará en horas.",
  },
  {
    title: "Sinergia de Escuadrones",
    icon: <Users size={32} className="text-neon-red mb-4" />,
    desc: "Combina operativos según sus habilidades tácticas. El francotirador cubre la retaguardia mientras asalto despeja el frente.",
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as any, stiffness: 100, damping: 12 }
  }
};

const SurvivalManual = () => {
  return (
    <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-blood-red/30 bg-black/60 backdrop-blur-sm">
      <div className="text-center mb-16">
        <h3 className="font-mono text-neon-red text-sm tracking-widest uppercase mb-2">Archivo Umbrela // 001</h3>
        <h2 className="font-bebas text-5xl md:text-6xl tracking-wider text-white">Manual de Supervivencia</h2>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {cards.map((card, idx) => (
          <motion.div 
            key={idx}
            variants={cardVariants}
            className="group relative bg-[#0a0a0a] border border-gray-800 p-8 flex flex-col hover:border-blood-red transition-colors duration-500"
          >
            {/* Left Border Accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-blood-red transform origin-top scale-y-100 group-hover:bg-neon-red transition-colors duration-300" />
            
            {/* Inner Content */}
            <div className="relative z-10">
              {card.icon}
              <h4 className="font-mono font-bold text-xl text-white mb-3 uppercase tracking-wide">{card.title}</h4>
              <p className="font-inter text-gray-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
            
            {/* Background Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blood-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default SurvivalManual;
