import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Shield, ChevronRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  calculateWeaponExp, 
  calculateWeaponPlus, 
  convertWeaponExpToMaterials,
  calculateUniqueWeaponFrags
} from '../utils/weaponCalculators';

interface SlotState {
  id: string;
  name: string;
  type: 'Penetración' | 'Vida' | 'Exclusiva';
  currentLevel: number;
  targetLevel: number;
  currentPlus: number;
  targetPlus: number;
}

interface EquipamientoViewProps {
  op: {
    id: string;
    name: string;
    unitType: string;
    rarity?: string;
    imageUrl: string;
  };
}

// Mapeo de personajes legendarios a su ID de Pieza/Arma Exclusiva (13000 a 13015)
const characterWeaponCodeMap: Record<string, string> = {
  '1': '13000', // Leon S. Kennedy
  '2': '13001', // Claire Redfield
  '3': '13002', // Carlos Oliveira
  '4': '13003', // Ada Wong
  '5': '13004', // Jill Valentine
  '6': '13005', // Chris Redfield
  '7': '13006', // Rebecca Chambers
  '8': '13007', // Billy Coen
  '9': '13008', // Jack Krauser
  '10': '13009', // Luis Sera
  '11': '13010', // Ashley Graham
  '12': '13011', // Jake Muller
  '13': '13012', // Sherry Birkin
  '14': '13013', // Piers Nivans
  '15': '13014', // Cazador (Hunter M)
  '16': '13015', // Cazadora (Hunter F)
};

const getNormalWeaponIcon = (unitType: string, slotId: string) => {
  const isDefender = unitType?.toLowerCase().includes('defen') || unitType?.includes('ディフェン');
  const isRanger = unitType?.toLowerCase().includes('rang') || unitType?.includes('レンジャー');
  const suffix = isDefender ? '541' : (isRanger ? '543' : '542');
  
  if (slotId === 'armaPrincipal') return `/recursos/Item_Hero_Epuip_A_${suffix}.webp`;
  if (slotId === 'pistola') return `/recursos/Item_Hero_Epuip_A_${isDefender ? '511' : (isRanger ? '513' : '512')}.webp`;
  if (slotId === 'revolver') return `/recursos/Item_Hero_Epuip_A_${isDefender ? '521' : (isRanger ? '523' : '522')}.webp`;
  if (slotId === 'cuchillo') return `/recursos/Item_Hero_Epuip_A_${isDefender ? '531' : (isRanger ? '533' : '532')}.webp`;
  
  return `/recursos/Item_Hero_Epuip_A_512.webp`;
};

const getUniqueWeaponIcon = (opId: string) => {
  const code = characterWeaponCodeMap[opId] || '13000';
  return `/recursos/Item_Hero_Epuip_A_${code}.webp`;
};

const getUniqueWeaponPieceIcon = (opId: string) => {
  const code = characterWeaponCodeMap[opId] || '13000';
  return `/recursos/Item_Hero_Epuip_Piece_A_${code}.webp`;
};

