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
  SpeedupCategory, 
  ResourceType 
} from '../data/conversoresData';
import { MANSION_LUMI_STATS } from '../data/mansionData';
import type { PrestigeLevel } from '../data/mansionData';

const Conversores: React.FC = () => {
  const { playHover, playClick } = useSound();
  const [activeTab, setActiveTab] = useState<'treasures' | 'speedups' | 'resources' | 'luminio' | 'equipment'>('treasures');

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
    const text = `[RE:SU Tienda de Intercambio]
Conversión: ${treasureCalculation.calculatedInput.toLocaleString()} ${treasureCalculation.inputItem.name} ➔ ${treasureCalculation.calculatedOutput.toLocaleString()} ${treasureCalculation.outputItem.name}
Ratio: ${currentRule.inputAmount} ${treasureCalculation.inputItem.id} = ${currentRule.outputAmount} ${treasureCalculation.outputItem.id}
Límite Semanal: ${currentRule.weeklyLimit.toLocaleString()} ops (${(currentRule.weeklyLimit * currentRule.outputAmount).toLocaleString()} ${treasureCalculation.outputItem.id})
Semanas de cupo requeridas: ${treasureCalculation.weeksNeeded} semana(s)
Fuente: resudb.com/conversores`;
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
    const text = `[RE:SU Inventario de Aceleradores]
Tiempo Total Acumulado: ${speedupTotals.grandDuration.formattedString} (${speedupTotals.grandDuration.totalHours} horas)
- Universales: ${formatMinutesToDuration(speedupTotals.categoryTotals.universal).formattedString}
- Construcción: ${formatMinutesToDuration(speedupTotals.categoryTotals.building).formattedString}
- Investigación: ${formatMinutesToDuration(speedupTotals.categoryTotals.research).formattedString}
- Entrenamiento: ${formatMinutesToDuration(speedupTotals.categoryTotals.training).formattedString}
- Curación: ${formatMinutesToDuration(speedupTotals.categoryTotals.healing).formattedString}
Puntos estimados en Cumbre de Ases: ${speedupTotals.aceSummitPoints.toLocaleString()} pts
Fuente: resudb.com/conversores`;
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
    const text = `[RE:SU Reservas Protegidas en Mochila]
- Comida 🌾: ${formatResourceNumber(resourceTotals.totals.food)}
- Madera 🪵: ${formatResourceNumber(resourceTotals.totals.wood)}
- Hierro ⛓️: ${formatResourceNumber(resourceTotals.totals.iron)}
- Petróleo 🛢️: ${formatResourceNumber(resourceTotals.totals.oil)}
- Cajas de Selección 🎁: ${formatResourceNumber(resourceTotals.totals.choice)}
Total de Recursos Seguros no saqueables: ${formatResourceNumber(resourceTotals.grandTotal)}
Fuente: resudb.com/conversores`;
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
        <title>Centro de Conversores Tácticos (Tesoros, Aceleradores, Recursos) | Resident Evil: Survival Unit Wiki</title>
        <meta 
          name="description" 
          content="Hub de herramientas y conversores tácticos para Resident Evil: Survival Unit. Simula la Tienda de Intercambio de Tesoros Míticos con cupos semanales, desglosa aceleradores en días/horas, gestiona maletines de recursos seguros y convierte Polvo en Piedras de Luminio." 
        />
        <link rel="canonical" href="https://resudb.com/conversores" />
        <meta property="og:title" content="Centro de Conversores Tácticos | RE:SU Database" />
        <meta property="og:description" content="Calculadoras de intercambio de tesoros, optimizador de aceleradores y mochila de recursos para Resident Evil: Survival Unit." />
        <meta property="og:url" content="https://resudb.com/conversores" />
      </Helmet>

      {/* HEADER HERO */}
      <div className="text-center px-4 sm:px-6 mb-8 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-red/10 border border-blood-red/30 text-blood-red text-xs font-mono uppercase tracking-widest mb-3">
          <Sparkles size={14} />
          <span>V1.10.1 // HERRAMIENTAS Y CONVERSORES DE INVENTARIO</span>
        </div>
        <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl tracking-wider text-white uppercase mb-3">
          Centro de Conversores Tácticos
        </h1>
        <p className="font-inter text-gray-400 text-xs sm:text-sm max-w-3xl mx-auto leading-relaxed">
          Optimiza la economía de tu asentamiento. Calcula intercambios oficiales de artefactos con límites semanales, 
          proyecta la duración de tus aceleradores, cuantifica tus reservas seguras de recursos y calcula equivalencias de Luminio.
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
            <span>Tienda de Tesoros</span>
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
            <span>Aceleradores</span>
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
            <span>Maletines de Recursos</span>
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
            <span>Luminio (Polvo ⇄ Piedras)</span>
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
            <span>Equipo & Armas</span>
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
                      Tienda de Intercambio de Tesoros (Treasure Exchange)
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      Rutas oficiales de canje extraídas del sistema del juego. Incluye cupos semanales y consejos de rentabilidad.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyTreasure}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedTreasure ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      <span>{copiedTreasure ? '¡Copiado!' : 'Copiar Canje'}</span>
                    </button>
                  </div>
                </div>

                {/* SELECTOR DE RUTA DE INTERCAMBIO */}
                <div className="mb-6">
                  <label className="block text-xs font-mono uppercase text-gray-400 tracking-wider mb-2.5">
                    Selecciona la Operación Oficial de Canje:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {TREASURE_EXCHANGE_RULES.map(rule => {
                      const inMeta = TREASURE_ITEMS[rule.inputItem];
                      const outMeta = TREASURE_ITEMS[rule.outputItem];
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
                              {inMeta.name.split('(')[0]}
                              <ArrowRight size={12} className="text-gray-500" />
                              {outMeta.name.split('(')[0]}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-purple-300 border border-purple-500/30">
                              Límite: {rule.weeklyLimit}/sem
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-gray-400">
                            Ratio: <strong className="text-amber-400">{rule.inputAmount}</strong> ➔ <strong className="text-purple-300">{rule.outputAmount}</strong>
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
                      <span className="text-xs font-mono text-gray-400 uppercase">Modo de Cálculo:</span>
                      <div className="inline-flex p-1 rounded-lg bg-black/60 border border-neutral-800 text-xs font-mono">
                        <button
                          onClick={() => setExchangeMode('input')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            exchangeMode === 'input' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Tengo (Material de Entrada)
                        </button>
                        <button
                          onClick={() => setExchangeMode('output')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            exchangeMode === 'output' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Necesito (Material Objetivo)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1.5">
                        {exchangeMode === 'input' 
                          ? `Cantidad de ${treasureCalculation.inputItem.name} en tu posesión:` 
                          : `Cantidad de ${treasureCalculation.outputItem.name} que deseas conseguir:`}
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
                          {exchangeMode === 'input' ? treasureCalculation.inputItem.id : treasureCalculation.outputItem.id}
                        </div>
                      </div>
                    </div>

                    {/* PRESETS RÁPIDOS */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[11px] font-mono text-gray-500 self-center">Añadir rápido:</span>
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
                        Mínimo ({currentRule.inputAmount})
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs text-gray-400 font-inter leading-relaxed flex items-start gap-2.5">
                      <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>{currentRule.efficiencyNote}</span>
                    </div>
                  </div>

                  {/* RESULTADO Y ANÁLISIS DE CUPO SEMANAL */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-4 bg-black/40 p-4 sm:p-5 rounded-xl border border-neutral-800/80">
                    <div>
                      <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Resultado del Canje:</div>
                      
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${treasureCalculation.inputItem.iconBg}`}>
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 font-mono">Consumirás:</div>
                            <div className="text-lg sm:text-xl font-mono font-bold text-amber-400">
                              {treasureCalculation.calculatedInput.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-gray-500 font-inter">{treasureCalculation.inputItem.name.split('(')[0]}</div>
                          </div>
                        </div>

                        <ArrowRight className="text-gray-600" size={24} />

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <div className="text-xs text-gray-400 font-mono">Obtendrás:</div>
                            <div className="text-lg sm:text-xl font-mono font-bold text-purple-400">
                              {treasureCalculation.calculatedOutput.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-gray-500 font-inter">{treasureCalculation.outputItem.name.split('(')[0]}</div>
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
                            ? `Excede el cupo semanal de la tienda (${(currentRule.weeklyLimit * currentRule.outputAmount).toLocaleString()} máx/sem)` 
                            : `Dentro del cupo semanal permitido (${(currentRule.weeklyLimit * currentRule.outputAmount).toLocaleString()} máx/sem)`}
                        </span>
                      </div>
                      <div className="text-xs font-inter text-gray-300 leading-relaxed">
                        {treasureCalculation.exceedsWeekly ? (
                          <>
                            Necesitarás <strong className="text-amber-400 font-mono">{treasureCalculation.weeksNeeded} reseteos semanales</strong> (cada lunes a las 00:00 UTC) para completar este volumen de intercambio.
                          </>
                        ) : (
                          'Puedes canjear todo este volumen de forma inmediata dentro de una misma semana de juego.'
                        )}
                      </div>
                    </div>

                    {/* ENLACE DIRECTO A CALCULADORA DE TESOROS */}
                    <div className="pt-2 flex justify-end">
                      <Link
                        to="/herramientas"
                        className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                      >
                        <span>Ver Calculadora de Tesoros y Joyas Míticas</span>
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
                  Matriz Oficial de Conversión de la Tienda de Tesoros
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-gray-400 uppercase">
                        <th className="py-2.5 px-3">Ítem Origen</th>
                        <th className="py-2.5 px-3">Ítem Destino</th>
                        <th className="py-2.5 px-3 text-center">Tasa / Ratio</th>
                        <th className="py-2.5 px-3 text-center">Límite Semanal</th>
                        <th className="py-2.5 px-3">Evaluación Táctica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {TREASURE_EXCHANGE_RULES.map(rule => {
                        const inMeta = TREASURE_ITEMS[rule.inputItem];
                        const outMeta = TREASURE_ITEMS[rule.outputItem];
                        return (
                          <tr key={rule.id} className="hover:bg-neutral-900/50 transition-colors">
                            <td className="py-3 px-3 text-amber-300 font-semibold">{inMeta.name}</td>
                            <td className="py-3 px-3 text-purple-300 font-semibold">{outMeta.name}</td>
                            <td className="py-3 px-3 text-center font-bold">
                              <span className="text-amber-400">{rule.inputAmount}</span> : <span className="text-purple-400">{rule.outputAmount}</span>
                            </td>
                            <td className="py-3 px-3 text-center text-gray-300">
                              {rule.weeklyLimit.toLocaleString()} ops
                            </td>
                            <td className="py-3 px-3 text-gray-400 font-inter text-[11px]">
                              {rule.efficiencyNote}
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
                      Calculadora & Optimizador de Aceleradores
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      Suma y desglosa tus ítems de aceleración por categoría (Universales, Construcción, Investigación, Tropa, Hospital).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetSpeedups}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Limpiar Todo</span>
                    </button>
                    <button
                      onClick={handleCopySpeedup}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-mono text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-600/20 cursor-pointer"
                    >
                      {copiedSpeedup ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedSpeedup ? '¡Copiado!' : 'Copiar Resumen'}</span>
                    </button>
                  </div>
                </div>

                {/* RESUMEN GLOBAL EN TIEMPO REAL */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">Tiempo Total Acumulado</span>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
                      {speedupTotals.grandDuration.formattedString}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {speedupTotals.grandDuration.totalHours} horas totales
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">Aceleración Universal</span>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-orange-400">
                      {formatMinutesToDuration(speedupTotals.categoryTotals.universal).formattedString}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Comodín para cualquier tarea</span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">Construcción + Universal</span>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-yellow-400">
                      {formatMinutesToDuration(speedupTotals.categoryTotals.building + speedupTotals.categoryTotals.universal).formattedString}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Para Mansión y Edificios</span>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                    <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">Pts Cumbre de Ases (Est.)</span>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-purple-400">
                      {speedupTotals.aceSummitPoints.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Días de evento (30 pts/min)</span>
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
                    Ver Todas las Categorías
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
                        {cat.name}
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
                                {cat.name.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-400 font-inter">{cat.description}</span>
                            </div>
                            <div className="text-xs font-mono text-gray-300">
                              Subtotal: <strong className="text-amber-400">{catDuration.formattedString}</strong> ({catDuration.totalHours} h)
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
                    Comprobador Inverso de Proyecto Táctico
                  </h3>
                  <p className="text-xs text-gray-400 font-inter mb-4">
                    Ingresa el tiempo que demanda tu próxima construcción o tecnología para comprobar si tus aceleradores actuales cubren el proyecto al 100%.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">Días requeridos del proyecto:</label>
                      <input
                        type="number"
                        min="0"
                        value={targetProjectDays}
                        onChange={e => setTargetProjectDays(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-sm text-white"
                        placeholder="Ej. 14 días"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">Horas adicionales:</label>
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={targetProjectHours}
                        onChange={e => setTargetProjectHours(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg font-mono text-sm text-white"
                        placeholder="Ej. 12 horas"
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-[11px] font-mono text-gray-400">Cobertura de tu inventario:</div>
                      <div className="text-lg font-mono font-bold text-amber-400">
                        {speedupTotals.targetCoverageRatio}% cubierto
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
                      Mochila de Recursos Seguros (Maletines no Saqueables)
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      Calcula exactamente cuántos millones de Comida, Madera, Hierro y Petróleo tienes acumulados en cajas sin abrirlos en tu inventario.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetResources}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Limpiar Todo</span>
                    </button>
                    <button
                      onClick={handleCopyResources}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-mono text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      {copiedResources ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedResources ? '¡Copiado!' : 'Copiar Mochila'}</span>
                    </button>
                  </div>
                </div>

                {/* ADVERTENCIA DE SEGURIDAD UMBRELLA */}
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 mb-6 flex items-start gap-3">
                  <ShieldAlert size={20} className="shrink-0 mt-0.5 text-amber-400" />
                  <div className="text-xs font-inter leading-relaxed">
                    <strong>Directriz Táctica de Supervivencia:</strong> Nunca abras maletines de recursos directamente a tu almacén 
                    hasta que tengas todos los requisitos completos y vayas a dar clic a "Mejorar" o "Investigar". Los recursos en mochila 
                    están <strong>100% blindados contra saqueos</strong> si otro jugador ataca tu asentamiento.
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
                          <span>{res.icon}</span>
                          <span>{res.name}</span>
                        </div>
                        <div className="text-lg sm:text-xl font-mono font-bold" style={{ color: res.color }}>
                          {formatResourceNumber(amount)}
                        </div>
                        <div className="text-[10px] font-mono text-gray-500">
                          {amount.toLocaleString()} uds
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
                            <span>{res.icon}</span>
                            <span>{res.name.toUpperCase()}</span>
                          </span>
                          <span className="text-xs font-mono text-gray-300">
                            Total seguro: <strong style={{ color: res.color }}>{formatResourceNumber(resourceTotals.totals[resKey])}</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                          {RESOURCE_DENOMINATIONS.map(denom => {
                            const val = resourceInputs[resKey][denom.amount] || 0;
                            return (
                              <div key={denom.amount} className="p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                                <div className="text-[11px] font-mono text-gray-400 mb-1 text-center font-bold">
                                  Caja {denom.label}
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
                      Comprobador de Materiales para Mansión de Luminio
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">Nivel de Mansión:</span>
                      <select
                        value={selectedMansionPrestigeCompare}
                        onChange={e => setSelectedMansionPrestigeCompare(parseInt(e.target.value))}
                        className="px-3 py-1 bg-neutral-950 border border-neutral-700 rounded font-mono text-xs text-white cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
                          <option key={p} value={p}>Prestigio {p} (P{p})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {resourceTotals.mansionReq && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[11px] font-mono text-gray-400 block mb-1">Comida Requerida</span>
                        <div className="text-sm font-mono font-bold text-lime-400">
                          {formatResourceNumber(resourceTotals.mansionReq.food)}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          Tienes: {formatResourceNumber(resourceTotals.totals.food)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[11px] font-mono text-gray-400 block mb-1">Madera Requerida</span>
                        <div className="text-sm font-mono font-bold text-amber-400">
                          {formatResourceNumber(resourceTotals.mansionReq.wood)}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          Tienes: {formatResourceNumber(resourceTotals.totals.wood)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[11px] font-mono text-gray-400 block mb-1">Hierro Requerido</span>
                        <div className="text-sm font-mono font-bold text-slate-300">
                          {formatResourceNumber(resourceTotals.mansionReq.iron)}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          Tienes: {formatResourceNumber(resourceTotals.totals.iron)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <span className="text-[11px] font-mono text-gray-400 block mb-1">Petróleo Requerido</span>
                        <div className="text-sm font-mono font-bold text-sky-400">
                          {formatResourceNumber(resourceTotals.mansionReq.oil)}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          Tienes: {formatResourceNumber(resourceTotals.totals.oil)}
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
                      Conversor de Luminio (Polvo ⇄ Piedras)
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      Relación oficial matemática del juego: 1 Piedra de Luminio = 1.3 Polvo de Luminio (Ratio: 1.3).
                    </p>
                  </div>

                  <Link
                    to="/herramientas"
                    className="px-3.5 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-xs font-mono text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-yellow-600/20"
                  >
                    <span>Ir al Árbol de Luminio</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                {/* CALCULADORA BIDIRECCIONAL */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase">Dirección de Conversión:</span>
                      <div className="inline-flex p-1 rounded-lg bg-black/60 border border-neutral-800 text-xs font-mono">
                        <button
                          onClick={() => setLuminioInputMode('powder')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            luminioInputMode === 'powder' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Polvo ➔ Piedras
                        </button>
                        <button
                          onClick={() => setLuminioInputMode('stones')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            luminioInputMode === 'stones' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          Piedras ➔ Polvo
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1.5">
                        {luminioInputMode === 'powder' ? 'Cantidad de Polvo de Luminio:' : 'Cantidad de Piedras de Luminio:'}
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
                      <span className="text-[11px] font-mono text-gray-500 block mb-1.5">Paquetes / Cajas estándar de Luminio:</span>
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
                      <span className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-3">Equivalencia Táctica:</span>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                          <span className="text-[11px] font-mono text-gray-400 block mb-1">Polvo de Luminio</span>
                          <div className="text-2xl font-mono font-bold text-yellow-400">
                            {luminioCalculated.powder.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
                          <span className="text-[11px] font-mono text-gray-400 block mb-1">Piedras de Luminio</span>
                          <div className="text-2xl font-mono font-bold text-amber-300">
                            {luminioCalculated.stones.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-gray-400 font-inter leading-relaxed">
                      💡 <strong>Dato del Datamine:</strong> Investigar por completo una rama de tecnología de Luminio requiere exactamente 
                      <strong> 27,314 de Polvo</strong> y <strong>21,010 Piedras</strong>. Para las 3 ramas combinadas, el coste asciende a 
                      <strong> 81,942 de Polvo</strong> y <strong>63,032 Piedras</strong>.
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
                      Calculadora de Equipamiento (+1 a +20) y Armas Exclusivas
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-inter">
                      Cada uno de los 31 operativos del juego cuenta con su simulador interactivo completo de ranuras de armas y arma exclusiva.
                    </p>
                  </div>

                  <Link
                    to="/heroes"
                    className="px-4 py-2 rounded-xl bg-blood-red hover:bg-red-700 text-xs font-mono text-white flex items-center gap-2 transition-colors shadow-lg shadow-blood-red/30"
                  >
                    <span>Explorar Operativos</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <h3 className="text-base font-bebas tracking-wide text-white mb-2 flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-400" />
                      Mejora de Equipamiento Normal (+1 a +20)
                    </h3>
                    <p className="text-xs text-gray-400 font-inter leading-relaxed mb-4">
                      Cada operativo dispone de 4 ranuras de equipo militar (Arma Grande, Pistola, Revólver, Cuchillo) con niveles del 1 al 100.
                    </p>
                    <div className="space-y-2 font-mono text-xs text-gray-300">
                      <div className="flex justify-between p-2 rounded bg-neutral-950">
                        <span>Partes de Mejora (+1 a +20):</span>
                        <strong className="text-amber-400">2,100 partes totales</strong>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-neutral-950">
                        <span>Armas Legendarias requeridas (+11 a +20):</span>
                        <strong className="text-purple-400">55 armas legendarias</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <h3 className="text-base font-bebas tracking-wide text-white mb-2 flex items-center gap-2">
                      <Gem size={18} className="text-blood-red" />
                      Armas Exclusivas Legendarias (Nv. 0 a 10)
                    </h3>
                    <p className="text-xs text-gray-400 font-inter leading-relaxed mb-4">
                      Desbloquean efectos pasivos que alteran las habilidades activas de los operativos Legendarios.
                    </p>
                    <div className="space-y-2 font-mono text-xs text-gray-300">
                      <div className="flex justify-between p-2 rounded bg-neutral-950">
                        <span>Desbloqueo Inicial (Nv. 1):</span>
                        <strong className="text-blood-red">10 Fragmentos</strong>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-neutral-950">
                        <span>Máximo Nivel (Nv. 10):</span>
                        <strong className="text-amber-400">275 Fragmentos Totales</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-neutral-900/30 border border-neutral-800 text-center">
                  <p className="text-xs text-gray-400 font-inter mb-3">
                    Para interactuar con la calculadora de equipamiento para un operativo específico, dirígete a su ficha en la base de datos:
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
