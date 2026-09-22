import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import llaverosData from '../data/llaveros.json';

interface Keyring {
  id: string;
  name: string;
  icon: string;
  mainStat: string;
  type: string;
}

const Llaveros = () => {
  const llaveros: Keyring[] = llaverosData;
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Todos');

  const types = ['Todos', ...Array.from(new Set(llaveros.map(l => l.type)))];

  const filtered = llaveros.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.mainStat.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'Todos' || l.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen w-full overflow-x-hidden">
      <Helmet>
        <title>Catálogo de 42 Llaveros y Efectos Pasivos | Resident Evil: Survival Unit Wiki</title>
        <meta name="description" content="Catálogo completo de los 42 llaveros de Resident Evil: Survival Unit. Descubre los efectos pasivos permanentes de inventario y las sub-estadísticas equipadas en las 3 ranuras." />
        <link rel="canonical" href="https://resudb.com/llaveros" />
        <meta property="og:title" content="Catálogo de Llaveros (KeyRings) | Resident Evil: Survival Unit Wiki" />
        <meta property="og:description" content="Efectos pasivos y ranuras de los 42 llaveros de Resident Evil: Survival Unit." />
        <meta property="og:url" content="https://resudb.com/llaveros" />
        <meta property="og:image" content="https://resudb.com/metadata-img.png" />
      </Helmet>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-12 text-center"
      >
        <div className="inline-flex items-center justify-center p-3 bg-blood-red/10 border border-blood-red/30 rounded-full mb-4">
          <Key className="text-neon-red" size={32} />
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bebas tracking-wider sm:tracking-widest text-white mb-4 break-words">BASE DE DATOS: LLAVEROS</h1>
        <p className="text-gray-400 max-w-3xl mx-auto font-mono text-xs sm:text-sm mb-6 leading-relaxed px-1">
          Catálogo del equipo "KeyRing". Solo puedes equipar un máximo de 3 llaveros a la vez. El primero se desbloquea al superar el Nivel 1 del modo oleadas (5v5), el segundo al superar el Nivel 200, y el tercero se adquiere mediante un paquete especial de la tienda.
          <br /><br />
          <strong className="text-blood-red">Importante:</strong> Los efectos principales de los llaveros aplican automáticamente sin necesidad de equiparlos, pero no se acumulan si tienes llaveros duplicados del mismo tipo exacto. Las sub-estadísticas sí requieren que el llavero esté equipado para activarse y varían según su nivel.
        </p>
        <Link 
          to="/guias/guia-maestra-llaveros" 
          className="inline-flex items-center justify-center text-center gap-2 px-5 py-2.5 bg-blood-red/20 text-red-400 border border-blood-red/50 hover:bg-blood-red hover:text-white rounded-full transition-all font-bebas text-sm sm:text-base tracking-wider max-w-full"
        >
          LEER GUÍA COMPLETA SOBRE LLAVEROS
        </Link>
      </motion.div>

      {/* Filtros */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#0a0a0a] p-3 sm:p-4 border border-gray-800 rounded-lg w-full max-w-full min-w-0">
        <div className="relative w-full md:w-96 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o estadística..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-gray-700 text-white font-mono text-xs sm:text-sm py-2.5 pl-10 pr-4 rounded focus:outline-none focus:border-blood-red transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto min-w-0">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 font-mono text-xs uppercase border transition-all duration-300 rounded-sm cursor-pointer ${
                filterType === type 
                  ? 'bg-blood-red text-white border-blood-red shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
                  : 'bg-black text-gray-400 border-gray-700 hover:border-gray-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
        {filtered.map((llavero, idx) => (
          <motion.div
            key={llavero.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[#0f0f0f] border border-gray-800 hover:border-blood-red/50 rounded-lg overflow-hidden group transition-all duration-300 relative"
          >
            {/* Type badge */}
            <div className={`absolute top-3 right-3 text-[10px] font-mono px-2 py-1 uppercase rounded-sm z-10 ${
              llavero.type === 'Combate' ? 'bg-red-900/50 text-red-300 border border-red-800/50' :
              llavero.type === 'Defensa' ? 'bg-blue-900/50 text-blue-300 border border-blue-800/50' :
              'bg-emerald-900/50 text-emerald-300 border border-emerald-800/50'
            }`}>
              {llavero.type}
            </div>

            <div className="p-4 sm:p-6 flex flex-col items-center border-b border-gray-800/50 bg-black/40 group-hover:bg-blood-red/5 transition-colors">
              <div className="w-20 h-20 sm:w-24 sm:h-24 relative mb-3 sm:mb-4 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                <img src={llavero.icon} alt={llavero.name} className="max-w-full max-h-full object-contain" />
              </div>
              <h3 className="font-bebas text-lg sm:text-xl tracking-wider text-center text-white min-h-[48px] flex items-center justify-center py-1">
                {llavero.name}
              </h3>
            </div>
            
            <div className="p-3.5 sm:p-4 bg-[#0a0a0a]">
              <div className="text-[10px] sm:text-xs font-mono text-gray-500 mb-1 uppercase tracking-widest">Estadística Principal</div>
              <div className="flex items-start gap-2 text-neon-red font-bold text-xs sm:text-sm">
                <Shield size={16} className="shrink-0 mt-0.5" />
                <span className="break-words leading-snug">{llavero.mainStat}</span>
              </div>
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800/50 text-[10px] font-mono text-gray-600 text-center uppercase">
                Huecos Secundarios: 1 a 5 según rareza
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 font-mono">No se encontraron llaveros que coincidan con la búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default Llaveros;
