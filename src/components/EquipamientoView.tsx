import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Shield, ChevronRight, Star, Sparkles, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  calculateWeaponExp, 
  calculateWeaponPlus, 
  calculateLegendaryWeapons,
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

// Mapeo de personajes legendarios a su ID de Pieza/Arma Exclusiva (13000 a 13018)
const characterWeaponCodeMap: Record<string, string> = {
  'leon': '13000', // Leon S. Kennedy
  'claire': '13001', // Claire Redfield
  'carlos': '13002', // Carlos Oliveira
  'ada': '13003', // Ada Wong
  'jill': '13004', // Jill Valentine
  'chris': '13005', // Chris Redfield
  'rebecca': '13006', // Rebecca Chambers
  'billy': '13007', // Billy Coen
  'jack': '13008', // Jack Krauser
  'luis': '13009', // Luis Sera
  'ashley': '13010', // Ashley Graham
  'jake': '13011', // Jake Muller
  'sherry': '13012', // Sherry Birkin
  'piers': '13013', // Piers Nivans
  'cazadora': '13014', // Cazadora (Hunter F)
  'cazador': '13015', // Cazador (Hunter M)
  'sheva': '13016', // Sheva Alomar
  'bsaa-chris': '13017', // BSAA Chris
  'excella': '13018' // Excella Gionne
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
  const { t, i18n } = useTranslation();
  const isLegendary = op.rarity?.toLowerCase().includes('legen') || op.rarity?.includes('レジェン');

  const buildInitialSlots = (): SlotState[] => {
    const list: SlotState[] = [
      { id: 'armaPrincipal', name: t('op_detail.weapon_big_gun'), type: 'Penetración', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 0 },
      { id: 'pistola', name: t('op_detail.weapon_pistol'), type: 'Penetración', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 0 },
      { id: 'revolver', name: t('op_detail.weapon_revolver'), type: 'Vida', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 0 },
      { id: 'cuchillo', name: t('op_detail.weapon_knife'), type: 'Vida', currentLevel: 1, targetLevel: 100, currentPlus: 0, targetPlus: 0 },
    ];

    if (isLegendary) {
      list.push({
        id: 'armaUnica',
        name: t('op_detail.weapon_exclusive'),
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
  const [showExpEquivalents, setShowExpEquivalents] = useState<boolean>(false);

  useEffect(() => {
    setSlots(buildInitialSlots());
  }, [op?.id, op?.rarity, i18n.language]);

  const localImage = `/operativos/${op.imageUrl.split('/').pop()}`;
  const selectedSlot = slots.find(s => s.id === selectedSlotId);

  const updateSlot = (id: string, updates: Partial<SlotState>) => {
    setSlots(slots.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Calculate totals
  let totalExp = 0;
  let totalPlus = 0;
  let totalLegendWeapons = 0;
  let uniqueFrags = 0;

  const slotCosts = slots.map(slot => {
    if (slot.id === 'armaUnica') {
      const frags = calculateUniqueWeaponFrags(slot.currentLevel, slot.targetLevel);
      uniqueFrags += frags;
      return { id: slot.id, exp: 0, plus: 0, legendWeapons: 0, frags, name: slot.name, isUnique: true };
    }
    const exp = calculateWeaponExp(slot.currentLevel, slot.targetLevel);
    const plus = calculateWeaponPlus(slot.currentPlus, slot.targetPlus);
    const legendWeapons = calculateLegendaryWeapons(slot.currentPlus, slot.targetPlus);
    totalExp += exp;
    totalPlus += plus;
    totalLegendWeapons += legendWeapons;
    return { id: slot.id, exp, plus, legendWeapons, frags: 0, name: slot.name, isUnique: false };
  });

  const materials = convertWeaponExpToMaterials(totalExp);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full relative flex flex-col items-center min-w-0"
    >
      
      {/* DESKTOP LAYOUT (>= md): Visual 2D Mockup with Center Character & Floating Slots */}
      <div className="hidden md:flex w-full max-w-4xl relative h-[540px] items-center justify-center mb-8">
        {/* Hero Character Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute inset-0 flex justify-center items-end pointer-events-none"
        >
          <img 
            src={localImage} 
            alt={op.name} 
            className="h-full object-contain filter drop-shadow-[0_0_35px_rgba(234,179,8,0.2)]"
          />
        </motion.div>

        {/* 4 Normal Weapon Slots */}
        <div className="absolute inset-0 flex justify-between items-center px-8 lg:px-12 pointer-events-none">
          {/* Left Side Slots (Penetración) */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col gap-16 pointer-events-auto"
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

          {/* Right Side Slots (Vida) */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col gap-16 pointer-events-auto"
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
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 250, delay: 0.2 }}
            className="absolute bottom-1 z-20 flex flex-col items-center pointer-events-auto"
          >
            <motion.button
              whileHover={{ scale: 1.08, y: -3 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedSlotId('armaUnica')}
              className="group relative flex flex-col items-center cursor-pointer"
            >
              <div className="absolute -inset-3 rounded-2xl bg-yellow-500/0 group-hover:bg-yellow-500/25 blur-lg transition-all duration-300 pointer-events-none" />
              
              <div className="w-20 h-20 md:w-22 md:h-22 bg-gradient-to-br from-[#3b2e0c] via-[#1a1405] to-[#0a0803] border-2 border-yellow-500 rounded-md flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_25px_rgba(234,179,8,0.5)] group-hover:shadow-[0_0_35px_rgba(234,179,8,0.9)] transition-all">
                <img 
                  src={getUniqueWeaponIcon(op.id)} 
                  alt="Arma Exclusiva" 
                  className="w-14 h-14 md:w-15 md:h-15 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-300" 
                />
                <div className="absolute bottom-0 w-full bg-black/90 font-mono text-[9px] text-yellow-400 font-bold text-center py-0.5 border-t border-yellow-500/50">
                  {t('op_detail.lvl_prefix', 'Nv.')}{slots.find(s => s.id === 'armaUnica')?.currentLevel || 0}
                </div>
              </div>
              <span className="font-bebas text-base md:text-lg text-yellow-400 tracking-widest mt-1 drop-shadow flex items-center gap-1 group-hover:text-yellow-300">
                <Star size={14} className="fill-yellow-400 text-yellow-400 animate-spin-slow" /> {t('op_detail.weapon_exclusive', 'Arma Exclusiva')}
              </span>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* MOBILE LAYOUT (< md): Tactical Interactive Cards Grid */}
      <div className="flex md:hidden flex-col w-full gap-3 mb-8">
        <div className="text-center mb-1">
          <p className="font-mono text-[10px] text-yellow-500/80 uppercase tracking-widest">
            {t('op_detail.touch_to_upgrade', 'Toca un arma para editar sus niveles')}
          </p>
        </div>

        {/* 4 Standard Weapon Slots Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
          {slots.filter(s => s.id !== 'armaUnica').map(slot => (
            <motion.button
              key={slot.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedSlotId(slot.id)}
              className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-[#14120c] to-[#080808] border border-yellow-500/40 rounded-sm hover:border-yellow-400 transition-colors text-left cursor-pointer shadow-md"
            >
              <div className="w-12 h-12 bg-black/80 border border-yellow-500/60 rounded flex items-center justify-center shrink-0 relative overflow-hidden">
                <img 
                  src={getNormalWeaponIcon(op.unitType, slot.id)} 
                  alt={slot.name} 
                  className="w-9 h-9 object-contain drop-shadow"
                />
                <div className="absolute bottom-0 w-full bg-black/90 text-[8px] font-mono text-yellow-400 text-center font-bold">
                  {t('op_detail.lvl_prefix', 'Nv.')}{slot.currentLevel}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bebas text-sm text-white tracking-wider truncate leading-tight">{slot.name}</h4>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <span className="font-mono text-[9px] text-yellow-500 bg-yellow-500/10 px-1 py-0.2 rounded border border-yellow-500/30">
                    +{slot.currentPlus}
                  </span>
                  {slot.currentPlus > 10 && (
                    <span className="font-mono text-[8px] text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/40 font-bold">
                      10+
                    </span>
                  )}
                  <span className="font-mono text-[8px] text-gray-400 uppercase truncate">
                    {slot.type === 'Penetración' ? t('op_detail.penetration', 'Penetración') : slot.type === 'Vida' ? t('op_detail.health_stat', 'Vida') : t('op_detail.weapon_exclusive', 'Exclusiva')}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Exclusive Weapon Mobile Card */}
        {isLegendary && slots.find(s => s.id === 'armaUnica') && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedSlotId('armaUnica')}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-950/40 via-[#181305] to-[#0a0803] border-2 border-yellow-500/70 rounded-sm hover:border-yellow-400 transition-all cursor-pointer shadow-[0_0_15px_rgba(234,179,8,0.2)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3b2e0c] to-[#0a0803] border border-yellow-500 rounded flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner">
                <img 
                  src={getUniqueWeaponIcon(op.id)} 
                  alt="Arma Exclusiva" 
                  className="w-9 h-9 object-contain drop-shadow"
                />
                <div className="absolute bottom-0 w-full bg-black/95 text-[8px] font-mono text-yellow-400 text-center font-bold">
                  {t('op_detail.lvl_prefix', 'Nv.')}{slots.find(s => s.id === 'armaUnica')?.currentLevel || 0}
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bebas text-base text-yellow-400 tracking-wider">{t('op_detail.weapon_exclusive', 'Arma Exclusiva')}</span>
                </div>
                <span className="font-mono text-[9px] text-gray-400 uppercase">{t('op_detail.lvl_prefix', 'Nv.')} 0 ➔ 10</span>
              </div>
            </div>
            <div className="font-mono text-xs text-yellow-400 bg-yellow-500/20 px-2.5 py-1 border border-yellow-500/50 rounded-sm uppercase tracking-wider">
              {t('op_detail.edit', 'Editar')} ➔
            </div>
          </motion.button>
        )}
      </div>

      {/* MODAL EDITOR CENTRADO IMPECABLEMENTE CON FLEXBOX */}
      <AnimatePresence>
        {selectedSlot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 pb-6 overflow-y-auto">
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
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-y-auto bg-[#09090b] border-2 border-yellow-500/60 shadow-[0_0_50px_rgba(234,179,8,0.35)] p-4 sm:p-6 backdrop-blur-xl rounded-lg my-auto scrollbar-none"
            >
              {/* Close Button Top Right */}
              <button 
                onClick={() => setSelectedSlotId(null)} 
                className="absolute top-2.5 right-2.5 z-50 text-gray-300 hover:text-white bg-black/90 hover:bg-yellow-500/20 border border-gray-700 hover:border-yellow-500/50 p-2 rounded-full transition-all duration-200 cursor-pointer shadow-lg"
                aria-label={t('op_detail.close_modal', 'Cerrar')}
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6 border-b border-yellow-500/20 pb-3 sm:pb-4 relative z-20 pr-10">
                {selectedSlot.type === 'Exclusiva' ? (
                  <div className="p-2 bg-yellow-500/20 rounded-md border border-yellow-500/40 shrink-0">
                    <Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={20} />
                  </div>
                ) : selectedSlot.type === 'Penetración' ? (
                  <div className="p-2 bg-red-950/30 rounded-md border border-red-800/40 shrink-0">
                    <Sword className="text-neon-red" size={20} />
                  </div>
                ) : (
                  <div className="p-2 bg-blue-950/30 rounded-md border border-blue-800/40 shrink-0">
                    <Shield className="text-blue-500" size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-widest leading-none truncate">
                    {selectedSlot.name}
                  </h3>
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase text-yellow-400 tracking-wider">
                    {selectedSlot.type === 'Exclusiva' ? t('op_detail.exclusive_legendary_weapon') : t('op_detail.slot_of', { type: selectedSlot.type === 'Penetración' ? t('op_detail.penetration') : t('op_detail.health_stat') })}
                  </span>
                </div>
              </div>

              {/* Vista Previa Flotante del Arma */}
              <div className="flex justify-center mb-4 sm:mb-6 relative z-20">
                <div className="relative flex items-center justify-center p-3 sm:p-4 bg-gradient-to-b from-[#1a1405] via-[#0d0a03] to-[#050401] border border-yellow-500/40 rounded-lg w-full max-w-xs overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  
                  {/* Resplandor de Fondo detrás del Arma */}
                  <div className="absolute w-28 h-28 bg-yellow-500/15 rounded-full blur-xl pointer-events-none" />

                  {/* Imagen Flotante del Arma */}
                  <img 
                    src={selectedSlot.type === 'Exclusiva' ? getUniqueWeaponIcon(op.id) : getNormalWeaponIcon(op.unitType, selectedSlot.id)}
                    alt={selectedSlot.name} 
                    className="h-16 sm:h-24 md:h-28 object-contain filter drop-shadow-[0_4px_15px_rgba(234,179,8,0.4)] relative z-20"
                  />

                  {/* Borde Inferior Dorado Brillante */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_8px_#facc15]" />
                </div>
              </div>

              {/* CONTROLES DE NIVEL */}
              {selectedSlot.type === 'Exclusiva' ? (
                <div className="border border-yellow-500/30 p-4 sm:p-5 bg-yellow-950/20 rounded-md relative z-20">
                  <h4 className="font-mono text-yellow-400 text-[11px] uppercase tracking-widest text-center mb-4">
                    {t('op_detail.exclusive_weapon_level')}
                  </h4>
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <label className="block text-[9px] text-gray-400 font-mono uppercase mb-1.5 text-center">{t('op_detail.actual_caps')}</label>
                      <input 
                        type="number" min="0" max="10" 
                        value={selectedSlot.currentLevel}
                        onChange={e => updateSlot(selectedSlot.id, { currentLevel: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-black/70 border-b-2 border-gray-700 text-white text-2xl sm:text-3xl font-bebas text-center focus:border-yellow-400 outline-none pb-1 rounded-t-sm"
                      />
                    </div>
                    <ChevronRight className="text-yellow-500 animate-pulse shrink-0" size={24} />
                    <div className="flex-1">
                      <label className="block text-[9px] text-gray-400 font-mono uppercase mb-1.5 text-center">{t('op_detail.objective_caps')}</label>
                      <input 
                        type="number" min="0" max="10" 
                        value={selectedSlot.targetLevel}
                        onChange={e => updateSlot(selectedSlot.id, { targetLevel: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-full bg-black/70 border-b-2 border-yellow-400 text-yellow-400 text-2xl sm:text-3xl font-bebas text-center focus:border-white outline-none pb-1 rounded-t-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* ARMAS NORMALES */
                <div className="space-y-3 mb-3 relative z-20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="border border-gray-800 p-3 sm:p-4 bg-black/60 rounded-md">
                      <h4 className="font-mono text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest text-center mb-3">{t('op_detail.base_level')}</h4>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <label className="block text-[9px] text-gray-500 font-mono uppercase mb-1 text-center">{t('op_detail.actual_caps')}</label>
                          <input 
                            type="number" min="1" max="100" 
                            value={selectedSlot.currentLevel}
                            onChange={e => updateSlot(selectedSlot.id, { currentLevel: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
                            className="w-full bg-black border-b-2 border-gray-800 text-white text-xl sm:text-2xl font-bebas text-center focus:border-neon-red outline-none pb-1"
                          />
                        </div>
                        <ChevronRight className="text-gray-600 shrink-0" size={16} />
                        <div className="flex-1">
                          <label className="block text-[9px] text-gray-500 font-mono uppercase mb-1 text-center">{t('op_detail.objective_caps')}</label>
                          <input 
                            type="number" min="1" max="100" 
                            value={selectedSlot.targetLevel}
                            onChange={e => updateSlot(selectedSlot.id, { targetLevel: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
                            className="w-full bg-black border-b-2 border-blood-red text-neon-red text-xl sm:text-2xl font-bebas text-center focus:border-white outline-none pb-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-800 p-3 sm:p-4 bg-black/60 rounded-md">
                      <h4 className="font-mono text-gray-400 text-[10px] sm:text-xs uppercase tracking-widest text-center mb-3">{t('op_detail.plus_level')}</h4>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <label className="block text-[9px] text-gray-500 font-mono uppercase mb-1 text-center">{t('op_detail.actual_caps')}</label>
                          <input 
                            type="number" min="0" max="20" 
                            value={selectedSlot.currentPlus}
                            onChange={(e) => updateSlot(selectedSlot.id, { currentPlus: Math.min(20, Math.max(0, Number(e.target.value))) })}
                            className="w-full bg-black border-b-2 border-gray-800 text-white text-xl sm:text-2xl font-bebas text-center focus:border-yellow-500 outline-none pb-1"
                          />
                        </div>
                        <ChevronRight className="text-gray-600 shrink-0" size={16} />
                        <div className="flex-1">
                          <label className="block text-[9px] text-gray-500 font-mono uppercase mb-1 text-center">{t('op_detail.objective_caps')}</label>
                          <input 
                            type="number" min="0" max="20" 
                            value={selectedSlot.targetPlus}
                            onChange={(e) => updateSlot(selectedSlot.id, { targetPlus: Math.min(20, Math.max(0, Number(e.target.value))) })}
                            className="w-full bg-black border-b-2 border-yellow-500 text-yellow-500 text-xl sm:text-2xl font-bebas text-center focus:border-white outline-none pb-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REQUISITO DE ARMAS LEGENDARIAS (SOLO CUANDO TARGET > 10) */}
                  {selectedSlot.targetPlus > 10 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-md bg-gradient-to-r from-yellow-950/40 via-[#181305] to-[#0a0803] border border-yellow-500/50 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <img 
                            src="/recursos/Item_Custom_Box_Equipment_02.webp" 
                            alt="Maletín de Arma Legendaria a Elección" 
                            className="w-9 h-9 object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] shrink-0"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black font-mono text-[8px] font-bold px-1 rounded-full leading-tight">
                            +10
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono text-[11px] text-yellow-400 font-bold uppercase tracking-wider truncate">
                            {t('op_detail.legendary_weapon_box')}
                          </span>
                          <span className="font-mono text-[9px] text-gray-400">
                            {t('op_detail.legendary_weapons_note')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bebas text-2xl text-yellow-400 tracking-wider">
                          {calculateLegendaryWeapons(selectedSlot.currentPlus, selectedSlot.targetPlus).toLocaleString()}
                        </span>
                        <span className="font-mono text-[10px] text-yellow-500/80 ml-1 uppercase">uds</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Botón de Cierre al Final del Modal */}
              <div className="mt-4 sm:mt-5 text-center relative z-20">
                <button 
                  onClick={() => setSelectedSlotId(null)}
                  className="w-full py-2.5 sm:py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-mono text-xs uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
                >
                  ✕ {t('op_detail.close_modal', 'CERRAR').toUpperCase()}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* REDISEÑO COMPLETO: RESUMEN Y PROYECCIÓN TOTAL DE EQUIPAMIENTO     */}
      {/* ================================================================= */}
      <div className="w-full max-w-5xl mt-6 sm:mt-10 bg-[#060608]/90 border border-neutral-800 rounded-2xl p-4 sm:p-7 backdrop-blur-md relative overflow-hidden shadow-2xl">
        
        {/* Subtle Glow Accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800/80">
          <div>
            <h2 className="font-bebas text-2xl sm:text-3xl md:text-4xl text-white tracking-widest flex items-center gap-2.5">
              <Sparkles size={24} className="text-yellow-400 shrink-0" />
              <span>{t('op_detail.equip_summary')}</span>
            </h2>
            <p className="font-mono text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest mt-0.5">
              {t('op_detail.proj_resources')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs text-yellow-500/90 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
              4 Ranuras Militares {isLegendary ? '+ 1 Exclusiva' : ''}
            </span>
          </div>
        </div>

        {/* 1. DASHBOARD DE TOTALES EJECUTIVOS (3 o 4 CARDS EN GRID BALANCEADO) */}
        <div className={`grid grid-cols-2 ${isLegendary || totalLegendWeapons > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 sm:gap-4 mb-6`}>
          
          {/* Card 1: Costo Total EXP */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-950/80 border border-red-950/60 hover:border-red-500/40 transition-all flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-400 tracking-wider font-semibold truncate">
                {t('op_detail.total_exp_cost', 'EXP TOTAL')}
              </span>
              <img 
                src="/recursos/UI_Icon_Hero_Equip_Exp.webp" 
                alt="EXP" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_0_8px_rgba(255,42,42,0.4)] shrink-0" 
              />
            </div>
            <div>
              <div className="font-bebas text-2xl sm:text-3xl md:text-4xl text-neon-red tracking-wide leading-tight">
                {totalExp.toLocaleString()}
              </div>
              <button
                onClick={() => setShowExpEquivalents(prev => !prev)}
                className="mt-1 text-[10px] font-mono text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{showExpEquivalents ? '▾ Ocultar materiales' : '▸ Ver materiales'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Total Componentes (+) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-950/80 border border-yellow-950/60 hover:border-yellow-500/40 transition-all flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-400 tracking-wider font-semibold truncate">
                {t('op_detail.total_comp_cost', 'COMPONENTES (+)')}
              </span>
              <img 
                src="/recursos/UI_Icon_Hero_Equip_Mod.webp" 
                alt="Componentes" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] shrink-0" 
              />
            </div>
            <div>
              <div className="font-bebas text-2xl sm:text-3xl md:text-4xl text-yellow-400 tracking-wide leading-tight">
                {totalPlus.toLocaleString()}
              </div>
              <span className="text-[10px] font-mono text-gray-500 block mt-1">
                Nivel +1 a +20
              </span>
            </div>
          </div>

          {/* Card 3: Armas Legendarias (Tier 10+) */}
          <div className={`p-3.5 sm:p-4 rounded-xl transition-all flex flex-col justify-between shadow-inner ${
            totalLegendWeapons > 0 
              ? 'bg-gradient-to-b from-yellow-950/30 to-neutral-950/90 border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]' 
              : 'bg-neutral-950/80 border border-neutral-800'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-400 tracking-wider font-semibold truncate">
                  {t('op_detail.legendary_weapons_abbr', 'ARMAS LEG.')}
                </span>
                <span className="text-[9px] font-mono px-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-bold shrink-0">
                  10+
                </span>
              </div>
              <img 
                src="/recursos/Item_Custom_Box_Equipment_02.webp" 
                alt="Maletín Legendario" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] shrink-0" 
              />
            </div>
            <div>
              <div className={`font-bebas text-2xl sm:text-3xl md:text-4xl tracking-wide leading-tight ${
                totalLegendWeapons > 0 ? 'text-amber-300 font-bold' : 'text-gray-500'
              }`}>
                {totalLegendWeapons.toLocaleString()} <span className="font-mono text-xs uppercase font-normal text-gray-400">uds</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 block mt-1 truncate">
                {totalLegendWeapons > 0 ? t('op_detail.legendary_weapon_box') : 'Requerido en +11 a +20'}
              </span>
            </div>
          </div>

          {/* Card 4: Fragmentos Exclusivos (Solo si es personaje legendario) */}
          {isLegendary && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-950/80 border border-amber-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-400 tracking-wider font-semibold truncate">
                  {t('op_detail.weapon_exclusive', 'EXCLUSIVA')}
                </span>
                <img 
                  src={getUniqueWeaponPieceIcon(op.id)} 
                  alt="Fragmentos Exclusivos" 
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] shrink-0" 
                />
              </div>
              <div>
                <div className="font-bebas text-2xl sm:text-3xl md:text-4xl text-yellow-400 tracking-wide leading-tight">
                  {uniqueFrags.toLocaleString()} <span className="font-mono text-xs uppercase font-normal text-yellow-500/70">frags</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 block mt-1">
                  Nivel 0 ➔ 10
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2. TABLA EXPANDIBLE / RIBBON DE EQUIVALENCIAS DE MATERIALES DE EXP */}
        <AnimatePresence>
          {showExpEquivalents && totalExp > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-gray-300 font-semibold flex items-center gap-1.5">
                  <Info size={14} className="text-yellow-500 shrink-0" />
                  <span>{t('op_detail.exp_equivalents', 'Equivalencias en Materiales y Armas:')}</span>
                </span>
                <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">
                  Cualquiera de estas opciones cubre el total de EXP
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
                <div className="bg-green-950/30 text-green-400 border border-green-500/30 p-2.5 rounded-lg flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400">{t('op_detail.mat_green')}</span>
                  <span className="font-bold text-sm text-green-300">{materials.materialesVerdes.toLocaleString()}</span>
                </div>
                <div className="bg-purple-950/30 text-purple-400 border border-purple-500/30 p-2.5 rounded-lg flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400">{t('op_detail.mat_purple')}</span>
                  <span className="font-bold text-sm text-purple-300">{materials.materialesMorados.toLocaleString()}</span>
                </div>
                <div className="bg-neutral-900 text-gray-300 border border-gray-700 p-2.5 rounded-lg flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400">{t('op_detail.gun_gray')}</span>
                  <span className="font-bold text-sm text-gray-200">{materials.armasGrises.toLocaleString()}</span>
                </div>
                <div className="bg-green-950/20 text-green-500 border border-green-700/50 p-2.5 rounded-lg flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400">{t('op_detail.gun_green')}</span>
                  <span className="font-bold text-sm text-green-400">{materials.armasVerdes.toLocaleString()}</span>
                </div>
                <div className="bg-blue-950/20 text-blue-400 border border-blue-700/50 p-2.5 rounded-lg flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400">{t('op_detail.gun_blue')}</span>
                  <span className="font-bold text-sm text-blue-300">{materials.armasAzules.toLocaleString()}</span>
                </div>
                <div className="bg-purple-950/20 text-purple-400 border border-purple-700/50 p-2.5 rounded-lg flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400">{t('op_detail.gun_purple')}</span>
                  <span className="font-bold text-sm text-purple-300">{materials.armasMoradas.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. DESGLOSE POR ARMA: CARDS RESPONSIVAS DE 2 COLUMNAS (FULL WIDTH) */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-mono text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <span>{t('op_detail.breakdown')}</span>
              <span className="text-[10px] text-gray-500 font-normal font-inter hidden sm:inline">
                (Toca cualquier arma para modificar sus niveles)
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {slotCosts.map((s) => {
              const correspondingSlot = slots.find(slot => slot.id === s.id);
              const iconUrl = s.isUnique 
                ? getUniqueWeaponIcon(op.id)
                : getNormalWeaponIcon(op.unitType, s.id);

              const isPenetration = correspondingSlot?.type === 'Penetración';
              const isHighTier = (correspondingSlot?.targetPlus || 0) > 10;

              return (
                <div 
                  key={s.id}
                  onClick={() => setSelectedSlotId(s.id)}
                  className="group p-3.5 sm:p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-yellow-500/60 hover:bg-neutral-900/90 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between shadow-md hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                >
                  {/* Top Row: Icon + Name + Type + Range Badges */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-black/80 border border-neutral-700 group-hover:border-yellow-500/60 flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner transition-colors">
                        <img 
                          src={iconUrl} 
                          alt={s.name} 
                          className="w-9 h-9 sm:w-10 sm:h-10 object-contain filter drop-shadow group-hover:scale-110 transition-transform duration-300" 
                        />
                        {isHighTier && (
                          <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/90 border border-yellow-500 flex items-center justify-center">
                            <img src="/recursos/Item_Custom_Box_Equipment_02.webp" alt="10+" className="w-2.5 h-2.5 object-contain" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bebas text-lg sm:text-xl text-white tracking-wider truncate leading-tight group-hover:text-yellow-400 transition-colors">
                          {s.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-medium ${
                            s.isUnique 
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              : isPenetration
                                ? 'bg-red-950/40 text-red-400 border-red-800/40'
                                : 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                          }`}>
                            {s.isUnique ? 'Exclusiva' : isPenetration ? 'Penetración' : 'Vida'}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {s.isUnique 
                              ? `Nv.${correspondingSlot?.currentLevel} ➔ Nv.${correspondingSlot?.targetLevel}`
                              : `Nv.${correspondingSlot?.currentLevel} ➔ ${correspondingSlot?.targetLevel}`}
                          </span>
                          {!s.isUnique && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              isHighTier 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-neutral-800 text-gray-300'
                            }`}>
                              +{correspondingSlot?.currentPlus} ➔ +{correspondingSlot?.targetPlus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit Affordance */}
                    <div className="shrink-0 text-gray-500 group-hover:text-yellow-400 group-hover:translate-x-0.5 transition-all text-xs font-mono hidden sm:flex items-center gap-0.5">
                      <span>{t('op_detail.edit', 'Editar')}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>

                  {/* Bottom Row: Metrics & Costs Pills */}
                  <div className="pt-2.5 border-t border-neutral-800/80 flex items-center justify-between gap-2 flex-wrap">
                    {s.isUnique ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-mono text-gray-400">Fragmentos Requeridos:</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-yellow-400 font-bebas text-2xl tracking-wider">{s.frags.toLocaleString()}</span>
                          <span className="text-[10px] font-mono text-yellow-500/80 uppercase">frags</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* EXP Needed */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-mono text-gray-400">EXP:</span>
                          <span className="text-neon-red font-mono text-xs sm:text-sm font-bold tracking-tight">
                            {s.exp.toLocaleString()}
                          </span>
                        </div>

                        {/* Components Needed */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-mono text-gray-400">Comp:</span>
                          <span className="text-yellow-400 font-mono text-xs sm:text-sm font-bold tracking-tight">
                            {s.plus.toLocaleString()}
                          </span>
                        </div>

                        {/* Legendary Weapons (Only when > 0) */}
                        {s.legendWeapons > 0 ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/40">
                            <img 
                              src="/recursos/Item_Custom_Box_Equipment_02.webp" 
                              alt="Arma Legendaria" 
                              className="w-3.5 h-3.5 object-contain shrink-0" 
                            />
                            <span className="text-amber-300 font-mono text-xs font-bold">
                              {s.legendWeapons} {t('op_detail.legendary_weapons_abbr', 'Armas Leg.')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-gray-600 hidden sm:inline">
                            (0 Armas Leg.)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </motion.div>
  );
}

function WeaponSlotNode({ slot, iconUrl, onClick, right = false }: { slot: SlotState, iconUrl: string, onClick: () => void, right?: boolean }) {
  const { t } = useTranslation();
  const isHighTier = slot.currentPlus > 10;

  return (
    <motion.button 
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`group relative flex items-center gap-3 sm:gap-4 cursor-pointer select-none ${right ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-16 h-16 md:w-18 md:h-18 bg-gradient-to-br from-[#3b2e0c] via-[#1a1405] to-[#0a0803] border-2 ${isHighTier ? 'border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.6)]' : 'border-yellow-500/80'} group-hover:border-yellow-400 rounded-md flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.35)] group-hover:shadow-[0_0_25px_rgba(234,179,8,0.85)] transition-all duration-300`}>
        <img 
          src={iconUrl} 
          alt={slot.name} 
          className="w-11 h-11 md:w-13 md:h-13 object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-300" 
        />
        {isHighTier && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 border border-yellow-500/80 flex items-center justify-center shadow">
            <img 
              src="/recursos/Item_Custom_Box_Equipment_02.webp" 
              alt="Tier 10+" 
              className="w-3 h-3 object-contain" 
            />
          </div>
        )}
        <div className="absolute bottom-0 w-full bg-black/90 font-mono text-[9px] text-yellow-400 font-bold text-center py-0.5 border-t border-yellow-500/40">
          {t('op_detail.lvl_prefix', 'Nv.')}{slot.currentLevel}
        </div>
      </div>
      <div className={`flex flex-col ${right ? 'items-end' : 'items-start'}`}>
        <span className="font-bebas text-lg md:text-xl text-white tracking-widest drop-shadow-md group-hover:text-yellow-400 transition-colors duration-200">{slot.name}</span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 border border-yellow-500/30 rounded-sm">
            +{slot.currentPlus}
          </span>
          {isHighTier && (
            <span className="font-mono text-[8px] text-amber-300 bg-amber-500/20 px-1 py-0.5 border border-amber-500/40 rounded-sm uppercase tracking-tighter font-bold">
              10+
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
