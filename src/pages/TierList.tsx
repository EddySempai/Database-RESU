import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, Star, Filter, Shield, Crosshair } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useOperativos } from '../hooks/useOperativos';
import { Link } from 'react-router-dom';
import { PvP_MidGame_TierList } from '../data/tierlistData';

const TIER_COLORS = {
  SS: 'bg-red-900 border-red-500 text-red-200',
  S: 'bg-orange-900 border-orange-500 text-orange-200',
  A: 'bg-yellow-900 border-yellow-500 text-yellow-200',
  B: 'bg-blue-900 border-blue-500 text-blue-200',
  C: 'bg-gray-900 border-gray-500 text-gray-200'
};

const MODES = ['PvP Arena'];
const PHASES = ['Mid Game'];
const TABS = ['Clasificación', 'Equipos Meta 5vs5'];

const isDefender = (type: string) => type?.toLowerCase().includes('defen') || type?.includes('ディフェンダー');
const isAttacker = (type: string) => type?.toLowerCase().includes('ata') || type?.toLowerCase().includes('att') || type?.includes('アタッカー');
const isRanger = (type: string) => type?.toLowerCase().includes('rang') || type?.includes('レンジャー');

// Custom icon mimicking the game's RifleMan bullets
const BulletsIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h12a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4V4zm0 7h12a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4v-4zm0 7h12a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4v-4z" />
  </svg>
);

const getUnitIcon = (type: string) => {
  if (isDefender(type)) return <Shield size={12} />;
  if (isAttacker(type)) return <BulletsIcon size={12} />;
  if (isRanger(type)) return <Crosshair size={12} />;
  return null;
};

