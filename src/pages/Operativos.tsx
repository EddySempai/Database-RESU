import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Search, Filter, Shield, Sword, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';
import operativosData from '../data/operativos.json';

const getUnitIcon = (type: string) => {
  switch(type) {
    case 'Defensor': return <Shield size={14} />;
    case 'Atacante': return <Sword size={14} />;
    case 'Ranger': return <Crosshair size={14} />;
    default: return null;
  }
};

const getUnitColor = (type: string) => {
  switch(type) {
    case 'Defensor': return 'text-blue-400 bg-blue-900/40 border-blue-500/50';
    case 'Atacante': return 'text-blood-red bg-blood-red/20 border-blood-red/50';
    case 'Ranger': return 'text-green-400 bg-green-900/40 border-green-500/50';
    default: return 'text-gray-400 bg-gray-800 border-gray-600';
  }
};

const Operativos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('Todos');
  const [filterRarity, setFilterRarity] = useState('Todos');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getRarity = (op: any) => {
    return op.rarity || 'Épico';
  };

  const filteredOperativos = operativosData.filter(op => {
    const matchesSearch = op.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Todos' || op.unitType === filterType;
    const matchesRarity = filterRarity === 'Todos' || getRarity(op) === filterRarity;
    return matchesSearch && matchesType && matchesRarity;
  });

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen relative z-10">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-800 pb-6 gap-6 relative">
        <div>
          <h1 className="font-bebas text-5xl md:text-6xl text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,42,42,0.6)] flex items-center gap-4">
            <Target className="text-neon-red w-10 h-10 md:w-12 md:h-12" />
            Base de Datos: Operativos
          </h1>
          <p className="font-mono text-gray-500 mt-2 uppercase tracking-widest text-sm">
            Mostrando: <span className="text-white">{filteredOperativos.length}</span> / {operativosData.length}
          </p>
        </div>

        <div className="flex w-full md:w-auto gap-4 relative">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar operativo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-gray-800 text-white pl-10 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-neon-red transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`border p-2 transition-colors flex items-center justify-center ${showFilters ? 'bg-blood-red text-white border-blood-red' : 'bg-blood-red/20 border-blood-red/50 text-neon-red hover:bg-blood-red hover:text-white'}`}
          >
            <Filter size={18} />
          </button>

          {/* Filter Dropdown Menu */}
          {showFilters && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-[#0a0a0a] border border-gray-800 p-4 z-50 shadow-2xl">
              <h3 className="font-mono text-blood-red text-xs uppercase tracking-widest border-b border-gray-800 pb-2 mb-3">Filtros Activos</h3>
              
              <div className="mb-4">
                <label className="block text-gray-500 font-mono text-[10px] uppercase mb-2">Clase de Unidad</label>
                <div className="flex flex-wrap gap-2">
                  {['Todos', 'Defensor', 'Atacante', 'Ranger'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`text-xs font-mono px-2 py-1 border transition-colors ${filterType === type ? 'bg-white/10 border-white text-white' : 'bg-black border-gray-800 text-gray-400 hover:border-gray-500'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-500 font-mono text-[10px] uppercase mb-2">Rareza (Estimada)</label>
                <div className="flex flex-wrap gap-2">
                  {['Todos', 'Legendario', 'Épico'].map(rarity => (
                    <button
                      key={rarity}
                      onClick={() => setFilterRarity(rarity)}
                      className={`text-xs font-mono px-2 py-1 border transition-colors ${filterRarity === rarity ? 'bg-white/10 border-white text-white' : 'bg-black border-gray-800 text-gray-400 hover:border-gray-500'}`}
                    >
                      {rarity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-mono text-[10px] uppercase mb-2 flex justify-between">
                  <span>Tier List</span>
                  <span className="text-neon-red text-[8px]">PRÓXIMAMENTE</span>
                </label>
                <div className="w-full bg-black border border-gray-800 text-gray-600 p-2 text-xs font-mono text-center cursor-not-allowed">
                  Bloqueado
                </div>
              </div>
            </div>
          )}
        </div>
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
            <Link 
              to={`/operativos/${op.id}`}
              key={idx} 
              className={`group relative bg-[#050505] border ${op.rarity === 'Legendario' ? 'border-yellow-600/30 hover:border-yellow-500/80 shadow-[0_0_10px_rgba(202,138,4,0.05)] hover:shadow-[0_0_15px_rgba(202,138,4,0.2)]' : 'border-gray-800 hover:border-neon-red'} overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-[280px]`}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex flex-col h-full bg-gradient-to-t ${op.rarity === 'Legendario' ? 'from-[#1a1400] to-[#111]' : 'from-[#0a0a0a] to-[#111]'} relative overflow-hidden`}
              >
                
                {/* Unit Type Badge */}
                {op.unitType && op.unitType !== 'Desconocido' && (
                  <div className={`absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-1 border text-[10px] font-mono uppercase tracking-widest ${getUnitColor(op.unitType)} backdrop-blur-sm`}>
                    {getUnitIcon(op.unitType)} {op.unitType}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-blood-red/0 group-hover:bg-blood-red/10 transition-colors z-0" />
                
                <div className="relative z-10 p-2 flex-1 w-full overflow-hidden flex items-center justify-center">
                  <img 
                    src={localImage} 
                    alt={op.name} 
                    className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
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
                
                <div className="p-3 border-t border-gray-800 bg-black/80 relative z-10 backdrop-blur-sm mt-auto">
                  <h3 className="font-bebas text-xl text-white tracking-wider text-center truncate relative z-30">
                    {op.name}
                  </h3>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
      
      {filteredOperativos.length === 0 && (
        <div className="text-center py-20 font-mono text-gray-500">
          No se encontraron operativos con los parámetros especificados.
        </div>
      )}
    </div>
  );
};

export default Operativos;
