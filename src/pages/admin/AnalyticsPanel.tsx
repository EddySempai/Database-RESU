import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, TrendingDown, Loader2, Activity, Zap, Target, Swords,
  FlaskConical, Skull, Shield, Boxes, Flame, Biohazard, Award, Crown, Medal,
  Search, ChevronLeft, ChevronRight, BarChart3, Users
} from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

interface Member {
  id: string;
  nickname: string;
  rank: string;
  account_type: 'main' | 'alt';
  power: number;
  alliance_name: string;
}

interface ActivityRecord {
  id: string;
  member_id: string;
  cycle_date: string;
  power: number;
  crocodile_damage: number;
  tac_power: number;
  lab_points: number;
  wesker_points: number;
  alliance_points?: number;
  nemesis_level?: number;
  mortem_damage?: number;
  mortem_shield_damage?: number;
  mortem_prep_points?: number;
}

export type MetricType = 
  | 'power'
  | 'crocodile_damage'
  | 'tac_power'
  | 'lab_points'
  | 'mortem_damage'
  | 'mortem_shield_damage'
  | 'mortem_prep_points'
  | 'nemesis_level'
  | 'wesker_points'
  | 'alliance_points';

const METRIC_CONFIG: Record<MetricType, {
  title: string;
  shortTitle: string;
  icon: any;
  oldLabel: string;
  newLabel: string;
  format: (n: number) => string;
}> = {
  power: {
    title: 'Crecimiento de Poder Global',
    shortTitle: 'Poder',
    icon: Zap,
    oldLabel: 'Poder Ant.',
    newLabel: 'Nuevo Poder',
    format: (n) => (n / 1_000_000).toFixed(2) + 'M',
  },
  crocodile_damage: {
    title: 'Daño Caimán / Cocodrilo',
    shortTitle: 'Cocodrilo',
    icon: Target,
    oldLabel: 'Daño Ant.',
    newLabel: 'Nuevo Daño',
    format: (n) => (n / 1_000_000).toFixed(2) + 'M',
  },
  tac_power: {
    title: 'Poder Torneo TAC',
    shortTitle: 'TAC Torneo',
    icon: Swords,
    oldLabel: 'Poder Ant.',
    newLabel: 'Nuevo Poder',
    format: (n) => (n / 1_000_000).toFixed(2) + 'M',
  },
  lab_points: {
    title: 'Puntos Vacunas (Laboratorio)',
    shortTitle: 'Vacunas',
    icon: FlaskConical,
    oldLabel: 'Pts Ant.',
    newLabel: 'Nuevos Pts',
    format: (n) => n.toLocaleString(),
  },
  mortem_damage: {
    title: 'Mortem: Daño Principal',
    shortTitle: 'Mortem Daño',
    icon: Skull,
    oldLabel: 'Daño Ant.',
    newLabel: 'Nuevo Daño',
    format: (n) => (n / 1_000_000).toFixed(2) + 'M',
  },
  mortem_shield_damage: {
    title: 'Mortem: Destrucción de Escudo',
    shortTitle: 'Mortem Escudo',
    icon: Shield,
    oldLabel: 'Escudo Ant.',
    newLabel: 'Nuevo Escudo',
    format: (n) => (n / 1_000_000).toFixed(2) + 'M',
  },
  mortem_prep_points: {
    title: 'Mortem: Puntos de Preparación',
    shortTitle: 'Mortem Prep',
    icon: Boxes,
    oldLabel: 'Prep Ant.',
    newLabel: 'Nueva Prep',
    format: (n) => n.toLocaleString(),
  },
  nemesis_level: {
    title: 'Nivel Némesis',
    shortTitle: 'Némesis',
    icon: Flame,
    oldLabel: 'Nv. Ant.',
    newLabel: 'Nuevo Nv.',
    format: (n) => (n ? `Nv. ${n}` : '-'),
  },
  wesker_points: {
    title: 'Puntos Desafío Wesker',
    shortTitle: 'Wesker',
    icon: Biohazard,
    oldLabel: 'Pts Ant.',
    newLabel: 'Nuevos Pts',
    format: (n) => n.toLocaleString(),
  },
  alliance_points: {
    title: 'Puntos de Unión Alianza',
    shortTitle: 'Puntos Alianza',
    icon: Award,
    oldLabel: 'Pts Ant.',
    newLabel: 'Nuevos Pts',
    format: (n) => n.toLocaleString(),
  },
};