export default function EquipamientoView({ op }: EquipamientoViewProps) {
  const { t } = useTranslation();
  const isLegendary = op.rarity?.toLowerCase().includes('legen') || op.rarity?.includes('レジェン');

  const buildInitialSlots = (): SlotState[] => {
    const list: SlotState[] = [
      { id: 'armaPrincipal', name: 'Arma Grande', type: 'Penetración', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 0 },
      { id: 'pistola', name: 'Pistola', type: 'Penetración', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 0 },
      { id: 'revolver', name: 'Revólver', type: 'Vida', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 0 },
      { id: 'cuchillo', name: 'Cuchillo', type: 'Vida', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 0 },
    ];

    if (isLegendary) {
      list.push({
        id: 'armaUnica',
        name: 'Arma Exclusiva',
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full relative flex flex-col items-center"
    >
      
      {/* Layout Visual del Operativo y sus Equipamientos */}
      <div className="w-full max-w-4xl relative h-[560px] flex items-center justify-center mb-8">
        
        {/* Hero Character Image with smooth glow fade-in */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="absolute inset-0 flex justify-center items-end pointer-events-none"
        >
          <img 
            src={localImage} 
            alt={op.name} 
            className="h-[95%] md:h-full object-contain filter drop-shadow-[0_0_35px_rgba(234,179,8,0.2)]"
          />
        </motion.div>

        {/* 4 Normal Weapon Slots */}
        <div className="absolute inset-0 flex justify-between items-center px-4 md:px-12 pointer-events-none">
          
          {/* Left Side Slots (Penetración) - Animated Flying in from Left */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex flex-col gap-20 pointer-events-auto"
          >
            {[slots[0], slots[1]].map(slot => slot && (
              <WeaponSlotNode 
                key={slot.id} 
                slot={slot} 
                iconUrl={getNormalWeaponIcon(op.unitType, slot.id)}
                onClick={() => setSelectedSlotId(slot.id)} 
              />
            ))}
          </motion.div>

          {/* Right Side Slots (Vida) - Animated Flying in from Right */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex flex-col gap-20 pointer-events-auto"
          >
            {[slots[2], slots[3]].map(slot => slot && (
              <WeaponSlotNode 
                key={slot.id} 
                slot={slot} 
                iconUrl={getNormalWeaponIcon(op.unitType, slot.id)}
                onClick={() => setSelectedSlotId(slot.id)} 
                right 
              />
            ))}
          </motion.div>
        </div>

        {/* BOTTOM CENTER: ARMA ÚNICA / EXCLUSIVA PARA PERSONAJES LEGENDARIOS */}
        {isLegendary && slots.find(s => s.id === 'armaUnica') && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 250, delay: 0.35 }}
            className="absolute bottom-1 z-20 flex flex-col items-center pointer-events-auto"
          >
            <motion.button
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedSlotId('armaUnica')}
              className="group relative flex flex-col items-center cursor-pointer"
            >
              {/* Dynamic Golden Energy Pulsing Ring on Hover */}
              <div className="absolute -inset-3 rounded-2xl bg-yellow-500/0 group-hover:bg-yellow-500/25 blur-lg transition-all duration-300 pointer-events-none" />
              
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#3b2e0c] via-[#1a1405] to-[#0a0803] border-2 border-yellow-500 rounded-md flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_25px_rgba(234,179,8,0.5)] group-hover:shadow-[0_0_40px_rgba(234,179,8,0.9)] transition-all">
                <img 
                  src={getUniqueWeaponIcon(op.id)} 
                  alt="Arma Exclusiva" 
                  className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-300" 
                />
                <div className="absolute bottom-0 w-full bg-black/90 font-mono text-[9px] text-yellow-400 font-bold text-center py-0.5 border-t border-yellow-500/50">
                  Nv.{slots.find(s => s.id === 'armaUnica')?.currentLevel || 0}
                </div>
              </div>
              <span className="font-bebas text-base md:text-lg text-yellow-400 tracking-widest mt-1 drop-shadow flex items-center gap-1 group-hover:text-yellow-300">
                <Star size={14} className="fill-yellow-400 text-yellow-400 animate-spin-slow" /> Arma Exclusiva
              </span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* MODAL EDITOR CENTRADO IMPECABLEMENTE CON FLEXBOX */}
      <AnimatePresence>
        {selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Darkened Blur Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedSlotId(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal HUD Táctico Centrado en Pantalla */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative z-10 w-full max-w-2xl bg-[#09090b] border-2 border-yellow-500/60 shadow-[0_0_60px_rgba(234,179,8,0.35)] p-6 md:p-8 backdrop-blur-xl rounded-lg overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedSlotId(null)} 
                className="absolute top-4 right-4 z-30 text-gray-400 hover:text-white bg-black/60 hover:bg-yellow-500/20 border border-gray-800 hover:border-yellow-500/50 p-1.5 rounded-full transition-all duration-200"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6 border-b border-yellow-500/20 pb-4 relative z-20">
                {selectedSlot.type === 'Exclusiva' ? (
                  <div className="p-2 bg-yellow-500/20 rounded-md border border-yellow-500/40">
                    <Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={24} />
                  </div>
                ) : selectedSlot.type === 'Penetración' ? (
                  <div className="p-2 bg-red-950/30 rounded-md border border-red-800/40">
                    <Sword className="text-neon-red" size={24} />
                  </div>
                ) : (
                  <div className="p-2 bg-blue-950/30 rounded-md border border-blue-800/40">
                    <Shield className="text-blue-500" size={24} />
                  </div>
                )}
                <div>
                  <h3 className="font-bebas text-3xl md:text-4xl text-white tracking-widest leading-none">
                    {selectedSlot.name}
                  </h3>
                  <span className="font-mono text-[10px] uppercase text-yellow-400 tracking-wider">
                    {selectedSlot.type === 'Exclusiva' ? 'Arma Exclusiva Legendaria' : `Slot de ${selectedSlot.type}`}
                  </span>
                </div>
              </div>

              {/* Vista Previa Flotante del Arma con Resplandor Dorado Elegante */}
              <div className="flex justify-center mb-6 relative z-20">
                <div className="relative flex items-center justify-center p-6 bg-gradient-to-b from-[#1a1405] via-[#0d0a03] to-[#050401] border-2 border-yellow-500/40 rounded-xl w-full max-w-sm overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.25)]">
                  
                  {/* Resplandor Suave de Luz Dorada */}
                  <motion.div 
                    animate={{ 
                      opacity: [0.4, 0.7, 0.4],
                      scale: [1, 1.08, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/25 via-amber-600/10 to-transparent pointer-events-none"
                  />

                  {/* Resplandor de Fondo detrás del Arma */}
                  <div className="absolute w-36 h-36 bg-yellow-500/20 rounded-full blur-2xl pointer-events-none" />

                  {/* Imagen Flotante del Arma */}
                  <motion.img 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    src={selectedSlot.type === 'Exclusiva' ? getUniqueWeaponIcon(op.id) : getNormalWeaponIcon(op.unitType, selectedSlot.id)}
                    alt={selectedSlot.name}
                    className="h-28 md:h-32 object-contain filter drop-shadow-[0_4px_25px_rgba(234,179,8,0.5)] relative z-20"
                  />

                  {/* Borde Inferior Dorado Brillante */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_10px_#facc15]" />
                </div>
              </div>

              {/* CONTROLES DE NIVEL */}
              {selectedSlot.type === 'Exclusiva' ? (
                <div className="border border-yellow-500/30 p-6 bg-yellow-950/20 rounded-md relative z-20">
                  <h4 className="font-mono text-yellow-400 text-xs uppercase tracking-widest text-center mb-6">
                    Nivel de Arma Exclusiva (0 ➔ 10)
                  </h4>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-400 font-mono uppercase mb-2 text-center">Nivel Actual</label>
                      <input 
                        type="number" min="0" max="10" 
                        value={selectedSlot.currentLevel}
                        onChange={e => updateSlot(selectedSlot.id, { currentLevel: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-black/60 border-b-2 border-gray-700 text-white text-3xl font-bebas text-center focus:border-yellow-400 outline-none pb-1 rounded-t-sm"
                      />
                    </div>
                    <ChevronRight className="text-yellow-500 animate-pulse" size={28} />
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-400 font-mono uppercase mb-2 text-center">Nivel Objetivo</label>
                      <input 
                        type="number" min="0" max="10" 
                        value={selectedSlot.targetLevel}
                        onChange={e => updateSlot(selectedSlot.id, { targetLevel: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-black/60 border-b-2 border-yellow-400 text-yellow-400 text-3xl font-bebas text-center focus:border-white outline-none pb-1 rounded-t-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* ARMAS NORMALES */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 relative z-20">
                  <div className="border border-gray-800 p-5 bg-black/60 rounded-md">
                    <h4 className="font-mono text-gray-400 text-xs uppercase tracking-widest text-center mb-4">{t('op_detail.base_level')}</h4>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 font-mono uppercase mb-1 text-center">ACTUAL</label>
                        <input 
                          type="number" min="1" max="100" 
                          value={selectedSlot.currentLevel}
                          onChange={e => updateSlot(selectedSlot.id, { currentLevel: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
                          className="w-full bg-black border-b-2 border-gray-800 text-white text-2xl font-bebas text-center focus:border-neon-red outline-none pb-1"
                        />
                      </div>
                      <ChevronRight className="text-gray-600" size={20} />
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 font-mono uppercase mb-1 text-center">OBJETIVO</label>
                        <input 
                          type="number" min="1" max="100" 
                          value={selectedSlot.targetLevel}
                          onChange={e => updateSlot(selectedSlot.id, { targetLevel: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
                          className="w-full bg-black border-b-2 border-blood-red text-neon-red text-2xl font-bebas text-center focus:border-white outline-none pb-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-800 p-5 bg-black/60 rounded-md">
                    <h4 className="font-mono text-gray-400 text-xs uppercase tracking-widest text-center mb-4">{t('op_detail.plus_level')}</h4>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 font-mono uppercase mb-1 text-center">ACTUAL</label>
                        <input 
                          type="number" min="0" max="20" 
                          value={selectedSlot.currentPlus}
                          onChange={(e) => updateSlot(selectedSlot.id, { currentPlus: Math.min(20, Math.max(0, Number(e.target.value))) })}
                          className="w-full bg-black border-b-2 border-gray-800 text-white text-2xl font-bebas text-center focus:border-yellow-500 outline-none pb-1"
                        />
                      </div>
                      <ChevronRight className="text-gray-600" size={20} />
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 font-mono uppercase mb-1 text-center">OBJETIVO</label>
                        <input 
                          type="number" min="0" max="20" 
                          value={selectedSlot.targetPlus}
                          onChange={(e) => updateSlot(selectedSlot.id, { targetPlus: Math.min(20, Math.max(0, Number(e.target.value))) })}
                          className="w-full bg-black border-b-2 border-yellow-500 text-yellow-500 text-2xl font-bebas text-center focus:border-white outline-none pb-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
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
                  <div key={i} className="flex items-center justify-between p-2.5 bg-gradient-to-r from-yellow-500/15 via-[#080808] to-transparent border-l-2 border-yellow-500 rounded-r-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        <img 
                          src={iconUrl} 
                          alt={s.name} 
                          className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" 
                        />
                      </div>
                      <span className="font-bebas text-lg text-white tracking-wider">{s.name}</span>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs">
                      {s.isUnique ? (
                        <div className="flex items-center gap-1.5">
                          <img src={getUniqueWeaponPieceIcon(op.id)} alt="Pieza" className="w-4 h-4 object-contain" />
                          <span className="text-yellow-400 font-bold">{s.frags.toLocaleString()} frag</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-neon-red font-bold">{s.exp.toLocaleString()} EXP</span>
                          <span className="text-yellow-500 font-bold">+{s.plus} comp</span>
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

    </motion.div>
  );
}

function WeaponSlotNode({ slot, iconUrl, onClick, right = false }: { slot: SlotState, iconUrl: string, onClick: () => void, right?: boolean }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.08, y: -3 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`group relative flex items-center gap-4 cursor-pointer select-none ${right ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#3b2e0c] via-[#1a1405] to-[#0a0803] border-2 border-yellow-500/80 group-hover:border-yellow-400 rounded-md flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.35)] group-hover:shadow-[0_0_30px_rgba(234,179,8,0.85)] transition-shadow duration-300">
        <img 
          src={iconUrl} 
          alt={slot.name} 
          className="w-12 h-12 md:w-14 md:h-14 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-300" 
        />
        <div className="absolute bottom-0 w-full bg-black/90 font-mono text-[9px] text-yellow-400 font-bold text-center py-0.5 border-t border-yellow-500/40">
          Lv.{slot.currentLevel}
        </div>
      </div>
      <div className={`flex flex-col ${right ? 'items-end' : 'items-start'}`}>
        <span className="font-bebas text-xl text-white tracking-widest drop-shadow-md group-hover:text-yellow-400 transition-colors duration-200">{slot.name}</span>
        <span className="font-mono text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 border border-yellow-500/30 rounded-sm">
          +{slot.currentPlus}
        </span>
      </div>
    </motion.button>
  );
}
