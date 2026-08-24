import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, Key } from 'lucide-react';

interface Keyring {
  id: string;
  name: string;
  icon: string;
  mainStat: string;
  type: string;
}

const Llaveros = () => {
  const [llaveros, setLlaveros] = useState<Keyring[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Todos');

  useEffect(() => {
    fetch('/src/data/llaveros.json')
      .then(res => res.json())
      .then(data => setLlaveros(data))
      .catch(err => console.error("Error loading llaveros:", err));
  }, []);

  const types = ['Todos', ...Array.from(new Set(llaveros.map(l => l.type)))];

  const filtered = llaveros.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.mainStat.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'Todos' || l.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center justify-center p-3 bg-blood-red/10 border border-blood-red/30 rounded-full mb-4">
          <Key className="text-neon-red" size={32} />
        </div>
        <h1 className="text-4xl md:text-6xl font-bebas tracking-widest text-white mb-4">BASE DE DATOS: LLAVEROS</h1>
        <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm">
          Catálogo del equipo "KeyRing" (V1.9.1). Descubre las estadísticas principales fijas de cada llavero.
        </p>
      </motion.div>

      {/* Filtros */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0a0a0a] p-4 border border-gray-800 rounded-lg">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o estadística..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-gray-700 text-white font-mono text-sm py-2.5 pl-10 pr-4 rounded focus:outline-none focus:border-blood-red transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 font-mono text-xs uppercase whitespace-nowrap border transition-all duration-300 ${
                filterType === type 
                  ? 'bg-blood-red text-white border-blood-red' 
                  : 'bg-black text-gray-400 border-gray-700 hover:border-gray-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

            <div className="p-6 flex flex-col items-center border-b border-gray-800/50 bg-black/40 group-hover:bg-blood-red/5 transition-colors">
              <div className="w-24 h-24 relative mb-4 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                <img src={llavero.icon} alt={llavero.name} className="max-w-full max-h-full object-contain" />
              </div>
              <h3 className="font-bebas text-xl tracking-wider text-center text-white h-12 flex items-center justify-center">
                {llavero.name}
              </h3>
            </div>
            
            <div className="p-4 bg-[#0a0a0a]">
              <div className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-widest">Estadística Principal</div>
              <div className="flex items-center gap-2 text-neon-red font-bold text-sm">
                <Shield size={16} />
                <span>{llavero.mainStat}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-800/50 text-[10px] font-mono text-gray-600 text-center uppercase">
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