const AnalyticsPanel = ({ activeAlliance }: { activeAlliance: string }) => {
  const { playClick, playHover } = useSound();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [aliases, setAliases] = useState<Record<string, string[]>>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedRecentDate, setSelectedRecentDate] = useState<string>('');
  const [selectedPriorDate, setSelectedPriorDate] = useState<string>('');
  const [metric, setMetric] = useState<MetricType>('power');
  const [sortMode, setSortMode] = useState<'growth' | 'value'>('growth');
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('ALL');

  // Drag-to-scroll for metrics bar
  const metricsBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    fetchData();
  }, [activeAlliance]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch members of active alliance
      const { data: memData, error: memErr } = await supabase
        .from('members')
        .select('*')
        .eq('alliance_name', activeAlliance)
        .order('rank', { ascending: false })
        .order('nickname', { ascending: true });
      if (memErr) throw memErr;

      // 2. Fetch cycle activities
      const { data: actData, error: actErr } = await supabase
        .from('guild_activity_cycles')
        .select('*')
        .order('cycle_date', { ascending: false });
      if (actErr) throw actErr;

      // 3. Fetch settings for aliases & Mortem fallback data
      const { data: settingsData } = await supabase
        .from('guild_settings')
        .select('*');

      const aliasObj: Record<string, string[]> = {};
      const mortemFallbackMap: Record<string, Record<string, any>> = {};

      (settingsData || []).forEach(s => {
        if (s.key === 'member_aliases' && typeof s.value === 'object') {
          Object.assign(aliasObj, s.value);
        } else if (s.key && s.key.startsWith(`mortem_${activeAlliance}_`)) {
          const d = s.key.replace(`mortem_${activeAlliance}_`, '');
          mortemFallbackMap[d] = s.value || {};
        }
      });

      setAliases(aliasObj);

      // Augment activities with fallback Mortem data if present
      const augmentedActs: ActivityRecord[] = (actData || []).map(a => {
        const fallback = mortemFallbackMap[a.cycle_date]?.[a.member_id];
        return {
          ...a,
          power: a.power || 0,
          crocodile_damage: a.crocodile_damage || 0,
          tac_power: a.tac_power || 0,
          lab_points: a.lab_points || 0,
          wesker_points: a.wesker_points || 0,
          alliance_points: a.alliance_points || 0,
          nemesis_level: a.nemesis_level || 0,
          mortem_damage: a.mortem_damage || fallback?.damage || 0,
          mortem_shield_damage: a.mortem_shield_damage || fallback?.shieldDamage || 0,
          mortem_prep_points: a.mortem_prep_points || fallback?.prepPoints || 0,
        };
      });

      const uniqueDates = Array.from(new Set(augmentedActs.map(a => a.cycle_date))).sort().reverse();
      setAvailableDates(uniqueDates);

      if (uniqueDates.length > 0) {
        setSelectedRecentDate(uniqueDates[0]);
        setSelectedPriorDate(uniqueDates[1] || uniqueDates[0]);
      }

      setMembers(memData || []);
      setActivities(augmentedActs);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Drag-to-scroll handlers for metric buttons
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!metricsBarRef.current) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.pageX - metricsBarRef.current.offsetLeft;
    scrollLeftRef.current = metricsBarRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !metricsBarRef.current) return;
    e.preventDefault();
    hasMovedRef.current = true;
    const x = e.pageX - metricsBarRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    metricsBarRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!metricsBarRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      metricsBarRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollMetrics = (offset: number) => {
    playClick();
    if (metricsBarRef.current) {
      metricsBarRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Calculate analysis data based on selected cycle dates and metric
  const getAnalysis = () => {
    const analysisMap = new Map<string, { 
      member: Member; 
      growth: number; 
      oldVal: number; 
      newVal: number;
    }>();

    members.forEach(m => {
      const recentAct = activities.find(a => a.member_id === m.id && a.cycle_date === selectedRecentDate);
      const priorAct = activities.find(a => a.member_id === m.id && a.cycle_date === selectedPriorDate);

      let newVal = 0;
      let oldVal = 0;

      if (metric === 'power') {
        newVal = recentAct?.power ?? m.power;
        // If comparing against same date or no prior cycle, compare against baseline member power
        if (!priorAct || selectedRecentDate === selectedPriorDate) {
          oldVal = m.power;
        } else {
          oldVal = priorAct.power ?? m.power;
        }
      } else {
        newVal = (recentAct as any)?.[metric] || 0;
        oldVal = (priorAct as any)?.[metric] || 0;
      }

      const growth = newVal - oldVal;

      // Include if there is any activity (growth or non-zero current value)
      if (growth !== 0 || newVal > 0) {
        analysisMap.set(m.id, {
          member: m,
          growth,
          oldVal,
          newVal
        });
      }
    });

    const list = Array.from(analysisMap.values());
    if (sortMode === 'growth') {
      return list.sort((a, b) => b.growth - a.growth);
    } else {
      return list.sort((a, b) => b.newVal - a.newVal);
    }
  };

  const data = getAnalysis();
  const config = METRIC_CONFIG[metric];
  const IconComponent = config.icon;

  // Global totals
  const totalGrowth = data.reduce((acc, curr) => acc + curr.growth, 0);
  const totalNewVal = data.reduce((acc, curr) => acc + curr.newVal, 0);
  const positiveOperatives = data.filter(d => d.growth > 0).length;
  const negativeOperatives = data.filter(d => d.growth < 0).length;
  const avgGrowth = data.length > 0 ? totalGrowth / data.length : 0;

  // Filtered list for table
  const filteredData = data.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.member.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (aliases[item.member.id] || []).some(al => al.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRank = rankFilter === 'ALL' || item.member.rank === rankFilter;
    return matchesSearch && matchesRank;
  });

  const ranks = ['R5', 'R4', 'R3', 'R2', 'R1'];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="animate-spin text-neon-red" size={36} />
        <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">
          Cargando métricas tácticas de {activeAlliance}...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-5 overflow-hidden">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP COMMAND HUD BANNER (REMODELED) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#090909] border border-gray-800/90 rounded-sm p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-red/60 to-transparent" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Title & Division Protocol */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-blood-red/20 border border-blood-red/60 flex items-center justify-center rounded-sm shadow-[0_0_15px_rgba(255,42,42,0.25)] text-neon-red shrink-0">
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neon-red bg-blood-red/15 px-2 py-0.5 rounded-sm border border-blood-red/30">
                  Umbrella Intelligence Division
                </span>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider hidden sm:inline">
                  // {activeAlliance}
                </span>
              </div>
              <h2 className="font-bebas text-2xl sm:text-3xl tracking-widest text-white mt-0.5">
                CENTRO DE RENDIMIENTO & CRECIMIENTO
              </h2>
            </div>
          </div>

          {/* Cycle Comparator Selectors & Sort Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            
            {/* Cycle Comparison Selectors */}
            {availableDates.length > 1 && (
              <div className="flex items-center gap-1.5 bg-black border border-gray-800 px-2.5 py-1.5 rounded-sm text-xs font-mono">
                <span className="text-gray-500 text-[10px] uppercase">Comparar:</span>
                <select
                  value={selectedRecentDate}
                  onChange={(e) => setSelectedRecentDate(e.target.value)}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
                >
                  {availableDates.map(d => (
                    <option key={d} value={d} className="bg-[#121212] text-white">{d}</option>
                  ))}
                </select>
                <span className="text-gray-600">vs</span>
                <select
                  value={selectedPriorDate}
                  onChange={(e) => setSelectedPriorDate(e.target.value)}
                  className="bg-transparent text-gray-400 font-mono text-xs focus:outline-none cursor-pointer"
                >
                  {availableDates.map(d => (
                    <option key={d} value={d} className="bg-[#121212] text-gray-300">{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Toggle: Growth vs Absolute Total */}
            <div className="flex bg-black border border-gray-800 rounded-sm p-0.5 text-[11px] font-mono">
              <button
                onClick={() => { playClick(); setSortMode('growth'); }}
                className={`px-3 py-1 uppercase tracking-wider transition-colors rounded-sm ${sortMode === 'growth' ? 'bg-blood-red/30 text-neon-red font-bold' : 'text-gray-400 hover:text-white'}`}
                title="Ordenar por mayor subida de puntos o poder"
              >
                Mayor Subida
              </button>
              <button
                onClick={() => { playClick(); setSortMode('value'); }}
                className={`px-3 py-1 uppercase tracking-wider transition-colors rounded-sm ${sortMode === 'value' ? 'bg-blood-red/30 text-neon-red font-bold' : 'text-gray-400 hover:text-white'}`}
                title="Ordenar por mayor puntaje absoluto en el ciclo"
              >
                Puntaje Total
              </button>
            </div>
          </div>
        </div>

        {/* Global Key Impact Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-800/80">
          
          {/* Card 1: Delta Global */}
          <div className="bg-black/50 border border-gray-800/80 p-3 rounded-sm">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
              Delta Global Alianza
            </span>
            <div className="flex items-center gap-2">
              <Activity className={totalGrowth >= 0 ? "text-emerald-400" : "text-red-400"} size={18} />
              <span className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${totalGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalGrowth > 0 ? '+' : ''}{config.format(totalGrowth)}
              </span>
            </div>
            <span className="font-mono text-[10px] text-gray-500 mt-0.5 block">
              Suma de variaciones del clan
            </span>
          </div>

          {/* Card 2: Total Ciclo Actual */}
          <div className="bg-black/50 border border-gray-800/80 p-3 rounded-sm">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
              Puntuación Total Ciclo
            </span>
            <div className="flex items-center gap-2">
              <IconComponent className="text-neon-red" size={18} />
              <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight">
                {config.format(totalNewVal)}
              </span>
            </div>
            <span className="font-mono text-[10px] text-gray-500 mt-0.5 block">
              Puntaje acumulado activo
            </span>
          </div>

          {/* Card 3: Balance de Operativos */}
          <div className="bg-black/50 border border-gray-800/80 p-3 rounded-sm">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
              Dinámica de Crecimiento
            </span>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-emerald-400 font-mono text-sm font-bold">
                <TrendingUp size={15} />
                <span>{positiveOperatives}</span>
                <span className="text-[10px] text-gray-500 font-normal">subieron</span>
              </div>
              <div className="flex items-center gap-1 text-red-400 font-mono text-sm font-bold">
                <TrendingDown size={15} />
                <span>{negativeOperatives}</span>
                <span className="text-[10px] text-gray-500 font-normal">bajaron</span>
              </div>
            </div>
            <span className="font-mono text-[10px] text-gray-500 mt-1 block">
              {data.length} de {members.length} operativos activos
            </span>
          </div>

          {/* Card 4: Promedio por Miembro */}
          <div className="bg-black/50 border border-gray-800/80 p-3 rounded-sm">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
              Promedio por Operativo
            </span>
            <div className="flex items-center gap-2">
              <Users className="text-cyan-400" size={18} />
              <span className={`font-mono text-lg sm:text-xl font-bold ${avgGrowth >= 0 ? 'text-cyan-300' : 'text-red-400'}`}>
                {avgGrowth > 0 ? '+' : ''}{config.format(avgGrowth)}
              </span>
            </div>
            <span className="font-mono text-[10px] text-gray-500 mt-0.5 block">
              Media de variación por miembro
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EVENT SELECTOR (ALL 10 EVENTS, ZERO EMOJIS, DRAG-TO-SCROLL) */}
        {/* ------------------------------------------------------------- */}
        <div className="relative flex items-center bg-black/60 border border-gray-800/80 rounded-sm mt-1">
          {/* Left arrow */}
          <button
            onClick={() => scrollMetrics(-200)}
            className="p-2 bg-black hover:bg-[#151515] text-gray-400 hover:text-neon-red border-r border-gray-800 flex items-center justify-center shrink-0 z-10 transition-colors"
            title="Desplazar eventos a la izquierda"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Draggable Metric Pills List - scrollbar hidden */}
          <div
            ref={metricsBarRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={`flex gap-1.5 overflow-x-auto select-none py-1.5 px-2 flex-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {(Object.keys(METRIC_CONFIG) as MetricType[]).map(key => {
              const item = METRIC_CONFIG[key];
              const TabIcon = item.icon;
              const isActive = metric === key;

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (!hasMovedRef.current) {
                      playClick();
                      setMetric(key);
                    }
                  }}
                  onMouseEnter={playHover}
                  className={`flex items-center gap-2 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-all rounded-sm border shrink-0 ${
                    isActive 
                      ? 'bg-blood-red/25 border-neon-red text-white shadow-[0_0_12px_rgba(255,42,42,0.3)] font-bold' 
                      : 'border-gray-800/80 bg-black/40 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <TabIcon size={14} className={isActive ? 'text-neon-red' : 'text-gray-500'} />
                  <span>{item.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollMetrics(200)}
            className="p-2 bg-black hover:bg-[#151515] text-gray-400 hover:text-neon-red border-l border-gray-800 flex items-center justify-center shrink-0 z-10 transition-colors"
            title="Desplazar eventos a la derecha"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VANGUARD ELITE PODIUM (#1, #2, #3 COMMAND CARDS) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        
        {/* PODIUM #1 - CHAMPION CARD */}
        {data[0] ? (
          <div className="bg-gradient-to-b from-amber-500/15 via-[#0b0b0b] to-[#060606] border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.12)] p-5 relative overflow-hidden rounded-sm group hover:border-amber-400 transition-all">
            {/* Watermark */}
            <div className="absolute top-1 right-3 select-none pointer-events-none">
              <span className="font-bebas text-7xl text-amber-500/15 group-hover:text-amber-500/25 transition-colors">
                #1
              </span>
            </div>

            {/* Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] uppercase tracking-wider rounded-sm">
                <Crown size={12} className="text-amber-400" />
                <span>Campeón Semanal</span>
              </div>
              <span className="font-mono text-xs text-amber-400 font-bold">
                {data[0].member.rank}
              </span>
            </div>

            {/* Operative Name */}
            <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider truncate mb-0.5">
              {data[0].member.nickname}
            </h3>
            {aliases[data[0].member.id]?.[0] && (
              <p className="font-mono text-[10px] text-gray-500 truncate mb-4">
                aka: {aliases[data[0].member.id][0]}
              </p>
            )}

            {/* Delta Readout */}
            <div className="flex items-end gap-3 mt-4 mb-4">
              {data[0].growth >= 0 ? (
                <TrendingUp className="text-emerald-400 mb-1" size={26} />
              ) : (
                <TrendingDown className="text-red-400 mb-1" size={26} />
              )}
              <div>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">
                  {data[0].growth >= 0 ? 'Subida Neta' : 'Descenso'}
                </span>
                <span className={`font-mono text-3xl sm:text-4xl font-bold tracking-tight ${data[0].growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data[0].growth > 0 ? '+' : ''}{config.format(data[0].growth)}
                </span>
              </div>
            </div>

            {/* Progress / Jump Comparison Footer */}
            <div className="pt-3 border-t border-amber-500/20 flex justify-between items-center text-xs font-mono">
              <div>
                <span className="text-gray-500 text-[10px] block">{config.oldLabel}</span>
                <span className="text-gray-400">{config.format(data[0].oldVal)}</span>
              </div>
              <div className="text-amber-400/50">➔</div>
              <div className="text-right">
                <span className="text-gray-500 text-[10px] block">{config.newLabel}</span>
                <span className="text-white font-bold">{config.format(data[0].newVal)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#090909] border border-gray-800/80 p-6 text-center text-gray-500 font-mono text-xs rounded-sm flex flex-col items-center justify-center">
            <Activity className="mb-2 text-gray-600" size={24} />
            <span>Sin datos para el puesto #1</span>
          </div>
        )}

        {/* PODIUM #2 - SUBCOMMANDER CARD */}
        {data[1] ? (
          <div className="bg-gradient-to-b from-slate-400/15 via-[#0b0b0b] to-[#060606] border border-slate-500/40 shadow-[0_0_25px_rgba(148,163,184,0.08)] p-5 relative overflow-hidden rounded-sm group hover:border-slate-300 transition-all">
            {/* Watermark */}
            <div className="absolute top-1 right-3 select-none pointer-events-none">
              <span className="font-bebas text-7xl text-slate-400/15 group-hover:text-slate-400/25 transition-colors">
                #2
              </span>
            </div>

            {/* Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-500/20 border border-slate-500/40 text-slate-300 font-mono text-[10px] uppercase tracking-wider rounded-sm">
                <Medal size={12} className="text-slate-300" />
                <span>Subcomandante</span>
              </div>
              <span className="font-mono text-xs text-slate-300 font-bold">
                {data[1].member.rank}
              </span>
            </div>

            {/* Operative Name */}
            <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider truncate mb-0.5">
              {data[1].member.nickname}
            </h3>
            {aliases[data[1].member.id]?.[0] && (
              <p className="font-mono text-[10px] text-gray-500 truncate mb-4">
                aka: {aliases[data[1].member.id][0]}
              </p>
            )}

            {/* Delta Readout */}
            <div className="flex items-end gap-3 mt-4 mb-4">
              {data[1].growth >= 0 ? (
                <TrendingUp className="text-emerald-400 mb-1" size={24} />
              ) : (
                <TrendingDown className="text-red-400 mb-1" size={24} />
              )}
              <div>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">
                  {data[1].growth >= 0 ? 'Subida Neta' : 'Descenso'}
                </span>
                <span className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${data[1].growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data[1].growth > 0 ? '+' : ''}{config.format(data[1].growth)}
                </span>
              </div>
            </div>

            {/* Progress / Jump Comparison Footer */}
            <div className="pt-3 border-t border-slate-500/20 flex justify-between items-center text-xs font-mono">
              <div>
                <span className="text-gray-500 text-[10px] block">{config.oldLabel}</span>
                <span className="text-gray-400">{config.format(data[1].oldVal)}</span>
              </div>
              <div className="text-slate-400/50">➔</div>
              <div className="text-right">
                <span className="text-gray-500 text-[10px] block">{config.newLabel}</span>
                <span className="text-white font-bold">{config.format(data[1].newVal)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#090909] border border-gray-800/80 p-6 text-center text-gray-500 font-mono text-xs rounded-sm flex flex-col items-center justify-center">
            <Activity className="mb-2 text-gray-600" size={24} />
            <span>Sin datos para el puesto #2</span>
          </div>
        )}

        {/* PODIUM #3 - VANGUARD CARD */}
        {data[2] ? (
          <div className="bg-gradient-to-b from-amber-700/15 via-[#0b0b0b] to-[#060606] border border-amber-700/40 shadow-[0_0_25px_rgba(180,83,9,0.08)] p-5 relative overflow-hidden rounded-sm group hover:border-amber-600 transition-all">
            {/* Watermark */}
            <div className="absolute top-1 right-3 select-none pointer-events-none">
              <span className="font-bebas text-7xl text-amber-700/15 group-hover:text-amber-700/25 transition-colors">
                #3
              </span>
            </div>

            {/* Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-700/20 border border-amber-700/40 text-amber-500 font-mono text-[10px] uppercase tracking-wider rounded-sm">
                <Medal size={12} className="text-amber-600" />
                <span>Vanguardia</span>
              </div>
              <span className="font-mono text-xs text-amber-500 font-bold">
                {data[2].member.rank}
              </span>
            </div>

            {/* Operative Name */}
            <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wider truncate mb-0.5">
              {data[2].member.nickname}
            </h3>
            {aliases[data[2].member.id]?.[0] && (
              <p className="font-mono text-[10px] text-gray-500 truncate mb-4">
                aka: {aliases[data[2].member.id][0]}
              </p>
            )}

            {/* Delta Readout */}
            <div className="flex items-end gap-3 mt-4 mb-4">
              {data[2].growth >= 0 ? (
                <TrendingUp className="text-emerald-400 mb-1" size={24} />
              ) : (
                <TrendingDown className="text-red-400 mb-1" size={24} />
              )}
              <div>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">
                  {data[2].growth >= 0 ? 'Subida Neta' : 'Descenso'}
                </span>
                <span className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${data[2].growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {data[2].growth > 0 ? '+' : ''}{config.format(data[2].growth)}
                </span>
              </div>
            </div>

            {/* Progress / Jump Comparison Footer */}
            <div className="pt-3 border-t border-amber-700/20 flex justify-between items-center text-xs font-mono">
              <div>
                <span className="text-gray-500 text-[10px] block">{config.oldLabel}</span>
                <span className="text-gray-400">{config.format(data[2].oldVal)}</span>
              </div>
              <div className="text-amber-700/50">➔</div>
              <div className="text-right">
                <span className="text-gray-500 text-[10px] block">{config.newLabel}</span>
                <span className="text-white font-bold">{config.format(data[2].newVal)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#090909] border border-gray-800/80 p-6 text-center text-gray-500 font-mono text-xs rounded-sm flex flex-col items-center justify-center">
            <Activity className="mb-2 text-gray-600" size={24} />
            <span>Sin datos para el puesto #3</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RANKING TABLE WITH TACTICAL FILTERS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#090909] border border-gray-800/80 rounded-sm flex-1 min-h-0 overflow-hidden flex flex-col">
        
        {/* Table Toolbar: Search + Rank Pills */}
        <div className="p-3 sm:p-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-black/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-red animate-pulse" />
            <h3 className="font-bebas text-lg sm:text-xl tracking-widest text-white uppercase">
              Ranking General: {config.title}
            </h3>
            <span className="font-mono text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-sm">
              {filteredData.length} operativos
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar operativo o aka..."
                className="w-full bg-black border border-gray-800 text-white pl-8 pr-3 py-1 font-mono text-xs focus:outline-none focus:border-neon-red rounded-sm"
              />
            </div>

            {/* Rank Filter Pills */}
            <div className="flex gap-1 items-center">
              <button
                onClick={() => { playClick(); setRankFilter('ALL'); }}
                className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors border rounded-sm ${rankFilter === 'ALL' ? 'bg-blood-red/20 border-neon-red text-white' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
              >
                Todos
              </button>
              {ranks.map(r => (
                <button
                  key={r}
                  onClick={() => { playClick(); setRankFilter(r); }}
                  className={`px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors border rounded-sm ${rankFilter === r ? 'bg-blood-red/20 border-neon-red text-white' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Data Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-[#111] z-10 border-b border-gray-800">
              <tr>
                <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-16 text-center">Pos</th>
                <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4">Operativo</th>
                <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-20 text-center">Rango</th>
                <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4 w-36">{config.oldLabel}</th>
                <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4 w-36">{config.newLabel}</th>
                <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4 w-40 text-right">Subida Neta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {filteredData.map((item, i) => {
                const memberAlias = aliases[item.member.id]?.[0];
                const isChampion = i === 0;
                const isSecond = i === 1;
                const isThird = i === 2;

                return (
                  <tr key={item.member.id} className="hover:bg-white/[0.03] transition-colors group">
                    {/* Position */}
                    <td className="py-3 px-3 text-center font-mono text-xs">
                      {isChampion ? (
                        <span className="text-amber-400 font-bold flex items-center justify-center gap-1">
                          <Crown size={12} /> #1
                        </span>
                      ) : isSecond ? (
                        <span className="text-slate-300 font-bold flex items-center justify-center gap-1">
                          <Medal size={12} /> #2
                        </span>
                      ) : isThird ? (
                        <span className="text-amber-600 font-bold flex items-center justify-center gap-1">
                          <Medal size={12} /> #3
                        </span>
                      ) : (
                        <span className="text-gray-500">#{i + 1}</span>
                      )}
                    </td>

                    {/* Member Name + Alias */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-white font-medium group-hover:text-neon-red transition-colors truncate">
                          {item.member.nickname}
                        </span>
                        {memberAlias && (
                          <span className="font-mono text-[10px] text-gray-500 truncate" title={`Alias: ${memberAlias}`}>
                            aka: {memberAlias}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-xs bg-white/5 border border-gray-800 px-2 py-0.5 rounded text-gray-300">
                        {item.member.rank}
                      </span>
                    </td>

                    {/* Old Value */}
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {config.format(item.oldVal)}
                    </td>

                    {/* New Value */}
                    <td className="py-3 px-4 font-mono text-xs text-white font-semibold">
                      {config.format(item.newVal)}
                    </td>

                    {/* Delta / Growth with indicator */}
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.growth > 0 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <TrendingUp size={12} />
                            +{config.format(item.growth)}
                          </span>
                        ) : item.growth < 0 ? (
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <TrendingDown size={12} />
                            {config.format(item.growth)}
                          </span>
                        ) : (
                          <span className="text-gray-600 font-mono">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center font-mono text-gray-500 text-xs uppercase tracking-wider">
                    No se encontraron operativos con registros en esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
