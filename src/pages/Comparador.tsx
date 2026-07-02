import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Crosshair, Heart, Zap, Search, X } from 'lucide-react';
import operativosData from '../data/operativos.json';

interface Operativo {
  id: string;
  name: string;
  imageUrl: string;
  unitType: string;
  rarity: string;
  stats: {
    health: number;
    attack: number;
    defense: number;
  };
  fieldStats?: { label: string, value: string }[];
}

const Comparador = () => {
  const [slot1, setSlot1] = useState<Operativo | null>(null);
  const [slot2, setSlot2] = useState<Operativo | null>(null);
  const [selectingSlot, setSelectingSlot] = useState<1 | 2 | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic for modal
  const getSelectableOperativos = () => {
    let filtered = operativosData as Operativo[];
    
    // Si estamos seleccionando el Slot 2 y el Slot 1 tiene un personaje, filtramos por clase
    if (selectingSlot === 2 && slot1) {
      filtered = filtered.filter(op => op.unitType === slot1.unitType);
    } else if (selectingSlot === 1 && slot2) {
      filtered = filtered.filter(op => op.unitType === slot2.unitType);
    }

    if (searchTerm) {
      filtered = filtered.filter(op => op.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered;
  };

  const handleSelect = (op: Operativo) => {
    if (selectingSlot === 1) setSlot1(op);
    if (selectingSlot === 2) setSlot2(op);
    setSelectingSlot(null);
    setSearchTerm('');
  };

  const compareStats = (val1: number, val2: number, isSlot1: boolean) => {
    if (val1 === val2) return 'text-gray-400';
    if (isSlot1) {
      return val1 > val2 ? 'text-green-500 font-bold' : 'text-red-500';
    } else {
      return val2 > val1 ? 'text-green-500 font-bold' : 'text-red-500';
    }
  };

  const renderSlot = (slot: 1 | 2, op: Operativo | null) => {
    return (
      <div className="flex-1 bg-[#050505] border border-gray-800 p-6 flex flex-col relative min-h-[400px]">
        {op ? (
          <div className="flex flex-col h-full">
            <button 
              onClick={() => slot === 1 ? setSlot1(null) : setSlot2(null)}
              className="absolute top-4 right-4 z-20 text-gray-500 hover:text-white bg-black/50 p-1 rounded"
            >
              <X size={20} />
            </button>
            <div className="h-64 overflow-hidden relative border-b border-gray-800 mb-6 cursor-pointer group" onClick={() => setSelectingSlot(slot)}>
              <div className="absolute inset-0 bg-blood-red/0 group-hover:bg-blood-red/10 transition-colors z-10" />
              <img src={`/operativos/${op.imageUrl.split('/').pop()}`} alt={op.name} className="w-full h-full object-contain object-bottom group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="text-center mb-6">
              <div className="text-xs font-mono text-blood-red tracking-widest uppercase mb-1">{op.unitType} / {op.rarity}</div>
              <h3 className="font-bebas text-3xl tracking-widest text-white">{op.name}</h3>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setSelectingSlot(slot)}
            className="flex-1 border-2 border-dashed border-gray-700 hover:border-blood-red hover:bg-blood-red/5 flex flex-col items-center justify-center text-gray-500 hover:text-white transition-all group"
          >
            <Search className="mb-4 w-12 h-12 group-hover:scale-110 transition-transform" />
            <span className="font-bebas text-2xl tracking-widest">SELECCIONAR OPERATIVO</span>
            {((slot === 2 && slot1) || (slot === 1 && slot2)) && (
              <span className="font-mono text-xs text-blood-red mt-2 uppercase">Debe ser {slot1 ? slot1.unitType : slot2?.unitType}</span>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen relative z-10 flex flex-col">
      <div className="text-center mb-12">
        <h1 className="font-bebas text-5xl md:text-7xl tracking-widest text-white uppercase drop-shadow-lg mb-2">
          Análisis <span className="text-blood-red">Comparativo</span>
        </h1>
        <p className="font-mono text-gray-400 text-sm max-w-2xl mx-auto uppercase tracking-widest">
          Simulación de combate directo. Solo operativos de la misma clase táctica son elegibles para comparación.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-12 flex-1">
        {/* SLOT 1 */}
        {renderSlot(1, slot1)}

        {/* VS Divider */}
        <div className="flex items-center justify-center lg:w-16 shrink-0 py-6 lg:py-0">
          <div className="w-16 h-16 rounded-full border border-gray-700 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(255,42,42,0.2)]">
            <span className="font-bebas text-2xl text-blood-red tracking-widest">VS</span>
          </div>
        </div>

        {/* SLOT 2 */}
        {renderSlot(2, slot2)}
      </div>

      {/* STATS COMPARISON SECTION */}
      {slot1 && slot2 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#050505] border border-gray-800 p-6 md:p-12 mb-12"
        >
          <h3 className="font-bebas text-3xl tracking-widest text-center mb-8 border-b border-gray-800 pb-4">Desempeño Base (Nivel 1)</h3>
          
          <div className="space-y-6">
            {/* Health */}
            <div className="grid grid-cols-3 items-center gap-4 border-b border-gray-800/50 pb-4">
              <div className={`text-right font-mono text-lg md:text-xl ${compareStats(slot1.stats.health, slot2.stats.health, true)}`}>
                {slot1.stats.health.toLocaleString()}
              </div>
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Heart size={20} className="mb-1" />
                <span className="text-[10px] uppercase tracking-widest">Salud</span>
              </div>
              <div className={`font-mono text-lg md:text-xl ${compareStats(slot1.stats.health, slot2.stats.health, false)}`}>
                {slot2.stats.health.toLocaleString()}
              </div>
            </div>

            {/* Attack */}
            <div className="grid grid-cols-3 items-center gap-4 border-b border-gray-800/50 pb-4">
              <div className={`text-right font-mono text-lg md:text-xl ${compareStats(slot1.stats.attack, slot2.stats.attack, true)}`}>
                {slot1.stats.attack.toLocaleString()}
              </div>
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Crosshair size={20} className="mb-1" />
                <span className="text-[10px] uppercase tracking-widest">Ataque</span>
              </div>
              <div className={`font-mono text-lg md:text-xl ${compareStats(slot1.stats.attack, slot2.stats.attack, false)}`}>
                {slot2.stats.attack.toLocaleString()}
              </div>
            </div>

            {/* Defense */}
            <div className="grid grid-cols-3 items-center gap-4 border-b border-gray-800/50 pb-4">
              <div className={`text-right font-mono text-lg md:text-xl ${compareStats(slot1.stats.defense, slot2.stats.defense, true)}`}>
                {slot1.stats.defense.toLocaleString()}
              </div>
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Shield size={20} className="mb-1" />
                <span className="text-[10px] uppercase tracking-widest">Defensa</span>
              </div>
              <div className={`font-mono text-lg md:text-xl ${compareStats(slot1.stats.defense, slot2.stats.defense, false)}`}>
                {slot2.stats.defense.toLocaleString()}
              </div>
            </div>

          </div>

          {/* Field Stats */}
          <div className="mt-8 border-t border-gray-800 pt-8">
            <h4 className="font-bebas text-xl text-blood-red tracking-widest text-center mb-6">Porcentajes de Campo (Habilidades)</h4>
            <div className="grid grid-cols-2 gap-8">
              {/* Slot 1 Field Stats */}
              <div className="space-y-3">
                {slot1.fieldStats?.map((stat, i) => (
                  <div key={i} className="flex flex-col bg-gray-900/30 p-3 border border-gray-800/50">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{stat.label}</span>
                    <span className="font-mono text-white text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>
              {/* Slot 2 Field Stats */}
              <div className="space-y-3">
                {slot2.fieldStats?.map((stat, i) => (
                  <div key={i} className="flex flex-col bg-gray-900/30 p-3 border border-gray-800/50">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">{stat.label}</span>
                    <span className="font-mono text-white text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis Placeholder */}
          <div className="mt-8 border border-blood-red/30 bg-blood-red/5 p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] mix-blend-overlay opacity-20" />
            <Zap size={24} className="mx-auto text-blood-red mb-3 drop-shadow-[0_0_8px_rgba(255,42,42,0.8)] group-hover:scale-110 transition-transform" />
            <h4 className="font-bebas text-2xl tracking-widest text-white mb-2">Análisis Táctico de Red Queen</h4>
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest max-w-xl mx-auto">
              [ EN DESARROLLO ] Pronto, la IA evaluará estas estadísticas y habilidades para proporcionarte una recomendación directa sobre qué operativo es superior para tu formación actual.
            </p>
          </div>
        </motion.div>
      )}

      {/* SELECTION MODAL */}
      <AnimatePresence>
        {selectingSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#050505] border border-gray-800 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                <h2 className="font-bebas text-3xl tracking-widest text-white">Seleccionar Operativo</h2>
                <button onClick={() => setSelectingSlot(null)} className="text-gray-400 hover:text-white">
                  <X size={28} />
                </button>
              </div>
              
              <div className="p-6 border-b border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-white pl-10 pr-4 py-3 font-mono focus:border-blood-red outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {getSelectableOperativos().length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-mono">
                    No hay operativos disponibles para esta selección.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {getSelectableOperativos().map(op => (
                      <button 
                        key={op.id}
                        onClick={() => handleSelect(op)}
                        className="bg-black border border-gray-800 hover:border-blood-red group transition-colors text-left flex flex-col"
                      >
                        <div className="h-32 bg-gray-900/50 overflow-hidden flex justify-center border-b border-gray-800 relative">
                          <img src={`/operativos/${op.imageUrl.split('/').pop()}`} alt={op.name} className="h-full object-contain object-bottom group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="p-3">
                          <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest truncate">{op.unitType}</div>
                          <div className="font-bebas text-lg tracking-wide text-white group-hover:text-blood-red transition-colors truncate">{op.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Comparador;