export default function TierList() {
  const operativosData = useOperativos();
  
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [activeMode, setActiveMode] = useState(MODES[0]);
  const [activePhase, setActivePhase] = useState(PHASES[1]); // Default to Mid Game

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Función para obtener el tier real basado en el modo y fase
  const getOperativeTier = (id: string, mode: string, phase: string) => {
    if (mode === 'PvP Arena' && phase === 'Mid Game') {
      for (const [tier, ids] of Object.entries(PvP_MidGame_TierList)) {
        if (ids.includes(id)) return tier;
      }
      return 'C'; // Fallback for any unmapped characters
    }
    
    // Fallback aleatorio para otras categorías no implementadas aún
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const tiers = ['SS', 'S', 'A', 'B', 'C'];
    return tiers[hash % tiers.length];
  };

  const renderGeneralTierList = () => {
    return (
      <div className="flex flex-col gap-4">
        {Object.entries(TIER_COLORS).map(([tier, colorClass]) => {
          const opsInTier = operativosData.filter(op => getOperativeTier(op.id, activeMode, activePhase) === tier);
          
          return (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={tier} 
              className="flex border border-gray-800 bg-[#050505] overflow-hidden rounded-sm"
            >
              {/* Etiqueta del Tier */}
              <div className={`w-20 md:w-24 flex items-center justify-center font-bebas text-3xl md:text-5xl border-r ${colorClass}`}>
                {tier}
              </div>
              
              {/* Contenedor de Personajes */}
              <div className="flex-1 p-3 flex flex-wrap gap-2 md:gap-3 bg-black/40 min-h-[80px]">
                {opsInTier.map((op: any) => {
                  const localImage = op.iconUrl || `/operativos/${op.imageUrl.split('/').pop()}`;
                  // Colores de rareza para el borde del mini icono
                  const isLegendary = op.rarity?.toLowerCase().includes('legen') || op.rarity?.includes('レジェン');
                  const isCommon = op.rarity?.toLowerCase().includes('com') || op.rarity?.includes('コモン');
                  const borderClass = isLegendary ? 'border-yellow-500 animate-legendary-glow relative z-10' : (isCommon ? 'border-blue-500 border-opacity-70' : 'border-purple-500 border-opacity-70');

                  return (
                    <Link to={`/heroes/${op.id}`} key={op.id}>
                      <motion.div 
                        whileHover={{ scale: 1.15, y: -4, zIndex: 30 }}
                        className={`relative w-12 md:w-16 border-2 ${borderClass} rounded-xl overflow-hidden bg-[#0a0a0a] cursor-pointer shadow-lg`}
                        title={op.name}
                      >
                        <div className="absolute top-0.5 right-0.5 bg-black/80 rounded-full p-1 border border-gray-600/50 z-20 text-gray-300">
                          {getUnitIcon(op.unitType)}
                        </div>
                        <img src={localImage} alt={op.name} className="w-full h-auto block scale-110 origin-bottom" />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderMetaTeams = () => {
    // Equipo mock para demostración
    const mockTeam = operativosData.slice(0, 5);

    return (
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050505] border border-gray-800/50 rounded-xl p-6 relative overflow-hidden shadow-2xl"
        >
          {/* Fondo estético */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blood-red/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4 relative z-10">
            <div>
              <h3 className="font-bebas text-3xl text-white tracking-wider flex items-center gap-2">
                <Trophy className="text-yellow-500" size={24} /> 
                Competición Absoluta
              </h3>
              <p className="font-mono text-gray-400 text-xs mt-2 uppercase tracking-widest">Team Rating: <span className="text-neon-red">98.5/100</span></p>
            </div>
            <div className="bg-blood-red text-white px-3 py-1 font-mono text-xs font-bold rounded-sm">META #1</div>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-8 relative z-10">
            {/* Izquierda: Formación */}
            <div className="flex-1 flex flex-col items-center gap-2 md:gap-4 w-full">
              {/* Vanguardia (Frente) */}
              <div className="flex justify-center gap-8 md:gap-12 mb-2 w-full">
                {mockTeam.slice(0, 2).map((op: any) => {
                  const localImage = op.iconUrl || `/operativos/${op.imageUrl.split('/').pop()}`;
                  return (
                    <div key={op.id} className="flex flex-col items-center group cursor-pointer w-20 md:w-28">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="w-full border border-gray-800/60 rounded-lg bg-[#0a0a0a] overflow-hidden mb-2 relative group-hover:border-gray-500 transition-colors duration-300 shadow-xl"
                      >
                        <div className="absolute top-1 left-1 bg-black/80 rounded-full p-1 border border-gray-600/50 z-20 text-gray-300">
                          {getUnitIcon(op.unitType)}
                        </div>
                        <img src={localImage} alt={op.name} className="w-full h-auto block scale-110 origin-bottom" />
                        <div className="absolute bottom-0 w-full bg-blue-900/90 text-center py-0.5 border-t border-blue-500/50">
                          <span className="font-mono text-[9px] text-white uppercase tracking-wider">Vanguardia</span>
                        </div>
                      </motion.div>
                      <span className="text-white font-inter text-xs text-center line-clamp-1">{op.name}</span>
                    </div>
                  )
                })}
              </div>

              {/* Retaguardia (Atrás) */}
              <div className="flex justify-center gap-4 md:gap-8 w-full">
                {mockTeam.slice(2, 5).map((op: any) => {
                  const localImage = op.iconUrl || `/operativos/${op.imageUrl.split('/').pop()}`;
                  return (
                    <div key={op.id} className="flex flex-col items-center group cursor-pointer w-20 md:w-28">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="w-full border border-gray-800/60 rounded-lg bg-[#0a0a0a] overflow-hidden mb-2 relative group-hover:border-gray-500 transition-colors duration-300 shadow-xl"
                      >
                        <div className="absolute top-1 left-1 bg-black/80 rounded-full p-1 border border-gray-600/50 z-20 text-gray-300">
                          {getUnitIcon(op.unitType)}
                        </div>
                        <img src={localImage} alt={op.name} className="w-full h-auto block scale-110 origin-bottom" />
                        <div className="absolute bottom-0 w-full bg-red-900/90 text-center py-0.5 border-t border-red-500/50">
                          <span className="font-mono text-[9px] text-white uppercase tracking-wider">Retaguardia</span>
                        </div>
                      </motion.div>
                      <span className="text-white font-inter text-xs text-center line-clamp-1">{op.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Derecha: INFO */}
            <div className="w-full lg:w-1/3 bg-black/40 rounded-lg p-6 flex flex-col border border-gray-800/50">
              <div className="mb-6">
                <h4 className="font-bebas text-2xl text-white tracking-widest mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                  INFORMACIÓN
                </h4>
                <div className="space-y-3 font-mono text-xs uppercase tracking-wider text-gray-400">
                  <div className="flex justify-between border-b border-gray-800/50 pb-1">
                    <span>DPS:</span> <span className="text-neon-red font-bold">Extremo</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800/50 pb-1">
                    <span>Apoyo:</span> <span className="text-blue-400 font-bold">Moderado</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800/50 pb-1">
                    <span>Tanques:</span> <span className="text-yellow-500 font-bold">Alto</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <h4 className="font-mono text-white text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Star size={12} className="text-yellow-500" /> Sinergia del Equipo
                </h4>
                <p className="text-sm text-gray-400 font-inter leading-relaxed">
                  Esta formación se especializa en daño explosivo rápido. Los vanguardias absorben el daño inicial mientras los atacantes en retaguardia cargan sus habilidades definitivas. Excelente para limpiar equipos defensivos en los primeros 15 segundos del combate.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen relative z-10">
      <Helmet>
        <title>Tier List de Héroes | RE: Survival Unit Hub</title>
        <meta name="description" content="Descubre cuáles son los mejores operativos (SS, S, A, B) en el meta actual. Análisis táctico de vanguardia y retaguardia." />
        <meta property="og:title" content="Tier List de Héroes | RE: Survival Unit Hub" />
        <meta property="og:description" content="Descubre cuáles son los mejores operativos (SS, S, A, B) en el meta actual." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1200&auto=format&fit=crop" />
      </Helmet>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-gray-800 pb-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <Swords className="text-neon-red" size={28} />
            <span className="font-mono text-neon-red text-sm tracking-[0.3em] uppercase">Tactical Database</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bebas text-5xl md:text-7xl text-white tracking-widest drop-shadow-md"
          >
            TIER LIST <span className="text-blood-red">& META</span>
          </motion.h1>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-bebas text-xl px-6 py-2 transition-all tracking-widest relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tier-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-red" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex md:hidden gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-bebas text-lg px-4 py-2 border transition-all whitespace-nowrap ${activeTab === tab ? 'border-neon-red bg-blood-red/10 text-white' : 'border-gray-800 text-gray-500 bg-[#050505]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-[#050505] border border-gray-800 p-4 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400 font-mono text-xs uppercase tracking-widest">
          <Filter size={16} /> Filtros de Entorno
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {/* Mode Selector */}
          <div className="flex flex-1 sm:flex-none bg-black border border-gray-800 p-1 rounded-sm">
            {MODES.map(mode => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`flex-1 sm:flex-none px-3 py-1.5 font-mono text-[10px] uppercase transition-colors rounded-sm ${activeMode === mode ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Phase Selector */}
          <div className="flex flex-1 sm:flex-none bg-black border border-gray-800 p-1 rounded-sm">
            {PHASES.map(phase => (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={`flex-1 sm:flex-none px-3 py-1.5 font-mono text-[10px] uppercase transition-colors rounded-sm ${activePhase === phase ? 'bg-blood-red text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === TABS[0] ? renderGeneralTierList() : renderMetaTeams()}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
