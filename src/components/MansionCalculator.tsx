import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SETTLEMENT_BUILDINGS,
  PRESTIGE_LABELS,
  SHORT_PRESTIGE_LABELS,
  getPrestigeFrameUrl,
  MANSION_LUMI_STATS,
  BASE_MANSION_LEVELS_1_TO_30,
  getBuildingCommonCost,
  formatResourceNumber,
  formatHoursToDays,
  type PrestigeLevel,
  type BuildingId,
  type SettlementBuildingConfig
} from '../data/mansionData';
import {
  Castle,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  ShieldAlert,
  Wrench,
  Swords,
  Building2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Clock
} from 'lucide-react';

interface StepObjectiveItem {
  key: string;
  buildingId: BuildingId;
  buildingName: string;
  sprite: string;
  fromLevel: PrestigeLevel;
  toLevel: Exclude<PrestigeLevel, 0>;
  stepCost: number;
  luminioCost: number;
  compositeCost: number;
  foodCost: number;
  woodCost: number;
  ironCost: number;
  oilCost: number;
  baseHours: number;
  isMansion: boolean;
  isExtra?: boolean;
}

interface LevelPhasePlan {
  mansionLevel: Exclude<PrestigeLevel, 0>;
  unlockNote?: string;
  steps: StepObjectiveItem[];
  phaseLuminioTotal: number;
  phaseCompositeTotal: number;
  phaseFoodTotal: number;
  phaseWoodTotal: number;
  phaseIronTotal: number;
  phaseOilTotal: number;
  phaseHoursTotal: number;
}

const ALL_LEVELS: PrestigeLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const TARGET_LEVELS: Exclude<PrestigeLevel, 0>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Medallón oficial de Luminio con el número de nivel superpuesto en el centro:
 * - 1 a 3: Luminium_Level01.webp
 * - 4 a 5: Luminium_Level02.webp
 * - 6 a 8: Luminium_Level03.webp
 * - 9 a 10: Luminium_Level04.webp
 */
const LumiLevelBadge: React.FC<{
  level: PrestigeLevel;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ level, size = 'md', className = '' }) => {
  const { t } = useTranslation();
  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-[13px]',
    lg: 'w-11 h-11 text-base'
  }[size];

  if (level === 0) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full bg-zinc-900/90 border border-zinc-600 text-zinc-300 shrink-0 select-none ${sizeClasses} ${className}`}
        style={{ fontFamily: "'Roboto', 'Inter', sans-serif", fontWeight: 300 }}
        title={t('mansion.level_30_base', 'Nv. 30 (Base)')}
      >
        <span className="leading-none">30</span>
      </div>
    );
  }

  const frameUrl = getPrestigeFrameUrl(level);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeClasses} ${className}`}
      title={`${t('mansion.legend_mansion', 'Mansión')} P${level} (Lumi Level ${level})`}
    >
      <img
        src={frameUrl}
        alt={`Marco P${level}`}
        className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] pointer-events-none"
        draggable={false}
      />
      <span
        className="absolute inset-0 flex items-center justify-center text-white leading-none font-light tracking-tight"
        style={{
          fontFamily: "'Roboto', 'Inter', sans-serif",
          fontWeight: 300,
          textShadow: '0 1px 2px rgba(0,0,0,0.95)'
        }}
      >
        {level}
      </span>
    </div>
  );
};

