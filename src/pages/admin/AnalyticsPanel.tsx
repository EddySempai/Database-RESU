import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, TrendingDown, Loader2, Activity, Zap, Target, Swords,
  FlaskConical, Skull, Shield, Boxes, Flame, Biohazard, Award, Crown, Medal,
  Search, ChevronLeft, ChevronRight, BarChart3, Users, CalendarDays
} from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';
import { useTheme } from '../../contexts/ThemeContext';

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
  saint_valley?: boolean;
  security_centers?: boolean;
  security_centers_data?: any[];
  tac_joined?: boolean;
  lab_joined?: boolean;
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
  | 'alliance_points'
  | 'all_time_score'
  | 'weekly_score';

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
  all_time_score: {
    title: 'Aportes Históricos (Puntuación Total)',
    shortTitle: 'Aporte Global',
    icon: Medal,
    oldLabel: 'No aplica',
    newLabel: 'Total Histórico',
    format: (n) => `${n} Pts`,
  },
  weekly_score: {
    title: 'Aporte Semanal (Últimos 7 días)',
    shortTitle: 'Aporte Semanal',
    icon: CalendarDays,
    oldLabel: 'No aplica',
    newLabel: 'Total Semanal',
    format: (n) => `${n} Pts`,
  },
};

const AnalyticsPanel = ({ activeAlliance }: { activeAlliance: string }) => {
  const { isDark } = useTheme();
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

  // Helper for historical score calculation
  const calcScore = (act: ActivityRecord | undefined) => {
    if (!act) return 0;
    let score = 0;
    if (act.crocodile_damage > 0) score += 1;
    if (act.saint_valley) score += 5;
    if (act.security_centers || (act as any).security_centers_data?.length > 0) score += 2;
    if (act.tac_joined || act.tac_power > 0) score += 2;
    if ((act.mortem_damage && act.mortem_damage > 0) || (act.mortem_shield_damage && act.mortem_shield_damage > 0) || (act.mortem_prep_points && act.mortem_prep_points > 0)) score += 3;
    if (act.wesker_points > 0) score += 4;
    if (act.lab_joined || act.lab_points > 0) score += 5;
    const unionScore = Math.min(4, Math.floor((act.alliance_points || 0) / 1000));
    if (unionScore > 0) score += unionScore;
    if (Number(act.nemesis_level) > 0) score += 2;
    return score;
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
      } else if (metric === 'weekly_score') {
        const last7Dates = availableDates.slice(0, 7);
        const weeklyActs = activities.filter(a => a.member_id === m.id && last7Dates.includes(a.cycle_date));
        newVal = weeklyActs.reduce((acc, act) => acc + calcScore(act), 0);
        oldVal = 0;
      } else if (metric === 'all_time_score') {
        // Sum up all scores from all dates for this member
        const allActs = activities.filter(a => a.member_id === m.id);
        newVal = allActs.reduce((acc, act) => acc + calcScore(act), 0);
        oldVal = 0;
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
    <div className="h-full overflow-y-auto p-3 sm:p-5 custom-scrollbar">
      <div className="flex flex-col gap-4 sm:gap-5 max-w-[1600px] mx-auto">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP COMMAND HUD BANNER (REMODELED) */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden transition-colors border rounded-2xl ${
        isDark ? 'bg-[#090909] border-slate-800/90 shadow-sm' : 'bg-white border-slate-300 shadow-md'
      }`}>
        
        {/* Ambient Top Glow Line */}
        {isDark && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Title & Division Protocol */}
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 border ${
              isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-rose-100 border-rose-300 text-rose-600'
            }`}>
              <BarChart3 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md border font-bold ${
                  isDark ? 'text-rose-400 bg-rose-500/15 border-rose-500/30' : 'text-rose-700 bg-rose-100 border-rose-300'
                }`}>
                  Umbrella Intelligence Division
                </span>
                <span className={`font-mono text-[10px] uppercase tracking-wider hidden sm:inline ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}>
                  // {activeAlliance}
                </span>
              </div>
              <h2 className={`font-bebas text-2xl sm:text-3xl tracking-widest mt-0.5 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                CENTRO DE RENDIMIENTO & CRECIMIENTO
              </h2>
            </div>
          </div>

          {/* Cycle Comparator Selectors & Sort Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            
            {/* Cycle Comparison Selectors */}
            {availableDates.length > 1 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono border ${
                isDark ? 'bg-[#141824] border-slate-800' : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <span className={`text-[10px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Comparar:</span>
                <select
                  value={selectedRecentDate}
                  onChange={(e) => setSelectedRecentDate(e.target.value)}
                  className={`bg-transparent font-mono text-xs focus:outline-none cursor-pointer ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {availableDates.map(d => (
                    <option key={d} value={d} className={isDark ? 'bg-[#141824] text-white' : 'bg-white text-slate-900'}>{d}</option>
                  ))}
                </select>
                <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>vs</span>
                <select
                  value={selectedPriorDate}
                  onChange={(e) => setSelectedPriorDate(e.target.value)}
                  className={`bg-transparent font-mono text-xs focus:outline-none cursor-pointer ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {availableDates.map(d => (
                    <option key={d} value={d} className={isDark ? 'bg-[#141824] text-slate-300' : 'bg-white text-slate-700'}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Toggle: Growth vs Absolute Total */}
            <div className={`flex rounded-xl p-0.5 text-[11px] font-mono border ${
              isDark ? 'bg-[#141824] border-slate-800' : 'bg-white border-slate-300 shadow-sm'
            }`}>
              <button
                onClick={() => { playClick(); setSortMode('growth'); }}
                className={`px-3 py-1 uppercase tracking-wider transition-all rounded-[10px] ${
                  sortMode === 'growth' 
                    ? (isDark ? 'bg-rose-500/20 text-rose-400 font-bold' : 'bg-rose-50 text-rose-700 font-bold') 
                    : (isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                }`}
                title="Ordenar por mayor subida de puntos o poder"
              >
                Mayor Subida
              </button>
              <button
                onClick={() => { playClick(); setSortMode('value'); }}
                className={`px-3 py-1 uppercase tracking-wider transition-all rounded-[10px] ${
                  sortMode === 'value' 
                    ? (isDark ? 'bg-rose-500/20 text-rose-400 font-bold' : 'bg-rose-50 text-rose-700 font-bold') 
                    : (isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                }`}
                title="Ordenar por mayor puntaje absoluto en el ciclo"
              >
                Puntaje Total
              </button>
            </div>
          </div>
        </div>

        {/* Global Key Impact Metrics Strip */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          
          {/* Card 1: Delta Global */}
          <div 
            className={`p-3 rounded-2xl border transition-all cursor-help flex flex-col justify-center ${
              isDark ? 'bg-[#10131d]/60 border-slate-800/80 hover:bg-[#141824]' : 'bg-white border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md'
            }`}
            title="Suma de variaciones del clan"
          >
            <span className={`font-mono text-[10px] uppercase tracking-widest block mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Delta Global Alianza
            </span>
            <div className="flex items-center gap-2">
              <Activity className={totalGrowth >= 0 ? "text-emerald-500" : "text-rose-500"} size={18} />
              <span className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${totalGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalGrowth > 0 ? '+' : ''}{config.format(totalGrowth)}
              </span>
            </div>
          </div>

          {/* Card 2: Total Ciclo Actual */}
          <div 
            className={`p-3 rounded-2xl border transition-all cursor-help flex flex-col justify-center ${
              isDark ? 'bg-[#10131d]/60 border-slate-800/80 hover:bg-[#141824]' : 'bg-white border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md'
            }`}
            title="Puntaje acumulado activo"
          >
            <span className={`font-mono text-[10px] uppercase tracking-widest block mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Puntuación Total Ciclo
            </span>
            <div className="flex items-center gap-2">
              <IconComponent className={isDark ? "text-rose-400" : "text-rose-500"} size={18} />
              <span className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {config.format(totalNewVal)}
              </span>
            </div>
          </div>

          {/* Card 3: Balance de Operativos */}
          <div 
            className={`p-3 rounded-2xl border transition-all cursor-help flex flex-col justify-center ${
              isDark ? 'bg-[#10131d]/60 border-slate-800/80 hover:bg-[#141824]' : 'bg-white border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md'
            }`}
            title={`${data.length} de ${members.length} operativos activos`}
          >
            <span className={`font-mono text-[10px] uppercase tracking-widest block mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Dinámica Crecimiento
            </span>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-emerald-500 font-mono text-sm font-bold">
                <TrendingUp size={15} />
                <span>{positiveOperatives}</span>
              </div>
              <div className="flex items-center gap-1 text-rose-500 font-mono text-sm font-bold">
                <TrendingDown size={15} />
                <span>{negativeOperatives}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Promedio por Miembro */}
          <div 
            className={`p-3 rounded-2xl border transition-all cursor-help flex flex-col justify-center ${
              isDark ? 'bg-[#10131d]/60 border-slate-800/80 hover:bg-[#141824]' : 'bg-white border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md'
            }`}
            title="Media de variación por miembro"
          >
            <span className={`font-mono text-[10px] uppercase tracking-widest block mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Promedio Operativo
            </span>
            <div className="flex items-center gap-2">
              <Users className={isDark ? "text-sky-400" : "text-sky-600"} size={18} />
              <span className={`font-mono text-lg sm:text-xl font-bold ${avgGrowth >= 0 ? (isDark ? 'text-sky-400' : 'text-sky-600') : 'text-rose-500'}`}>
                {avgGrowth > 0 ? '+' : ''}{config.format(avgGrowth)}
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EVENT SELECTOR (ALL 10 EVENTS, ZERO EMOJIS, DRAG-TO-SCROLL) */}
        {/* ------------------------------------------------------------- */}
        <div className={`relative flex items-center border rounded-xl mt-1 shadow-sm ${
          isDark ? 'bg-[#10131d]/60 border-slate-800' : 'bg-white border-slate-300 shadow-md'
        }`}>
          {/* Left arrow */}
          <button
            onClick={() => scrollMetrics(-200)}
            className={`p-2 flex items-center justify-center shrink-0 z-10 transition-colors border-r ${
              isDark ? 'hover:bg-[#141824] text-slate-400 hover:text-rose-500 border-slate-800' : 'hover:bg-slate-50 text-slate-500 hover:text-rose-600 border-slate-300'
            }`}
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
                  className={`flex items-center gap-2 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-all rounded-[10px] border shrink-0 ${
                    isActive 
                      ? (isDark ? 'bg-rose-500/20 border-rose-500/50 text-white font-bold' : 'bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-sm')
                      : (isDark ? 'border-slate-800/80 bg-[#141824]/50 text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm')
                  }`}
                >
                  <TabIcon size={14} className={isActive ? (isDark ? 'text-rose-400' : 'text-rose-600') : (isDark ? 'text-slate-500' : 'text-slate-400')} />
                  <span>{item.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollMetrics(200)}
            className={`p-2 flex items-center justify-center shrink-0 z-10 transition-colors border-l ${
              isDark ? 'hover:bg-[#141824] text-slate-400 hover:text-rose-500 border-slate-800' : 'hover:bg-slate-50 text-slate-500 hover:text-rose-600 border-slate-300'
            }`}
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
          <div className={`p-5 relative overflow-hidden rounded-2xl group transition-all border ${
            isDark 
              ? 'bg-gradient-to-b from-amber-500/15 via-[#10131d] to-[#0d1017] border-amber-500/50 hover:border-amber-400 shadow-sm' 
              : 'bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-md hover:shadow-lg hover:border-amber-400'
          }`}>
            {/* Watermark */}
            <div className="absolute top-1 right-3 select-none pointer-events-none">
              <span className={`font-bebas text-7xl transition-colors ${isDark ? 'text-amber-500/15 group-hover:text-amber-500/25' : 'text-amber-500/10 group-hover:text-amber-500/20'}`}>
                #1
              </span>
            </div>

            {/* Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded-md border ${
                isDark ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-amber-200/50 border-amber-300 text-amber-700'
              }`}>
                <Crown size={12} className={isDark ? "text-amber-400" : "text-amber-600"} />
                <span className="font-bold">Campeón Semanal</span>
              </div>
              <span className={`font-mono text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {data[0].member.rank}
              </span>
            </div>

            {/* Operative Name */}
            <h3 className={`font-bebas text-2xl sm:text-3xl tracking-wider truncate mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {data[0].member.nickname}
            </h3>
            {aliases[data[0].member.id]?.[0] && (
              <p className={`font-mono text-[10px] truncate mb-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                aka: {aliases[data[0].member.id][0]}
              </p>
            )}

            {/* Delta Readout */}
            <div className="flex items-end gap-3 mt-4 mb-4">
              {data[0].growth >= 0 ? (
                <TrendingUp className="text-emerald-500 mb-1" size={26} />
              ) : (
                <TrendingDown className="text-rose-500 mb-1" size={26} />
              )}
              <div>
                <span className={`font-mono text-[10px] uppercase tracking-widest block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  {data[0].growth >= 0 ? 'Subida Neta' : 'Descenso'}
                </span>
                <span className={`font-mono text-3xl sm:text-4xl font-bold tracking-tight ${data[0].growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {data[0].growth > 0 ? '+' : ''}{config.format(data[0].growth)}
                </span>
              </div>
            </div>

            {/* Progress / Jump Comparison Footer */}
            <div className={`pt-3 border-t flex justify-between items-center text-xs font-mono ${isDark ? 'border-amber-500/20' : 'border-amber-200'}`}>
              <div>
                <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{config.oldLabel}</span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{config.format(data[0].oldVal)}</span>
              </div>
              <div className={isDark ? 'text-amber-400/50' : 'text-amber-400/80'}>➔</div>
              <div className="text-right">
                <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{config.newLabel}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{config.format(data[0].newVal)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-6 text-center font-mono text-xs flex flex-col items-center justify-center rounded-2xl border ${
            isDark ? 'bg-[#10131d]/50 border-slate-800 text-slate-500' : 'bg-white border-slate-300 shadow-sm text-slate-500'
          }`}>
            <Activity className="mb-2 opacity-50" size={24} />
            <span>Sin datos para el puesto #1</span>
          </div>
        )}

        {/* PODIUM #2 - SUBCOMMANDER CARD */}
        {data[1] ? (
          <div className={`p-5 relative overflow-hidden rounded-2xl group transition-all border ${
            isDark 
              ? 'bg-gradient-to-b from-slate-400/15 via-[#10131d] to-[#0d1017] border-slate-500/40 hover:border-slate-300 shadow-sm' 
              : 'bg-gradient-to-b from-slate-50 to-white border-slate-300 shadow-md hover:shadow-lg hover:border-slate-400'
          }`}>
            {/* Watermark */}
            <div className="absolute top-1 right-3 select-none pointer-events-none">
              <span className={`font-bebas text-7xl transition-colors ${isDark ? 'text-slate-400/15 group-hover:text-slate-400/25' : 'text-slate-400/10 group-hover:text-slate-400/20'}`}>
                #2
              </span>
            </div>

            {/* Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded-md border ${
                isDark ? 'bg-slate-500/20 border-slate-500/40 text-slate-300' : 'bg-slate-200/50 border-slate-300 text-slate-700'
              }`}>
                <Medal size={12} className={isDark ? "text-slate-300" : "text-slate-500"} />
                <span className="font-bold">Subcomandante</span>
              </div>
              <span className={`font-mono text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {data[1].member.rank}
              </span>
            </div>

            {/* Operative Name */}
            <h3 className={`font-bebas text-2xl sm:text-3xl tracking-wider truncate mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {data[1].member.nickname}
            </h3>
            {aliases[data[1].member.id]?.[0] && (
              <p className={`font-mono text-[10px] truncate mb-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                aka: {aliases[data[1].member.id][0]}
              </p>
            )}

            {/* Delta Readout */}
            <div className="flex items-end gap-3 mt-4 mb-4">
              {data[1].growth >= 0 ? (
                <TrendingUp className="text-emerald-500 mb-1" size={24} />
              ) : (
                <TrendingDown className="text-rose-500 mb-1" size={24} />
              )}
              <div>
                <span className={`font-mono text-[10px] uppercase tracking-widest block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  {data[1].growth >= 0 ? 'Subida Neta' : 'Descenso'}
                </span>
                <span className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${data[1].growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {data[1].growth > 0 ? '+' : ''}{config.format(data[1].growth)}
                </span>
              </div>
            </div>

            {/* Progress / Jump Comparison Footer */}
            <div className={`pt-3 border-t flex justify-between items-center text-xs font-mono ${isDark ? 'border-slate-500/20' : 'border-slate-200'}`}>
              <div>
                <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{config.oldLabel}</span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{config.format(data[1].oldVal)}</span>
              </div>
              <div className={isDark ? 'text-slate-400/50' : 'text-slate-400/80'}>➔</div>
              <div className="text-right">
                <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{config.newLabel}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{config.format(data[1].newVal)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-6 text-center font-mono text-xs flex flex-col items-center justify-center rounded-2xl border ${
            isDark ? 'bg-[#10131d]/50 border-slate-800 text-slate-500' : 'bg-white border-slate-300 shadow-sm text-slate-500'
          }`}>
            <Activity className="mb-2 opacity-50" size={24} />
            <span>Sin datos para el puesto #2</span>
          </div>
        )}

        {/* PODIUM #3 - VANGUARD CARD */}
        {data[2] ? (
          <div className={`p-5 relative overflow-hidden rounded-2xl group transition-all border ${
            isDark 
              ? 'bg-gradient-to-b from-orange-700/15 via-[#10131d] to-[#0d1017] border-orange-700/40 hover:border-orange-600 shadow-sm' 
              : 'bg-gradient-to-b from-orange-50 to-white border-orange-300 shadow-md hover:shadow-lg hover:border-orange-400'
          }`}>
            {/* Watermark */}
            <div className="absolute top-1 right-3 select-none pointer-events-none">
              <span className={`font-bebas text-7xl transition-colors ${isDark ? 'text-orange-700/15 group-hover:text-orange-700/25' : 'text-orange-500/10 group-hover:text-orange-500/20'}`}>
                #3
              </span>
            </div>

            {/* Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider rounded-md border ${
                isDark ? 'bg-orange-700/20 border-orange-700/40 text-orange-500' : 'bg-orange-200/50 border-orange-300 text-orange-700'
              }`}>
                <Medal size={12} className={isDark ? "text-orange-600" : "text-orange-500"} />
                <span className="font-bold">Vanguardia</span>
              </div>
              <span className={`font-mono text-xs font-bold ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>
                {data[2].member.rank}
              </span>
            </div>

            {/* Operative Name */}
            <h3 className={`font-bebas text-2xl sm:text-3xl tracking-wider truncate mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {data[2].member.nickname}
            </h3>
            {aliases[data[2].member.id]?.[0] && (
              <p className={`font-mono text-[10px] truncate mb-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                aka: {aliases[data[2].member.id][0]}
              </p>
            )}

            {/* Delta Readout */}
            <div className="flex items-end gap-3 mt-4 mb-4">
              {data[2].growth >= 0 ? (
                <TrendingUp className="text-emerald-500 mb-1" size={24} />
              ) : (
                <TrendingDown className="text-rose-500 mb-1" size={24} />
              )}
              <div>
                <span className={`font-mono text-[10px] uppercase tracking-widest block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  {data[2].growth >= 0 ? 'Subida Neta' : 'Descenso'}
                </span>
                <span className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${data[2].growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {data[2].growth > 0 ? '+' : ''}{config.format(data[2].growth)}
                </span>
              </div>
            </div>

            {/* Progress / Jump Comparison Footer */}
            <div className={`pt-3 border-t flex justify-between items-center text-xs font-mono ${isDark ? 'border-orange-700/20' : 'border-orange-200'}`}>
              <div>
                <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{config.oldLabel}</span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{config.format(data[2].oldVal)}</span>
              </div>
              <div className={isDark ? 'text-orange-700/50' : 'text-orange-400/80'}>➔</div>
              <div className="text-right">
                <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{config.newLabel}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{config.format(data[2].newVal)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-6 text-center font-mono text-xs flex flex-col items-center justify-center rounded-2xl border ${
            isDark ? 'bg-[#10131d]/50 border-slate-800 text-slate-500' : 'bg-white border-slate-300 shadow-sm text-slate-500'
          }`}>
            <Activity className="mb-2 opacity-50" size={24} />
            <span>Sin datos para el puesto #3</span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RANKING TABLE WITH TACTICAL FILTERS */}
      {/* ------------------------------------------------------------- */}
      <div className={`border rounded-2xl flex flex-col overflow-hidden ${
        isDark ? 'bg-[#090909] border-slate-800 shadow-sm' : 'bg-white border-slate-300 shadow-md'
      }`}>
        
        {/* Table Toolbar: Search + Rank Pills */}
        <div className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 ${
          isDark ? 'bg-[#141824]/50 border-slate-800' : 'bg-slate-50 border-slate-300'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h3 className={`font-bebas text-lg sm:text-xl tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Ranking General: {config.title}
            </h3>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md border ${
              isDark ? 'text-slate-500 bg-[#10131d] border-slate-800' : 'text-slate-600 bg-white border-slate-300 shadow-sm'
            }`}>
              {filteredData.length} operativos
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={13} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar operativo o aka..."
                className={`w-full pl-8 pr-3 py-1 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 rounded-xl transition-all border ${
                  isDark 
                    ? 'bg-[#10131d] border-slate-800 text-white placeholder-slate-600' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                }`}
              />
            </div>

            {/* Rank Filter Pills */}
            <div className="flex gap-1 items-center">
              <button
                onClick={() => { playClick(); setRankFilter('ALL'); }}
                className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all border rounded-[10px] ${
                  rankFilter === 'ALL' 
                    ? (isDark ? 'bg-rose-500/20 border-rose-500/50 text-white font-bold' : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm') 
                    : (isDark ? 'border-slate-800 bg-[#141824] text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm')
                }`}
              >
                Todos
              </button>
              {ranks.map(r => (
                <button
                  key={r}
                  onClick={() => { playClick(); setRankFilter(r); }}
                  className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all border rounded-[10px] ${
                    rankFilter === r 
                      ? (isDark ? 'bg-rose-500/20 border-rose-500/50 text-white font-bold' : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm') 
                      : (isDark ? 'border-slate-800 bg-[#141824] text-slate-400 hover:text-white hover:border-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-sm')
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className={`border-b ${isDark ? 'bg-[#10131d] border-slate-800 shadow-sm' : 'bg-slate-50 border-slate-300'}`}>
              <tr>
                <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-16 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pos</th>
                <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Operativo</th>
                <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-20 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rango</th>
                <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 w-36 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{config.oldLabel}</th>
                <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 w-36 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{config.newLabel}</th>
                <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 w-40 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subida Neta</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 bg-[#090909]' : 'divide-slate-200 bg-white'}`}>
              {filteredData.map((item, i) => {
                const memberAlias = aliases[item.member.id]?.[0];
                const isChampion = i === 0;
                const isSecond = i === 1;
                const isThird = i === 2;

                return (
                  <tr key={item.member.id} className={`transition-colors group ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                    {/* Position */}
                    <td className="py-3 px-3 text-center font-mono text-xs">
                      {isChampion ? (
                        <span className="text-amber-500 font-bold flex items-center justify-center gap-1">
                          <Crown size={12} /> #1
                        </span>
                      ) : isSecond ? (
                        <span className="text-slate-400 font-bold flex items-center justify-center gap-1">
                          <Medal size={12} /> #2
                        </span>
                      ) : isThird ? (
                        <span className="text-orange-500 font-bold flex items-center justify-center gap-1">
                          <Medal size={12} /> #3
                        </span>
                      ) : (
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>#{i + 1}</span>
                      )}
                    </td>

                    {/* Member Name + Alias */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className={`font-mono text-sm font-medium transition-colors truncate ${
                          isDark ? 'text-white group-hover:text-rose-400' : 'text-slate-900 group-hover:text-rose-600'
                        }`}>
                          {item.member.nickname}
                        </span>
                        {memberAlias && (
                          <span className={`font-mono text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`} title={`Alias: ${memberAlias}`}>
                            aka: {memberAlias}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rank */}
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono text-xs border px-2 py-0.5 rounded-md ${
                        isDark ? 'bg-white/5 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        {item.member.rank}
                      </span>
                    </td>

                    {/* Old Value */}
                    <td className={`py-3 px-4 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {config.format(item.oldVal)}
                    </td>

                    {/* New Value */}
                    <td className={`py-3 px-4 font-mono text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {config.format(item.newVal)}
                    </td>

                    {/* Delta / Growth with indicator */}
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.growth > 0 ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <TrendingUp size={12} />
                            +{config.format(item.growth)}
                          </span>
                        ) : item.growth < 0 ? (
                          <span className="text-rose-500 font-bold flex items-center gap-1">
                            <TrendingDown size={12} />
                            {config.format(item.growth)}
                          </span>
                        ) : (
                          <span className={isDark ? 'text-slate-600 font-mono' : 'text-slate-300 font-mono'}>-</span>
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
    </div>
  );
};

export default AnalyticsPanel;
