import { useState } from 'react';
import { Database, X, Settings2 } from 'lucide-react';
import { TREASURE_TIERS, getCostBetweenTiers, getRarityStyle } from '../data/treasures';
import { motion, AnimatePresence } from 'framer-motion';

export default function TreasuresV2() {
  const [slots, setSlots] = useState<{current: number, target: number}[]>(
    Array(6).fill({ current: 0, target: 0 })
  );
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [isSelecting, setIsSelecting] = useState<'current' | 'target' | null>(null);

  // Totals Calculation (Grand Total)
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
    if (!isSelecting) return;
    const newSlots = [...slots];
    const s = activeSlot;
    if (isSelecting === 'current') {
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
    setIsSelecting(null);
  };

  const activeTreasure = slots[activeSlot];
  const activeCurrentTier = TREASURE_TIERS[activeTreasure.current];
  const activeTargetTier = TREASURE_TIERS[activeTreasure.target];
  const activeCost = getCostBetweenTiers(activeTreasure.current, activeTreasure.target);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 mt-8 mb-16 relative z-10 font-sans">
      <div className="bg-[#1a1f2e] rounded-xl border border-gray-700 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#121622] p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="text-gray-400" />
            <h2 className="text-xl font-bold text-gray-200">Tesoros de oficial (Modo Inspector)</h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row p-6 gap-8">
          
          {/* LEFT PANEL: 2x3 Grid */}
          <div className="md:w-1/2 flex flex-col items-center">
            <h3 className="text-gray-400 font-semibold mb-4 w-full text-left uppercase text-sm tracking-wider">Inventario</h3>
            
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {slots.map((slot, idx) => {
                const tier = TREASURE_TIERS[slot.current];
                const style = getRarityStyle(tier.rarity);
                const isActive = activeSlot === idx;
                
                return (
                  <div 
                    key={idx}
                    onClick={() => setActiveSlot(idx)}
                    className={`relative aspect-square bg-[#232838] rounded-md cursor-pointer transition-all overflow-hidden ${
                      isActive ? 'border-2 border-white ring-2 ring-white/20' : 'border border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {/* Background Glow */}
                    <div className={`absolute inset-0 bg-gradient-radial from-white/20 to-transparent opacity-50 ${style.bg.replace('bg-', 'from-')}`} />
                    
                    {/* Image */}
                    <div className="absolute inset-2 flex items-center justify-center">
                       <img src={`/tesoros/Treasure_${idx+1}.webp`} alt={`Treasure ${idx+1}`} className="w-[80%] h-[80%] object-contain drop-shadow-md" />
                    </div>

                    {/* Tier Badge */}
                    {slot.current !== 0 && (
                      <div className="absolute top-1 right-1 bg-black/60 px-1 rounded text-[10px] text-white font-bold">
                        T{tier.level}
                      </div>
                    )}
                    
                    {/* Bottom Decorative Boxes (Red/Blue/Yellow) */}
                    <div className="absolute bottom-1 w-full flex justify-center gap-1">
                       <div className="w-2 h-2 bg-red-500 rounded-sm" />
                       <div className="w-2 h-2 bg-blue-500 rounded-sm" />
                       <div className="w-2 h-2 bg-yellow-500 rounded-sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Inspector */}
          <div className="md:w-1/2 flex flex-col items-center border-t md:border-t-0 md:border-l border-gray-700 pt-8 md:pt-0 md:pl-8 relative">
            
            <div className="relative w-full flex flex-col items-center mb-8">
              {/* Massive Radial Glow */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-3xl opacity-60 rounded-full ${getRarityStyle(activeCurrentTier.rarity).bg}`} />
              
              <img 
                src={`/tesoros/Treasure_${activeSlot + 1}.webp`} 
                alt="Selected Treasure" 
                className="w-40 h-40 object-contain relative z-10 drop-shadow-2xl" 
              />
              
              <h3 className="mt-4 text-2xl font-bold text-white relative z-10 drop-shadow-md">Tesoro {activeSlot + 1}</h3>
              <p className="text-gray-400 text-sm mt-1">{activeCurrentTier.rarity === 'None' ? 'Sin nivel' : `${activeCurrentTier.rarity} T${activeCurrentTier.level}`}</p>
            </div>

            {/* Controls */}
            <div className="w-full bg-[#232838] border border-gray-700 rounded-md p-4 mb-4">
              <h4 className="text-gray-400 text-xs uppercase mb-3 border-b border-gray-700 pb-2">Configuración</h4>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300 text-sm">Nivel Actual</span>
                <button 
                  onClick={() => setIsSelecting('current')}
                  className="bg-[#1a1f2e] border border-gray-600 px-4 py-2 rounded text-white text-sm min-w-[120px] text-right hover:bg-gray-700 transition-colors"
                >
                  {activeCurrentTier.id}
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Nivel Objetivo</span>
                <button 
                  onClick={() => setIsSelecting('target')}
                  className="bg-[#1a1f2e] border border-gray-600 px-4 py-2 rounded text-white text-sm min-w-[120px] text-right hover:bg-gray-700 transition-colors"
                >
                  {activeTargetTier.id === 'None' ? 'Ninguno' : activeTargetTier.id}
                </button>
              </div>
            </div>

            {/* Individual Cost */}
            <div className="w-full bg-[#232838] border border-gray-700 rounded-md p-4">
              <h4 className="text-gray-400 text-xs uppercase mb-3 border-b border-gray-700 pb-2">Requisitos de mejora</h4>
              <div className="flex justify-between text-sm">
                 <span className="text-yellow-500">Gold Frag: {activeCost.goldFrag.toLocaleString()}</span>
                 <span className="text-gray-300">Polish: {activeCost.polish.toLocaleString()}</span>
                 <span className="text-blue-400">BluePrint: {activeCost.bluePrint.toLocaleString()}</span>
                 <span className="text-red-400">AP: {activeCost.advancePolish.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM PANEL: Grand Total */}
        <div className="bg-[#121622] border-t border-gray-700 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <Database className="text-red-500" />
             <h3 className="text-xl font-bold text-white uppercase tracking-wider">Costo Global (6 Slots)</h3>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-center">
             <div>
                <div className="text-xs text-gray-500 uppercase">Gold Frag</div>
                <div className="text-2xl font-bold text-yellow-500">{totalGoldFrag.toLocaleString()}</div>
             </div>
             <div>
                <div className="text-xs text-gray-500 uppercase">Polish</div>
                <div className="text-2xl font-bold text-gray-300">{totalPolish.toLocaleString()}</div>
             </div>
             <div>
                <div className="text-xs text-gray-500 uppercase">BluePrint</div>
                <div className="text-2xl font-bold text-blue-400">{totalBluePrint.toLocaleString()}</div>
             </div>
             <div>
                <div className="text-xs text-gray-500 uppercase">Advance Polish</div>
                <div className="text-2xl font-bold text-red-500">{totalAdvancePolish.toLocaleString()}</div>
             </div>
          </div>
        </div>
      </div>

      {/* Select Modal */}
      <AnimatePresence>
        {isSelecting && (
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
              className="bg-[#1a1f2e] border border-gray-700 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h3 className="font-bebas text-xl text-white">SELECCIONAR NIVEL {isSelecting === 'current' ? 'ACTUAL' : 'OBJETIVO'}</h3>
                <button onClick={() => setIsSelecting(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="overflow-y-auto p-4 flex flex-col gap-3">
                {TREASURE_TIERS.map((tier, idx) => {
                  const style = getRarityStyle(tier.rarity);
                  const isSelected = idx === slots[activeSlot][isSelecting];
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectTier(idx)}
                      className={`relative flex justify-between items-center px-4 py-3 rounded-lg border transition-all duration-300 overflow-visible ${
                        isSelected 
                          ? `border-solid ${style.border} ${style.bg} ${style.shadow} scale-[1.02]` 
                          : 'border-solid border-gray-800 bg-[#232838] hover:border-gray-600'
                      }`}
                    >
                      {/* Gradient Bottom Border */}
                      {isSelected && (
                        <div className={`absolute -bottom-[2px] left-0 w-full h-[2px] bg-gradient-to-r ${style.gradient} rounded-b-lg opacity-80`} />
                      )}

                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-3 h-3 rounded-full ${style.bg} border ${style.border} ${style.shadow}`} />
                        <span className={`font-mono text-sm ${isSelected ? 'text-white font-bold drop-shadow-md' : 'text-gray-400'}`}>{tier.id}</span>
                      </div>
                      
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0.5, opacity: 0, x: -20, rotate: -20 }}
                          animate={{ scale: 1.4, opacity: 1, x: 5, rotate: 12 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                        >
                          <img 
                            src={`/tesoros/Treasure_${activeSlot + 1}.webp`} 
                            alt="Selected" 
                            className="w-14 h-14 object-contain"
                          />
                        </motion.div>
                      )}
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
