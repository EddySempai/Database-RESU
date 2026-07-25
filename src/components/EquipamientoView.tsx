import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Shield, ChevronRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateWeaponExp, calculateWeaponPlus, convertWeaponExpToMaterials, calculateUniqueWeaponFrags } from '../utils/weaponCalculators';

interface SlotState {
  id: string;
  name: string;
  type: 'Penetración' | 'Vida' | 'Exclusiva';
  currentLevel: number;
  targetLevel: number;
  currentPlus: number;
  targetPlus: number;
}

const isDefender = (type: string) => type?.toLowerCase().includes('defen') || type?.includes('ディフェン');
const isAttacker = (type: string) => type?.toLowerCase().includes('atac') || type?.toLowerCase().includes('attack') || type?.includes('アタッカー');

// Iconos de armas normales según tipo de unidad (Imagen 4)
// Rojo = Atacantes, Azul = Defensores, Verde = Ranger
const getNormalWeaponIcon = (unitType: string, slotId: string) => {
  const isDef = isDefender(unitType);
  const isAtk = isAttacker(unitType);

  if (slotId === 'armaGrande') {
    if (isAtk) return '/recursos/Item_Hero_Epuip_A_542.webp';
    if (isDef) return '/recursos/Item_Hero_Epuip_A_541.webp';
    return '/recursos/Item_Hero_Epuip_A_543.webp';
  }
  if (slotId === 'pistola') {
    if (isAtk) return '/recursos/Item_Hero_Epuip_A_512.webp';
    if (isDef) return '/recursos/Item_Hero_Epuip_A_511.webp';
    return '/recursos/Item_Hero_Epuip_A_513.webp';
  }
  if (slotId === 'revolver') {
    if (isAtk) return '/recursos/Item_Hero_Epuip_A_522.webp';
    if (isDef) return '/recursos/Item_Hero_Epuip_A_521.webp';
    return '/recursos/Item_Hero_Epuip_A_523.webp';
  }
  if (slotId === 'cuchillo') {
    if (isAtk) return '/recursos/Item_Hero_Epuip_A_532.webp';
    if (isDef) return '/recursos/Item_Hero_Epuip_A_531.webp';
    return '/recursos/Item_Hero_Epuip_A_533.webp';
  }
  return '/recursos/Item_Hero_Epuip_A_511.webp';
};

// Mapeo oficial de Armas Exclusivas por Personaje (13000 -> 13015)
const characterWeaponCodeMap: Record<string, string> = {
  leon: '13000',
  claire: '13001',
  carlos: '13002',
  ada: '13003',
  jill: '13004',
  chris: '13005',
  chirs: '13005',
  rebecca: '13006',
  billy: '13007',
  billie: '13007',
  krauser: '13008',
  luis: '13009',
  ashley: '13010',
  asheley: '13010',
  jake: '13011',
  sherry: '13012',
  piers: '13013',
  cazador: '13014',
  cazadora: '13015',
};

const getWeaponCodeByCharacter = (characterId: string): string => {
  const id = characterId?.toLowerCase() || '';
  for (const key of Object.keys(characterWeaponCodeMap)) {
    if (id.includes(key)) {
      return characterWeaponCodeMap[key];
    }
  }
  return '13000';
};

// Icono de Arma Única / Exclusiva para Personajes Legendarios
const getUniqueWeaponIcon = (characterId: string) => {
  const code = getWeaponCodeByCharacter(characterId);
  return `/recursos/Item_Hero_Epuip_A_${code}.webp`;
};

// Icono de Fragmento / Pieza de Arma Única para Personajes Legendarios
const getUniqueWeaponPieceIcon = (characterId: string) => {
  const code = getWeaponCodeByCharacter(characterId);
  return `/recursos/Item_Hero_Epuip_Piece_A_${code}.webp`;
};

