// src/pages/Conversores.tsx
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightLeft, 
  Clock, 
  Package, 
  Gem, 
  Sparkles, 
  ShieldAlert, 
  Copy, 
  Check, 
  RotateCcw, 
  Info, 
  ArrowRight, 
  TrendingUp, 
  Crosshair, 
  ShieldCheck,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSound } from '../contexts/SoundContext';
import { 
  TREASURE_ITEMS, 
  TREASURE_EXCHANGE_RULES, 
  SPEEDUP_CATEGORIES,
  SPEEDUP_DENOMINATIONS,
  formatMinutesToDuration,
  RESOURCE_TYPES,
  RESOURCE_DENOMINATIONS,
  formatResourceNumber,
  LUMINIO_POWDER_TO_STONE_RATIO,
  convertPowderToStones,
  convertStonesToPowder,
  LUMINIO_BOX_PRESETS
} from '../data/conversoresData';
import type { 
  TreasureItemType,
  SpeedupCategory, 
  ResourceType 
} from '../data/conversoresData';
import { MANSION_LUMI_STATS } from '../data/mansionData';
import type { PrestigeLevel } from '../data/mansionData';

const Conversores: React.FC = () => {
  const { t } = useTranslation();
  const { playHover, playClick } = useSound();
  const [activeTab, setActiveTab] = useState<'treasures' | 'speedups' | 'resources' | 'luminio' | 'equipment'>('treasures');

  // Helpers de localización
  const getItemName = (itemKey: TreasureItemType) => {
    return t(`converters.items.${itemKey}.name`, { defaultValue: TREASURE_ITEMS[itemKey].name });
  };

  const getItemShortName = (itemKey: TreasureItemType) => {
    return t(`converters.items.${itemKey}.short`, { defaultValue: TREASURE_ITEMS[itemKey].name.split('(')[0].trim() });
  };

  const getRuleEfficiencyNote = (ruleId: string) => {
    return t(`converters.rules.${ruleId}`, { 
      defaultValue: TREASURE_EXCHANGE_RULES.find(r => r.id === ruleId)?.efficiencyNote || '' 
    });
  };

  const getSpeedupCatName = (catKey: SpeedupCategory) => {
    return t(`converters.speedup_categories.${catKey}.name`, { defaultValue: SPEEDUP_CATEGORIES[catKey].name });
  };

  const getSpeedupCatDesc = (catKey: SpeedupCategory) => {
    return t(`converters.speedup_categories.${catKey}.desc`, { defaultValue: SPEEDUP_CATEGORIES[catKey].description });
  };

  const getResourceName = (resKey: ResourceType) => {
    return t(`converters.resource_types.${resKey}`, { defaultValue: RESOURCE_TYPES[resKey].name });
  };

  // ==========================================
  // TAB 1: TREASURE EXCHANGE STATE
  // ==========================================
  const [selectedRuleId, setSelectedRuleId] = useState<string>(TREASURE_EXCHANGE_RULES[0].id);
  const [exchangeMode, setExchangeMode] = useState<'input' | 'output'>('input');
  const [exchangeAmount, setExchangeAmount] = useState<number>(10);
  const [copiedTreasure, setCopiedTreasure] = useState(false);

  const currentRule = useMemo(() => {
    return TREASURE_EXCHANGE_RULES.find(r => r.id === selectedRuleId) || TREASURE_EXCHANGE_RULES[0];
  }, [selectedRuleId]);

  const treasureCalculation = useMemo(() => {
    const inputItem = TREASURE_ITEMS[currentRule.inputItem];
    const outputItem = TREASURE_ITEMS[currentRule.outputItem];
    
    let calculatedInput = 0;
    let calculatedOutput = 0;

    if (exchangeMode === 'input') {
      calculatedInput = Math.max(0, exchangeAmount);
      calculatedOutput = Number(((calculatedInput / currentRule.inputAmount) * currentRule.outputAmount).toFixed(1));
    } else {
      calculatedOutput = Math.max(0, exchangeAmount);
      calculatedInput = Math.ceil((calculatedOutput / currentRule.outputAmount) * currentRule.inputAmount);
    }

    // Límite semanal
    const weeklyCap = currentRule.weeklyLimit;
    const weeksNeeded = calculatedOutput > 0 ? Math.ceil(calculatedOutput / (currentRule.outputAmount * weeklyCap)) : 0;
    const exceedsWeekly = calculatedOutput > weeklyCap * currentRule.outputAmount;

    return {
      inputItem,
      outputItem,
      calculatedInput,
      calculatedOutput,
      weeklyCap,
      weeksNeeded: Math.max(1, weeksNeeded),
      exceedsWeekly
    };
  }, [currentRule, exchangeMode, exchangeAmount]);

  const handleCopyTreasure = () => {
    const text = `${t('converters.clipboard.treasure_header')}
${t('converters.clipboard.treasure_conv', {
  input: treasureCalculation.calculatedInput.toLocaleString(),
  inputItem: getItemShortName(currentRule.inputItem),
  output: treasureCalculation.calculatedOutput.toLocaleString(),
  outputItem: getItemShortName(currentRule.outputItem)
})}
${t('converters.clipboard.treasure_ratio', {
  inAmt: currentRule.inputAmount,
  inId: currentRule.inputItem,
  outAmt: currentRule.outputAmount,
  outId: currentRule.outputItem
})}
${t('converters.clipboard.treasure_cap', {
  cap: currentRule.weeklyLimit.toLocaleString(),
  max: (currentRule.weeklyLimit * currentRule.outputAmount).toLocaleString(),
  outId: currentRule.outputItem
})}
${t('converters.clipboard.treasure_weeks', { weeks: treasureCalculation.weeksNeeded })}
${t('converters.clipboard.source')}`;
    navigator.clipboard.writeText(text);
    setCopiedTreasure(true);
    setTimeout(() => setCopiedTreasure(false), 2000);
  };

  // ==========================================
  // TAB 2: SPEEDUPS STATE
  // ==========================================
  const [selectedSpeedupCategory, setSelectedSpeedupCategory] = useState<SpeedupCategory | 'all'>('all');
  const [speedupInputs, setSpeedupInputs] = useState<Record<SpeedupCategory, Record<number, number>>>({
    universal: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 },
    building: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 },
    research: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 },
    training: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 },
    healing: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 }
  });
  const [copiedSpeedup, setCopiedSpeedup] = useState(false);

  // Proyecto objetivo inverso
  const [targetProjectDays, setTargetProjectDays] = useState<number>(0);
  const [targetProjectHours, setTargetProjectHours] = useState<number>(0);

  const speedupTotals = useMemo(() => {
    const categoryTotals: Record<SpeedupCategory, number> = {
      universal: 0,
      building: 0,
      research: 0,
      training: 0,
      healing: 0
    };

    let grandTotalMinutes = 0;

    (Object.keys(speedupInputs) as SpeedupCategory[]).forEach(cat => {
      let catMin = 0;
      Object.entries(speedupInputs[cat]).forEach(([mins, count]) => {
        catMin += Number(mins) * (count || 0);
      });
      categoryTotals[cat] = catMin;
      grandTotalMinutes += catMin;
    });

    const activeMinutes = selectedSpeedupCategory === 'all' 
      ? grandTotalMinutes 
      : (categoryTotals[selectedSpeedupCategory] + (selectedSpeedupCategory !== 'universal' ? categoryTotals.universal : 0));

    const aceSummitPoints = grandTotalMinutes * 30; // ~30 pts por minuto en eventos de aceleración
    const targetProjectTotalMinutes = (targetProjectDays * 1440) + (targetProjectHours * 60);
    const targetCoverageRatio = targetProjectTotalMinutes > 0 
      ? Math.min(100, Math.round((activeMinutes / targetProjectTotalMinutes) * 100)) 
      : 0;

    return {
      categoryTotals,
      grandTotalMinutes,
      activeMinutes,
      activeDuration: formatMinutesToDuration(activeMinutes),
      grandDuration: formatMinutesToDuration(grandTotalMinutes),
      aceSummitPoints,
      targetProjectTotalMinutes,
      targetCoverageRatio
    };
  }, [speedupInputs, selectedSpeedupCategory, targetProjectDays, targetProjectHours]);

  const handleUpdateSpeedup = (cat: SpeedupCategory, mins: number, val: number) => {
    setSpeedupInputs(prev => ({
      ...prev,
      [cat]: {
        ...prev[cat],
        [mins]: Math.max(0, val)
      }
    }));
  };

  const handleAddSpeedupQuick = (cat: SpeedupCategory, mins: number, delta: number) => {
    setSpeedupInputs(prev => ({
      ...prev,
      [cat]: {
        ...prev[cat],
        [mins]: Math.max(0, (prev[cat][mins] || 0) + delta)
      }
    }));
  };

  const handleResetSpeedups = () => {
    setSpeedupInputs({
      universal: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 },
      building: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 },
      research: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 },
      training: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 },
      healing: { 1: 0, 5: 0, 15: 0, 30: 0, 60: 0, 180: 0, 480: 0, 900: 0, 1440: 0, 4320: 0 }
    });
  };

  const handleCopySpeedup = () => {
    const text = `${t('converters.clipboard.speedup_header')}
${t('converters.clipboard.speedup_total', {
  formatted: speedupTotals.grandDuration.formattedString,
  hours: speedupTotals.grandDuration.totalHours
})}
- ${getSpeedupCatName('universal')}: ${formatMinutesToDuration(speedupTotals.categoryTotals.universal).formattedString}
- ${getSpeedupCatName('building')}: ${formatMinutesToDuration(speedupTotals.categoryTotals.building).formattedString}
- ${getSpeedupCatName('research')}: ${formatMinutesToDuration(speedupTotals.categoryTotals.research).formattedString}
- ${getSpeedupCatName('training')}: ${formatMinutesToDuration(speedupTotals.categoryTotals.training).formattedString}
- ${getSpeedupCatName('healing')}: ${formatMinutesToDuration(speedupTotals.categoryTotals.healing).formattedString}
${t('converters.clipboard.speedup_ace', { pts: speedupTotals.aceSummitPoints.toLocaleString() })}
${t('converters.clipboard.source')}`;
    navigator.clipboard.writeText(text);
    setCopiedSpeedup(true);
    setTimeout(() => setCopiedSpeedup(false), 2000);
  };

  // ==========================================
  // TAB 3: RESOURCE PACKS STATE
  // ==========================================
  const [resourceInputs, setResourceInputs] = useState<Record<ResourceType, Record<number, number>>>({
    food: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 },
    wood: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 },
    iron: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 },
    oil: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 },
    choice: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 }
  });
  const [selectedMansionPrestigeCompare, setSelectedMansionPrestigeCompare] = useState<number>(1);
  const [copiedResources, setCopiedResources] = useState(false);

  const resourceTotals = useMemo(() => {
    const totals: Record<ResourceType, number> = {
      food: 0,
      wood: 0,
      iron: 0,
      oil: 0,
      choice: 0
    };

    (Object.keys(resourceInputs) as ResourceType[]).forEach(res => {
      let sum = 0;
      Object.entries(resourceInputs[res]).forEach(([amount, count]) => {
        sum += Number(amount) * (count || 0);
      });
      totals[res] = sum;
    });

    const grandTotal = totals.food + totals.wood + totals.iron + totals.oil + totals.choice;

    // Comparar con Mansión
    const mansionReq = MANSION_LUMI_STATS[selectedMansionPrestigeCompare as Exclude<PrestigeLevel, 0>];

    return {
      totals,
      grandTotal,
      mansionReq
    };
  }, [resourceInputs, selectedMansionPrestigeCompare]);

  const handleUpdateResource = (res: ResourceType, amount: number, val: number) => {
    setResourceInputs(prev => ({
      ...prev,
      [res]: {
        ...prev[res],
        [amount]: Math.max(0, val)
      }
    }));
  };

  const handleResetResources = () => {
    setResourceInputs({
      food: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 },
      wood: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 },
      iron: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 },
      oil: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 },
      choice: { 1000: 0, 10000: 0, 50000: 0, 150000: 0, 500000: 0, 1500000: 0, 5000000: 0 }
    });
  };

  const handleCopyResources = () => {
    const text = `${t('converters.clipboard.resource_header')}
- ${getResourceName('food')} 🌾: ${formatResourceNumber(resourceTotals.totals.food)}
- ${getResourceName('wood')} 🪵: ${formatResourceNumber(resourceTotals.totals.wood)}
- ${getResourceName('iron')} ⛓️: ${formatResourceNumber(resourceTotals.totals.iron)}
- ${getResourceName('oil')} 🛢️: ${formatResourceNumber(resourceTotals.totals.oil)}
- ${getResourceName('choice')} 🎁: ${formatResourceNumber(resourceTotals.totals.choice)}
${t('converters.clipboard.resource_safe_total', { total: formatResourceNumber(resourceTotals.grandTotal) })}
${t('converters.clipboard.source')}`;
    navigator.clipboard.writeText(text);
    setCopiedResources(true);
    setTimeout(() => setCopiedResources(false), 2000);
  };

  // ==========================================
  // TAB 4: LUMINIO CONVERTER STATE
  // ==========================================
  const [luminioInputMode, setLuminioInputMode] = useState<'powder' | 'stones'>('powder');
  const [luminioInputValue, setLuminioInputValue] = useState<number>(1000);

  const luminioCalculated = useMemo(() => {
    if (luminioInputMode === 'powder') {
      const { stones, exact } = convertPowderToStones(luminioInputValue);
      return {
        powder: luminioInputValue,
        stones,
        exactStones: exact,
        ratio: LUMINIO_POWDER_TO_STONE_RATIO
      };
    } else {
      const { powder, exact } = convertStonesToPowder(luminioInputValue);
      return {
        powder,
        stones: luminioInputValue,
        exactPowder: exact,
        ratio: LUMINIO_POWDER_TO_STONE_RATIO
      };
    }
  }, [luminioInputMode, luminioInputValue]);

  return (
    <div className="pt-24 min-h-screen relative z-10 w-full overflow-x-hidden pb-16">
      <Helmet>
        <title>{t('converters.seo_title')}</title>
        <meta name="description" content={t('converters.seo_desc')} />
        <link rel="canonical" href="https://resudb.com/conversores" />
        <meta property="og:title" content={t('converters.og_title')} />
        <meta property="og:description" content={t('converters.og_desc')} />
        <meta property="og:url" content="https://resudb.com/conversores" />
      </Helmet>

      {/* HEADER HERO */}
      <div className="text-center px-4 sm:px-6 mb-8 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-red/10 border border-blood-red/30 text-blood-red text-xs font-mono uppercase tracking-widest mb-3">
          <Sparkles size={14} />
          <span>{t('converters.badge')}</span>
        </div>
        <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl tracking-wider text-white uppercase mb-3">
          {t('converters.title')}
        </h1>
        <p className="font-inter text-gray-400 text-xs sm:text-sm max-w-3xl mx-auto leading-relaxed">
          {t('converters.description')}
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 p-1.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 backdrop-blur-md">
          <button
            onClick={() => { playClick(); setActiveTab('treasures'); }}
            onMouseEnter={playHover}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              activeTab === 'treasures'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/40'
                : 'text-gray-400 hover:text-white hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <ArrowRightLeft size={16} />
            <span>{t('converters.tabs.treasures')}</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('speedups'); }}
            onMouseEnter={playHover}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              activeTab === 'speedups'
                ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] border border-amber-400/40'
                : 'text-gray-400 hover:text-white hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <Clock size={16} />
            <span>{t('converters.tabs.speedups')}</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('resources'); }}
            onMouseEnter={playHover}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/40'
                : 'text-gray-400 hover:text-white hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <Package size={16} />
            <span>{t('converters.tabs.resources')}</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('luminio'); }}
            onMouseEnter={playHover}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              activeTab === 'luminio'
                ? 'bg-yellow-600 text-white shadow-[0_0_15px_rgba(202,138,4,0.4)] border border-yellow-400/40'
                : 'text-gray-400 hover:text-white hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <Gem size={16} />
            <span>{t('converters.tabs.luminio')}</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveTab('equipment'); }}
            onMouseEnter={playHover}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              activeTab === 'equipment'
                ? 'bg-blood-red text-white shadow-[0_0_15px_rgba(255,0,0,0.4)] border border-red-500/40'
                : 'text-gray-400 hover:text-white hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <Crosshair size={16} />
            <span>{t('converters.tabs.equipment')}</span>
          </button>
        </div>
      </div>

      {/* CONTENT TABS */}
      <div className="max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* TAB 1: TIENDA DE INTERCAMBIO DE TESOROS                      */}
          {/* ============================================================ */}
          {activeTab === 'treasures' && (
            <motion.div
              key="treasures-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* PANEL PRINCIPAL DE CONVERSIÓN */}
              <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-neutral-800/80 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bebas tracking-wide text-white flex items-center gap-2.5">
                      <Sparkles className="text-purple-400" size={24} />
                      {t('converters.treasures.title')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      {t('converters.treasures.desc')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyTreasure}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedTreasure ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      <span>{copiedTreasure ? t('converters.treasures.btn_copied') : t('converters.treasures.btn_copy')}</span>
                    </button>
                  </div>
                </div>

                {/* SELECTOR DE RUTA DE INTERCAMBIO */}
                <div className="mb-6">
                  <label className="block text-xs font-mono uppercase text-gray-400 tracking-wider mb-2.5">
                    {t('converters.treasures.select_operation')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {TREASURE_EXCHANGE_RULES.map(rule => {
                      const inMeta = TREASURE_ITEMS[rule.inputItem];
                      const isSelected = rule.id === selectedRuleId;

                      return (
                        <button
                          key={rule.id}
                          onClick={() => { playClick(); setSelectedRuleId(rule.id); }}
                          onMouseEnter={playHover}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                              : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-semibold text-white flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${inMeta.rarity === 'gold' ? 'bg-amber-400' : inMeta.rarity === 'purple' ? 'bg-purple-400' : 'bg-red-400'}`} />
                              {getItemShortName(rule.inputItem)}
                              <ArrowRight size={12} className="text-gray-500" />
                              {getItemShortName(rule.outputItem)}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-purple-300 border border-purple-500/30">
                              {t('converters.treasures.limit_weekly', { limit: rule.weeklyLimit })}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-gray-400">
                            {t('converters.treasures.ratio_label')} <strong className="text-amber-400">{rule.inputAmount}</strong> ➔ <strong className="text-purple-300">{rule.outputAmount}</strong>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CALCULADORA INTERACTIVA BIDIRECCIONAL */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  {/* CONFIGURACIÓN Y INPUT */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase">{t('converters.treasures.calc_mode')}</span>
                      <div className="inline-flex p-1 rounded-lg bg-black/60 border border-neutral-800 text-xs font-mono">
                        <button
                          onClick={() => setExchangeMode('input')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            exchangeMode === 'input' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {t('converters.treasures.mode_have')}
                        </button>
                        <button
                          onClick={() => setExchangeMode('output')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            exchangeMode === 'output' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {t('converters.treasures.mode_need')}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1.5">
                        {exchangeMode === 'input' 
                          ? t('converters.treasures.input_have', { item: getItemName(currentRule.inputItem) }) 
                          : t('converters.treasures.input_need', { item: getItemName(currentRule.outputItem) })}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={exchangeAmount}
                          onChange={e => setExchangeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl font-mono text-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <div className="absolute right-3 top-3.5 text-xs font-mono text-gray-500 uppercase">
                          {exchangeMode === 'input' ? currentRule.inputItem : currentRule.outputItem}
                        </div>
                      </div>
                    </div>

                    {/* PRESETS RÁPIDOS */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[11px] font-mono text-gray-500 self-center">{t('converters.treasures.quick_add')}</span>
                      {[10, 50, 100, 500, 1000].map(val => (
                        <button
                          key={val}
                          onClick={() => setExchangeAmount(prev => prev + val)}
                          className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-gray-300 transition-colors cursor-pointer"
                        >
                          +{val}
                        </button>
                      ))}
                      <button
                        onClick={() => setExchangeAmount(currentRule.inputAmount)}
                        className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-amber-400 transition-colors cursor-pointer"
                      >
                        {t('converters.treasures.min_rule', { amount: currentRule.inputAmount })}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-gray-400 font-inter leading-relaxed flex items-start gap-2.5">
                      <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>{getRuleEfficiencyNote(currentRule.id)}</span>
                    </div>
                  </div>

                  {/* RESULTADO Y ANÁLISIS DE CUPO SEMANAL */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-4 bg-black/40 p-4 sm:p-5 rounded-xl border border-neutral-800/80">
                    <div>
                      <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
                        {t('converters.treasures.result_title')}
                      </div>
                      
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${treasureCalculation.inputItem.iconBg}`}>
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 font-mono">{t('converters.treasures.will_consume')}</div>
                            <div className="text-lg sm:text-xl font-mono font-bold text-amber-400">
                              {treasureCalculation.calculatedInput.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-gray-500 font-inter">{getItemShortName(currentRule.inputItem)}</div>
                          </div>
                        </div>

                        <ArrowRight className="text-gray-600" size={24} />

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <div className="text-xs text-gray-400 font-mono">{t('converters.treasures.will_get')}</div>
                            <div className="text-lg sm:text-xl font-mono font-bold text-purple-400">
                              {treasureCalculation.calculatedOutput.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-gray-500 font-inter">{getItemShortName(currentRule.outputItem)}</div>
                          </div>
                          <div className={`p-2 rounded-lg border ${treasureCalculation.outputItem.iconBg}`}>
                            <Gem size={20} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ADVERTENCIA DE CUPO SEMANAL */}
                    <div className={`p-4 rounded-xl border ${
                      treasureCalculation.exceedsWeekly 
                        ? 'bg-amber-950/30 border-amber-500/50 text-amber-300' 
                        : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-1.5 font-mono text-xs font-semibold">
                        {treasureCalculation.exceedsWeekly ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                        <span>
                          {treasureCalculation.exceedsWeekly 
                            ? t('converters.treasures.cap_exceeded_title', { max: (currentRule.weeklyLimit * currentRule.outputAmount).toLocaleString() })
                            : t('converters.treasures.cap_ok_title', { max: (currentRule.weeklyLimit * currentRule.outputAmount).toLocaleString() })}
                        </span>
                      </div>
                      <div className="text-xs font-inter text-gray-300 leading-relaxed">
                        {treasureCalculation.exceedsWeekly 
                          ? t('converters.treasures.cap_exceeded_desc', { weeks: treasureCalculation.weeksNeeded })
                          : t('converters.treasures.cap_ok_desc')}
                      </div>
                    </div>

                    {/* ENLACE DIRECTO A CALCULADORA DE TESOROS */}
                    <div className="pt-2 flex justify-end">
                      <Link
                        to="/herramientas"
                        className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                      >
                        <span>{t('converters.treasures.link_calc')}</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABLA DE REFERENCIA RÁPIDA DE RATIOS OFICIALES */}
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-bebas tracking-wide text-white mb-3 flex items-center gap-2">
                  <Layers size={18} className="text-gray-400" />
                  {t('converters.treasures.matrix_title')}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-gray-400 uppercase">
                        <th className="py-2.5 px-3">{t('converters.treasures.th_source')}</th>
                        <th className="py-2.5 px-3">{t('converters.treasures.th_target')}</th>
                        <th className="py-2.5 px-3 text-center">{t('converters.treasures.th_ratio')}</th>
                        <th className="py-2.5 px-3 text-center">{t('converters.treasures.th_weekly_limit')}</th>
                        <th className="py-2.5 px-3">{t('converters.treasures.th_evaluation')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {TREASURE_EXCHANGE_RULES.map(rule => {
                        return (
                          <tr key={rule.id} className="hover:bg-neutral-900/50 transition-colors">
                            <td className="py-3 px-3 text-amber-300 font-semibold">{getItemName(rule.inputItem)}</td>
                            <td className="py-3 px-3 text-purple-300 font-semibold">{getItemName(rule.outputItem)}</td>
                            <td className="py-3 px-3 text-center font-bold">
                              <span className="text-amber-400">{rule.inputAmount}</span> : <span className="text-purple-400">{rule.outputAmount}</span>
                            </td>
                            <td className="py-3 px-3 text-center text-gray-300">
                              {t('converters.treasures.ops_per_week', { count: rule.weeklyLimit.toLocaleString() })}
                            </td>
                            <td className="py-3 px-3 text-gray-400 font-inter text-[11px]">
                              {getRuleEfficiencyNote(rule.id)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: CALCULADORA Y OPTIMIZADOR DE ACELERADORES             */}
          {/* ============================================================ */}
          {activeTab === 'speedups' && (
            <motion.div
              key="speedups-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-neutral-800/80 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bebas tracking-wide text-white flex items-center gap-2.5">
                      <Clock className="text-amber-400" size={24} />
                      {t('converters.speedups.title')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      {t('converters.speedups.desc')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetSpeedups}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>{t('converters.speedups.btn_clear')}</span>
                    </button>
                    <button
                      onClick={handleCopySpeedup}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-mono text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-600/20 cursor-pointer"
                    >
                      {copiedSpeedup ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedSpeedup ? t('converters.speedups.btn_copied') : t('converters.speedups.btn_copy')}</span>
                    </button>
                  </div>
                </div>

                {/* RESUMEN GLOBAL EN TIEMPO REAL */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
                      {t('converters.speedups.total_accumulated')}
                    </span>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
                      {speedupTotals.grandDuration.formattedString}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {t('converters.speedups.total_hours', { hours: speedupTotals.grandDuration.totalHours })}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
                      {t('converters.speedups.universal_title')}
                    </span>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-orange-400">
                      {formatMinutesToDuration(speedupTotals.categoryTotals.universal).formattedString}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {t('converters.speedups.universal_subtitle')}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
                      {t('converters.speedups.building_universal_title')}
                    </span>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-yellow-400">
                      {formatMinutesToDuration(speedupTotals.categoryTotals.building + speedupTotals.categoryTotals.universal).formattedString}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {t('converters.speedups.building_universal_subtitle')}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
                      {t('converters.speedups.ace_title')}
                    </span>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-purple-400">
                      {speedupTotals.aceSummitPoints.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {t('converters.speedups.ace_subtitle')}
                    </span>
                  </div>
                </div>

                {/* FILTRO DE CATEGORÍAS */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setSelectedSpeedupCategory('all')}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
                      selectedSpeedupCategory === 'all'
                        ? 'bg-amber-600 text-white'
                        : 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {t('converters.speedups.view_all')}
                  </button>
                  {(Object.keys(SPEEDUP_CATEGORIES) as SpeedupCategory[]).map(catKey => {
                    const cat = SPEEDUP_CATEGORIES[catKey];
                    const isSelected = selectedSpeedupCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        onClick={() => setSelectedSpeedupCategory(catKey)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors cursor-pointer border ${
                          isSelected ? cat.badge : 'bg-neutral-900 text-gray-400 hover:text-white border-neutral-800'
                        }`}
                      >
                        {getSpeedupCatName(catKey)}
                      </button>
                    );
                  })}
                </div>

                {/* SECCIONES DE INPUTS POR CATEGORÍA */}
                <div className="space-y-6">
                  {(Object.keys(SPEEDUP_CATEGORIES) as SpeedupCategory[])
                    .filter(catKey => selectedSpeedupCategory === 'all' || selectedSpeedupCategory === catKey)
                    .map(catKey => {
                      const cat = SPEEDUP_CATEGORIES[catKey];
                      const catMins = speedupTotals.categoryTotals[catKey];
                      const catDuration = formatMinutesToDuration(catMins);

                      return (
                        <div key={catKey} className="p-4 sm:p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-neutral-800/60 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${cat.accent}`}>
                                {getSpeedupCatName(catKey).toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-400 font-inter">{getSpeedupCatDesc(catKey)}</span>
                            </div>
                            <div className="text-xs font-mono text-gray-300">
                              {t('converters.speedups.subtotal')} <strong className="text-amber-400">{catDuration.formattedString}</strong> {t('converters.speedups.subtotal_hours', { hours: catDuration.totalHours })}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {SPEEDUP_DENOMINATIONS.map(denom => {
                              const val = speedupInputs[catKey][denom.minutes] || 0;
                              return (
                                <div key={denom.minutes} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-mono font-bold text-gray-300">{denom.label}</span>
                                    <span className="text-[10px] font-mono text-gray-500">{denom.minutes} min</span>
                                  </div>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={val === 0 ? '' : val}
                                    placeholder="0"
                                    onChange={e => handleUpdateSpeedup(catKey, denom.minutes, parseInt(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-700 rounded font-mono text-sm text-white focus:outline-none focus:border-amber-500 mb-2"
                                  />
                                  <div className="flex gap-1">
                                    {[1, 5, 10].map(add => (
                                      <button
                                        key={add}
                                        onClick={() => handleAddSpeedupQuick(catKey, denom.minutes, add)}
                                        className="flex-1 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono text-gray-400 hover:text-white cursor-pointer"
                                      >
                                        +{add}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* CALCULADORA INVERSA TÁCTICA */}
                <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-neutral-900/60 border border-amber-500/30">
                  <h3 className="text-base font-bebas tracking-wide text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="text-amber-400" size={18} />
                    {t('converters.speedups.reverse_title')}
                  </h3>
                  <p className="text-xs text-gray-400 font-inter mb-4">
                    {t('converters.speedups.reverse_desc')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">{t('converters.speedups.project_days')}</label>
                      <input
                        type="number"
                        min="0"
                        value={targetProjectDays}
                        onChange={e => setTargetProjectDays(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-sm text-white"
                        placeholder={t('converters.speedups.project_days_placeholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">{t('converters.speedups.project_hours')}</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={targetProjectHours}
                        onChange={e => setTargetProjectHours(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-sm text-white"
                        placeholder={t('converters.speedups.project_hours_placeholder')}
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-[11px] font-mono text-gray-400">{t('converters.speedups.inventory_coverage')}</div>
                      <div className="text-lg font-mono font-bold text-amber-400">
                        {t('converters.speedups.covered_ratio', { ratio: speedupTotals.targetCoverageRatio })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: MOCHILA Y RECURSOS SEGUROS                            */}
          {/* ============================================================ */}
          {activeTab === 'resources' && (
            <motion.div
              key="resources-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-neutral-800/80 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bebas tracking-wide text-white flex items-center gap-2.5">
                      <Package className="text-emerald-400" size={24} />
                      {t('converters.resources.title')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      {t('converters.resources.desc')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetResources}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>{t('converters.resources.btn_clear')}</span>
                    </button>
                    <button
                      onClick={handleCopyResources}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-mono text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      {copiedResources ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedResources ? t('converters.resources.btn_copied') : t('converters.resources.btn_copy')}</span>
                    </button>
                  </div>
                </div>

                {/* ADVERTENCIA DE SEGURIDAD UMBRELLA */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 mb-6 flex items-start gap-3">
                  <ShieldAlert size={20} className="shrink-0 mt-0.5 text-amber-400" />
                  <div className="text-xs font-inter leading-relaxed">
                    <strong>{t('converters.resources.directive_title')}</strong> {t('converters.resources.directive_body')}
                  </div>
                </div>

                {/* RESUMEN DE TOTALES EN TIEMPO REAL */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                  {(Object.keys(RESOURCE_TYPES) as ResourceType[]).map(resKey => {
                    const res = RESOURCE_TYPES[resKey];
                    const amount = resourceTotals.totals[resKey];
                    return (
                      <div key={resKey} className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 mb-1">
                          {res.image ? (
                            <img src={res.image} alt="" className="w-4 h-4 object-contain" />
                          ) : (
                            <span>{res.icon}</span>
                          )}
                          <span>{getResourceName(resKey)}</span>
                        </div>
                        <div className="text-lg sm:text-xl font-mono font-bold" style={{ color: res.color }}>
                          {formatResourceNumber(amount)}
                        </div>
                        <div className="text-[10px] font-mono text-gray-500">
                          {t('converters.resources.units', { count: amount.toLocaleString() })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* MATRIZ DE INPUTS POR TIPO DE CAJA */}
                <div className="space-y-5">
                  {(Object.keys(RESOURCE_TYPES) as ResourceType[]).map(resKey => {
                    const res = RESOURCE_TYPES[resKey];
                    return (
                      <div key={resKey} className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800">
                        <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
                          <span className="text-xs font-mono font-bold flex items-center gap-2" style={{ color: res.color }}>
                            {res.image ? (
                              <img src={res.image} alt="" className="w-4 h-4 object-contain" />
                            ) : (
                              <span>{res.icon}</span>
                            )}
                            <span>{getResourceName(resKey).toUpperCase()}</span>
                          </span>
                          <span className="text-xs font-mono text-gray-300">
                            {t('converters.resources.safe_total')} <strong style={{ color: res.color }}>{formatResourceNumber(resourceTotals.totals[resKey])}</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                          {RESOURCE_DENOMINATIONS.map(denom => {
                            const val = resourceInputs[resKey][denom.amount] || 0;
                            return (
                              <div key={denom.amount} className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                                <div className="text-[11px] font-mono text-gray-400 mb-1 text-center font-bold">
                                  {t('converters.resources.box_denom', { label: denom.label })}
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={val === 0 ? '' : val}
                                  placeholder="0"
                                  onChange={e => handleUpdateResource(resKey, denom.amount, parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded font-mono text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* COMPARADOR DIRECTO CON MANSIÓN P1 - P10 */}
                <div className="mt-8 p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-base font-bebas tracking-wide text-white flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-400" />
                      {t('converters.resources.mansion_checker_title')}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{t('converters.resources.mansion_level')}</span>
                      <select
                        value={selectedMansionPrestigeCompare}
                        onChange={e => setSelectedMansionPrestigeCompare(parseInt(e.target.value))}
                        className="px-3 py-1 bg-neutral-950 border border-neutral-700 rounded font-mono text-xs text-white cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                          <option key={p} value={p}>{t('converters.resources.prestige_label', { level: p })}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {resourceTotals.mansionReq && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5 mb-1">
                          <img src="/recursos/Item_Food.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                          {t('converters.resources.req_food')}
                        </span>
                        <div className="text-sm font-mono font-bold text-lime-400">
                          {formatResourceNumber(resourceTotals.mansionReq.food)}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          {t('converters.resources.you_have', { amount: formatResourceNumber(resourceTotals.totals.food) })}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5 mb-1">
                          <img src="/recursos/Item_Wood.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                          {t('converters.resources.req_wood')}
                        </span>
                        <div className="text-sm font-mono font-bold text-amber-400">
                          {formatResourceNumber(resourceTotals.mansionReq.wood)}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          {t('converters.resources.you_have', { amount: formatResourceNumber(resourceTotals.totals.wood) })}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5 mb-1">
                          <img src="/recursos/Item_Iron.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                          {t('converters.resources.req_iron')}
                        </span>
                        <div className="text-sm font-mono font-bold text-slate-300">
                          {formatResourceNumber(resourceTotals.mansionReq.iron)}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          {t('converters.resources.you_have', { amount: formatResourceNumber(resourceTotals.totals.iron) })}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5 mb-1">
                          <img src="/recursos/Item_Oil.webp" alt="" className="w-3.5 h-3.5 object-contain" />
                          {t('converters.resources.req_oil')}
                        </span>
                        <div className="text-sm font-mono font-bold text-sky-400">
                          {formatResourceNumber(resourceTotals.mansionReq.oil)}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          {t('converters.resources.you_have', { amount: formatResourceNumber(resourceTotals.totals.oil) })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: CONVERSOR DE LUMINIO (POLVO ⇄ PIEDRAS)               */}
          {/* ============================================================ */}
          {activeTab === 'luminio' && (
            <motion.div
              key="luminio-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-neutral-800/80 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bebas tracking-wide text-white flex items-center gap-2.5">
                      <Gem className="text-yellow-400" size={24} />
                      {t('converters.luminio.title')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      {t('converters.luminio.desc')}
                    </p>
                  </div>

                  <Link
                    to="/herramientas"
                    className="px-3.5 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-xs font-mono text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-yellow-600/20"
                  >
                    <span>{t('converters.luminio.btn_goto_tree')}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {/* CALCULADORA BIDIRECCIONAL */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase">{t('converters.luminio.direction_label')}</span>
                      <div className="inline-flex p-1 rounded-lg bg-black/60 border border-neutral-800 text-xs font-mono">
                        <button
                          onClick={() => setLuminioInputMode('powder')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            luminioInputMode === 'powder' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {t('converters.luminio.dir_powder_to_stones')}
                        </button>
                        <button
                          onClick={() => setLuminioInputMode('stones')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            luminioInputMode === 'stones' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {t('converters.luminio.dir_stones_to_powder')}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1.5">
                        {luminioInputMode === 'powder' ? t('converters.luminio.powder_input_label') : t('converters.luminio.stones_input_label')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={luminioInputValue}
                        onChange={e => setLuminioInputValue(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl font-mono text-xl text-yellow-300 focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    {/* PRESETS DE CAJAS */}
                    <div>
                      <span className="text-[11px] font-mono text-gray-500 block mb-1.5">
                        {t('converters.luminio.presets_label')}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {LUMINIO_BOX_PRESETS.map(preset => (
                          <button
                            key={preset}
                            onClick={() => setLuminioInputValue(preset)}
                            className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-gray-300 transition-colors cursor-pointer"
                          >
                            {preset.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 flex flex-col justify-between bg-black/40 p-5 rounded-xl border border-neutral-800/80">
                    <div>
                      <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-3">
                        {t('converters.luminio.tactical_equiv')}
                      </span>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                          <span className="text-[11px] font-mono text-gray-400 block mb-1">{t('converters.luminio.card_powder')}</span>
                          <div className="text-2xl font-mono font-bold text-yellow-400">
                            {luminioCalculated.powder.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                          <span className="text-[11px] font-mono text-gray-400 block mb-1">{t('converters.luminio.card_stones')}</span>
                          <div className="text-2xl font-mono font-bold text-amber-300">
                            {luminioCalculated.stones.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-gray-400 font-inter leading-relaxed">
                      {t('converters.luminio.datamine_note')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: ACCESO RÁPIDO A EQUIPAMIENTO Y ARMAS EXCLUSIVAS       */}
          {/* ============================================================ */}
          {activeTab === 'equipment' && (
            <motion.div
              key="equipment-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-neutral-800/80 pb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bebas tracking-wide text-white flex items-center gap-2.5">
                      <Crosshair className="text-blood-red" size={24} />
                      {t('converters.equipment.title')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      {t('converters.equipment.desc')}
                    </p>
                  </div>

                  <Link
                    to="/heroes"
                    className="px-4 py-2 rounded-xl bg-blood-red hover:bg-red-700 text-xs font-mono text-white flex items-center gap-2 transition-colors shadow-lg shadow-blood-red/30"
                  >
                    <span>{t('converters.equipment.btn_explore')}</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <h3 className="text-base font-bebas tracking-wide text-white mb-2 flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-400" />
                      {t('converters.equipment.normal_title')}
                    </h3>
                    <p className="text-xs text-gray-400 font-inter leading-relaxed mb-4">
                      {t('converters.equipment.normal_desc')}
                    </p>
                    <div className="space-y-2 font-mono text-xs text-gray-300">
                      <div className="flex justify-between p-2 rounded bg-neutral-950">
                        <span>{t('converters.equipment.upgrade_parts_label')}</span>
                        <strong className="text-amber-400">{t('converters.equipment.upgrade_parts_val')}</strong>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-neutral-950">
                        <span>{t('converters.equipment.legend_weapons_label')}</span>
                        <strong className="text-purple-400">{t('converters.equipment.legend_weapons_val')}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <h3 className="text-base font-bebas tracking-wide text-white mb-2 flex items-center gap-2">
                      <Gem size={18} className="text-blood-red" />
                      {t('converters.equipment.exclusive_title')}
                    </h3>
                    <p className="text-xs text-gray-400 font-inter leading-relaxed mb-4">
                      {t('converters.equipment.exclusive_desc')}
                    </p>
                    <div className="space-y-2 font-mono text-xs text-gray-300">
                      <div className="flex justify-between p-2 rounded bg-neutral-950">
                        <span>{t('converters.equipment.unlock_label')}</span>
                        <strong className="text-blood-red">{t('converters.equipment.unlock_val')}</strong>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-neutral-950">
                        <span>{t('converters.equipment.max_label')}</span>
                        <strong className="text-amber-400">{t('converters.equipment.max_val')}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-neutral-900/30 border border-neutral-800 text-center">
                  <p className="text-xs text-gray-400 font-inter mb-3">
                    {t('converters.equipment.explore_prompt')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['leon', 'bsaa-chris', 'sheva', 'cazadora', 'hunk'].map(id => (
                      <Link
                        key={id}
                        to={`/heroes/${id}`}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-gray-300 uppercase hover:text-white transition-colors"
                      >
                        {id.replace('-', ' ')}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Conversores;
