import { useState } from 'react';
import { Database, ArrowDown, X, Search } from 'lucide-react';
import { JEWEL_TIERS, getJewelCostBetweenTiers, getJewelImageUrl, getJewelRarityStyle, TREASURE_GEM_COLORS } from '../data/jewels';
import type { JewelTier } from '../data/jewels';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Jewels() {
  const { t } = useTranslation();
  
  // 18 gems in total
  const [gems, setGems] = useState<{current: JewelTier, target: JewelTier}[]>(
    Array(18).fill({ current: 'None', target: 'None' })
  );
  
  const [activeSelect, setActiveSelect] = useState<{index: number, type: 'current' | 'target'} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Totals Calculation
  let totalRoughJewel = 0;
  let totalJewelTool = 0;

  gems.forEach(gem => {
    const cost = getJewelCostBetweenTiers(gem.current, gem.target);
    totalRoughJewel += cost.roughJewel;
    totalJewelTool += cost.jewelTool;
  });

  const handleSelectTier = (tier: JewelTier) => {
    if (!activeSelect) return;
    const newGems = [...gems];
    const s = activeSelect.index;
    const tierIndex = JEWEL_TIERS.indexOf(tier);
    
    if (activeSelect.type === 'current') {
       newGems[s] = { ...newGems[s], current: tier };
       if (tierIndex > JEWEL_TIERS.indexOf(newGems[s].target)) {
           newGems[s].target = tier;
       }
    } else {
       newGems[s] = { ...newGems[s], target: tier };
       if (tierIndex < JEWEL_TIERS.indexOf(newGems[s].current)) {
           newGems[s].current = tier;
       }
    }
    setGems(newGems);
    setActiveSelect(null);
  };

  const filteredTiers = JEWEL_TIERS.filter(tier => 
    tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 mt-8 mb-16 relative z-10">
      <div className="bg-[#0a0a0a]/90 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-8 border-b border-gray-800 pb-4 text-center">
          <h2 className="font-bebas text-4xl md:text-5xl text-white tracking-widest uppercase">
            {t('jewels.title', 'CALCULADORA DE GEMAS')}
          </h2>
        </div>

        {/* The 6 Treasures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 6 }).map((_, treasureIndex) => (
            <div key={treasureIndex} className="bg-black/40 p-4 rounded-xl border border-gray-800">
              <h3 className="text-gray-500 font-mono text-xs text-center border-b border-gray-800 pb-2 mb-4 uppercase">TREASURE {treasureIndex + 1}</h3>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Current State Box */}
                <div className="flex-1 flex flex-col items-center p-3 rounded-xl border border-gray-800 bg-[#0d0d0d] relative overflow-hidden">
                  <span className="absolute top-2 left-2 font-mono text-[9px] text-gray-500 uppercase">{t('jewels.current_tier', 'ACTUAL')}</span>
                  <div className="w-16 h-16 mb-4 mt-2">
                    <img src={`/tesoros/Treasure_${treasureIndex+1}.webp`} alt={`Treasure ${treasureIndex+1}`} className="w-full h-full object-contain filter drop-shadow-md" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64/222222/FFFFFF?text=T' + (treasureIndex+1))} />
                  </div>
                  <div className="flex gap-2 justify-center w-full">
                    {Array.from({ length: 3 }).map((_, colIndex) => {
                      const gemIndex = treasureIndex * 3 + colIndex;
                      const gem = gems[gemIndex];
                      const colorIndex = TREASURE_GEM_COLORS[treasureIndex][colIndex];
                      const isSet = gem.current !== 'None';
                      return (
                        <div 
                          key={colIndex}
                          onClick={() => setActiveSelect({index: gemIndex, type: 'current'})}
                          className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                            isSet 
                              ? 'bg-[#181818] border-gray-700 hover:border-gray-500 hover:bg-[#222]' 
                              : 'bg-black/40 border-dashed border-gray-800 hover:border-gray-600'
                          }`}
                        >
                          {isSet ? (
                            <img src={getJewelImageUrl(gem.current, colorIndex)} alt="Gem" className="w-8 h-8 object-contain filter drop-shadow-md" />
                          ) : (
                            <span className="text-gray-700 font-bold text-lg">+</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-gray-700 rotate-90 md:rotate-0">
                  <ArrowDown size={18} className="md:-rotate-90 text-gray-600" />
                </div>

                {/* Target State Box */}
                <div className="flex-1 flex flex-col items-center p-3 rounded-xl border border-red-950/60 bg-[#120a0a] relative overflow-hidden">
                  <span className="absolute top-2 left-2 font-mono text-[9px] text-red-800 uppercase">{t('jewels.target_tier', 'MEJORA')}</span>
                  <div className="w-16 h-16 mb-4 mt-2">
                    <img src={`/tesoros/Treasure_${treasureIndex+1}.webp`} alt={`Treasure ${treasureIndex+1}`} className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(239,68,68,0.25)]" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64/222222/FFFFFF?text=T' + (treasureIndex+1))} />
                  </div>
                  <div className="flex gap-2 justify-center w-full">
                    {Array.from({ length: 3 }).map((_, colIndex) => {
                      const gemIndex = treasureIndex * 3 + colIndex;
                      const gem = gems[gemIndex];
                      const colorIndex = TREASURE_GEM_COLORS[treasureIndex][colIndex];
                      const isSet = gem.target !== 'None';
                      return (
                        <div 
                          key={colIndex}
                          onClick={() => setActiveSelect({index: gemIndex, type: 'target'})}
                          className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                            isSet 
                              ? 'bg-[#221010] border-red-900/60 hover:border-red-500 hover:bg-[#2e1515] shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                              : 'bg-black/40 border-dashed border-red-950/40 hover:border-red-900/60'
                          }`}
                        >
                          {isSet ? (
                            <img src={getJewelImageUrl(gem.target, colorIndex)} alt="Gem" className="w-8 h-8 object-contain filter drop-shadow-md" />
                          ) : (
                            <span className="text-red-950 font-bold text-lg">+</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Global Cost Summary */}
        <div className="bg-black/60 border border-gray-800 rounded-xl p-6 md:p-8">
          <h3 className="font-bebas text-2xl text-white mb-6 flex items-center gap-2">
            <Database className="text-neon-red" />
            {t('jewels.total_resources', 'TOTAL DE RECURSOS')}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div className="bg-[#111] border border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent" />
              <img src="/jewels/Item_Jewel_material_02.webp" alt="Rough Jewel" className="w-10 h-10 mb-2 z-10 drop-shadow-md" />
              <span className="text-gray-400 font-mono text-xs mb-1 z-10 uppercase">{t('jewels.rough_jewel', 'Joya en bruto')}</span>
              <span className="text-2xl md:text-4xl font-bebas text-purple-300 z-10">{totalRoughJewel.toLocaleString()}</span>
            </div>

            <div className="bg-[#111] border border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent" />
              <img src="/jewels/Item_Jewel_material_01.webp" alt="Jewel Tool" className="w-10 h-10 mb-2 z-10 drop-shadow-md" />
              <span className="text-gray-400 font-mono text-xs mb-1 z-10 uppercase">{t('jewels.jewel_tool', 'Herramienta de tallado')}</span>
              <span className="text-2xl md:text-4xl font-bebas text-neon-red z-10">{totalJewelTool.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Modal for Tier Selection */}
      <AnimatePresence>
        {activeSelect !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSelect(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0f0f0f] border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#151515] rounded-t-xl">
                <h3 className="font-bebas text-2xl text-white tracking-widest uppercase">
                  {activeSelect.type === 'current' ? t('jewels.select_current', 'SELECCIONAR ACTUAL') : t('jewels.select_target', 'SELECCIONAR OBJETIVO')}
                </h3>
                <button 
                  onClick={() => setActiveSelect(null)}
                  className="text-gray-500 hover:text-white transition-colors p-1"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-4 border-b border-gray-800/50 bg-[#151515]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder={t('jewels.search_placeholder', 'Buscar nivel...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white font-mono text-xs focus:outline-none focus:border-red-900 transition-colors placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredTiers.map((tier) => {
                    const isSelected = activeSelect.type === 'current' 
                      ? gems[activeSelect.index].current === tier
                      : gems[activeSelect.index].target === tier;

                    const style = getJewelRarityStyle(tier);
                    const treasureIdx = Math.floor(activeSelect.index / 3);
                    const colIdx = activeSelect.index % 3;
                    const colorIndex = TREASURE_GEM_COLORS[treasureIdx][colIdx];

                    return (
                      <button
                        key={tier}
                        onClick={() => handleSelectTier(tier)}
                        className={`py-3 px-2 rounded-lg border font-bebas text-sm flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                          isSelected 
                            ? `${style.bg} border-white ${style.text} ${style.shadow} scale-105 brightness-125`
                            : `${style.bg} ${style.border} ${style.text} opacity-80 ${style.hover}`
                        }`}
                      >
                        {tier !== 'None' ? (
                          <img src={getJewelImageUrl(tier, colorIndex)} alt={tier} className="w-8 h-8 object-contain filter drop-shadow-md" />
                        ) : (
                          <span className="text-gray-500 font-mono text-xs py-1">NINGUNO</span>
                        )}
                        <span>{tier}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
