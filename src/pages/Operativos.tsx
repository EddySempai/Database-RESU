import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import operativosData from '../data/operativos.json';

const Operativos = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOperativos = operativosData.filter(op => 
    op.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen relative z-10">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="font-bebas text-5xl md:text-6xl text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,42,42,0.5)] flex items-center gap-4">
            <Users className="text-neon-red" size={48} />
            Base de Datos: Operativos
          </h1>
          <p className="font-mono text-gray-500 text-sm mt-2 uppercase tracking-widest">
            {operativosData.length} Operativos Registrados
          </p>
        </div>
        
        <input 
          type="text" 
          placeholder="Buscar operativo..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-black/50 border border-gray-700 text-white font-mono p-3 outline-none focus:border-blood-red transition-colors w-full md:w-64"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      >
        {filteredOperativos.map((op: any, idx) => {
          const localImage = `/operativos/${op.imageUrl.split('/').pop()}`;
          return (
            <motion.div 
              key={op.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-gradient-to-t from-[#0a0a0a] to-[#111] border border-gray-800 group relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-blood-red/0 group-hover:bg-blood-red/10 transition-colors z-0" />
              
              <div className="aspect-[3/4] relative z-10 p-2">
                <img 
                  src={localImage} 
                  alt={op.name} 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_15px_rgba(255,42,42,0.4)] transition-all"
                  loading="lazy"
                />

                {/* Stats overlay */}
                {op.stats && (
                  <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 z-20 backdrop-blur-sm">
                    <h4 className="font-mono text-neon-red text-[10px] md:text-xs uppercase tracking-widest mb-4 border-b border-neon-red/30 pb-2 w-full text-center">
                      Estadísticas (Nv. 80)
                    </h4>
                    <div className="w-full space-y-3 font-bebas text-lg md:text-xl tracking-wider text-gray-400">
                      <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span>Salud</span>
                        <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{op.stats.health.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span>Ataque</span>
                        <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{op.stats.attack.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-1">
                        <span>Defensa</span>
                        <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{op.stats.defense.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-gray-800 bg-black/80 relative z-10 backdrop-blur-sm">
                <h3 className="font-bebas text-xl text-white tracking-wider text-center truncate relative z-30">
                  {op.name}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {filteredOperativos.length === 0 && (
        <div className="text-center py-20">
          <p className="font-mono text-gray-500 uppercase tracking-widest text-xl">
            No se encontraron operativos
          </p>
        </div>
      )}
    </div>
  );
};

export default Operativos;
