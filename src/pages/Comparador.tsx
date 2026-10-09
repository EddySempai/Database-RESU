import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Crosshair, Heart, Zap, Search, X, Loader2, Compass, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { useOperativos } from '../hooks/useOperativos';
import { getRedQueenResponse } from '../services/geminiService';
import { useOnboarding, OnboardingTour, TutorialButton } from '../components/OnboardingTour';
import type { Step } from 'react-joyride';

interface SkillItem {
  name: string;
  description: string;
  type: string;
  iconUrl?: string;
  isArmaEspecial?: boolean;
  isVipSkill?: boolean;
}

interface Operativo {
  id: string;
  name: string;
  imageUrl: string;
  unitType: string;
  rarity: string;
  stats: {
    health: number;
    attack: number;
    defense: number;
  };
  fieldStats?: { label: string, value: string }[];
  skills?: SkillItem[];
}

const Comparador = () => {
  const { t } = useTranslation();
  const { run, startTour, handleJoyrideCallback, stepIndex, advanceTour } = useOnboarding('comparador_calc');
  const operativosData = useOperativos();
  const [slot1, setSlot1] = useState<Operativo | null>(null);
  const [slot2, setSlot2] = useState<Operativo | null>(null);
  const [selectingSlot, setSelectingSlot] = useState<1 | 2 | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<'all' | 'campo' | 'exploracion'>('all');
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Filter logic for modal
  const getSelectableOperativos = () => {
    let filtered = operativosData as Operativo[];
    
    // Si estamos seleccionando el Slot 2 y el Slot 1 tiene un personaje, filtramos por clase
    if (selectingSlot === 2 && slot1) {
      filtered = filtered.filter(op => op.unitType === slot1?.unitType);
    } else if (selectingSlot === 1 && slot2) {
      filtered = filtered.filter(op => op.unitType === slot2?.unitType);
    }

    if (searchTerm) {
      filtered = filtered.filter(op => op.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered;
  };

  const handleSelect = (op: Operativo) => {
    if (selectingSlot === 1) { setSlot1(op); if (run && stepIndex === 1) advanceTour(); }
    if (selectingSlot === 2) { setSlot2(op); if (run && stepIndex === 3) advanceTour(); }
    setSelectingSlot(null);
    setSearchTerm('');
    setAiAnalysis(null); // Reset analysis on change
  };

  const handleAnalyze = async () => {
    if (!slot1 || !slot2) return;
    setIsAnalyzing(true);
    try {
      const prompt = `Analiza la comparación táctica entre estos dos operativos de la clase ${slot1?.unitType}: ${slot1?.name} y ${slot2?.name}. 
      Compara brevemente sus estadísticas de Salud, Ataque y Defensa. Luego dime cuál tiene mejores habilidades para el campo de batalla o para economía/exploración.
      Mantén tu personalidad de Red Queen. Sé concluyente y recomienda cuál llevar al combate directo.`;
      
      const response = await getRedQueenResponse([], prompt);
      setAiAnalysis(response);
    } catch (e) {
      console.error(e);
      setAiAnalysis("t('comparador.sys_error')");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const renderBaseStatComparison = (
    label: string, 
    icon: React.ReactNode, 
    val1: number, 
    val2: number
  ) => {
    const isTie = val1 === val2;
    const slot1Wins = val1 > val2;
    const slot2Wins = val2 > val1;
    const maxVal = Math.max(val1, val2, 1);
    const diff = Math.abs(val1 - val2);

    // If tie: both bars at 50% width meeting at the center punto medio
    // If winner: winner is 100%, loser is proportional to max
    const pct1 = isTie ? 50 : (slot1Wins ? 100 : Math.max(14, Math.round((val1 / maxVal) * 100)));
    const pct2 = isTie ? 50 : (slot2Wins ? 100 : Math.max(14, Math.round((val2 / maxVal) * 100)));

    const leftBarGradient = isTie
      ? 'bg-gradient-to-l from-gray-500 to-gray-700'
      : slot1Wins
        ? 'bg-gradient-to-l from-emerald-400 via-emerald-500 to-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
        : 'bg-gradient-to-l from-rose-600 via-rose-700 to-rose-900/60';

    const rightBarGradient = isTie
      ? 'bg-gradient-to-r from-gray-500 to-gray-700'
      : slot2Wins
        ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
        : 'bg-gradient-to-r from-rose-600 via-rose-700 to-rose-900/60';

    return (
      <div className="border-b border-gray-800/60 pb-5 pt-1">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Slot 1 Stat Value */}
          <div className="w-16 sm:w-28 text-right shrink-0">
            <span className={`font-mono text-base sm:text-xl font-bold tracking-tight block ${
              isTie 
                ? 'text-gray-300' 
                : slot1Wins 
                  ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]' 
                  : 'text-rose-500/80'
            }`}>
              {val1.toLocaleString()}
            </span>
            {!isTie && slot1Wins && (
              <span className="text-[10px] font-mono font-semibold text-emerald-400/90 hidden sm:block">
                +{diff.toLocaleString()}
              </span>
            )}
          </div>

          {/* Left Bar (Slot 1) */}
          <div className="flex-1 bg-gray-950/90 border border-gray-800/90 rounded-sm h-3 sm:h-3.5 overflow-hidden flex justify-end">
            <div 
              style={{ width: `${pct1}%` }} 
              className={`h-full rounded-sm transition-all duration-500 ${leftBarGradient}`} 
            />
          </div>

          {/* Center Column: Icon + Label + Punto Medio Indicator */}
          <div className="w-20 sm:w-28 flex flex-col items-center justify-center shrink-0 text-center px-1">
            <div className={`mb-1 shrink-0 ${isTie ? 'text-amber-400' : 'text-gray-400'}`}>
              {icon}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold line-clamp-1">
              {label}
            </span>
            {isTie ? (
              <span className="mt-1 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/50 border border-amber-600/40 px-1.5 py-0.5 rounded shadow-sm">
                Punto Medio
              </span>
            ) : (
              <span className="mt-0.5 text-[9px] font-mono text-gray-500">
                Δ {diff.toLocaleString()}
              </span>
            )}
          </div>

          {/* Right Bar (Slot 2) */}
          <div className="flex-1 bg-gray-950/90 border border-gray-800/90 rounded-sm h-3 sm:h-3.5 overflow-hidden flex justify-start">
            <div 
              style={{ width: `${pct2}%` }} 
              className={`h-full rounded-sm transition-all duration-500 ${rightBarGradient}`} 
            />
          </div>

          {/* Slot 2 Stat Value */}
          <div className="w-16 sm:w-28 text-left shrink-0">
            <span className={`font-mono text-base sm:text-xl font-bold tracking-tight block ${
              isTie 
                ? 'text-gray-300' 
                : slot2Wins 
                  ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]' 
                  : 'text-rose-500/80'
            }`}>
              {val2.toLocaleString()}
            </span>
            {!isTie && slot2Wins && (
              <span className="text-[10px] font-mono font-semibold text-emerald-400/90 hidden sm:block">
                +{diff.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getCleanIconUrl = (url?: string) => {
    if (!url) return '';
    let cleanUrl = url.trim();
    if (cleanUrl.startsWith('/public')) {
      cleanUrl = cleanUrl.replace('/public', '');
    } else if (cleanUrl.startsWith('public/')) {
      cleanUrl = cleanUrl.replace('public/', '/');
    }
    if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
      cleanUrl = '/' + cleanUrl;
    }
    return cleanUrl;
  };

  const isSkillInCampo = (s: SkillItem) => {
    const tp = (s.type || '').toLowerCase();
    return (tp.includes('campo') || tp.includes('field') || tp.includes('フィールド')) && !s.isVipSkill;
  };

  const isSkillInExplora = (s: SkillItem) => {
    const tp = (s.type || '').toLowerCase();
    return (tp.includes('explor') || tp.includes('探索')) && !s.isVipSkill;
  };

  const renderSkillCard = (skill: SkillItem, idx: number, theme: 'campo' | 'exploracion') => {
    const isCampo = theme === 'campo';
    const borderColor = isCampo 
      ? 'border-blood-red/40 group-hover:border-blood-red/80' 
      : 'border-emerald-500/40 group-hover:border-emerald-500/80';
    const shadowColor = isCampo 
      ? 'shadow-[0_0_12px_rgba(220,38,38,0.25)] group-hover:shadow-[0_0_18px_rgba(220,38,38,0.45)]' 
      : 'shadow-[0_0_12px_rgba(16,185,129,0.25)] group-hover:shadow-[0_0_18px_rgba(16,185,129,0.45)]';
    const accentText = isCampo ? 'text-neon-red' : 'text-emerald-400';
    const tagBg = isCampo 
      ? 'bg-red-950/40 text-red-400 border-red-800/40' 
      : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';

    return (
      <div 
        key={idx} 
        className="group bg-[#060606] hover:bg-[#0b0b0b] border border-gray-800/80 hover:border-gray-700 p-3.5 sm:p-4 rounded-lg transition-all duration-300 flex items-start gap-3.5 sm:gap-4 relative overflow-hidden"
      >
        {/* Circular Skill Icon */}
        <div className="relative shrink-0 flex items-center justify-center mt-0.5">
          {skill.iconUrl ? (
            <img 
              src={getCleanIconUrl(skill.iconUrl)} 
              alt={skill.name} 
              className={`w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-full border-2 ${borderColor} ${shadowColor} bg-black/80 transition-all duration-300 group-hover:scale-105`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.skill-fallback-icon');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            style={{ display: skill.iconUrl ? 'none' : 'flex' }}
            className={`skill-fallback-icon w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 border-2 ${borderColor} rounded-full items-center justify-center font-bebas ${accentText} text-sm sm:text-base ${shadowColor}`}
          >
            {isCampo ? `C${idx + 1}` : `E${idx + 1}`}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${tagBg}`}>
              {skill.isArmaEspecial 
                ? t('op_detail.special_weapon', 'Arma Especial') 
                : skill.isVipSkill 
                  ? t('op_detail.vip_skill', 'VIP') 
                  : (isCampo ? t('heroes.field', 'Campo') : t('heroes.exploration', 'Exploración'))}
            </span>
            {skill.isArmaEspecial && (
              <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-400 border border-purple-800/40">
                Exclusiva
              </span>
            )}
          </div>
          <h4 className="font-bebas text-base sm:text-lg text-white tracking-wider group-hover:text-gray-100 transition-colors">
            {skill.name}
          </h4>
          <p className="font-inter text-gray-400 text-xs leading-relaxed mt-1 break-words">
            {skill.description}
          </p>
        </div>
      </div>
    );
  };

  const renderSlot = (slot: 1 | 2, op: Operativo | null) => {
    return (
      <div className={`flex-1 bg-[#050505] border border-gray-800 p-6 flex flex-col relative min-h-[400px] tour-comparador-slot-${slot}`}>
        {op ? (
          <div className="flex flex-col h-full">
            <button 
              onClick={() => slot === 1 ? setSlot1(null) : setSlot2(null)}
              className="absolute top-4 right-4 z-20 text-gray-500 hover:text-white bg-black/50 p-1 rounded"
            >
              <X size={20} />
            </button>
            <div className="h-64 overflow-hidden relative border-b border-gray-800 mb-6 cursor-pointer group" onClick={() => { setSelectingSlot(slot); if (run && (stepIndex === 0 || stepIndex === 2)) advanceTour(); }}>
              <div className="absolute inset-0 bg-blood-red/0 group-hover:bg-blood-red/10 transition-colors z-10" />
              <img src={`/operativos/${op.imageUrl.split('/').pop()}`} alt={op.name} className="w-full h-full object-contain object-bottom group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-blood-red tracking-widest uppercase mb-1">
                {op.unitType && (
                  <img 
                    src={
                      op.unitType.toLowerCase().includes('defen') ? '/icons/units/UI_Hero_Infantry.webp' :
                      op.unitType.toLowerCase().includes('rang') ? '/icons/units/UI_Hero_Rifle.webp' :
                      '/icons/units/UI_Hero_Heavy.webp'
                    } 
                    alt={op.unitType} 
                    className="w-4 h-4 object-contain shrink-0 inline-block" 
                  />
                )}
                <span>{op.unitType} / {op.rarity}</span>
              </div>
              <h3 className="font-bebas text-3xl tracking-widest text-white">{op.name}</h3>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => { setSelectingSlot(slot); if (run && (stepIndex === 0 || stepIndex === 2)) advanceTour(); }}
            className="flex-1 border-2 border-dashed border-gray-700 hover:border-blood-red hover:bg-blood-red/5 flex flex-col items-center justify-center text-gray-500 hover:text-white transition-all group"
          >
            <Search className="mb-4 w-12 h-12 group-hover:scale-110 transition-transform" />
            <span className="font-bebas text-2xl tracking-widest">{t('comparador.select_op')}</span>
            {((slot === 2 && slot1) || (slot === 1 && slot2)) && (
              <span className="font-mono text-xs text-blood-red mt-2 uppercase">{t('comparador.must_be_class', { unitType: slot1 ? slot1?.unitType : slot2?.unitType })}</span>
            )}
          </button>
        )}
      </div>
    );
  };

  const steps: Step[] = [
    {
      target: '.tour-comparador-slot-1',
      content: t('tour.comparador_step1', 'Elige tu primer operativo haciendo clic en esta ranura vacía.'),
      buttons: ['close', 'skip'],
    },
    {
      target: '.tour-comparador-modal-header',
      content: t('tour.comparador_step1_modal', 'Selecciona a cualquier operativo de la lista para comenzar.'),
      placement: 'bottom',
      hideOverlay: true,
      disableFocusTrap: true,
      buttons: ['close', 'skip'],
    },
    {
      target: '.tour-comparador-slot-2',
      content: t('tour.comparador_step2', 'Ahora haz clic en la segunda ranura. ¡Nota importante: solo podrás compararlo con operativos de su MISMA CLASE táctica!'),
      buttons: ['close', 'skip'],
    },
    {
      target: '.tour-comparador-modal-header',
      content: t('tour.comparador_step2_modal', 'Elige al segundo operativo para completar la pareja y ver los resultados.'),
      placement: 'bottom',
      hideOverlay: true,
      disableFocusTrap: true,
      buttons: ['close', 'skip'],
    },
    {
      target: '.tour-comparador-stats',
      content: t('tour.comparador_step3', 'Aquí verás quién gana en estadísticas base de vida, ataque y defensa.'),
    },
    {
      target: '.tour-comparador-ai',
      content: t('tour.comparador_step4', 'Si quieres un análisis más profundo, nuestra IA (Red Queen) puede generar un reporte táctico de cómo interactúan las habilidades de ambos héroes.'),
    }
  ];

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen relative z-10 flex flex-col w-full overflow-x-hidden">
      <Helmet>
        <title>Comparador de Héroes y Atributos | Resident Evil: Survival Unit Wiki</title>
        <meta name="description" content="Compara héroes cara a cara en Resident Evil: Survival Unit. Analiza estadísticas base de vida, ataque, defensa, porcentaje de habilidades de campo y sinergia con IA (Red Queen)." />
        <link rel="canonical" href="https://resudb.com/comparador" />
        <meta property="og:title" content="Comparador de Héroes | Resident Evil: Survival Unit Wiki" />
        <meta property="og:description" content="Comparador táctico de héroes cara a cara para Resident Evil: Survival Unit." />
        <meta property="og:url" content="https://resudb.com/comparador" />
        <meta property="og:image" content="https://resudb.com/metadata-img.png" />
      </Helmet>
      <OnboardingTour run={run} steps={steps} stepIndex={stepIndex} handleJoyrideCallback={handleJoyrideCallback} />
      {/* Top Action Bar */}
      <div className="flex justify-center sm:justify-end mb-4">
        <TutorialButton 
          onClick={startTour} 
          className="flex items-center gap-2 bg-black/80 hover:bg-blood-red/20 border border-gray-700 hover:border-blood-red text-gray-400 hover:text-white px-4 py-1.5 rounded-full transition-all cursor-pointer group shadow-lg text-xs font-mono" 
        />
      </div>

      <div className="text-center mb-8 sm:mb-12">
        <h1 className="font-bebas text-4xl sm:text-5xl md:text-7xl tracking-wider sm:tracking-widest text-white uppercase drop-shadow-lg mb-2 break-words">
          {t('comparador.title_main', 'Análisis Comparativo')}
        </h1>
        <p className="font-mono text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto uppercase tracking-wider sm:tracking-widest px-2 leading-relaxed">
          {t('comparador.subtitle_main', 'Simulación de combate directo. Solo operativos de la misma clase táctica son elegibles para comparación.')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-12 flex-1">
        {/* SLOT 1 */}
        {renderSlot(1, slot1)}

        {/* VS Divider */}
        <div className="flex items-center justify-center lg:w-16 shrink-0 py-6 lg:py-0">
          <div className="w-16 h-16 rounded-full border border-gray-700 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(255,42,42,0.2)]">
            <span className="font-bebas text-2xl text-blood-red tracking-widest">VS</span>
          </div>
        </div>

        {/* SLOT 2 */}
        {renderSlot(2, slot2)}
      </div>

      {/* STATS COMPARISON SECTION */}
      {(slot1 && slot2 || (run && stepIndex >= 4)) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-[#050505] border border-gray-800 p-6 md:p-12 mb-12 tour-comparador-stats ${(!slot1 || !slot2) ? "opacity-0 pointer-events-none" : ""}`}
        >
          <h3 className="font-bebas text-2xl sm:text-3xl tracking-wider sm:tracking-widest text-center mb-6 sm:mb-8 border-b border-gray-800 pb-4">{t('comparador.base_performance', 'Desempeño Base (Nivel 1)')}</h3>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Health */}
            {renderBaseStatComparison(
              t('heroes.health', 'Salud'),
              <Heart size={18} />,
              slot1?.stats.health ?? 0,
              slot2?.stats.health ?? 0
            )}

            {/* Attack */}
            {renderBaseStatComparison(
              t('heroes.attack', 'Ataque'),
              <Crosshair size={18} />,
              slot1?.stats.attack ?? 0,
              slot2?.stats.attack ?? 0
            )}

            {/* Defense */}
            {renderBaseStatComparison(
              t('heroes.defense', 'Defensa'),
              <Shield size={18} />,
              slot1?.stats.defense ?? 0,
              slot2?.stats.defense ?? 0
            )}
          </div>

          {/* Field Stats */}
          <div className="mt-10 border-t border-gray-800 pt-8">
            <h4 className="font-bebas text-xl text-blood-red tracking-widest text-center mb-6">
              {t('comparador.field_percentages', 'Porcentajes de Campo (Habilidades)')}
            </h4>
            
            <div className="space-y-4">
              {(() => {
                const list1 = slot1?.fieldStats || [];
                const list2 = slot2?.fieldStats || [];
                const maxLen = Math.max(list1.length, list2.length);

                if (maxLen === 0) {
                  return (
                    <div className="text-center text-gray-500 font-mono text-xs py-4">
                      {t('comparador.no_field_stats', 'Sin estadísticas de campo registradas')}
                    </div>
                  );
                }

                return Array.from({ length: maxLen }).map((_, i) => {
                  const s1 = list1[i];
                  const s2 = list2[i];

                  const num1 = s1 ? parseFloat(s1.value.replace('%', '').replace(',', '.').trim()) || 0 : 0;
                  const num2 = s2 ? parseFloat(s2.value.replace('%', '').replace(',', '.').trim()) || 0 : 0;

                  const isTie = Math.abs(num1 - num2) < 0.001;
                  const s1Wins = num1 > num2;
                  const s2Wins = num2 > num1;
                  const diff = Math.abs(num1 - num2);

                  const combinedLabel = `${s1?.label || ''} ${s2?.label || ''}`.toLowerCase();
                  const isAttack = combinedLabel.includes('ataque') || combinedLabel.includes('attack');
                  const isDefense = combinedLabel.includes('defensa') || combinedLabel.includes('defense');

                  const categoryTitle = isAttack 
                    ? t('heroes.field_attack', 'Poder de Ataque') 
                    : isDefense 
                      ? t('heroes.field_defense', 'Poder de Defensa') 
                      : (s1?.label || s2?.label || t('comparador.field_stat', 'Estadística'));

                  const totalNum = num1 + num2;
                  const pctShare1 = totalNum > 0 ? (num1 / totalNum) * 100 : 50;
                  const pctShare2 = totalNum > 0 ? (num2 / totalNum) * 100 : 50;

                  return (
                    <div key={i} className="bg-[#080808] border border-gray-800/80 p-4 sm:p-5 rounded-sm space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          {isAttack ? (
                            <Crosshair size={17} className="text-neon-red shrink-0" />
                          ) : isDefense ? (
                            <Shield size={17} className="text-blue-400 shrink-0" />
                          ) : (
                            <Zap size={17} className="text-amber-400 shrink-0" />
                          )}
                          <span className="font-bebas text-lg sm:text-xl tracking-wider text-white">
                            {categoryTitle}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isTie ? (
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-600/40 px-2 py-0.5 rounded shadow-sm">
                              Punto Medio (Empate)
                            </span>
                          ) : s1Wins ? (
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 rounded shadow-sm">
                              Ventaja: {slot1?.name} (+{diff.toFixed(2)}%)
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 rounded shadow-sm">
                              Ventaja: {slot2?.name} (+{diff.toFixed(2)}%)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Side-by-side Cards with Background Colors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Slot 1 Card */}
                        <div className={`p-4 rounded-sm border transition-all flex flex-col justify-between ${
                          isTie 
                            ? 'bg-gray-900/40 border-gray-700/60' 
                            : s1Wins 
                              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.12)]' 
                              : 'bg-rose-950/20 border-rose-900/50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-semibold truncate max-w-[120px] sm:max-w-[160px]">
                              {slot1?.name}
                            </span>
                            {isTie ? (
                              <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700">
                                EMPATE
                              </span>
                            ) : s1Wins ? (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                                ▲ GANADOR (+{diff.toFixed(2)}%)
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-900/40">
                                ▼ PERDEDOR (-{diff.toFixed(2)}%)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 truncate">
                            {s1?.label || '—'}
                          </div>
                          <div className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${
                            isTie ? 'text-gray-200' : s1Wins ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-rose-400/90'
                          }`}>
                            {s1?.value || '0.00%'}
                          </div>
                        </div>

                        {/* Slot 2 Card */}
                        <div className={`p-4 rounded-sm border transition-all flex flex-col justify-between ${
                          isTie 
                            ? 'bg-gray-900/40 border-gray-700/60' 
                            : s2Wins 
                              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.12)]' 
                              : 'bg-rose-950/20 border-rose-900/50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-semibold truncate max-w-[120px] sm:max-w-[160px]">
                              {slot2?.name}
                            </span>
                            {isTie ? (
                              <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700">
                                EMPATE
                              </span>
                            ) : s2Wins ? (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                                ▲ GANADOR (+{diff.toFixed(2)}%)
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-900/40">
                                ▼ PERDEDOR (-{diff.toFixed(2)}%)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 truncate">
                            {s2?.label || '—'}
                          </div>
                          <div className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${
                            isTie ? 'text-gray-200' : s2Wins ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-rose-400/90'
                          }`}>
                            {s2?.value || '0.00%'}
                          </div>
                        </div>
                      </div>

                      {/* Comparative Balance Gauge */}
                      <div className="pt-2">
                        <div className="h-2 w-full bg-gray-950 rounded-full border border-gray-800/80 overflow-hidden flex relative">
                          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/40 z-10 -translate-x-1/2" />
                          <div 
                            style={{ width: `${pctShare1}%` }}
                            className={`h-full transition-all duration-500 ${
                              isTie 
                                ? 'bg-gray-600' 
                                : s1Wins 
                                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' 
                                  : 'bg-gradient-to-r from-rose-700 to-rose-600'
                            }`}
                          />
                          <div 
                            style={{ width: `${pctShare2}%` }}
                            className={`h-full transition-all duration-500 ${
                              isTie 
                                ? 'bg-gray-600' 
                                : s2Wins 
                                  ? 'bg-gradient-to-l from-emerald-600 to-emerald-400' 
                                  : 'bg-gradient-to-l from-rose-700 to-rose-600'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-gray-500 mt-1">
                          <span className={s1Wins ? 'text-emerald-400 font-bold' : ''}>
                            {slot1?.name}: {pctShare1.toFixed(1)}%
                          </span>
                          <span className={isTie ? 'text-amber-400 font-bold' : 'text-gray-400'}>
                            PUNTO MEDIO 50/50
                          </span>
                          <span className={s2Wins ? 'text-emerald-400 font-bold' : ''}>
                            {slot2?.name}: {pctShare2.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Hero Skills Comparison */}
          <div className="mt-16 max-w-5xl mx-auto border-t border-gray-800 pt-12">
            <h2 className="font-bebas text-3xl sm:text-4xl tracking-widest text-center text-neon-red mb-4 uppercase drop-shadow-[0_0_12px_rgba(255,42,42,0.4)]">
              {t('comparador.skill_archives', 'Archivos de Habilidades')}
            </h2>
            <p className="text-gray-400 font-mono text-xs text-center max-w-2xl mx-auto mb-8">
              {t('comparador.skill_archives_subtitle', 'Comparación detallada de habilidades activas y pasivas entre ambos operativos según su contexto táctico.')}
            </p>

            {/* Filter Tabs: Todas, Campo, Exploración */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10 flex-wrap">
              <button
                type="button"
                onClick={() => setSkillFilter('all')}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-sm border transition-all cursor-pointer ${
                  skillFilter === 'all'
                    ? 'bg-blood-red text-white border-neon-red shadow-[0_0_15px_rgba(255,42,42,0.4)] font-bold'
                    : 'bg-black/60 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                }`}
              >
                {t('comparador.all_skills', 'Todas las Habilidades')}
              </button>
              <button
                type="button"
                onClick={() => setSkillFilter('campo')}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-sm border transition-all cursor-pointer flex items-center gap-2 ${
                  skillFilter === 'campo'
                    ? 'bg-red-950/70 text-red-200 border-blood-red shadow-[0_0_15px_rgba(220,38,38,0.4)] font-bold'
                    : 'bg-black/60 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                }`}
              >
                <Shield size={14} className="text-blood-red" />
                {t('heroes.field', 'Sección Campo')}
              </button>
              <button
                type="button"
                onClick={() => setSkillFilter('exploracion')}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-sm border transition-all cursor-pointer flex items-center gap-2 ${
                  skillFilter === 'exploracion'
                    ? 'bg-emerald-950/70 text-emerald-200 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold'
                    : 'bg-black/60 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                }`}
              >
                <Compass size={14} className="text-emerald-400" />
                {t('heroes.exploration', 'Sección Exploración')}
              </button>
            </div>

            {/* SECCIÓN CAMPO */}
            {(skillFilter === 'all' || skillFilter === 'campo') && (() => {
              const s1Campo = (slot1?.skills || []).filter(isSkillInCampo);
              const s2Campo = (slot2?.skills || []).filter(isSkillInCampo);

              return (
                <div className="mb-12">
                  <div className="flex items-center justify-between border-b border-blood-red/40 pb-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-blood-red rounded-full shadow-[0_0_10px_#ff0000] shrink-0" />
                      <h3 className="font-bebas text-2xl tracking-widest text-white uppercase flex items-center gap-2">
                        <Shield size={20} className="text-blood-red" />
                        {t('comparador.field_skills_title', 'Sección Campo (Combate Táctico)')}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-blood-red/80 uppercase tracking-widest hidden sm:inline font-semibold">
                      {t('comparador.battle_bonuses', 'Bonificaciones de Batalla')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Slot 1 Campo */}
                    <div className="bg-[#070707] border border-gray-800 p-4 sm:p-5 rounded-lg flex flex-col shadow-lg">
                      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 mb-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={`/operativos/${slot1?.imageUrl.split('/').pop()}`} 
                            alt={slot1?.name} 
                            className="w-8 h-8 rounded-full object-cover border border-blood-red/50 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span className="font-mono text-xs uppercase tracking-wider text-gray-200 font-bold truncate">
                            {slot1?.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest shrink-0">
                          {s1Campo.length} {t('comparador.skills_count', 'Habilidades')}
                        </span>
                      </div>

                      <div className="space-y-3.5 flex-1">
                        {s1Campo.length > 0 ? (
                          s1Campo.map((skill, i) => renderSkillCard(skill, i, 'campo'))
                        ) : (
                          <div className="h-32 flex items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                            {t('comparador.no_skills', 'Sin habilidades de campo registradas')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Slot 2 Campo */}
                    <div className="bg-[#070707] border border-gray-800 p-4 sm:p-5 rounded-lg flex flex-col shadow-lg">
                      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 mb-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={`/operativos/${slot2?.imageUrl.split('/').pop()}`} 
                            alt={slot2?.name} 
                            className="w-8 h-8 rounded-full object-cover border border-blood-red/50 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span className="font-mono text-xs uppercase tracking-wider text-gray-200 font-bold truncate">
                            {slot2?.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest shrink-0">
                          {s2Campo.length} {t('comparador.skills_count', 'Habilidades')}
                        </span>
                      </div>

                      <div className="space-y-3.5 flex-1">
                        {s2Campo.length > 0 ? (
                          s2Campo.map((skill, i) => renderSkillCard(skill, i, 'campo'))
                        ) : (
                          <div className="h-32 flex items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                            {t('comparador.no_skills', 'Sin habilidades de campo registradas')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SECCIÓN EXPLORACIÓN */}
            {(skillFilter === 'all' || skillFilter === 'exploracion') && (() => {
              const s1Explore = (slot1?.skills || []).filter(isSkillInExplora);
              const s2Explore = (slot2?.skills || []).filter(isSkillInExplora);

              return (
                <div className="mb-12">
                  <div className="flex items-center justify-between border-b border-emerald-500/40 pb-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] shrink-0" />
                      <h3 className="font-bebas text-2xl tracking-widest text-white uppercase flex items-center gap-2">
                        <Compass size={20} className="text-emerald-400" />
                        {t('comparador.explore_skills_title', 'Sección Exploración (Aventura y Mapa)')}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-widest hidden sm:inline font-semibold">
                      {t('comparador.adventure_effects', 'Efectos en Aventura')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Slot 1 Exploración */}
                    <div className="bg-[#070707] border border-gray-800 p-4 sm:p-5 rounded-lg flex flex-col shadow-lg">
                      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 mb-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={`/operativos/${slot1?.imageUrl.split('/').pop()}`} 
                            alt={slot1?.name} 
                            className="w-8 h-8 rounded-full object-cover border border-emerald-500/50 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span className="font-mono text-xs uppercase tracking-wider text-gray-200 font-bold truncate">
                            {slot1?.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest shrink-0">
                          {s1Explore.length} {t('comparador.skills_count', 'Habilidades')}
                        </span>
                      </div>

                      <div className="space-y-3.5 flex-1">
                        {s1Explore.length > 0 ? (
                          s1Explore.map((skill, i) => renderSkillCard(skill, i, 'exploracion'))
                        ) : (
                          <div className="h-32 flex items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                            {t('comparador.no_skills', 'Sin habilidades de exploración registradas')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Slot 2 Exploración */}
                    <div className="bg-[#070707] border border-gray-800 p-4 sm:p-5 rounded-lg flex flex-col shadow-lg">
                      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 mb-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={`/operativos/${slot2?.imageUrl.split('/').pop()}`} 
                            alt={slot2?.name} 
                            className="w-8 h-8 rounded-full object-cover border border-emerald-500/50 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span className="font-mono text-xs uppercase tracking-wider text-gray-200 font-bold truncate">
                            {slot2?.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest shrink-0">
                          {s2Explore.length} {t('comparador.skills_count', 'Habilidades')}
                        </span>
                      </div>

                      <div className="space-y-3.5 flex-1">
                        {s2Explore.length > 0 ? (
                          s2Explore.map((skill, i) => renderSkillCard(skill, i, 'exploracion'))
                        ) : (
                          <div className="h-32 flex items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                            {t('comparador.no_skills', 'Sin habilidades de exploración registradas')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SECCIÓN HABILIDADES VIP (Si alguno de los dos tiene) */}
            {(() => {
              const s1Vip = (slot1?.skills || []).filter(s => s.isVipSkill);
              const s2Vip = (slot2?.skills || []).filter(s => s.isVipSkill);

              if (s1Vip.length === 0 && s2Vip.length === 0) return null;

              return (
                <div className="mb-12 border-t border-purple-900/30 pt-8">
                  <div className="flex items-center justify-between border-b border-purple-500/30 pb-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] shrink-0" />
                      <h3 className="font-bebas text-2xl tracking-widest text-white uppercase flex items-center gap-2">
                        <Sparkles size={20} className="text-purple-400" />
                        {t('op_detail.vip_skill', 'Habilidades VIP (Estrellas)')}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-purple-400 uppercase tracking-widest hidden sm:inline">
                      {t('op_detail.vip_stars_unlock', 'Desbloqueo por Estrellas')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Slot 1 VIP */}
                    <div className="bg-[#070707] border border-purple-500/20 p-4 sm:p-5 rounded-lg flex flex-col shadow-lg">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <img 
                            src={`/operativos/${slot1?.imageUrl.split('/').pop()}`} 
                            alt={slot1?.name} 
                            className="w-7 h-7 rounded-full object-cover border border-purple-500/40 shrink-0" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span className="font-mono text-xs uppercase tracking-wider text-gray-200 font-bold truncate">
                            {slot1?.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest shrink-0">
                          {s1Vip.length} {t('comparador.skills_count', 'Habilidades')}
                        </span>
                      </div>
                      <div className="space-y-3.5 flex-1">
                        {s1Vip.length > 0 ? (
                          s1Vip.map((skill, i) => renderSkillCard(skill, i, 'campo'))
                        ) : (
                          <div className="h-24 flex items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                            {t('comparador.no_vip_skills', 'Sin habilidad VIP')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Slot 2 VIP */}
                    <div className="bg-[#070707] border border-purple-500/20 p-4 sm:p-5 rounded-lg flex flex-col shadow-lg">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <img 
                            src={`/operativos/${slot2?.imageUrl.split('/').pop()}`} 
                            alt={slot2?.name} 
                            className="w-7 h-7 rounded-full object-cover border border-purple-500/40 shrink-0" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span className="font-mono text-xs uppercase tracking-wider text-gray-200 font-bold truncate">
                            {slot2?.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest shrink-0">
                          {s2Vip.length} {t('comparador.skills_count', 'Habilidades')}
                        </span>
                      </div>
                      <div className="space-y-3.5 flex-1">
                        {s2Vip.length > 0 ? (
                          s2Vip.map((skill, i) => renderSkillCard(skill, i, 'campo'))
                        ) : (
                          <div className="h-24 flex items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                            {t('comparador.no_vip_skills', 'Sin habilidad VIP')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* AI Analysis */}
          <div className="mt-16 text-center max-w-5xl mx-auto">
            <div className="bg-gradient-to-b from-[#0a0202] to-black border border-blood-red/20 p-8 md:p-12 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-50" />
              
              <Zap className="mx-auto text-neon-red mb-4" size={32} />
              <h2 className="font-bebas text-3xl md:text-4xl tracking-widest text-white mb-8 uppercase">
                {t('comparador.ai_analysis')}
              </h2>
              
              {!aiAnalysis ? (
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`
                    px-8 py-4 font-mono text-sm uppercase tracking-widest border transition-all duration-300
                    border-blood-red text-neon-red hover:bg-blood-red hover:text-white shadow-[0_0_15px_rgba(158,0,0,0.3)]
                  `}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> {t('comparador.analyzing')}
                    </span>
                  ) : (
                    t('comparador.btn_evaluate')
                  )}
                </button>
              ) : (
                <div className="relative z-10 text-left">
                  <div className="flex items-center gap-3 mb-4 border-b border-blood-red/30 pb-3">
                    <span className="w-2 h-2 rounded-full bg-blood-red animate-pulse"></span>
                    <h4 className="font-bebas text-2xl tracking-widest text-blood-red m-0">{t('comparador.tactical_resolution', 'Resolución Táctica')}</h4>
                  </div>
                  <div className="font-mono text-sm text-gray-300 leading-relaxed max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="font-bebas text-3xl text-white my-4 tracking-widest" {...props} />,
                        h2: ({node, ...props}) => <h2 className="font-bebas text-2xl text-white my-3 tracking-widest border-b border-gray-800 pb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="font-bebas text-xl text-blood-red my-3 tracking-widest" {...props} />,
                        h4: ({node, ...props}) => <h4 className="font-bold text-white my-2" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4" {...props} />,
                        strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
                        table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="w-full text-left border-collapse border border-gray-800" {...props} /></div>,
                        thead: ({node, ...props}) => <thead className="bg-blood-red/10 border-b border-gray-800" {...props} />,
                        th: ({node, ...props}) => <th className="p-2 border border-gray-800 text-blood-red font-mono text-xs uppercase" {...props} />,
                        td: ({node, ...props}) => <td className="p-2 border border-gray-800" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blood-red pl-4 italic text-gray-400 my-4 bg-black/50 py-2" {...props} />
                      }}
                    >
                      {aiAnalysis}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-6 text-center">
                     <button onClick={() => setAiAnalysis(null)} className="text-[10px] font-mono text-gray-500 hover:text-white uppercase underline">{t('comparador.close_eval', 'Cerrar Evaluación')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* SELECTION MODAL */}
      <AnimatePresence>
        {selectingSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#050505] border border-gray-800 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl tour-comparador-modal-content"
            >
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 tour-comparador-modal-header">
                <h2 className="font-bebas text-3xl tracking-widest text-white">Seleccionar Operativo</h2>
                <button onClick={() => setSelectingSlot(null)} className="text-gray-400 hover:text-white">
                  <X size={28} />
                </button>
              </div>
              
              <div className="p-6 border-b border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder={t('comparador.search_name')} 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-white pl-10 pr-4 py-3 font-mono focus:border-blood-red outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {getSelectableOperativos().length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-mono">
                    No hay operativos disponibles para esta selección.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {getSelectableOperativos().map(op => (
                      <button 
                        key={op.id}
                        onClick={() => handleSelect(op)}
                        className="bg-black border border-gray-800 hover:border-blood-red group transition-colors text-left flex flex-col"
                      >
                        <div className="h-32 bg-gray-900/50 overflow-hidden flex justify-center border-b border-gray-800 relative">
                          <img src={`/operativos/${op.imageUrl.split('/').pop()}`} alt={op.name} className="h-full object-contain object-bottom group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-1 text-[9px] font-mono text-gray-500 uppercase tracking-widest truncate">
                            {op.unitType && (
                              <img 
                                src={
                                  op.unitType.toLowerCase().includes('defen') ? '/icons/units/UI_Hero_Infantry.webp' :
                                  op.unitType.toLowerCase().includes('rang') ? '/icons/units/UI_Hero_Rifle.webp' :
                                  '/icons/units/UI_Hero_Heavy.webp'
                                } 
                                alt="" 
                                className="w-2.5 h-2.5 object-contain shrink-0 inline-block" 
                              />
                            )}
                            <span className="truncate">{op.unitType}</span>
                          </div>
                          <div className="font-bebas text-lg tracking-wide text-white group-hover:text-blood-red transition-colors truncate">{op.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Comparador;