export default function EquipamientoView({ op }: { op: any }) {
  const { t } = useTranslation();
  const isLegendary = op?.rarity?.toLowerCase() === 'legendario' || op?.rarity?.toLowerCase() === 'legendary';

  const buildInitialSlots = (): SlotState[] => {
    const list: SlotState[] = [
      { id: 'armaGrande', name: t('op_detail.big_gun'), type: 'Penetración', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 20 },
      { id: 'pistola', name: t('op_detail.pistol'), type: 'Penetración', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 20 },
      { id: 'revolver', name: t('op_detail.revolver'), type: 'Vida', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 20 },
      { id: 'cuchillo', name: t('op_detail.knife'), type: 'Vida', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 20 }
    ];

    if (isLegendary) {
      list.push({
        id: 'armaUnica',
        name: `Arma Exclusiva (${op?.name || 'Legendario'})`,
        type: 'Exclusiva',
        currentLevel: 0,
        targetLevel: 10,
        currentPlus: 0,
        targetPlus: 0
      });
    }

    return list;
  };

  const [slots, setSlots] = useState<SlotState[]>(buildInitialSlots);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    setSlots(buildInitialSlots());
  }, [op?.id, op?.rarity]);

  const localImage = `/operativos/${op.imageUrl.split('/').pop()}`;
  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  const updateSlot = (id: string, updates: Partial<SlotState>) => {
    setSlots(slots.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Calculate totals
  let totalExp = 0;
  let totalPlus = 0;
  let uniqueFrags = 0;

  const slotCosts = slots.map(slot => {
    if (slot.id === 'armaUnica') {
      const frags = calculateUniqueWeaponFrags(slot.currentLevel, slot.targetLevel);
      uniqueFrags += frags;
      return { id: slot.id, exp: 0, plus: 0, frags, name: slot.name, isUnique: true };
    }
    const exp = calculateWeaponExp(slot.currentLevel, slot.targetLevel);
    const plus = calculateWeaponPlus(slot.currentPlus, slot.targetPlus);
    totalExp += exp;
    totalPlus += plus;
    return { id: slot.id, exp, plus, frags: 0, name: slot.name, isUnique: false };
  });

  const materials = convertWeaponExpToMaterials(totalExp);

  return (
    <div className="w-full relative flex flex-col items-center">
      
      {/* Layout Visual del Operativo y sus Equipamientos */}
      <div className="w-full max-w-4xl relative h-[560px] flex items-center justify-center mb-8">
        
        {/* Character Image */}
        <div className="absolute inset-0 flex justify-center items-end opacity-90 pointer-events-none">
          <img 
            src={localImage} 
            alt={op.name} 
            className="h-[95%] md:h-full object-contain filter drop-shadow-[0_0_25px_rgba(255,0,0,0.15)]"
          />
        </div>

        {/* 4 Normal Weapon Slots */}
        <div className="absolute inset-0 flex justify-between items-center px-4 md:px-12 pointer-events-none">
          {/* Left Side (Penetración: Arma Grande y Pistola) */}
          <div className="flex flex-col gap-20 pointer-events-auto">
            {[slots[0], slots[1]].map(slot => slot && (
              <WeaponSlotNode 
                key={slot.id} 
                slot={slot} 
                iconUrl={getNormalWeaponIcon(op.unitType, slot.id)}
                onClick={() => setSelectedSlotId(slot.id)} 
              />
            ))}
          </div>

          {/* Right Side (Vida: Revólver y Cuchillo) */}
          <div className="flex flex-col gap-20 pointer-events-auto">
            {[slots[2], slots[3]].map(slot => slot && (
              <WeaponSlotNode 
                key={slot.id} 
                slot={slot} 
                iconUrl={getNormalWeaponIcon(op.unitType, slot.id)}
                onClick={() => setSelectedSlotId(slot.id)} 
                right 
              />
            ))}
          </div>
        </div>

        {/* BOTTOM CENTER: ARMA ÚNICA / EXCLUSIVA PARA PERSONAJES LEGENDARIOS */}
        {isLegendary && slots.find(s => s.id === 'armaUnica') && (
          <div className="absolute bottom-1 z-20 flex flex-col items-center pointer-events-auto">
            <button
              onClick={() => setSelectedSlotId('armaUnica')}
              className="group relative flex flex-col items-center transition-transform hover:scale-105"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#3b2e0c] via-[#1a1405] to-[#0a0803] border-2 border-yellow-500 rounded-md flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_25px_rgba(234,179,8,0.5)] group-hover:shadow-[0_0_35px_rgba(234,179,8,0.8)] transition-all">
                <img 
                  src={getUniqueWeaponIcon(op.id)} 
                  alt="Arma Exclusiva" 
                  className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" 
                />
                <div className="absolute bottom-0 w-full bg-black/90 font-mono text-[9px] text-yellow-400 font-bold text-center py-0.5 border-t border-yellow-500/50">
                  Nv.{slots.find(s => s.id === 'armaUnica')?.currentLevel || 0}
                </div>
              </div>
              <span className="font-bebas text-base md:text-lg text-yellow-400 tracking-widest mt-1 drop-shadow flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" /> Arma Exclusiva
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Editor de Nivel de Arma */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            className="fixed top-1/2 left-1/2 z-50 w-[95%] max-w-2xl bg-[#0a0a0a] border border-yellow-500/50 shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 backdrop-blur-md rounded-sm"
          >
            <button onClick={() => setSelectedSlotId(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              {selectedSlot.type === 'Exclusiva' ? (
                <Star className="text-yellow-400 fill-yellow-400" />
              ) : selectedSlot.type === 'Penetración' ? (
                <Sword className="text-neon-red" />
              ) : (
                <Shield className="text-blue-500" />
              )}
              <h3 className="font-bebas text-3xl text-white tracking-widest">{selectedSlot.name}</h3>
              <span className="font-mono text-xs uppercase text-yellow-400 bg-yellow-500/10 px-2 py-1 ml-auto mr-8 border border-yellow-500/30 rounded-sm">
                {selectedSlot.type === 'Exclusiva' ? 'Arma Única' : selectedSlot.type}
              </span>
            </div>

            {/* SI ES ARMA ÚNICA LEGENDARIA (NV 0 A 10) */}
            {selectedSlot.type === 'Exclusiva' ? (
              <div className="border border-yellow-500/30 p-6 bg-yellow-950/10 rounded-sm">
                <h4 className="font-mono text-yellow-400 text-xs uppercase tracking-widest text-center mb-6">
                  Nivel de Arma Exclusiva
                </h4>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] text-gray-400 font-mono uppercase mb-2">Nivel Actual</label>
                    <input 
                      type="number" min="0" max="10" 
                      value={selectedSlot.currentLevel}
                      onChange={e => updateSlot(selectedSlot.id, { currentLevel: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                      className="w-full bg-transparent border-b-2 border-gray-700 text-white text-3xl font-bebas text-center focus:border-yellow-400 outline-none pb-1"
                    />
                  </div>
                  <ChevronRight className="text-yellow-500" size={24} />
                  <div className="flex-1">
                    <label className="block text-[10px] text-gray-400 font-mono uppercase mb-2 text-right">Nivel Objetivo</label>
                    <input 
                      type="number" min="0" max="10" 
                      value={selectedSlot.targetLevel}
                      onChange={e => updateSlot(selectedSlot.id, { targetLevel: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                      className="w-full bg-transparent border-b-2 border-yellow-400 text-yellow-400 text-3xl font-bebas text-center focus:border-white outline-none pb-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* ARMAS NORMALES (NV 1-100 & MEJORA +0-20) */
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
            )}
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
          
          {/* Detailed Breakdown with Gold Gradients & Weapon Icons */}
          <div className="border border-gray-800 p-6 bg-black/40">
            <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">{t('op_detail.breakdown')}</h3>
            <div className="space-y-3">
              {slotCosts.map((s, i) => {
                const iconUrl = s.isUnique 
                  ? getUniqueWeaponIcon(op.id)
                  : getNormalWeaponIcon(op.unitType, s.id);

                return (
                  <div 
                    key={i} 
                    className="bg-gradient-to-r from-yellow-500/15 via-[#080808] to-transparent border border-yellow-500/30 p-3 rounded-sm flex justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={iconUrl} 
                        alt={s.name} 
                        className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" 
                      />
                      <span className="font-mono text-sm text-gray-200 font-bold truncate">{s.name}</span>
                    </div>

                    <div className="text-right shrink-0">
                      {s.isUnique ? (
                        <div className="font-bebas text-xl text-yellow-400 tracking-widest">{s.frags.toLocaleString()} Fragmentos</div>
                      ) : (
                        <>
                          <div className="font-bebas text-xl text-neon-red tracking-widest">{s.exp.toLocaleString()} EXP</div>
                          <div className="font-mono text-xs text-yellow-500">{s.plus.toLocaleString()} Componentes</div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
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

            {isLegendary && (
              <div className="bg-yellow-950/20 border border-yellow-500/40 p-4 rounded-sm flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <img src={getUniqueWeaponPieceIcon(op.id)} alt="Pieza de Arma Exclusiva" className="w-10 h-10 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                  <span className="font-mono text-xs text-yellow-400 uppercase tracking-wider text-left">Total Fragmentos Arma Exclusiva</span>
                </div>
                <span className="font-bebas text-4xl text-yellow-400">{uniqueFrags.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function WeaponSlotNode({ slot, iconUrl, onClick, right = false }: { slot: SlotState, iconUrl: string, onClick: () => void, right?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`group relative flex items-center gap-4 transition-transform hover:scale-105 ${right ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#3b2e0c] via-[#1a1405] to-[#0a0803] border-2 border-yellow-500/80 group-hover:border-yellow-400 rounded-md flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] transition-all">
        <img src={iconUrl} alt={slot.name} className="w-12 h-12 md:w-14 md:h-14 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" />
        <div className="absolute bottom-0 w-full bg-black/90 font-mono text-[9px] text-yellow-400 font-bold text-center py-0.5 border-t border-yellow-500/40">
          Lv.{slot.currentLevel}
        </div>
      </div>
      <div className={`flex flex-col ${right ? 'items-end' : 'items-start'}`}>
        <span className="font-bebas text-xl text-white tracking-widest drop-shadow-md">{slot.name}</span>
        <span className="font-mono text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 border border-yellow-500/30 rounded-sm">
          +{slot.currentPlus}
        </span>
      </div>
    </button>
  );
}
