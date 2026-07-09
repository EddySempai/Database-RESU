import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Search, Filter, Shield, Sword, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOperativos } from '../hooks/useOperativos';

const isDefender = (type: string) => type?.toLowerCase().includes('defen') || type?.includes('ディフェン');
const isAttacker = (type: string) => type?.toLowerCase().includes('atac') || type?.toLowerCase().includes('attack') || type?.includes('アタッカー');
const isRanger = (type: string) => type?.toLowerCase().includes('rang') || type?.includes('レンジャー');
const isLegendary = (rarity: string) => rarity?.toLowerCase().includes('legen') || rarity?.includes('レジェン');

const getUnitIcon = (type: string) => {
  if (isDefender(type)) return <Shield size={14} />;
  if (isAttacker(type)) return <Sword size={14} />;
  if (isRanger(type)) return <Crosshair size={14} />;
  return null;
};

const getUnitColor = (type: string) => {
  if (isDefender(type)) return 'text-blue-400 bg-blue-900/40 border-blue-500/50';
  if (isAttacker(type)) return 'text-blood-red bg-blood-red/20 border-blood-red/50';
  if (isRanger(type)) return 'text-green-400 bg-green-900/40 border-green-500/50';
  return 'text-gray-400 bg-gray-800 border-gray-600';
};

const Heroes = () => {
  const { t } = useTranslation();
  const operativosData = useOperativos();
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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-3 relative">
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-12 bg-blood-red" />
          <Target className="text-neon-red" size={32} />
          <h1 className="font-bebas text-5xl md:text-6xl text-white tracking-widest m-0">{t('heroes.title')}</h1>
        </div>

        <div className="flex w-full md:w-auto gap-4 relative">
          <div className="hidden md:flex items-center gap-2 text-gray-500 font-mono text-xs uppercase tracking-widest">
            {t('heroes.showing')} <span className="text-white">{filteredOperativos.length}</span> / {operativosData.length}
          </div>
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
            className={`border px-4 py-2 transition-colors flex items-center gap-2 ${showFilters ? 'bg-blood-red text-white border-blood-red' : 'bg-blood-red/20 border-blood-red/50 text-neon-red hover:bg-blood-red hover:text-white'}`}
          >
            <Filter size={18} />
            <span className="font-mono text-xs uppercase tracking-widest">{t('heroes.filters')}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="bg-[#050505] border border-gray-800 p-6 flex flex-wrap gap-6">
              <div>
                <h4 className="font-mono text-gray-500 text-[10px] uppercase tracking-widest mb-3">Clase</h4>
                <div className="flex flex-wrap gap-2">
                  {['Todos', ...Array.from(new Set(operativosData.map((o:any) => o.unitType).filter(t => t && !t.includes('Desconocido') && !t.includes('Unknown') && !t.includes('不明'))))].map(type => (
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

              <div>
                <h4 className="font-mono text-gray-500 text-[10px] uppercase tracking-widest mb-3">Rareza</h4>
                <div className="flex flex-wrap gap-2">
                  {['Todos', ...Array.from(new Set(operativosData.map((o:any) => getRarity(o))))].map(rarity => (
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              to={`/heroes/${op.id}`}
              key={idx} 
              className={`group relative bg-[#050505] border ${isLegendary(op.rarity) ? 'border-yellow-600/30 hover:border-yellow-500/80 shadow-[0_0_10px_rgba(202,138,4,0.05)] hover:shadow-[0_0_15px_rgba(202,138,4,0.2)]' : 'border-gray-800 hover:border-neon-red'} overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-[280px]`}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex flex-col h-full bg-gradient-to-t ${isLegendary(op.rarity) ? 'from-[#1a1400] to-[#111]' : 'from-[#0a0a0a] to-[#111]'} relative overflow-hidden`}
              >
                
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

                  {op.stats && (
                    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-6 z-20 backdrop-blur-sm">
                      <h4 className="font-mono text-neon-red text-[10px] md:text-xs uppercase tracking-widest mb-4 border-b border-neon-red/30 pb-2 w-full text-center">
                        {t('heroes.stats')} (Nv. 80)
                      </h4>
                      <div className="w-full space-y-3 font-mono text-[10px] md:text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">{t('heroes.health')}:</span>
                          <span className="text-green-400 font-bold">{op.stats.health.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">{t('heroes.attack')}:</span>
                          <span className="text-blood-red font-bold">{op.stats.attack.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">{t('heroes.defense')}:</span>
                          <span className="text-blue-400 font-bold">{op.stats.defense.toLocaleString()}</span>
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

export default Heroes;
