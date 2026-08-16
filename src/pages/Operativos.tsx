import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Search, Filter, Shield, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOperativos } from '../hooks/useOperativos';
import { useSound } from '../contexts/SoundContext';

const isDefender = (type: string) => type?.toLowerCase().includes('defen') || type?.includes('ディフェン');
const isAttacker = (type: string) => type?.toLowerCase().includes('atac') || type?.toLowerCase().includes('attack') || type?.includes('アタッカー');
const isRanger = (type: string) => type?.toLowerCase().includes('rang') || type?.includes('レンジャー');
const isLegendary = (rarity: string) => rarity?.toLowerCase().includes('legen') || rarity?.includes('レジェン');
const isCommon = (rarity: string) => rarity?.toLowerCase().includes('com') || rarity?.includes('コモン');

// Icono oficial de Balas para Atacante (Estilo Tier List)
const BulletsIcon = ({ size = 13, className = "text-white" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 block ${className}`} xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5h16a1.5 1.5 0 0 1 0 3H4a1.5 1.5 0 0 1 0-3zm0 5.5h16a1.5 1.5 0 0 1 0 3H4a1.5 1.5 0 0 1 0-3zm0 5.5h16a1.5 1.5 0 0 1 0 3H4a1.5 1.5 0 0 1 0-3z" />
  </svg>
);

const getUnitIcon = (type: string) => {
  if (isDefender(type)) return <Shield size={13} className="text-white shrink-0" />;
  if (isAttacker(type)) return <BulletsIcon size={13} className="text-white shrink-0" />;
  if (isRanger(type)) return <Crosshair size={13} className="text-white shrink-0" />;
  return null;
};

const Heroes = () => {
  const { t } = useTranslation();
  const { playHover, playClick } = useSound();
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
      
      {/* Header Bar */}
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
            onMouseEnter={playHover}
            onClick={() => { playClick(); setShowFilters(!showFilters); }}
            className={`border px-4 py-2 transition-colors flex items-center gap-2 ${showFilters ? 'bg-blood-red text-white border-blood-red' : 'bg-blood-red/20 border-blood-red/50 text-neon-red hover:bg-blood-red hover:text-white'}`}
          >
            <Filter size={18} />
            <span className="font-mono text-xs uppercase tracking-widest">{t('heroes.filters')}</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
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
                      onMouseEnter={playHover}
                      onClick={() => { playClick(); setFilterType(type); }}
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
                      onMouseEnter={playHover}
                      onClick={() => { playClick(); setFilterRarity(rarity); }}
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

      {/* Tarjetas Originales de Héroes con Icono Circular de la Tier List en la Esquina */}
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
              onMouseEnter={playHover}
              onClick={playClick}
              className={`group relative bg-[#050505] border ${isLegendary(op.rarity) ? 'border-yellow-600/30 hover:border-yellow-500/80 shadow-[0_0_10px_rgba(202,138,4,0.05)] hover:shadow-[0_0_15px_rgba(202,138,4,0.2)] card-shine' : (isCommon(op.rarity) ? 'border-blue-900/50 hover:border-blue-500/80' : 'border-purple-900/50 hover:border-purple-500/80')} overflow-hidden cursor-pointer transition-all duration-300 flex flex-col h-[280px]`}
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex flex-col h-full bg-gradient-to-t ${isLegendary(op.rarity) ? 'from-[#1a1400] to-[#111]' : (isCommon(op.rarity) ? 'from-[#000a1a] to-[#111]' : 'from-[#1a001a] to-[#111]')} relative overflow-hidden`}
              >
                
                {/* Icono Circular de Clase con Expansión de Nombre al hacer Hover */}
                {op.unitType && op.unitType !== 'Desconocido' && (
                  <div 
                    className="absolute top-2.5 right-2.5 z-30 group/badge bg-black/85 hover:bg-black text-white rounded-full h-7 min-w-[28px] px-1.5 border border-gray-600/60 shadow-md flex items-center justify-center gap-1.5 backdrop-blur-sm transition-all duration-300 cursor-pointer"
                    title={op.unitType}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {getUnitIcon(op.unitType)}
                    </div>
                    <span className="max-w-0 opacity-0 group-hover/badge:max-w-[100px] group-hover/badge:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300 font-mono text-[10px] uppercase text-white font-bold tracking-wider">
                      {op.unitType}
                    </span>
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