const MansionCalculator: React.FC = () => {
  const { t } = useTranslation();
  // Nivel actual y objetivo de la Mansión
  const [mansionCurrent, setMansionCurrent] = useState<PrestigeLevel>(0);
  const [mansionTarget, setMansionTarget] = useState<Exclude<PrestigeLevel, 0>>(3);

  // Niveles actuales personalizados de cada edificio (si el jugador ya adelantó alguno)
  const [customCurrentLevels, setCustomCurrentLevels] = useState<
    Partial<Record<BuildingId, PrestigeLevel>>
  >({});

  // Niveles objetivo extra (para edificios adicionales que el jugador quiera sumar a su cálculo)
  const [extraTargetLevels, setExtraTargetLevels] = useState<
    Partial<Record<BuildingId, PrestigeLevel>>
  >({});

  // Pasos marcados manualmente como ya completados en la caja de objetivos
  const [completedStepKeys, setCompletedStepKeys] = useState<Record<string, boolean>>({});

  // Luminio y Composite actuales en inventario del jugador
  const [ownedLuminio, setOwnedLuminio] = useState<number>(0);
  const [ownedComposite, setOwnedComposite] = useState<number>(0);

  // Edificio seleccionado en el Mini-Mapa Interactivo (null = barra inferior cerrada)
  const [selectedBuildingId, setSelectedBuildingId] = useState<BuildingId | null>('garage');

  // Selector rápido para agregar otro edificio desde la caja de objetivos
  const [quickAddBuildingId, setQuickAddBuildingId] = useState<BuildingId>('garage');
  const [quickAddTargetLevel, setQuickAddTargetLevel] = useState<Exclude<PrestigeLevel, 0>>(3);

  // Estado de copiado al portapapeles
  const [copiedPlan, setCopiedPlan] = useState(false);

  // Mostrar/ocultar tabla de referencia rápida de costos por nivel (Excel Lumi 1 - 10)
  const [showCostTable, setShowCostTable] = useState(false);
  const [showBase1To30Table, setShowBase1To30Table] = useState(false);

  // Zoom & Drag-Pan del Mini-Mapa
  const [mapZoom, setMapZoom] = useState<number>(1.25);
  const [mapPan, setMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanningMap, setIsPanningMap] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedMapRef = useRef<boolean>(false);

  const buildingMap = useMemo(() => {
    const map = {} as Record<BuildingId, SettlementBuildingConfig>;
    SETTLEMENT_BUILDINGS.forEach((b) => {
      map[b.id] = b;
    });
    return map;
  }, []);

  // Obtener el nivel base efectivo de un edificio
  const getEffectiveCurrentLevel = (id: BuildingId): PrestigeLevel => {
    if (id === 'mansion') return mansionCurrent;
    if (customCurrentLevels[id] !== undefined) {
      return customCurrentLevels[id]!;
    }
    // Si la mansión actual es > 0, por defecto los edificios ya completaron
    // los requisitos de las mansiones previas (nivel base = mansionCurrent - 1).
    return Math.max(0, mansionCurrent - 1) as PrestigeLevel;
  };

  // Cálculo de la Hoja de Ruta por Nivel (P1 -> P10) y edificios adicionales
  const calculationResult = useMemo(() => {
    const simulatedLevels: Record<BuildingId, PrestigeLevel> = {
      mansion: mansionCurrent,
      lab: getEffectiveCurrentLevel('lab'),
      barracks: getEffectiveCurrentLevel('barracks'),
      garage: getEffectiveCurrentLevel('garage'),
      range: getEffectiveCurrentLevel('range'),
      command: getEffectiveCurrentLevel('command'),
      hospital: getEffectiveCurrentLevel('hospital'),
      hero_center: getEffectiveCurrentLevel('hero_center'),
      alliance: getEffectiveCurrentLevel('alliance')
    };

    const initialLevels = { ...simulatedLevels };
    const phases: LevelPhasePlan[] = [];
    const mandatoryTargetByBuilding: Partial<Record<BuildingId, PrestigeLevel>> = {
      mansion: mansionTarget
    };

    // Recorremos cada nivel de Mansión desde (mansionCurrent + 1) hasta mansionTarget
    for (let mLvl = mansionCurrent + 1; mLvl <= mansionTarget; mLvl++) {
      const targetPLevel = mLvl as Exclude<PrestigeLevel, 0>;
      const mansionLevelInfo = buildingMap.mansion.levels[targetPLevel];
      const phaseSteps: StepObjectiveItem[] = [];

      // 1. Verificar requisitos previos de este nivel de Mansión
      mansionLevelInfo.prerequisites.forEach((prereq) => {
        const bConfig = buildingMap[prereq.buildingId];
        const reqLvl = prereq.requiredLevel;

        if ((mandatoryTargetByBuilding[prereq.buildingId] || 0) < reqLvl) {
          mandatoryTargetByBuilding[prereq.buildingId] = reqLvl;
        }

        while (simulatedLevels[prereq.buildingId] < reqLvl) {
          const nextLvl = (simulatedLevels[prereq.buildingId] + 1) as Exclude<PrestigeLevel, 0>;
          const lvlData = bConfig.levels[nextLvl];
          const commonCost = getBuildingCommonCost(prereq.buildingId, nextLvl);
          phaseSteps.push({
            key: `phase-${targetPLevel}-req-${prereq.buildingId}-${nextLvl}`,
            buildingId: prereq.buildingId,
            buildingName: bConfig.name,
            sprite: bConfig.sprite,
            fromLevel: simulatedLevels[prereq.buildingId],
            toLevel: nextLvl,
            stepCost: lvlData.stepCost,
            luminioCost: lvlData.luminioCost,
            compositeCost: lvlData.compositeCost,
            foodCost: commonCost.food,
            woodCost: commonCost.wood,
            ironCost: commonCost.iron,
            oilCost: commonCost.oil,
            baseHours: commonCost.baseHours,
            isMansion: false
          });
          simulatedLevels[prereq.buildingId] = nextLvl;
        }
      });

      // 2. Paso de subir la Mansión a este nivel P(n)
      const mansionCommonCost = getBuildingCommonCost('mansion', targetPLevel);
      phaseSteps.push({
        key: `phase-${targetPLevel}-mansion-${targetPLevel}`,
        buildingId: 'mansion',
        buildingName: buildingMap.mansion.name,
        sprite: buildingMap.mansion.sprite,
        fromLevel: (targetPLevel - 1) as PrestigeLevel,
        toLevel: targetPLevel,
        stepCost: mansionLevelInfo.stepCost,
        luminioCost: mansionLevelInfo.luminioCost,
        compositeCost: mansionLevelInfo.compositeCost,
        foodCost: mansionCommonCost.food,
        woodCost: mansionCommonCost.wood,
        ironCost: mansionCommonCost.iron,
        oilCost: mansionCommonCost.oil,
        baseHours: mansionCommonCost.baseHours,
        isMansion: true
      });
      simulatedLevels.mansion = targetPLevel;

      const phaseLuminioTotal = phaseSteps.reduce((acc, s) => acc + s.luminioCost, 0);
      const phaseCompositeTotal = phaseSteps.reduce((acc, s) => acc + s.compositeCost, 0);
      const phaseFoodTotal = phaseSteps.reduce((acc, s) => acc + s.foodCost, 0);
      const phaseWoodTotal = phaseSteps.reduce((acc, s) => acc + s.woodCost, 0);
      const phaseIronTotal = phaseSteps.reduce((acc, s) => acc + s.ironCost, 0);
      const phaseOilTotal = phaseSteps.reduce((acc, s) => acc + s.oilCost, 0);
      const phaseHoursTotal = phaseSteps.reduce((acc, s) => acc + s.baseHours, 0);

      phases.push({
        mansionLevel: targetPLevel,
        unlockNote: mansionLevelInfo.unlockNote,
        steps: phaseSteps,
        phaseLuminioTotal,
        phaseCompositeTotal,
        phaseFoodTotal,
        phaseWoodTotal,
        phaseIronTotal,
        phaseOilTotal,
        phaseHoursTotal
      });
    }

    // 3. Calcular mejoras adicionales opcionales (edificios extra que el usuario quiso agregar)
    const extraSteps: StepObjectiveItem[] = [];
    (Object.keys(extraTargetLevels) as BuildingId[]).forEach((bId) => {
      if (bId === 'mansion') return;
      const desiredTarget = extraTargetLevels[bId] || 0;
      const bConfig = buildingMap[bId];

      while (simulatedLevels[bId] < desiredTarget) {
        const nextLvl = (simulatedLevels[bId] + 1) as Exclude<PrestigeLevel, 0>;
        const lvlData = bConfig.levels[nextLvl];
        const extraCommonCost = getBuildingCommonCost(bId, nextLvl);
        extraSteps.push({
          key: `extra-${bId}-${nextLvl}`,
          buildingId: bId,
          buildingName: bConfig.name,
          sprite: bConfig.sprite,
          fromLevel: simulatedLevels[bId],
          toLevel: nextLvl,
          stepCost: lvlData.stepCost,
          luminioCost: lvlData.luminioCost,
          compositeCost: lvlData.compositeCost,
          foodCost: extraCommonCost.food,
          woodCost: extraCommonCost.wood,
          ironCost: extraCommonCost.iron,
          oilCost: extraCommonCost.oil,
          baseHours: extraCommonCost.baseHours,
          isMansion: false,
          isExtra: true
        });
        simulatedLevels[bId] = nextLvl;
      }
    });

    // Totales de Luminio, Composite y Recursos Comunes (descontando pasos completados)
    let totalLuminioAllSteps = 0;
    let completedLuminioSteps = 0;
    let totalCompositeAllSteps = 0;
    let completedCompositeSteps = 0;
    let totalFoodAllSteps = 0;
    let completedFoodSteps = 0;
    let totalWoodAllSteps = 0;
    let completedWoodSteps = 0;
    let totalIronAllSteps = 0;
    let completedIronSteps = 0;
    let totalOilAllSteps = 0;
    let completedOilSteps = 0;
    let totalHoursAllSteps = 0;
    let completedHoursSteps = 0;

    const accumulateStep = (s: StepObjectiveItem) => {
      totalLuminioAllSteps += s.luminioCost;
      totalCompositeAllSteps += s.compositeCost;
      totalFoodAllSteps += s.foodCost;
      totalWoodAllSteps += s.woodCost;
      totalIronAllSteps += s.ironCost;
      totalOilAllSteps += s.oilCost;
      totalHoursAllSteps += s.baseHours;

      if (completedStepKeys[s.key]) {
        completedLuminioSteps += s.luminioCost;
        completedCompositeSteps += s.compositeCost;
        completedFoodSteps += s.foodCost;
        completedWoodSteps += s.woodCost;
        completedIronSteps += s.ironCost;
        completedOilSteps += s.oilCost;
        completedHoursSteps += s.baseHours;
      }
    };

    phases.forEach((p) => {
      p.steps.forEach(accumulateStep);
    });

    let extraLuminioTotal = 0;
    let extraCompositeTotal = 0;
    extraSteps.forEach((s) => {
      extraLuminioTotal += s.luminioCost;
      extraCompositeTotal += s.compositeCost;
      accumulateStep(s);
    });

    const activeLuminioNeeded = Math.max(0, totalLuminioAllSteps - completedLuminioSteps);
    const missingLuminio = Math.max(0, activeLuminioNeeded - ownedLuminio);
    const activeCompositeNeeded = Math.max(0, totalCompositeAllSteps - completedCompositeSteps);
    const missingComposite = Math.max(0, activeCompositeNeeded - ownedComposite);
    const activeFoodNeeded = Math.max(0, totalFoodAllSteps - completedFoodSteps);
    const activeWoodNeeded = Math.max(0, totalWoodAllSteps - completedWoodSteps);
    const activeIronNeeded = Math.max(0, totalIronAllSteps - completedIronSteps);
    const activeOilNeeded = Math.max(0, totalOilAllSteps - completedOilSteps);
    const activeHoursNeeded = Math.max(0, totalHoursAllSteps - completedHoursSteps);

    const progressPercent =
      activeLuminioNeeded > 0
        ? Math.min(100, Math.round((ownedLuminio / activeLuminioNeeded) * 100))
        : 100;

    return {
      initialLevels,
      finalLevels: simulatedLevels,
      mandatoryTargetByBuilding,
      phases,
      extraSteps,
      extraLuminioTotal,
      extraCompositeTotal,
      totalLuminioAllSteps,
      completedLuminioSteps,
      activeLuminioNeeded,
      missingLuminio,
      activeCompositeNeeded,
      missingComposite,
      activeFoodNeeded,
      activeWoodNeeded,
      activeIronNeeded,
      activeOilNeeded,
      activeHoursNeeded,
      progressPercent
    };
  }, [
    mansionCurrent,
    mansionTarget,
    customCurrentLevels,
    extraTargetLevels,
    completedStepKeys,
    ownedLuminio,
    ownedComposite,
    buildingMap
  ]);

  const handleMansionCurrentChange = (newCurrent: PrestigeLevel) => {
    setMansionCurrent(newCurrent);
    if (newCurrent >= mansionTarget) {
      const nextTarget = Math.min(10, newCurrent + 1) as Exclude<PrestigeLevel, 0>;
      setMansionTarget(nextTarget);
    }
  };

  const handleMansionTargetChange = (newTarget: Exclude<PrestigeLevel, 0>) => {
    setMansionTarget(newTarget);
    setQuickAddTargetLevel(newTarget);
    if (newTarget <= mansionCurrent) {
      setMansionCurrent((newTarget - 1) as PrestigeLevel);
    }
  };

  const toggleStepCompleted = (stepKey: string) => {
    setCompletedStepKeys((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  const handleResetPlan = () => {
    setMansionCurrent(0);
    setMansionTarget(3);
    setCustomCurrentLevels({});
    setExtraTargetLevels({});
    setCompletedStepKeys({});
  };

  const handleApply3TroopBuildings = () => {
    setExtraTargetLevels((prev) => ({
      ...prev,
      barracks: mansionTarget,
      garage: mansionTarget,
      range: mansionTarget
    }));
  };

  const handleApplyFullSettlement = () => {
    setExtraTargetLevels({
      lab: mansionTarget,
      barracks: mansionTarget,
      garage: mansionTarget,
      range: mansionTarget,
      alliance: mansionTarget,
      hero_center: mansionTarget,
      command: mansionTarget,
      hospital: mansionTarget
    });
  };

  const handleQuickAddExtraBuilding = () => {
    setExtraTargetLevels((prev) => ({
      ...prev,
      [quickAddBuildingId]: quickAddTargetLevel
    }));
    setSelectedBuildingId(quickAddBuildingId);
  };

  // Controles de Zoom y Pan del Mini-Mapa
  const mapViewportRef = useRef<HTMLDivElement | null>(null);

  const handleMapZoom = (delta: number) => {
    setMapZoom((prev) => {
      const next = Math.min(2.4, Math.max(1.0, Number((prev + delta).toFixed(2))));
      if (next === 1.0) setMapPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Bloquear el scroll de la página cuando el usuario hace scroll/zoom encima del mini-mapa
  useEffect(() => {
    const el = mapViewportRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleMapZoom(e.deltaY < 0 ? 0.12 : -0.12);
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  const handleResetMapCamera = () => {
    setMapZoom(1.25);
    setMapPan({ x: 0, y: 0 });
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsPanningMap(true);
    hasDraggedMapRef.current = false;
    panStartRef.current = { x: e.clientX - mapPan.x, y: e.clientY - mapPan.y };
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isPanningMap) return;
    const nextX = e.clientX - panStartRef.current.x;
    const nextY = e.clientY - panStartRef.current.y;
    if (Math.abs(nextX - mapPan.x) > 4 || Math.abs(nextY - mapPan.y) > 4) {
      hasDraggedMapRef.current = true;
    }
    const maxOffset = Math.max(60, (mapZoom - 1) * 260);
    setMapPan({
      x: Math.max(-maxOffset, Math.min(maxOffset, nextX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, nextY))
    });
  };

  const handleMapMouseUp = () => {
    setIsPanningMap(false);
  };

  const handleCopyRoadmap = () => {
    const lines: string[] = [];
    lines.push(
      `🏰 PLAN DE ASCENSO DE MANSIÓN (${SHORT_PRESTIGE_LABELS[mansionCurrent]} ➔ ${SHORT_PRESTIGE_LABELS[mansionTarget]})`
    );
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    calculationResult.phases.forEach((phase) => {
      const compText =
        phase.phaseCompositeTotal > 0
          ? ` + ${phase.phaseCompositeTotal.toLocaleString()} Composite`
          : '';
      lines.push(
        `\n🔸 OBJETIVO ${PRESTIGE_LABELS[phase.mansionLevel]} (${phase.phaseLuminioTotal.toLocaleString()} Luminio${compText}):`
      );
      phase.steps.forEach((step) => {
        const done = completedStepKeys[step.key] ? '✅' : '⬜';
        const stepComp = step.compositeCost > 0 ? ` + ${step.compositeCost} Comp.` : '';
        lines.push(
          `  ${done} ${step.buildingName}: ${SHORT_PRESTIGE_LABELS[step.fromLevel]} ➔ ${SHORT_PRESTIGE_LABELS[step.toLevel]} (${step.luminioCost.toLocaleString()} Lumi${stepComp} | ${step.stepCost}/etapa)`
        );
      });
    });

    if (calculationResult.extraSteps.length > 0) {
      const extraCompText =
        calculationResult.extraCompositeTotal > 0
          ? ` + ${calculationResult.extraCompositeTotal.toLocaleString()} Composite`
          : '';
      lines.push(
        `\n➕ MEJORAS ADICIONALES (${calculationResult.extraLuminioTotal.toLocaleString()} Luminio${extraCompText}):`
      );
      calculationResult.extraSteps.forEach((step) => {
        const done = completedStepKeys[step.key] ? '✅' : '⬜';
        const stepComp = step.compositeCost > 0 ? ` + ${step.compositeCost} Comp.` : '';
        lines.push(
          `  ${done} ${step.buildingName}: ${SHORT_PRESTIGE_LABELS[step.fromLevel]} ➔ ${SHORT_PRESTIGE_LABELS[step.toLevel]} (${step.luminioCost.toLocaleString()} Lumi${stepComp})`
        );
      });
    }

    lines.push('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`💎 Luminio Total Requerido: ${calculationResult.activeLuminioNeeded.toLocaleString()}`);
    if (calculationResult.activeCompositeNeeded > 0) {
      lines.push(
        `🧪 Compuesto de Luminio (Composite): ${calculationResult.activeCompositeNeeded.toLocaleString()}`
      );
    }
    lines.push(`🌾 Comida: ${formatResourceNumber(calculationResult.activeFoodNeeded)} (${calculationResult.activeFoodNeeded.toLocaleString()})`);
    lines.push(`🪵 Madera: ${formatResourceNumber(calculationResult.activeWoodNeeded)} (${calculationResult.activeWoodNeeded.toLocaleString()})`);
    lines.push(`⛓️ Hierro: ${formatResourceNumber(calculationResult.activeIronNeeded)} (${calculationResult.activeIronNeeded.toLocaleString()})`);
    lines.push(`🛢️ Petróleo: ${formatResourceNumber(calculationResult.activeOilNeeded)} (${calculationResult.activeOilNeeded.toLocaleString()})`);
    lines.push(`⏱️ Tiempo Base Total: ${formatHoursToDays(calculationResult.activeHoursNeeded)} (${calculationResult.activeHoursNeeded.toLocaleString()}h)`);
    if (ownedLuminio > 0) {
      lines.push(`🔥 Luminio Faltante: ${calculationResult.missingLuminio.toLocaleString()}`);
    }
    lines.push('Generado en resudb.com/herramientas');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  const selectedBuilding = selectedBuildingId ? buildingMap[selectedBuildingId] : null;
  const selectedCurrentLvl = selectedBuildingId ? calculationResult.initialLevels[selectedBuildingId] : 0;
  const selectedFinalLvl = selectedBuildingId ? calculationResult.finalLevels[selectedBuildingId] : 0;
  const selectedMandatoryLvl = selectedBuildingId
    ? calculationResult.mandatoryTargetByBuilding[selectedBuildingId] || 0
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      {/* BANNER SUPERIOR DE CONTROLES PRINCIPALES */}
      <div className="bg-[#0d0d10]/95 border border-white/10 rounded-2xl p-5 sm:p-6 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          {/* Título y Explicación */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] uppercase tracking-widest mb-3">
              <Castle className="w-3.5 h-3.5" />
              <span>{t('mansion.tag_planner', 'Planificador de Asentamiento • Lumi Level 1 a 10 (P1–P10)')}</span>
            </div>
            <h2 className="font-bebas text-3xl sm:text-4xl tracking-wider text-white uppercase">
              {t('mansion.title', 'Mapa & Calculadora de Mansión de Luminio')}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-1">
              {t('mansion.description', 'Calcula el Luminio exacto (y Luminium Composite desde P6). Haz zoom en el mini-mapa y toca cualquier edificio para abrir su selector rápido en la parte inferior.')}
            </p>
          </div>

          {/* Selectores de Nivel de Mansión Actual -> Objetivo con Medallón Numerado */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-black/60 border border-white/10 p-4 rounded-xl">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                {t('mansion.current_mansion', 'Mansión Actual')}
              </label>
              <div className="flex items-center gap-2">
                <LumiLevelBadge level={mansionCurrent} size="sm" />
                <select
                  value={mansionCurrent}
                  onChange={(e) => handleMansionCurrentChange(Number(e.target.value) as PrestigeLevel)}
                  className="bg-[#16161a] text-white font-mono text-xs sm:text-sm px-3 py-2 rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  {ALL_LEVELS.slice(0, 10).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl === 0 ? t('mansion.level_30_base', 'Nv. 30 (Base)') : PRESTIGE_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-5 text-amber-500">
              <ArrowRight className="w-5 h-5" />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-amber-400 mb-1.5">
                {t('mansion.target_mansion', 'Mansión Objetivo')}
              </label>
              <div className="flex items-center gap-2.5">
                <select
                  value={mansionTarget}
                  onChange={(e) =>
                    handleMansionTargetChange(Number(e.target.value) as Exclude<PrestigeLevel, 0>)
                  }
                  className="bg-amber-500/15 text-amber-300 font-mono font-bold text-xs sm:text-sm px-3 py-2 rounded-lg border border-amber-500/40 focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  {TARGET_LEVELS.map((lvl) => (
                    <option
                      key={lvl}
                      value={lvl}
                      disabled={lvl <= mansionCurrent}
                      className="bg-[#16161a] text-white"
                    >
                      {PRESTIGE_LABELS[lvl]}
                    </option>
                  ))}
                </select>
                <LumiLevelBadge level={mansionTarget} size="md" />
              </div>
            </div>

            <button
              onClick={handleResetPlan}
              title={t('mansion.reset_plan_title', 'Reiniciar configuración')}
              className="mt-5 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Botones de Presets Rápidos + Modos de Asentamiento */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mr-1">
                {t('mansion.frames_label', 'Marcos de Mansión:')}
              </span>
              {[
                { label: t('mansion.preset_frame_1', 'Marco 1 (1–3)'), from: 0 as PrestigeLevel, to: 3 as Exclude<PrestigeLevel, 0> },
                { label: t('mansion.preset_frame_2', 'Marco 2 (4–5)'), from: 3 as PrestigeLevel, to: 5 as Exclude<PrestigeLevel, 0> },
                { label: t('mansion.preset_frame_3', 'Marco 3 (6–8)'), from: 5 as PrestigeLevel, to: 8 as Exclude<PrestigeLevel, 0> },
                { label: t('mansion.preset_frame_4', 'Marco 4 (9–10)'), from: 8 as PrestigeLevel, to: 10 as Exclude<PrestigeLevel, 0> },
                { label: `${t('mansion.level_prefix', 'Nv.')}30 ➔ P8`, from: 0 as PrestigeLevel, to: 8 as Exclude<PrestigeLevel, 0> },
                { label: `${t('mansion.level_prefix', 'Nv.')}30 ➔ P10`, from: 0 as PrestigeLevel, to: 10 as Exclude<PrestigeLevel, 0> }
              ].map((preset) => {
                const isActive = mansionCurrent === preset.from && mansionTarget === preset.to;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setMansionCurrent(preset.from);
                      setMansionTarget(preset.to);
                    }}
                    className={`px-3 py-1 rounded-md font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <LumiLevelBadge level={preset.to} size="xs" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mr-1">
                {t('mansion.include_in_plan', 'Incluir en el Plan:')}
              </span>
              <button
                type="button"
                onClick={() => setExtraTargetLevels({})}
                className={`px-3 py-1 rounded-md font-mono text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                  Object.keys(extraTargetLevels).length === 0
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                }`}
              >
                <Castle className="w-3.5 h-3.5" />
                <span>{t('mansion.mode_prereq_only', 'Solo Requisitos Mansión')}</span>
              </button>
              <button
                type="button"
                onClick={handleApply3TroopBuildings}
                className="px-3 py-1 rounded-md font-mono text-xs flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>{t('mansion.mode_plus_troops', { lvl: SHORT_PRESTIGE_LABELS[mansionTarget] })}</span>
              </button>
              <button
                type="button"
                onClick={handleApplyFullSettlement}
                className="px-3 py-1 rounded-md font-mono text-xs flex items-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('mansion.mode_all_settlement', { lvl: SHORT_PRESTIGE_LABELS[mansionTarget] })}</span>
              </button>
            </div>
          </div>

          {/* Tarjetas Resumen de Luminio y Composite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="flex items-center gap-3 bg-black/50 border border-amber-500/30 rounded-xl px-4 py-3">
              <img
                src="/edificios/Item_Luminium.webp"
                alt="Luminio"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400/90">
                  {t('mansion.luminio_needed', 'Luminio Requerido')}
                </div>
                <div className="font-bebas text-2xl sm:text-3xl tracking-wider text-white leading-none mt-0.5">
                  {calculationResult.activeLuminioNeeded.toLocaleString()}
                </div>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 bg-black/50 border rounded-xl px-4 py-3 ${
                calculationResult.activeCompositeNeeded > 0
                  ? 'border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'border-white/10 opacity-60'
              }`}
            >
              <img
                src="/edificios/Item_RefinedLuminium.webp"
                alt="Luminium Composite"
                className="w-9 h-9 object-contain shrink-0"
              />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                  {t('mansion.composite_title', 'Luminium Composite (P6–P10)')}
                </div>
                <div className="font-bebas text-2xl sm:text-3xl tracking-wider text-cyan-200 leading-none mt-0.5">
                  {calculationResult.activeCompositeNeeded > 0
                    ? calculationResult.activeCompositeNeeded.toLocaleString()
                    : t('mansion.composite_not_required', '0 (No requiere)')}
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 flex flex-col justify-center">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                {t('mansion.inventory_title', 'Tu Inventario Actual (Luminio / Comp.)')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  value={ownedLuminio || ''}
                  placeholder={`${t('mansion.lumi_short', 'Luminio')}: 0`}
                  onChange={(e) => setOwnedLuminio(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-white/5 text-white font-mono text-xs px-2.5 py-1.5 rounded border border-gray-700 focus:border-amber-400 focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  value={ownedComposite || ''}
                  placeholder={`${t('mansion.comp_short', 'Composite')}: 0`}
                  onChange={(e) => setOwnedComposite(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-white/5 text-cyan-200 font-mono text-xs px-2.5 py-1.5 rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 bg-black/50 border border-red-500/30 rounded-xl px-4 py-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-red-400">
                  {t('mansion.missing_title', 'Te Falta Conseguir')}
                </div>
                <div className="font-bebas text-2xl tracking-wider text-red-400 leading-none mt-0.5">
                  {calculationResult.missingLuminio.toLocaleString()}{' '}
                  <span className="text-xs font-mono text-gray-400">{t('mansion.lumi_short', 'Lumi')}</span>
                  {calculationResult.missingComposite > 0 && (
                    <span className="text-cyan-300 ml-2">
                      + {calculationResult.missingComposite.toLocaleString()}{' '}
                      <span className="text-xs font-mono">{t('mansion.comp_short', 'Comp.')}</span>
                    </span>
                  )}
                </div>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 shrink-0">
                {calculationResult.progressPercent}%
              </span>
            </div>
          </div>

          {/* RESUMEN DE RECURSOS COMUNES REQUERIDOS (P1–P10) */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {t('mansion.common_resources_title', 'Recursos Comunes Requeridos en tu Plan (P1–P10)')}
              </span>
              <span className="font-mono text-[10px] text-gray-400">
                {t('mansion.base_time_total', '⏱️ Tiempo Base Total:')} <strong className="text-cyan-300 font-bold">{formatHoursToDays(calculationResult.activeHoursNeeded)}</strong>{' '}
                <span className="text-gray-500">({calculationResult.activeHoursNeeded.toLocaleString()}h {t('mansion.without_speedups', 'sin aceleradores')})</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
              <div
                className="bg-black/50 border border-emerald-500/25 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                title={`${t('mansion.food', 'Comida')}: ${calculationResult.activeFoodNeeded.toLocaleString()}`}
              >
                <img
                  src="/recursos/Item_Food.webp"
                  alt="Comida"
                  className="w-8 h-8 object-contain shrink-0 drop-shadow-md"
                />
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">{t('mansion.food', 'Comida (Food)')}</div>
                  <div className="font-bebas text-lg sm:text-xl text-white tracking-wide leading-none mt-0.5 truncate">
                    {formatResourceNumber(calculationResult.activeFoodNeeded)}
                  </div>
                </div>
              </div>

              <div
                className="bg-black/50 border border-amber-500/25 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                title={`${t('mansion.wood', 'Madera')}: ${calculationResult.activeWoodNeeded.toLocaleString()}`}
              >
                <img
                  src="/recursos/Item_Wood.webp"
                  alt="Madera"
                  className="w-8 h-8 object-contain shrink-0 drop-shadow-md"
                />
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-amber-400">{t('mansion.wood', 'Madera (Wood)')}</div>
                  <div className="font-bebas text-lg sm:text-xl text-white tracking-wide leading-none mt-0.5 truncate">
                    {formatResourceNumber(calculationResult.activeWoodNeeded)}
                  </div>
                </div>
              </div>

              <div
                className="bg-black/50 border border-slate-400/25 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                title={`${t('mansion.iron', 'Hierro')}: ${calculationResult.activeIronNeeded.toLocaleString()}`}
              >
                <img
                  src="/recursos/Item_Iron.webp"
                  alt="Hierro"
                  className="w-8 h-8 object-contain shrink-0 drop-shadow-md"
                />
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-slate-300">{t('mansion.iron', 'Hierro (Iron)')}</div>
                  <div className="font-bebas text-lg sm:text-xl text-white tracking-wide leading-none mt-0.5 truncate">
                    {formatResourceNumber(calculationResult.activeIronNeeded)}
                  </div>
                </div>
              </div>

              <div
                className="bg-black/50 border border-red-500/25 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                title={`${t('mansion.oil', 'Petróleo')}: ${calculationResult.activeOilNeeded.toLocaleString()}`}
              >
                <img
                  src="/recursos/Item_Oil.webp"
                  alt="Petróleo"
                  className="w-8 h-8 object-contain shrink-0 drop-shadow-md"
                />
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-red-400">{t('mansion.oil', 'Petróleo (Oil)')}</div>
                  <div className="font-bebas text-lg sm:text-xl text-white tracking-wide leading-none mt-0.5 truncate">
                    {formatResourceNumber(calculationResult.activeOilNeeded)}
                  </div>
                </div>
              </div>

              <div
                className="col-span-2 sm:col-span-4 lg:col-span-1 bg-black/50 border border-cyan-500/25 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                title={`${t('mansion.base_time', 'Tiempo Base')}: ${calculationResult.activeHoursNeeded.toLocaleString()}h`}
              >
                <Clock className="w-7 h-7 text-cyan-400 shrink-0 p-1 bg-cyan-950/40 rounded-lg border border-cyan-500/30" />
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-cyan-300">{t('mansion.base_time', 'Tiempo Base')}</div>
                  <div className="font-bebas text-lg sm:text-xl text-cyan-100 tracking-wide leading-none mt-0.5 truncate">
                    {formatHoursToDays(calculationResult.activeHoursNeeded)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL: MINI-MAPA INTERACTIVO (IZQUIERDA) + CAJA DE OBJETIVOS POR NIVEL (DERECHA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA IZQUIERDA (7 cols): MINI-MAPA INTERACTIVO CON ZOOM Y DRAWER INFERIOR */}
        <div className="lg:col-span-7">
          <div className="bg-[#0b0c10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Barra de Estado Superior del Mapa */}
            <div className="px-4 sm:px-5 py-3 bg-black/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 relative z-30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-gray-200">
                  {t('mansion.map_status', 'Plano del Asentamiento (Arrastra o haz Zoom)')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  {t('mansion.legend_mansion', 'Mansión')}
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  {t('mansion.legend_prereq', 'Requisito')}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  {t('mansion.legend_extra', 'Extra')}
                </span>
              </div>
            </div>

            {/* Controles Flotantes de Zoom (Arriba a la Derecha del Mapa) */}
            <div className="absolute top-16 right-3 z-30 flex flex-col gap-1.5 bg-black/75 backdrop-blur-md border border-white/15 p-1.5 rounded-xl shadow-lg">
              <button
                type="button"
                onClick={() => handleMapZoom(0.2)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-200 transition-colors cursor-pointer"
                title={t('mansion.zoom_in', 'Acercar mapa')}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMapZoom(-0.2)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-200 transition-colors cursor-pointer"
                title={t('mansion.zoom_out', 'Alejar mapa')}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetMapCamera}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-amber-400 transition-colors cursor-pointer font-mono text-[10px] font-bold"
                title={t('mansion.reset_view', 'Restablecer vista')}
              >
                <Maximize2 className="w-3.5 h-3.5 mx-auto" />
              </button>
              <span className="font-mono text-[9px] text-center text-gray-400">
                {Math.round(mapZoom * 100)}%
              </span>
            </div>

            {/* Lienzo del Mapa Interactivo con Zoom y Drag-Pan Sincronizados */}
            <div
              ref={mapViewportRef}
              onMouseDown={handleMapMouseDown}
              onMouseMove={handleMapMouseMove}
              onMouseUp={handleMapMouseUp}
              onMouseLeave={handleMapMouseUp}
              className="relative w-full aspect-square max-h-[600px] mx-auto overflow-hidden overscroll-contain bg-[#08090c] select-none cursor-grab active:cursor-grabbing"
            >
              {/* Capa Transformable: Terreno + Edificios escalan y se mueven juntos */}
              <div
                style={{
                  transform: `translate3d(${mapPan.x}px, ${mapPan.y}px, 0) scale(${mapZoom})`,
                  transformOrigin: '50% 46%'
                }}
                className="w-full h-full relative transition-transform duration-100 ease-out"
              >
                <img
                  src="/edificios/Territory_Ground.webp"
                  alt="Mapa del Asentamiento"
                  className="w-full h-full object-cover object-center pointer-events-none"
                  draggable={false}
                />

                {/* Renderizado de los 9 Edificios en las coordenadas exactas del mockup */}
                {SETTLEMENT_BUILDINGS.map((b) => {
                  const startLvl = calculationResult.initialLevels[b.id];
                  const finalLvl = calculationResult.finalLevels[b.id];
                  const mandatoryTarget = calculationResult.mandatoryTargetByBuilding[b.id] || 0;
                  const extraTarget = extraTargetLevels[b.id] || 0;

                  const isUpgrading = finalLvl > startLvl;
                  const isMandatory = b.id === 'mansion' || mandatoryTarget > startLvl;
                  const isExtraUpgrading = !isMandatory && extraTarget > startLvl;
                  const isSelected = selectedBuildingId === b.id;

                  let glowClasses = '';
                  if (b.id === 'mansion') {
                    glowClasses = 'drop-shadow-[0_0_12px_rgba(245,158,11,0.65)]';
                  } else if (isMandatory) {
                    glowClasses = 'drop-shadow-[0_0_10px_rgba(239,68,68,0.55)]';
                  } else if (isExtraUpgrading) {
                    glowClasses = 'drop-shadow-[0_0_10px_rgba(16,185,129,0.55)]';
                  }

                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasDraggedMapRef.current) return;
                        setSelectedBuildingId(b.id);
                      }}
                      style={{
                        left: `${b.mapPos.x}%`,
                        top: `${b.mapPos.y}%`,
                        width: `${b.mapPos.widthPct}%`
                      }}
                      className={`group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform duration-150 focus:outline-none ${
                        isSelected ? 'z-30 scale-105' : 'z-20 hover:scale-105'
                      }`}
                    >
                      {/* Medallón de Nivel con Número Encima */}
                      {(finalLvl > 0 || isUpgrading || isSelected) && (
                        <div className="-mb-1.5 z-20 flex items-center gap-0.5 bg-black/65 backdrop-blur-xs px-1 py-0.5 rounded-full border border-white/15">
                          {isUpgrading ? (
                            <>
                              <LumiLevelBadge level={startLvl} size="xs" />
                              <span className="text-[8px] text-amber-300 font-bold px-0.5">➔</span>
                              <LumiLevelBadge level={finalLvl} size="xs" />
                            </>
                          ) : (
                            <LumiLevelBadge level={finalLvl} size="xs" />
                          )}
                        </div>
                      )}

                      {/* Sprite del edificio escalable con el mapa */}
                      <div
                        className={`relative w-full flex items-center justify-center transition-all ${glowClasses} ${
                          isSelected ? 'ring-2 ring-amber-400/80 rounded-lg bg-amber-400/10' : ''
                        }`}
                      >
                        <img
                          src={b.sprite}
                          alt={b.name}
                          className="w-full h-auto object-contain pointer-events-none"
                          draggable={false}
                        />
                      </div>

                      {/* Tooltip sutil al pasar el ratón */}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 px-1.5 py-0.5 rounded bg-black/90 text-white font-mono text-[8px] whitespace-nowrap border border-white/15 pointer-events-none z-30">
                        {b.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* MODAL COMPACTO QUE SALE DESDE ABAJO Y QUEDA EN LA PARTE INFERIOR DEL MAPA */}
              <AnimatePresence>
                {selectedBuilding && selectedBuildingId && (
                  <motion.div
                    key={selectedBuilding.id}
                    initial={{ y: 90, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 90, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute bottom-3 inset-x-3 z-40 bg-[#0d0e13]/95 backdrop-blur-md border border-white/15 rounded-xl px-3.5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    {/* Izquierda: Icono + Medallón + Nombre corto */}
                    <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={selectedBuilding.sprite}
                            alt={selectedBuilding.shortName}
                            className="w-10 h-10 object-contain bg-black/50 rounded-lg p-1 border border-white/10"
                          />
                          <div className="absolute -top-1.5 -right-1.5">
                            <LumiLevelBadge level={selectedFinalLvl} size="xs" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bebas text-lg tracking-wider text-white leading-none truncate">
                              {selectedBuilding.name}
                            </h4>
                            {selectedMandatoryLvl > selectedCurrentLvl &&
                              selectedBuildingId !== 'mansion' && (
                                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 shrink-0">
                                  {t('mansion.req_badge', { lvl: SHORT_PRESTIGE_LABELS[selectedMandatoryLvl] })}
                                </span>
                              )}
                          </div>
                          <span className="font-mono text-[10px] text-gray-400 block">
                            {selectedBuilding.id === 'mansion'
                              ? t('mansion.main_goal', {
                                  from: SHORT_PRESTIGE_LABELS[mansionCurrent],
                                  to: SHORT_PRESTIGE_LABELS[mansionTarget]
                                })
                              : t('mansion.level_cost', {
                                  cost: selectedBuilding.levels[
                                    Math.max(1, selectedFinalLvl) as Exclude<PrestigeLevel, 0>
                                  ].luminioCost
                                })}
                          </span>
                          {selectedBuilding.id === 'mansion' && MANSION_LUMI_STATS[mansionTarget] && (
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono text-gray-400 mt-0.5">
                              <span className="text-amber-300 font-semibold flex items-center gap-1" title={t('mansion.base_without_buffs', 'base sin buffs')}>
                                <Clock className="w-2.5 h-2.5 inline" /> {MANSION_LUMI_STATS[mansionTarget].baseTotalHours}h ({Math.round(MANSION_LUMI_STATS[mansionTarget].baseTotalHours / 24)}d) <span className="text-[8px] text-gray-500 font-sans">({t('mansion.base_without_buffs', 'base sin buffs')})</span>
                              </span>
                              <span className="text-gray-600">•</span>
                              <span className="inline-flex items-center gap-0.5"><img src="/recursos/Item_Food.webp" alt="" className="w-3 h-3 object-contain" /> {(MANSION_LUMI_STATS[mansionTarget].food / 1e6).toFixed(0)}M</span>
                              <span className="text-gray-600">•</span>
                              <span className="inline-flex items-center gap-0.5"><img src="/recursos/Item_Wood.webp" alt="" className="w-3 h-3 object-contain" /> {(MANSION_LUMI_STATS[mansionTarget].wood / 1e6).toFixed(0)}M</span>
                              <span className="text-gray-600">•</span>
                              <span className="inline-flex items-center gap-0.5"><img src="/recursos/Item_Iron.webp" alt="" className="w-3 h-3 object-contain" /> {(MANSION_LUMI_STATS[mansionTarget].iron / 1e6).toFixed(0)}M</span>
                              <span className="text-gray-600">•</span>
                              <span className="inline-flex items-center gap-0.5"><img src="/recursos/Item_Oil.webp" alt="" className="w-3 h-3 object-contain" /> {(MANSION_LUMI_STATS[mansionTarget].oil / 1e6).toFixed(1)}M</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedBuildingId(null)}
                        className="sm:hidden p-1 text-gray-400 hover:text-white cursor-pointer"
                        title={t('mansion.close', 'Cerrar')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Derecha: Selectores compactos de Nivel Actual -> Nivel Objetivo */}
                    {selectedBuildingId === 'mansion' ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={mansionCurrent}
                          onChange={(e) =>
                            handleMansionCurrentChange(Number(e.target.value) as PrestigeLevel)
                          }
                          className="bg-[#181920] text-white font-mono text-xs px-2.5 py-1.5 rounded-lg border border-gray-700 focus:border-amber-400 focus:outline-none cursor-pointer"
                        >
                          {ALL_LEVELS.slice(0, 10).map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {t('mansion.current_label', 'Actual')}: {lvl === 0 ? t('mansion.level_30_base', 'Nv.30') : SHORT_PRESTIGE_LABELS[lvl]}
                            </option>
                          ))}
                        </select>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <select
                          value={mansionTarget}
                          onChange={(e) =>
                            handleMansionTargetChange(
                              Number(e.target.value) as Exclude<PrestigeLevel, 0>
                            )
                          }
                          className="bg-amber-500/15 text-amber-300 font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/40 focus:border-amber-400 focus:outline-none cursor-pointer"
                        >
                          {TARGET_LEVELS.map((lvl) => (
                            <option
                              key={lvl}
                              value={lvl}
                              disabled={lvl <= mansionCurrent}
                              className="bg-[#181920] text-white"
                            >
                              {t('mansion.target_label', 'Meta')}: {SHORT_PRESTIGE_LABELS[lvl]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setSelectedBuildingId(null)}
                          className="hidden sm:inline-flex p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                          title={t('mansion.close', 'Cerrar')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 sm:flex-initial">
                          <span className="block font-mono text-[9px] uppercase text-gray-400 mb-0.5">
                            {t('mansion.current_label', 'Nivel Actual')}
                          </span>
                          <select
                            value={selectedCurrentLvl}
                            onChange={(e) => {
                              const val = Number(e.target.value) as PrestigeLevel;
                              setCustomCurrentLevels((prev) => ({
                                ...prev,
                                [selectedBuildingId]: val
                              }));
                            }}
                            className="w-full bg-[#181920] text-white font-mono text-xs px-2.5 py-1.5 rounded-lg border border-gray-700 focus:border-amber-400 focus:outline-none cursor-pointer"
                          >
                            {ALL_LEVELS.map((lvl) => (
                              <option key={lvl} value={lvl}>
                                {lvl === 0 ? t('mansion.level_30_base', 'Nv.30') : SHORT_PRESTIGE_LABELS[lvl]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400 mt-3.5 shrink-0" />

                        <div className="flex-1 sm:flex-initial">
                          <span className="block font-mono text-[9px] uppercase text-emerald-400 mb-0.5">
                            {t('mansion.target_label', 'Nivel Objetivo')}
                          </span>
                          <select
                            value={Math.max(selectedFinalLvl, extraTargetLevels[selectedBuildingId] || 0)}
                            onChange={(e) => {
                              const val = Number(e.target.value) as PrestigeLevel;
                              setExtraTargetLevels((prev) => ({
                                ...prev,
                                [selectedBuildingId]: val
                              }));
                            }}
                            className="w-full bg-emerald-500/15 text-emerald-300 font-mono font-bold text-xs px-2.5 py-1.5 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-none cursor-pointer"
                          >
                            {ALL_LEVELS.map((lvl) => (
                              <option
                                key={lvl}
                                value={lvl}
                                disabled={lvl < Math.max(selectedCurrentLvl, selectedMandatoryLvl)}
                                className="bg-[#181920] text-white"
                              >
                                {lvl === 0
                                  ? t('mansion.no_extra', 'Sin extra')
                                  : `${SHORT_PRESTIGE_LABELS[lvl]}${
                                      lvl === selectedMandatoryLvl ? ' (Req)' : ''
                                    }`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedBuildingId(null)}
                          className="hidden sm:inline-flex mt-3.5 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                          title={t('mansion.close', 'Cerrar')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (5 cols): CAJA DE OBJETIVOS POR NIVEL + AGREGAR EXTRA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0e0f14] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('mansion.roadmap_badge', 'Caja de Objetivos por Nivel')}
                </span>
                <h3 className="font-bebas text-2xl sm:text-3xl tracking-wider text-white uppercase mt-0.5 flex items-center gap-2">
                  <span>{t('mansion.roadmap_title', 'Hoja de Ruta')}</span>
                  <LumiLevelBadge level={mansionCurrent} size="sm" />
                  <span className="text-amber-400">➔</span>
                  <LumiLevelBadge level={mansionTarget} size="sm" />
                </h3>
              </div>

              <button
                onClick={handleCopyRoadmap}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-mono text-xs transition-all cursor-pointer shrink-0"
              >
                {copiedPlan ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">{t('mansion.btn_copied', '¡Copiado!')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('mansion.btn_copy_plan', 'Copiar Plan')}</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3 mb-4 leading-relaxed">
              {t('mansion.roadmap_desc', 'Cada edificio consta de 5 sub-etapas por nivel. Haz clic sobre cualquier objetivo ya completado para descontarlo del total.')}
            </p>

            {/* Lista de Fases por Nivel de Mansión */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {calculationResult.phases.map((phase) => (
                <div
                  key={phase.mansionLevel}
                  className="bg-black/50 border border-white/10 rounded-xl overflow-hidden"
                >
                  <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <LumiLevelBadge level={phase.mansionLevel} size="sm" />
                      <span className="font-bebas text-xl tracking-wider text-white">
                        {t('mansion.goal_prefix', 'Objetivo')} {PRESTIGE_LABELS[phase.mansionLevel]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-amber-300 font-bold flex items-center gap-1">
                        <img
                          src="/edificios/Item_Luminium.webp"
                          alt=""
                          className="w-4 h-4 object-contain"
                        />
                        {phase.phaseLuminioTotal.toLocaleString()}
                      </span>
                      {phase.phaseCompositeTotal > 0 && (
                        <span className="font-mono text-xs text-cyan-300 font-bold flex items-center gap-1">
                          <img
                            src="/edificios/Item_RefinedLuminium.webp"
                            alt=""
                            className="w-4 h-4 object-contain"
                          />
                          {phase.phaseCompositeTotal.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sub-barra de recursos comunes para esta fase */}
                  <div className="px-4 py-1.5 bg-black/40 border-b border-white/5 flex flex-wrap items-center gap-2.5 text-[10px] font-mono text-gray-400">
                    <span className="text-gray-500 uppercase font-semibold">{t('mansion.phase_prefix', 'Fase')} {SHORT_PRESTIGE_LABELS[phase.mansionLevel]}:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-300" title={`Comida: ${phase.phaseFoodTotal.toLocaleString()}`}>
                      <img src="/recursos/Item_Food.webp" alt="" className="w-3.5 h-3.5 object-contain" /> {formatResourceNumber(phase.phaseFoodTotal)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-300" title={`Madera: ${phase.phaseWoodTotal.toLocaleString()}`}>
                      <img src="/recursos/Item_Wood.webp" alt="" className="w-3.5 h-3.5 object-contain" /> {formatResourceNumber(phase.phaseWoodTotal)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-300" title={`Hierro: ${phase.phaseIronTotal.toLocaleString()}`}>
                      <img src="/recursos/Item_Iron.webp" alt="" className="w-3.5 h-3.5 object-contain" /> {formatResourceNumber(phase.phaseIronTotal)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-red-300" title={`Petróleo: ${phase.phaseOilTotal.toLocaleString()}`}>
                      <img src="/recursos/Item_Oil.webp" alt="" className="w-3.5 h-3.5 object-contain" /> {formatResourceNumber(phase.phaseOilTotal)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-cyan-300" title={`Tiempo base: ${phase.phaseHoursTotal} horas`}>
                      <Clock className="w-3 h-3 text-cyan-400" /> {formatHoursToDays(phase.phaseHoursTotal)}
                    </span>
                  </div>

                  <div className="p-3 space-y-2">
                    {phase.steps.map((step) => {
                      const isDone = !!completedStepKeys[step.key];
                      return (
                        <div
                          key={step.key}
                          onClick={() => toggleStepCompleted(step.key)}
                          className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-950/20 border-emerald-500/30 opacity-60'
                              : step.isMansion
                              ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-500 shrink-0" />
                            )}
                            <div className="relative shrink-0">
                              <img
                                src={step.sprite}
                                alt={step.buildingName}
                                className="w-8 h-8 object-contain"
                              />
                              <div className="absolute -bottom-1 -right-1">
                                <LumiLevelBadge level={step.toLevel} size="xs" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs font-semibold truncate ${
                                    isDone ? 'line-through text-gray-400' : 'text-white'
                                  }`}
                                >
                                  {step.buildingName}
                                </span>
                                <span
                                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                    step.isMansion
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-red-500/15 text-red-300 border border-red-500/25'
                                  }`}
                                >
                                  {step.isMansion ? t('mansion.legend_mansion', 'Mansión') : t('mansion.legend_prereq', 'Requisito')}
                                </span>
                              </div>
                              <div className="font-mono text-[11px] text-gray-400">
                                {SHORT_PRESTIGE_LABELS[step.fromLevel]} ➔{' '}
                                <strong className="text-amber-300">
                                  {SHORT_PRESTIGE_LABELS[step.toLevel]}
                                </strong>{' '}
                                <span className="text-gray-500">({step.stepCost}{t('mansion.per_stage', '/etapa')})</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-gray-400 flex-wrap">
                                <span className="inline-flex items-center gap-1" title={`Comida: ${step.foodCost.toLocaleString()}`}>
                                  <img src="/recursos/Item_Food.webp" alt="" className="w-3 h-3 object-contain" /> {formatResourceNumber(step.foodCost)}
                                </span>
                                <span className="inline-flex items-center gap-1" title={`Madera: ${step.woodCost.toLocaleString()}`}>
                                  <img src="/recursos/Item_Wood.webp" alt="" className="w-3 h-3 object-contain" /> {formatResourceNumber(step.woodCost)}
                                </span>
                                <span className="inline-flex items-center gap-1" title={`Hierro: ${step.ironCost.toLocaleString()}`}>
                                  <img src="/recursos/Item_Iron.webp" alt="" className="w-3 h-3 object-contain" /> {formatResourceNumber(step.ironCost)}
                                </span>
                                <span className="inline-flex items-center gap-1" title={`Petróleo: ${step.oilCost.toLocaleString()}`}>
                                  <img src="/recursos/Item_Oil.webp" alt="" className="w-3 h-3 object-contain" /> {formatResourceNumber(step.oilCost)}
                                </span>
                                <span className="inline-flex items-center gap-1 text-cyan-300/90" title={`Tiempo base: ${step.baseHours} horas`}>
                                  <Clock className="w-3 h-3 text-cyan-400" /> {formatHoursToDays(step.baseHours)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-amber-300 block">
                              {step.luminioCost.toLocaleString()} {t('mansion.lumi_short', 'Lumi')}
                            </span>
                            {step.compositeCost > 0 && (
                              <span className="font-mono text-[10px] font-bold text-cyan-300 block">
                                +{step.compositeCost.toLocaleString()} {t('mansion.comp_short', 'Comp.')}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {phase.unlockNote && (
                      <div className="px-2.5 pt-1 text-[11px] text-gray-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                        <span>{t(`mansion.unlock_notes.p${phase.mansionLevel}`, phase.unlockNote)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* SECCIÓN DE EDIFICIOS ADICIONALES */}
              {calculationResult.extraSteps.length > 0 && (
                <div className="bg-emerald-950/15 border border-emerald-500/30 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-emerald-500/15 border-b border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span className="font-bebas text-xl tracking-wider text-emerald-300">
                        {t('mansion.extra_buildings_title', 'Edificios Adicionales en tu Plan')}
                      </span>
                    </div>
                    <div className="text-right font-mono text-xs font-bold">
                      <span className="text-emerald-300">
                        +{calculationResult.extraLuminioTotal.toLocaleString()} {t('mansion.lumi_short', 'Lumi')}
                      </span>
                      {calculationResult.extraCompositeTotal > 0 && (
                        <span className="text-cyan-300 ml-2">
                          +{calculationResult.extraCompositeTotal.toLocaleString()} {t('mansion.comp_short', 'Comp.')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {calculationResult.extraSteps.map((step) => {
                      const isDone = !!completedStepKeys[step.key];
                      return (
                        <div
                          key={step.key}
                          onClick={() => toggleStepCompleted(step.key)}
                          className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-950/30 border-emerald-500/20 opacity-60'
                              : 'bg-black/40 border-emerald-500/25 hover:border-emerald-400/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-emerald-400/60 shrink-0" />
                            )}
                            <div className="relative shrink-0">
                              <img
                                src={step.sprite}
                                alt={step.buildingName}
                                className="w-8 h-8 object-contain"
                              />
                              <div className="absolute -bottom-1 -right-1">
                                <LumiLevelBadge level={step.toLevel} size="xs" />
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white">
                                {step.buildingName}
                              </div>
                              <div className="font-mono text-[11px] text-gray-400">
                                {SHORT_PRESTIGE_LABELS[step.fromLevel]} ➔{' '}
                                <strong className="text-emerald-300">
                                  {SHORT_PRESTIGE_LABELS[step.toLevel]}
                                </strong>{' '}
                                <span className="text-gray-500">({step.stepCost}{t('mansion.per_stage', '/etapa')})</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-gray-400 flex-wrap">
                                <span className="inline-flex items-center gap-1" title={`Comida: ${step.foodCost.toLocaleString()}`}>
                                  <img src="/recursos/Item_Food.webp" alt="" className="w-3 h-3 object-contain" /> {formatResourceNumber(step.foodCost)}
                                </span>
                                <span className="inline-flex items-center gap-1" title={`Madera: ${step.woodCost.toLocaleString()}`}>
                                  <img src="/recursos/Item_Wood.webp" alt="" className="w-3 h-3 object-contain" /> {formatResourceNumber(step.woodCost)}
                                </span>
                                <span className="inline-flex items-center gap-1" title={`Hierro: ${step.ironCost.toLocaleString()}`}>
                                  <img src="/recursos/Item_Iron.webp" alt="" className="w-3 h-3 object-contain" /> {formatResourceNumber(step.ironCost)}
                                </span>
                                <span className="inline-flex items-center gap-1" title={`Petróleo: ${step.oilCost.toLocaleString()}`}>
                                  <img src="/recursos/Item_Oil.webp" alt="" className="w-3 h-3 object-contain" /> {formatResourceNumber(step.oilCost)}
                                </span>
                                <span className="inline-flex items-center gap-1 text-cyan-300/90" title={`Tiempo base: ${step.baseHours} horas`}>
                                  <Clock className="w-3 h-3 text-cyan-400" /> {formatHoursToDays(step.baseHours)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-bold text-emerald-300 block">
                              {step.luminioCost.toLocaleString()} {t('mansion.lumi_short', 'Lumi')}
                            </span>
                            {step.compositeCost > 0 && (
                              <span className="font-mono text-[10px] font-bold text-cyan-300 block">
                                +{step.compositeCost.toLocaleString()} {t('mansion.comp_short', 'Comp.')}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* CAJA RÁPIDA PARA AGREGAR OTRO EDIFICIO AL PLAN (RESPONSIVE SIN OVERFLOW) */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-emerald-400 mb-2">
                {t('mansion.add_extra_label', '+ Añadir Otro Edificio Individual al Cálculo')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <select
                  value={quickAddBuildingId}
                  onChange={(e) => setQuickAddBuildingId(e.target.value as BuildingId)}
                  className="sm:col-span-6 min-w-0 w-full bg-[#16171d] text-white font-mono text-xs px-2.5 py-2 rounded-lg border border-gray-700 focus:border-emerald-400 focus:outline-none cursor-pointer truncate"
                >
                  {SETTLEMENT_BUILDINGS.filter((b) => b.id !== 'mansion').map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#16171d] text-white">
                      {t(`mansion.buildings.${b.id}`, b.shortName || b.name)}
                    </option>
                  ))}
                </select>

                <select
                  value={quickAddTargetLevel}
                  onChange={(e) =>
                    setQuickAddTargetLevel(Number(e.target.value) as Exclude<PrestigeLevel, 0>)
                  }
                  className="sm:col-span-3 min-w-0 w-full bg-[#16171d] text-emerald-300 font-mono font-bold text-xs px-2 py-2 rounded-lg border border-gray-700 focus:border-emerald-400 focus:outline-none cursor-pointer truncate text-center"
                >
                  {TARGET_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-[#16171d] text-white">
                      {SHORT_PRESTIGE_LABELS[lvl]}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleQuickAddExtraBuilding}
                  className="sm:col-span-3 min-w-0 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t('mansion.btn_add', 'Agregar')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DESPLEGABLE OFICIAL (DATOS EXACTOS DEL EXCEL LUMI LEVEL 1 A 10) */}
      <div className="mt-8 bg-[#0c0d12] border border-white/10 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCostTable(!showCostTable)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-bebas text-xl tracking-wider text-white uppercase">
                {t('mansion.cost_table_title', 'Tabla Oficial de Costos por Nivel (Lumi Level 1 a Lumi Level 10)')}
              </span>
              <span className="block text-xs text-gray-400">
                {t('mansion.cost_table_desc', 'Incluye costo por sub-etapa (Per Level / Starting Cost), nivel completo (Full Level Total), 3 Troop Buildings y Luminium Composite.')}
              </span>
            </div>
          </div>
          <span className="font-mono text-xs text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
            {showCostTable ? t('mansion.btn_hide_tables', 'Ocultar Tablas') : t('mansion.btn_show_tables', 'Ver Tablas Completas')}
          </span>
        </button>

        {showCostTable && (
          <div className="p-6 border-t border-white/10 space-y-6">
            <div className="flex items-center gap-2 text-xs text-amber-300/90 font-mono">
              <Wrench className="w-4 h-4" />
              <span>
                {t('mansion.cost_table_sync', 'Datos sincronizados con la hoja de cálculo oficial de Lumi Level 1 (P1) hasta Lumi Level 10 (P10).')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TARGET_LEVELS.map((lvl) => {
                const m = buildingMap.mansion.levels[lvl];
                const tBuilding = buildingMap.barracks.levels[lvl];
                const a = buildingMap.alliance.levels[lvl];
                const h = buildingMap.hero_center.levels[lvl];
                const c = buildingMap.command.levels[lvl];
                const hosp = buildingMap.hospital.levels[lvl];
                const lab = buildingMap.lab.levels[lvl];

                const rows = [
                  { name: 'Mansion', step: m.stepCost, total: m.luminioCost, troops3: null, comp: m.compositeCost },
                  { name: 'Training (x1 / x3)', step: tBuilding.stepCost, total: tBuilding.luminioCost, troops3: tBuilding.luminioCost * 3, comp: tBuilding.compositeCost },
                  { name: 'Alliance', step: a.stepCost, total: a.luminioCost, troops3: null, comp: a.compositeCost },
                  { name: 'Helipad', step: h.stepCost, total: h.luminioCost, troops3: null, comp: h.compositeCost },
                  { name: 'Command', step: c.stepCost, total: c.luminioCost, troops3: null, comp: c.compositeCost },
                  { name: 'Hospital', step: hosp.stepCost, total: hosp.luminioCost, troops3: null, comp: hosp.compositeCost },
                  { name: 'Lumi Lab', step: lab.stepCost, total: lab.luminioCost, troops3: null, comp: lab.compositeCost }
                ];

                const sum1Troop =
                  m.luminioCost +
                  tBuilding.luminioCost +
                  a.luminioCost +
                  h.luminioCost +
                  c.luminioCost +
                  hosp.luminioCost +
                  lab.luminioCost;
                const sum3Troops =
                  m.luminioCost +
                  tBuilding.luminioCost * 3 +
                  a.luminioCost +
                  h.luminioCost +
                  c.luminioCost +
                  hosp.luminioCost +
                  lab.luminioCost;
                const sumComposite3Troops =
                  m.compositeCost +
                  tBuilding.compositeCost * 3 +
                  a.compositeCost +
                  h.compositeCost +
                  c.compositeCost +
                  hosp.compositeCost +
                  lab.compositeCost;

                return (
                  <div
                    key={lvl}
                    className="bg-black/50 border border-white/10 rounded-xl overflow-hidden"
                  >
                    <div className="px-4 py-2.5 bg-amber-500/15 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LumiLevelBadge level={lvl} size="sm" />
                        <span className="font-bebas text-lg tracking-wider text-amber-300">
                          Lumi Level {lvl} ({SHORT_PRESTIGE_LABELS[lvl]})
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-gray-300">
                        {t('mansion.total_1_troop', 'Total (1 Tropa):')} <strong>{sum1Troop.toLocaleString()}</strong> | {t('mansion.total_3_troops', '(3 Tropas):')}{' '}
                        <strong className="text-amber-300">{sum3Troops.toLocaleString()}</strong>
                      </span>
                    </div>
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] text-gray-400 uppercase bg-white/[0.02]">
                          <th className="py-2 px-3">{t('mansion.th_building', 'Building')}</th>
                          <th className="py-2 px-2 text-right">{t('mansion.th_per_step', 'Per Step')}</th>
                          <th className="py-2 px-2 text-right">{t('mansion.th_full_total', 'Full Total')}</th>
                          <th className="py-2 px-2 text-right">{t('mansion.th_3_troops', '3 Troops')}</th>
                          <th className="py-2 px-3 text-right text-cyan-300">{t('mansion.th_composite', 'Composite')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {rows.map((r) => (
                          <tr key={r.name} className="hover:bg-white/[0.02]">
                            <td className="py-2 px-3 font-sans font-medium text-white">{r.name}</td>
                            <td className="py-2 px-2 text-right text-gray-400">
                              {r.step.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-right text-amber-200 font-semibold">
                              {r.total.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-right text-emerald-300">
                              {r.troops3 ? r.troops3.toLocaleString() : '—'}
                            </td>
                            <td className="py-2 px-3 text-right text-cyan-300">
                              {r.comp > 0 ? r.comp.toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {sumComposite3Troops > 0 && (
                        <tfoot>
                          <tr className="border-t border-white/10 bg-cyan-950/20 text-[11px]">
                            <td colSpan={4} className="py-2 px-3 text-gray-300">
                              Total Composite Nivel {lvl} (con las 3 Tropas):
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-cyan-300">
                              {sumComposite3Troops.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* TABLA GUÍA DE HOJA DE RUTA: MANSIÓN NIVEL 1 A 30 (BASE) */}
      <div className="mt-6 bg-[#0c0d12] border border-white/10 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowBase1To30Table(!showBase1To30Table)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Castle className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-bebas text-xl tracking-wider text-white uppercase">
                {t('mansion.guide_title', 'Guía de Requisitos & Tiempos: Mansión Nivel 1 a 30 (Base)')}
              </span>
              <span className="block text-xs text-gray-400">
                {t('mansion.guide_desc', 'Consulta los edificios previos obligatorios, recursos comunes (Comida, Madera, Hierro, Petróleo) y tiempo de construcción (tiempo base sin buffs) para llegar al Nivel 30.')}
              </span>
            </div>
          </div>
          <span className="font-mono text-xs text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full shrink-0">
            {showBase1To30Table ? t('mansion.btn_hide_guide', 'Ocultar Guía 1–30') : t('mansion.btn_show_guide', 'Ver Guía Nv. 1 a 30')}
          </span>
        </button>

        {showBase1To30Table && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  {t('mansion.guide_note', '*Tiempos base del juego (sin potenciadores de velocidad, talentos ni ayudas de alianza).')}
                </span>
              </div>
              <a
                href="/guias/mansion-nivel-1-a-30"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] shrink-0"
              >
                <Castle className="w-3.5 h-3.5" />
                <span>{t('mansion.btn_full_guide', 'Ver Guía Completa en /guias')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] text-gray-400 uppercase bg-white/[0.03]">
                    <th className="py-3 px-3">{t('mansion.th_level', 'Nivel')}</th>
                    <th className="py-3 px-4">{t('mansion.th_prereqs', 'Requisitos Previos')}</th>
                    <th className="py-3 px-3 text-right">{t('mansion.th_base_time', 'Tiempo Base')}</th>
                    <th className="py-3 px-3 text-right text-emerald-300">{t('mansion.th_cp', 'Poder (CP)')}</th>
                    <th className="py-3 px-3 text-right text-amber-200">{t('mansion.th_food', 'Comida')}</th>
                    <th className="py-3 px-3 text-right text-amber-200">{t('mansion.th_wood', 'Madera')}</th>
                    <th className="py-3 px-3 text-right text-amber-200">{t('mansion.th_iron', 'Hierro')}</th>
                    <th className="py-3 px-3 text-right text-amber-200">{t('mansion.th_oil', 'Petróleo')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {BASE_MANSION_LEVELS_1_TO_30.map((item) => (
                    <tr key={item.level} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-amber-400 font-bebas text-base">
                        {t('mansion.level_prefix', 'Nv.')} {item.level}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-gray-200 text-xs">
                        {item.requirements}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-300">
                        {item.timeFormatted}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-300 font-bold">
                        {item.combatPower.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-400">
                        {item.food > 0 ? item.food.toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-400">
                        {item.wood > 0 ? item.wood.toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-400">
                        {item.iron > 0 ? item.iron.toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-400">
                        {item.oil > 0 ? item.oil.toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MansionCalculator;
