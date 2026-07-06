import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickLinks = () => {
  const features = [
    {
      title: "Compara Héroes",
      desc: "Simulación de combate táctico. Compara dos héroes de la misma clase con ayuda de la IA.",
      image: "bg-gradient-to-br from-[#1a0000] to-black border-blood-red/50",
      label: "IA Integrada",
      href: "/comparador"
    },
    {
      title: "Calcula Tus Puntos",
      desc: "Lector de inventario automático. Optimiza tu entrenamiento de tropas para eventos como SvS.",
      image: "bg-gradient-to-br from-gray-900 to-[#1a0000]",
      label: "Herramienta",
      href: "/herramientas"
    },
    {
      title: "Tier List de Héroes",
      desc: "Descubre quiénes son los mejores personajes para el meta actual.",
      image: "bg-gradient-to-br from-gray-800 to-black",
      label: "Análisis",
      href: "/tier-list"
    },
    {
      title: "Base de Datos de Héroes",
      desc: "Expedientes completos, habilidades, y estadísticas de todos los operativos de combate.",
      image: "bg-gradient-to-br from-gray-800 to-black",
      label: "Database",
      href: "/heroes"
    }
  ];

  return (
    <section className="relative z-10 py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-10 border-b border-gray-800 pb-4">
        <ShieldCheck className="text-neon-red" size={32} />
        <h2 className="font-bebas text-4xl text-white tracking-widest">Base de Datos Principal</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, idx) => (
          <Link to={item.href} key={idx}>
            <motion.div 
              whileHover={{ y: -5 }}
              className={`relative group overflow-hidden border border-gray-800 ${item.image} p-6 flex flex-col h-64 cursor-pointer hover:border-blood-red transition-all duration-300`}
            >
              {/* Background Hover Effect */}
              <div className="absolute inset-0 bg-blood-red/0 group-hover:bg-blood-red/10 transition-colors duration-500" />
              
              <div className="relative z-10 flex-1">
                <span className="inline-block px-2 py-1 mb-4 border border-neon-red/50 text-neon-red font-mono text-[10px] uppercase tracking-widest">
                  {item.label}
                </span>
                <h3 className="font-bebas text-2xl text-white tracking-wide mb-2 group-hover:text-neon-red transition-colors">{item.title}</h3>
                <p className="font-inter text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              
              <div className="relative z-10 mt-auto font-mono text-xs text-gray-500 group-hover:text-white flex items-center justify-between transition-colors">
                <span>Acceder</span>
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickLinks;
