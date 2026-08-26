import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, TrendingUp, TrendingDown, Loader2, Activity } from 'lucide-react';

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
  power: number;
  cycle_date: string;
  crocodile_damage: number;
  tac_power: number;
  lab_points: number;
  wesker_points: number;
}

type MetricType = 'power' | 'crocodile_damage' | 'tac_power' | 'lab_points' | 'wesker_points';

const METRIC_LABELS: Record<MetricType, { title: string, oldLabel: string, newLabel: string, format: (n: number) => string }> = {
  power: { title: 'Poder', oldLabel: 'Poder Ant.', newLabel: 'Nuevo Poder', format: (n) => (n / 1000000).toFixed(2) + 'M' },
  crocodile_damage: { title: 'Daño Cocodrilo', oldLabel: 'Daño Ant.', newLabel: 'Nuevo Daño', format: (n) => (n / 1000000).toFixed(2) + 'M' },
  tac_power: { title: 'TAC', oldLabel: 'Poder Ant.', newLabel: 'Nuevo Poder', format: (n) => (n / 1000000).toFixed(2) + 'M' },
  lab_points: { title: 'Laboratorio', oldLabel: 'Pts Ant.', newLabel: 'Nuevos Pts', format: (n) => n.toLocaleString() },
  wesker_points: { title: 'Wesker', oldLabel: 'Pts Ant.', newLabel: 'Nuevos Pts', format: (n) => n.toLocaleString() },
};

const AnalyticsPanel = ({ activeAlliance }: { activeAlliance: string }) => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [metric, setMetric] = useState<MetricType>('power');

  useEffect(() => {
    fetchData();
  }, [activeAlliance]);

  const fetchData = async () => {
    try {
      const { data: memData, error: memErr } = await supabase.from('members').select('*').eq('alliance_name', activeAlliance);
      if (memErr) throw memErr;

      const { data: actData, error: actErr } = await supabase.from('guild_activity_cycles').select('*').order('cycle_date', { ascending: false });
      if (actErr) throw actErr;

      setMembers(memData || []);
      setActivities(actData || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysis = () => {
    const analysisMap = new Map<string, { member: Member; growth: number; oldVal: number; newVal: number }>();

    members.forEach(m => {
      // Find the two most recent activities for this member
      const memberActs = activities.filter(a => a.member_id === m.id);
      
      let newVal = 0;
      let oldVal = 0;

      if (metric === 'power') {
        newVal = memberActs[0]?.power || m.power;
        oldVal = memberActs[1]?.power || m.power;
      } else {
        newVal = memberActs[0]?.[metric] || 0;
        oldVal = memberActs[1]?.[metric] || 0;
      }

      const growth = newVal - oldVal;

      if (growth !== 0) {
        analysisMap.set(m.id, {
          member: m,
          growth,
          oldVal,
          newVal
        });
      }
    });

    return Array.from(analysisMap.values()).sort((a, b) => b.growth - a.growth);
  };

  const data = getAnalysis();
  const meta = METRIC_LABELS[metric];
  const totalGrowth = data.reduce((acc, curr) => acc + curr.growth, 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-red" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex gap-8 items-center">
          <div>
            <h2 className="font-bebas text-3xl tracking-widest text-white flex items-center gap-2">
              <Trophy className="text-neon-red" size={28} />
              Análisis Semanal
            </h2>
            <p className="font-mono text-gray-400 text-xs mt-1">Comparativa de rendimiento</p>
          </div>
          
          <div className="border-l border-gray-800 pl-8 hidden md:block">
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-1">Crecimiento Global de Alianza</p>
            <div className="flex items-center gap-2">
              <Activity className={totalGrowth >= 0 ? "text-emerald-500" : "text-red-500"} size={20} />
              <span className={`font-mono text-xl ${totalGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalGrowth > 0 ? '+' : ''}{meta.format(totalGrowth)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 bg-[#0a0a0a] border border-gray-800 p-1 flex-wrap justify-end">
          {(Object.keys(METRIC_LABELS) as MetricType[]).map(key => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${metric === key ? 'bg-blood-red/20 text-neon-red border border-blood-red' : 'text-gray-500 hover:text-white'}`}
            >
              {METRIC_LABELS[key].title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        {data.slice(0, 3).map((item, i) => (
          <div key={item.member.id} className="bg-[#0a0a0a] border border-gray-800 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className={`font-bebas text-6xl opacity-10 group-hover:opacity-20 transition-opacity ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-300' : 'text-amber-600'}`}>
                #{i + 1}
              </span>
            </div>
            
            <h3 className="font-bebas text-2xl text-white mb-1">{item.member.nickname}</h3>
            <span className="font-mono text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-sm">{item.member.rank}</span>
            
            <div className="mt-6 flex items-end gap-3">
              {item.growth > 0 ? (
                <TrendingUp className="text-emerald-500 mb-1" size={24} />
              ) : (
                <TrendingDown className="text-red-500 mb-1" size={24} />
              )}
              <div>
                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">{item.growth > 0 ? 'Subida' : 'Bajada'}</p>
                <p className={`font-mono text-3xl ${item.growth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.growth > 0 ? '+' : ''}{meta.format(item.growth)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-800/50 flex justify-between">
              <div>
                <p className="font-mono text-[10px] text-gray-500">{meta.oldLabel}</p>
                <p className="font-mono text-xs text-gray-400">{meta.format(item.oldVal)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-gray-500">{meta.newLabel}</p>
                <p className="font-mono text-xs text-white">{meta.format(item.newVal)}</p>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="col-span-3 py-8 text-center border border-gray-800/50 border-dashed">
            <Activity className="mx-auto mb-2 text-gray-600" size={24} />
            <p className="font-mono text-gray-500 text-xs uppercase tracking-widest">No hay datos de subida en esta categoría</p>
          </div>
        )}
      </div>

      <div className="bg-[#0a0a0a] border border-gray-800 flex-1 overflow-hidden flex flex-col mt-4">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-bebas text-xl tracking-widest text-white uppercase">Ranking de Crecimiento: {meta.title}</h3>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar p-4">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10 shadow-md">
              <tr>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 border-b border-gray-700 w-16 text-center">Pos</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 border-b border-gray-700">Operativo</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 border-b border-gray-700 w-32">{meta.oldLabel}</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 border-b border-gray-700 w-32">{meta.newLabel}</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 border-b border-gray-700 w-32 text-right">Subida</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={item.member.id} className="hover:bg-white/5 even:bg-white/[0.02] border-b border-gray-800/50 transition-colors">
                  <td className="py-4 px-4 text-center font-mono text-gray-500 text-sm">#{i + 1}</td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-white">{item.member.nickname}</span>
                    <span className="ml-2 font-mono text-xs text-gray-600">{item.member.rank}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-sm text-gray-400">{meta.format(item.oldVal)}</td>
                  <td className="py-4 px-4 font-mono text-sm text-white">{meta.format(item.newVal)}</td>
                  <td className={`py-4 px-4 font-mono text-sm text-right ${item.growth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.growth > 0 ? '+' : ''}{meta.format(item.growth)}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center font-mono text-gray-500 text-sm">No hay registros suficientes para comparar esta categoría.</td>
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
