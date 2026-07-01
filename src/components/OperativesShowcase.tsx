import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const topCharacters = [
  { id: 'leon', name: 'Leon S. Kennedy', img: 'character-LeonSKennedy-visual.png', role: 'Asalto / Liderazgo' },
  { id: 'claire', name: 'Claire Redfield', img: 'character-ClaireRedfield-visual.png', role: 'Soporte Táctico' },
  { id: 'jill', name: 'Jill Valentine', img: 'character-JillValentine-visual.png', role: 'Especialista Táctica' },
  { id: 'chris', name: 'Chris Redfield', img: 'character-ChrisRedfield-visual.png', role: 'Comandante BSAA' },
  { id: 'ada', name: 'Ada Wong', img: 'character-AdaWong-visual.png', role: 'Espía / Infiltración' },
  { id: 'carlos', name: 'Carlos Oliveira', img: 'character-CarlosOliveira-visual.png', role: 'Combate Pesado' },
];

const OperativesShowcase = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);
  const navigate = useNavigate();

  return (
    <section className="relative py-24 z-10 bg-[#050505] border-t border-gray-900">
      <div className="max-w-[1400px] mx-auto px-6">
        
        <div className="mb-12 text-center">
          <h3 className="font-mono text-neon-red text-sm tracking-widest uppercase mb-2">Base de Datos Táctica</h3>
          <h2 className="font-bebas text-5xl md:text-6xl tracking-wider text-white">Vanguardia Operativa</h2>
        </div>

        <div className="flex flex-col md:flex-row h-[600px] gap-2 w-full">
          {topCharacters.map((char, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <motion.div
                key={char.id}
                onMouseEnter={() => setHoveredIndex(index)}
                className={`relative h-full overflow-hidden cursor-pointer border border-gray-800 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
                  isHovered ? 'md:flex-[4] border-blood-red' : 'md:flex-[1]'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                
                <img 
                  src={`/src/assets/operativos/${char.img}`} 
                  alt={char.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    isHovered ? 'scale-105 grayscale-0 object-top' : 'scale-100 grayscale object-top'
                  }`}
                />

                {/* Vertical Text for non-hovered state (hidden on mobile) */}
                <div className={`hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
                  <span className="font-bebas text-3xl text-gray-400 tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                    {char.name}
                  </span>
                </div>

                {/* Full Info for hovered state */}
                <div className={`absolute bottom-0 left-0 w-full p-6 md:p-8 z-30 flex flex-col justify-end transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  <motion.div
                    initial={false}
                    animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="font-bebas text-4xl md:text-5xl text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,42,42,0.5)]">
                      {char.name}
                    </h3>
                    <p className="font-mono text-neon-red text-sm uppercase tracking-widest mb-4">
                      {char.role}
                    </p>
                    
                    <div className="hidden md:block">
                      <button 
                        onClick={() => navigate('/operativos')}
                        className="bg-blood-red/20 border border-blood-red text-white font-mono text-xs px-6 py-2 uppercase tracking-widest hover:bg-blood-red transition-colors backdrop-blur-sm"
                      >
                        Desplegar Expediente
                      </button>
                    </div>
                  </motion.div>
                </div>

              </motion.div>
            );
          })}
        </div>
        
        {/* View All Button */}
        <div className="mt-12 text-center relative z-20">
          <Link 
            to="/operativos"
            className="inline-block border border-gray-600 text-gray-300 font-mono text-sm px-8 py-3 uppercase tracking-widest hover:border-blood-red hover:text-white hover:bg-blood-red/10 transition-all duration-300"
          >
            Ver Todos Los Operativos
          </Link>
        </div>

      </div>
    </section>
  );
};

export default OperativesShowcase;
