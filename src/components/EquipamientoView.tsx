import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Shield, Crosshair, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateWeaponExp, calculateWeaponPlus, convertWeaponExpToMaterials } from '../utils/weaponCalculators';

interface SlotState {
  id: string;
  name: string;
  type: 'Penetración' | 'Vida';
  currentLevel: number;
  targetLevel: number;
  currentPlus: number;
  targetPlus: number;
}

export default function EquipamientoView({ op }: { op: any }) {
  const { t } = useTranslation();
  
  const initialSlots: SlotState[] = [
    { id: 'armaGrande', name: t('op_detail.big_gun'), type: 'Penetración', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 20 },
    { id: 'pistola', name: t('op_detail.pistol'), type: 'Penetración', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 20 },
    { id: 'revolver', name: t('op_detail.revolver'), type: 'Vida', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 20 },
    { id: 'cuchillo', name: t('op_detail.knife'), type: 'Vida', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 20 }
  ];

  const [slots, setSlots] = useState<SlotState[]>(initialSlots);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const localImage = `/operativos/${op.imageUrl.split('/').pop()}`;

  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  const updateSlot = (id: string, updates: Partial<SlotState>) => {
    setSlots(slots.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Calculate totals
  let totalExp = 0;
  let totalPlus = 0;
  const slotCosts = slots.map(slot => {
    const exp = calculateWeaponExp(slot.currentLevel, slot.targetLevel);
    const plus = calculateWeaponPlus(slot.currentPlus, slot.targetPlus);
    totalExp += exp;
    totalPlus += plus;
    return { id: slot.id, exp, plus, name: slot.name };
  });

  const materials = convertWeaponExpToMaterials(totalExp);

  return (
    <div className="w-full relative flex flex-col items-center">
      
      {/* Background / Layout */}
      <div className="w-full max-w-4xl relative h-[600px] flex items-center justify-center mb-8">
        {/* Character Image */}
        <div className="absolute inset-0 flex justify-center items-end opacity-90">
          <img 
            src={localImage} 
            alt={op.name} 
            className="h-full md:h-[105%] object-contain filter drop-shadow-[0_0_30px_rgba(255,0,0,0.2)]"
            style={{ maskImage: 'linear-gradient(to top, transparent 0%, black 20%)', WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 20%)' }}
          />
        </div>

        {/* 4 Weapon Slots */}
        <div className="absolute inset-0 flex justify-between items-center px-4 md:px-12 pointer-events-none">
          {/* Left Side (Penetration) */}
          <div className="flex flex-col gap-24 pointer-events-auto">
            {[slots[0], slots[1]].map(slot => (
              <WeaponSlotNode key={slot.id} slot={slot} onClick={() => setSelectedSlotId(slot.id)} />
            ))}
          </div>

          {/* Right Side (Life) */}
          <div className="flex flex-col gap-24 pointer-events-auto">
            {[slots[2], slots[3]].map(slot => (
              <WeaponSlotNode key={slot.id} slot={slot} onClick={() => setSelectedSlotId(slot.id)} right />
            ))}
          </div>
        </div>
      </div>

      {/* Calculator Editor Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            className="fixed top-1/2 left-1/2 z-50 w-[95%] max-w-2xl bg-[#0a0a0a] border border-blood-red/50 shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 backdrop-blur-md"
          >
            <button onClick={() => setSelectedSlotId(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              {selectedSlot.type === 'Penetración' ? <Sword className="text-neon-red" /> : <Shield className="text-blue-500" />}
              <h3 className="font-bebas text-3xl text-white tracking-widest">{selectedSlot.name}</h3>
              <span className="font-mono text-xs uppercase text-gray-500 bg-gray-900 px-2 py-1 ml-auto mr-8 border border-gray-700">
                {selectedSlot.type}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                <div className="border border-gray-800 p-6 bg-black/50">
                  <h4 className="font-mono text-gray-400 text-xs uppercase tracking-widest text-center mb-6">{t('op_detail.base_level')}</h4>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-600 font-mono uppercase mb-2">ACTUAL</label>
                      <input 
                        type="number" min="1" max="100" 
                        value={selectedSlot.currentLevel}
                        onChange={e => updateSlot(selectedSlot.id, { currentLevel: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
                        className="w-full bg-transparent border-b-2 border-gray-800 text-white text-3xl font-bebas text-center focus:border-neon-red outline-none pb-1"
                      />
                    </div>
                    <ChevronRight className="text-gray-700" size={24} />
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-600 font-mono uppercase mb-2 text-right">OBJETIVO</label>
                      <input 
                        type="number" min="1" max="100" 
                        value={selectedSlot.targetLevel}
                        onChange={e => updateSlot(selectedSlot.id, { targetLevel: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
                        className="w-full bg-transparent border-b-2 border-blood-red text-neon-red text-3xl font-bebas text-center focus:border-white outline-none pb-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-800 p-6 bg-black/50">
                  <h4 className="font-mono text-gray-400 text-xs uppercase tracking-widest text-center mb-6">{t('op_detail.plus_level')}</h4>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Actual</label>
                    <input 
                      type="number" min="0" max="20" 
                      value={selectedSlot.currentPlus}
                      onChange={(e) => updateSlot(selectedSlot.id, { currentPlus: Math.min(20, Math.max(0, Number(e.target.value))) })}
                      className="w-full bg-transparent border-b border-gray-700 text-white font-bebas text-2xl outline-none focus:border-yellow-500 text-center"
                    />
                  </div>
                  <ChevronRight className="text-gray-600" />
                  <div className="flex-1">
                    <label className="text-[10px] font-mono text-gray-500 uppercase">Objetivo</label>
                    <input 
                      type="number" min="0" max="20" 
                      value={selectedSlot.targetPlus}
                      onChange={(e) => updateSlot(selectedSlot.id, { targetPlus: Math.min(20, Math.max(0, Number(e.target.value))) })}
                      className="w-full bg-transparent border-b border-gray-700 text-yellow-500 font-bebas text-2xl outline-none focus:border-yellow-500 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Equipment Total Summary */}
      <div className="w-full max-w-4xl mt-12 bg-[#050505] border-t border-gray-900 pt-12">
        <div className="text-center mb-10">
          <h2 className="font-bebas text-4xl text-white tracking-widest">{t('op_detail.equip_summary')}</h2>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">{t('op_detail.proj_resources')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Detailed Breakdown */}
          <div className="border border-gray-800 p-6 bg-black/40">
            <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">{t('op_detail.breakdown')}</h3>
            <div className="space-y-4">
              {slotCosts.map((s, i) => (
                <div key={i} className="flex justify-between items-center border border-gray-800/50 p-4">
                  <span className="font-mono text-sm text-gray-300">{s.name}</span>
                  <div className="text-right">
                    <div className="font-bebas text-xl text-neon-red tracking-widest">{s.exp.toLocaleString()} EXP</div>
                    <div className="font-mono text-xs text-yellow-500">{s.plus.toLocaleString()} {t('op_detail.components')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Totals */}
          <div className="space-y-6">
            <div className="border border-gray-800 p-6 bg-black/40 text-center">
              <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">{t('op_detail.total_exp_cost')}</h3>
              <div className="font-bebas text-6xl text-neon-red tracking-widest mb-8">{totalExp.toLocaleString()}</div>
              
              {/* Materials Conversion */}
              {totalExp > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800 text-left">
                  <p className="font-mono text-[10px] text-gray-500 uppercase mb-2">{t('op_detail.exp_equivalents')}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-green-900/20 text-green-400 border border-green-500/30 p-1 flex justify-between"><span>{t('op_detail.mat_green')}</span> <span>{materials.materialesVerdes.toLocaleString()}</span></div>
                    <div className="bg-purple-900/20 text-purple-400 border border-purple-500/30 p-1 flex justify-between"><span>{t('op_detail.mat_purple')}</span> <span>{materials.materialesMorados.toLocaleString()}</span></div>
                    <div className="bg-gray-800 text-gray-300 border border-gray-600 p-1 flex justify-between"><span>{t('op_detail.gun_gray')}</span> <span>{materials.armasGrises.toLocaleString()}</span></div>
                    <div className="bg-green-900/10 text-green-500 border border-green-700/50 p-1 flex justify-between"><span>{t('op_detail.gun_green')}</span> <span>{materials.armasVerdes.toLocaleString()}</span></div>
                    <div className="bg-blue-900/10 text-blue-400 border border-blue-700/50 p-1 flex justify-between"><span>{t('op_detail.gun_blue')}</span> <span>{materials.armasAzules.toLocaleString()}</span></div>
                    <div className="bg-purple-900/10 text-purple-400 border border-purple-700/50 p-1 flex justify-between"><span>{t('op_detail.gun_purple')}</span> <span>{materials.armasMoradas.toLocaleString()}</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-black border border-gray-800 p-4 text-center">
              <span className="block font-mono text-xs text-gray-500 uppercase mb-1">{t('op_detail.total_comp_cost')}</span>
              <span className="font-bebas text-5xl text-yellow-500">{totalPlus.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function WeaponSlotNode({ slot, onClick, right = false }: { slot: SlotState, onClick: () => void, right?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`group relative flex items-center gap-4 transition-transform hover:scale-105 ${right ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0a0a0a] border-2 border-gray-700 group-hover:border-white rounded-md flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)]">
        {slot.type === 'Penetración' ? <Crosshair className="text-gray-600 group-hover:text-neon-red w-8 h-8 transition-colors" /> : <Shield className="text-gray-600 group-hover:text-blue-500 w-8 h-8 transition-colors" />}
        <div className="absolute bottom-0 w-full bg-black/80 font-mono text-[9px] text-gray-300 py-0.5 border-t border-gray-800">
          Lv.{slot.currentLevel}
        </div>
      </div>
      <div className={`flex flex-col ${right ? 'items-end' : 'items-start'}`}>
        <span className="font-bebas text-xl text-white tracking-widest drop-shadow-md">{slot.name}</span>
        <span className="font-mono text-[10px] text-yellow-500 bg-yellow-500/10 px-1 border border-yellow-500/30">
          +{slot.currentPlus}
        </span>
      </div>
    </button>
  );
}
