import { useState } from 'react';
import { Database, ArrowDown, X } from 'lucide-react';
import { TREASURE_TIERS, getCostBetweenTiers, getRarityStyle } from '../data/treasures';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Treasures() {
  const { t } = useTranslation();
  const [slots, setSlots] = useState<{current: number, target: number}[]>(
    Array(6).fill({ current: 0, target: 0 })
  );
  const [activeSelect, setActiveSelect] = useState<{slot: number, type: 'current' | 'target'} | null>(null);

  // Totals Calculation
  let totalGoldFrag = 0;
  let totalPolish = 0;
  let totalBluePrint = 0;
  let totalAdvancePolish = 0;

  slots.forEach(slot => {
    const cost = getCostBetweenTiers(slot.current, slot.target);
    totalGoldFrag += cost.goldFrag;
    totalPolish += cost.polish;
    totalBluePrint += cost.bluePrint;
    totalAdvancePolish += cost.advancePolish;
  });

  const handleSelectTier = (index: number) => {
    if (!activeSelect) return;
    const newSlots = [...slots];
    const s = activeSelect.slot;
    if (activeSelect.type === 'current') {
       newSlots[s] = { ...newSlots[s], current: index };
       if (index > newSlots[s].target && newSlots[s].target !== 0) {
           newSlots[s].target = index;
       }
    } else {
       newSlots[s] = { ...newSlots[s], target: index };
       if (index < newSlots[s].current && index !== 0) {
           newSlots[s].current = index;
       }
    }
    setSlots(newSlots);
    setActiveSelect(null);
  };

  const renderSquare = (tierIdx: number, slotIdx: number, type: 'current'|'target') => {
    const tier = TREASURE_TIERS[tierIdx];
    const style = getRarityStyle(tier.rarity);
    const isEmpty = tierIdx === 0;

    return (
      <div 
        onClick={() => setActiveSelect({slot: slotIdx, type})}
        className={`w-full aspect-square md:aspect-auto md:h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm ${
          isEmpty 
            ? 'border border-dashed border-gray-700 hover:border-gray-500 bg-black/40 shadow-none' 
            : `border border-solid ${style.border} ${style.bg} ${style.text} ${style.shadow} hover:brightness-125 hover:scale-105`
        }`}
      >
        {!isEmpty ? (
          <>
            <span className={`font-bebas text-lg md:text-2xl leading-none drop-shadow-md`}>{tier.rarity.replace('+', ' +')}</span>
            <span className="font-mono text-xs mt-1 text-white opacity-80">T{tier.level}</span>
          </>
        ) : (
          <span className="text-gray-600 font-mono text-[10px] md:text-xs text-center px-1">
            {type === 'current' ? 'CLICK (ACTUAL)' : 'CLICK (META)'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 mt-8 mb-16 relative z-10">
      <div className="bg-[#0a0a0a]/90 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-8 border-b border-gray-800 pb-4 text-center">
          <h2 className="font-bebas text-4xl md:text-5xl text-white tracking-widest">
            SIMULADOR DE <span className="text-neon-red">TESOROS</span>
          </h2>
        </div>

        {/* The 6 Slots Grid */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          {slots.map((slot, idx) => {
            const currentTier = TREASURE_TIERS[slot.current];
            const targetTier = TREASURE_TIERS[slot.target];
            const currentStyle = getRarityStyle(currentTier.rarity);
            const targetStyle = getRarityStyle(targetTier.rarity);
            
            return (
              <div key={idx} className={`relative flex-1 flex flex-row md:flex-col items-center gap-4 bg-gradient-to-b ${currentStyle.from} ${targetStyle.to} p-4 rounded-xl border border-gray-800 overflow-hidden`}>
                {/* Background base layer to ensure darkness */}
                <div className="absolute inset-0 bg-black/60 -z-10" />

                <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 relative flex items-center justify-center">
                  {/* Flashy Radial Glow Behind Image */}
                  {slot.current !== 0 && (
                    <>
                      <div className={`absolute inset-0 m-auto w-10 h-10 md:w-14 md:h-14 rounded-full blur-xl opacity-60 ${currentStyle.glow} animate-pulse`} />
                      <div className={`absolute inset-0 m-auto w-14 h-14 md:w-20 md:h-20 rounded-full blur-2xl opacity-40 ${currentStyle.glow}`} />
                      <div className={`absolute inset-0 m-auto w-8 h-8 rounded-full blur-md opacity-80 ${currentStyle.glow}`} />
                    </>
                  )}
                  <img src={`/tesoros/Treasure_${idx+1}.webp`} alt={`Treasure ${idx+1}`} className="w-full h-full object-contain relative z-10 drop-shadow-2xl" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/80/222222/FFFFFF?text=T' + (idx+1))} />
                </div>
              
              <div className="flex flex-col gap-3 w-full relative">
                <div className="text-center font-mono text-[10px] text-gray-500 mb-1 hidden md:block">{t('treasures.current_tier')}</div>
                {renderSquare(slot.current, idx, 'current')}
                
                <div className="flex justify-center text-gray-700 md:my-1">
                  <ArrowDown size={20} className="md:rotate-0 -rotate-90" />
                </div>
                
                {renderSquare(slot.target, idx, 'target')}
                <div className="text-center font-mono text-[10px] text-gray-500 mt-1 hidden md:block">{t('treasures.target_tier')}</div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Results Panel */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-red-900/30 text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <div className="flex flex-col items-center mb-10">
            <Database className="w-8 h-8 text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <h2 className="text-2xl font-bebas tracking-widest text-white drop-shadow-md">{t('treasures.total_resources')}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-black/40 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
              <div className="absolute inset-0 bg-yellow-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="/recursos/gold_frag.webp" alt="Gold Frag" className="w-16 h-16 object-contain drop-shadow-lg z-10" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/64/000000/FFD700?text=G' }} />
              <div className="flex flex-col items-center z-10">
                <span className="text-xs font-mono text-gray-500 mb-1">{t('treasures.gold_frag')}</span>
                <span className="text-3xl font-bebas text-yellow-500 drop-shadow-md">{totalGoldFrag.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-black/40 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:border-blue-400/50 transition-colors">
              <div className="absolute inset-0 bg-blue-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="/recursos/polish.webp" alt="Polish" className="w-16 h-16 object-contain drop-shadow-lg z-10" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/64/000000/FFFFFF?text=P' }} />
              <div className="flex flex-col items-center z-10">
                <span className="text-xs font-mono text-gray-500 mb-1">{t('treasures.polish')}</span>
                <span className="text-3xl font-bebas text-white drop-shadow-md">{totalPolish.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-black/40 p-6 rounded-xl border border-blue-500/20 flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="/recursos/blueprint.webp" alt="Blueprint" className="w-16 h-16 object-contain drop-shadow-lg z-10" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/64/000000/3B82F6?text=B' }} />
              <div className="flex flex-col items-center z-10">
                <span className="text-xs font-mono text-gray-500 mb-1">{t('treasures.blueprint')}</span>
                <span className="text-3xl font-bebas text-blue-400 drop-shadow-md">{totalBluePrint.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-black/40 p-6 rounded-xl border border-red-900/50 flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="absolute inset-0 bg-red-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="/recursos/advance_polish.webp" alt="Advance Polish" className="w-16 h-16 object-contain drop-shadow-lg z-10" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/64/000000/EF4444?text=A' }} />
              <div className="flex flex-col items-center z-10">
                <span className="text-xs font-mono text-red-500/80 mb-1">{t('treasures.advance_polish')}</span>
                <span className="text-3xl font-bebas text-red-500 drop-shadow-md">{totalAdvancePolish.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Select Modal */}
      <AnimatePresence>
        {activeSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#0f0f0f] border border-gray-700 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h3 className="font-bebas text-xl text-white">{activeSelect.type === 'current' ? t('treasures.select_current') : t('treasures.select_target')}</h3>
                <button onClick={() => setActiveSelect(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="overflow-y-auto p-4 flex flex-col gap-3">
                {TREASURE_TIERS.map((tier, idx) => {
                  const style = getRarityStyle(tier.rarity);
                  const isSelected = idx === slots[activeSelect.slot][activeSelect.type];
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectTier(idx)}
                      className={`relative flex justify-between items-center px-4 py-3 rounded-lg border transition-all duration-300 overflow-visible group ${
                        isSelected 
                          ? `border-solid ${style.border} ${style.bg} ${style.shadow} scale-[1.02]` 
                          : `border-solid border-gray-800 bg-black/50 ${style.hover}`
                      }`}
                    >
                      {/* Gradient Bottom Border for selected items */}
                      {isSelected && (
                        <div className={`absolute -bottom-[2px] left-0 w-full h-[2px] bg-gradient-to-r ${style.gradient} rounded-b-lg opacity-80`} />
                      )}

                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-3 h-3 rounded-full ${style.bg} border ${style.border} ${style.shadow}`} />
                        <span className={`font-mono text-sm ${isSelected ? 'text-white font-bold drop-shadow-md' : 'text-gray-400'}`}>{tier.id}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
