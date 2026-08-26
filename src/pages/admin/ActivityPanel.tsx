import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSound } from '../../contexts/SoundContext';
import { AdminModal, type AdminModalType } from '../../components/admin/AdminModal';
import { Search, Loader2, Save, Calendar, Settings, Plus, X } from 'lucide-react';
import { MansionSelect, PowerInput, NemesisSelect, PhaseSelect } from '../../components/admin/AdminInputs';

interface Member {
  id: string;
  nickname: string;
  rank: string;
  account_type: 'main' | 'alt';
  power: number;
  mansion_level: number;
  alliance_name: string;
}

interface ActivityRecord {
  id?: string;
  member_id: string;
  cycle_date: string;
  power: number;
  mansion_level: number;
  alliance_points: number;
  tac_joined: boolean;
  tac_power: number;
  lab_joined: boolean;
  lab_points: number;
  nemesis_difficulty: string;
  nemesis_level: number;
  nemesis_phase: number;
  crocodile_damage: number;
  saint_valley: boolean;
  wesker_points: number;
  security_centers: boolean;
  security_centers_data?: string[];
}

const ActivityPanel = ({ activeAlliance }: { activeAlliance: string }) => {
  const { playHover, playClick } = useSound();
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Record<string, ActivityRecord>>({});
  const [prevActivities, setPrevActivities] = useState<Record<string, ActivityRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<{isOpen: boolean, type: AdminModalType, title: string, message: string, onConfirm?: () => void}>({isOpen: false, type: 'alert', title: '', message: ''});
  const closeModal = () => setModal(prev => ({...prev, isOpen: false}));
  const [activeEventTab, setActiveEventTab] = useState('general');
  const [activeCenters, setActiveCenters] = useState<string[]>(['Centro 1', 'Centro 2']);
  const [showCenterSettings, setShowCenterSettings] = useState(false);
  
  const getInitialDate = () => {
    const d = new Date();
    d.setUTCHours(0,0,0,0);
    return d.toISOString().split('T')[0];
  };
  
  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate, activeAlliance]);

  const fetchData = async () => {
    setLoading(true);
    setHasChanges(false);
    try {
      const { data: memData, error: memErr } = await supabase
        .from('members')
        .select('*')
        .eq('is_active', true)
        .eq('alliance_name', activeAlliance)
        .order('rank', { ascending: false })
        .order('nickname', { ascending: true });
        
      if (memErr) throw memErr;
      setMembers(memData || []);

      const { data: actData, error: actErr } = await supabase
        .from('guild_activity_cycles')
        .select('*')
        .eq('cycle_date', selectedDate);
        
      if (actErr) throw actErr;
      
      const actMap: Record<string, ActivityRecord> = {};
      (actData || []).forEach(record => {
        actMap[record.member_id] = record;
      });
      
      setActivities(actMap);

      // Fetch active security centers settings
      const { data: settingsData } = await supabase
        .from('guild_settings')
        .select('*')
        .eq('key', 'security_centers')
        .maybeSingle();

      if (settingsData && settingsData.value) {
        setActiveCenters(settingsData.value);
      }

      // Fetch previous cycle for historical comparison
      const { data: prevActData } = await supabase
        .from('guild_activity_cycles')
        .select('*')
        .lt('cycle_date', selectedDate)
        .order('cycle_date', { ascending: false });

      const prevActMap: Record<string, ActivityRecord> = {};
      if (prevActData) {
        prevActData.forEach(record => {
          if (!prevActMap[record.member_id]) {
            prevActMap[record.member_id] = record;
          }
        });
      }
      setPrevActivities(prevActMap);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCenters = async (centers: string[]) => {
    try {
      await supabase
        .from('guild_settings')
        .upsert({ key: 'security_centers', value: centers });
    } catch (err) {
      console.error('Error saving centers:', err);
    }
  };

  const formatPower = (num: number) => {
    return (num / 1000000).toFixed(2) + 'M';
  };

  const handleCellChange = (memberId: string, field: keyof ActivityRecord, value: any) => {
    setHasChanges(true);
    setActivities(prev => {
      const member = members.find(m => m.id === memberId);
      const current = prev[memberId] || {
        member_id: memberId,
        cycle_date: selectedDate,
        power: member?.power || 0,
        mansion_level: member?.mansion_level || 1,
        alliance_points: 0,
        tac_joined: false,
        tac_power: 0,
        lab_joined: false,
        lab_points: 0,
        nemesis_phase: 1,
        nemesis_difficulty: 'Normal',
        nemesis_level: 0,
        crocodile_damage: 0,
        saint_valley: false,
        wesker_points: 0,
        security_centers: false,
        security_centers_data: []
      };
      
      return {
        ...prev,
        [memberId]: { ...current, [field]: value }
      };
    });
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    playClick();
    setSaving(true);
    
    try {
      const recordsToUpsert = Object.values(activities).map(act => ({
        ...act,
        cycle_date: selectedDate
      }));
      
      if (recordsToUpsert.length === 0) {
        setSaving(false);
        return;
      }
      
      const { error } = await supabase
        .from('guild_activity_cycles')
        .upsert(recordsToUpsert, { onConflict: 'cycle_date,member_id' });
        
      if (error) throw error;
      
      setHasChanges(false);
      setModal({isOpen: true, type: 'success', title: 'Éxito', message: 'Cambios guardados exitosamente'});
    } catch (err) {
      console.error('Error saving:', err);
      setModal({isOpen: true, type: 'error', title: 'Error', message: 'Error guardando cambios'});
    } finally {
      setSaving(false);
    }
  };

  const toggleColumnAll = (field: keyof ActivityRecord, value: boolean) => {
    setHasChanges(true);
    playClick();
    const newActivities = { ...activities };
    members.forEach(m => {
      if (!newActivities[m.id]) {
        newActivities[m.id] = {
          member_id: m.id,
          cycle_date: selectedDate,
          power: 0, mansion_level: 1,
          alliance_points: 0, tac_joined: false, tac_power: 0,
          lab_joined: false, lab_points: 0, nemesis_phase: 1, nemesis_difficulty: 'Normal',
          nemesis_level: 0, crocodile_damage: 0, saint_valley: false,
          wesker_points: 0, security_centers: false, security_centers_data: []
        };
      }
      newActivities[m.id] = { ...newActivities[m.id], [field]: value };
    });
    setActivities(newActivities);
  };

  const filteredMembers = members.filter(m => 
    m.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = members.filter(m => m.account_type === 'main').length;
  const altCount = members.filter(m => m.account_type === 'alt').length;

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-bebas text-3xl tracking-widest text-white">Auditoría Semanal</h2>
          <div className="flex gap-4 font-mono text-xs text-gray-400 mt-2">
            <span>Principales: <strong className="text-green-400">{activeCount}</strong></span>
            <span>Secundarias: <strong className="text-blue-400">{altCount}</strong></span>
          </div>
        </div>
        
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Ciclo (Fecha)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-black border border-gray-700 text-white pl-9 pr-3 py-2 font-mono text-sm focus:outline-none focus:border-neon-red"
              />
            </div>
          </div>
          <button 
            onClick={handleSave}
            onMouseEnter={playHover}
            disabled={!hasChanges || saving}
            className={`px-6 py-2 font-mono text-sm uppercase tracking-widest flex items-center gap-2 transition-colors ${!hasChanges ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blood-red/20 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white shadow-[0_0_15px_rgba(255,42,42,0.3)]'}`}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-gray-800 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 flex flex-col gap-4">
          <div className="flex gap-4 items-center overflow-x-auto scrollbar-none pb-2">
            <div className="relative w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar operativo..."
                className="w-full bg-black border border-gray-700 text-white pl-9 pr-3 py-1.5 font-mono text-xs focus:outline-none focus:border-neon-red"
              />
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button onClick={() => toggleColumnAll('tac_joined', true)} className="text-[10px] font-mono text-gray-400 border border-gray-700 px-2 py-1 hover:bg-white/10">+ Todo TAC</button>
              <button onClick={() => toggleColumnAll('lab_joined', true)} className="text-[10px] font-mono text-gray-400 border border-gray-700 px-2 py-1 hover:bg-white/10">+ Todo Lab</button>
              <button onClick={() => toggleColumnAll('saint_valley', true)} className="text-[10px] font-mono text-gray-400 border border-gray-700 px-2 py-1 hover:bg-white/10">+ Todo Valle</button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 border-b border-gray-800/50">
            {[
              { id: 'general', label: 'Crecimiento' },
              { id: 'union', label: 'Unión Alianza' },
              { id: 'tac', label: 'TAC' },
              { id: 'lab', label: 'Laboratorio' },
              { id: 'nemesis', label: 'Némesis' },
              { id: 'crocodile', label: 'Cocodrilo' },
              { id: 'valley', label: 'Valle & Sec' },
              { id: 'wesker', label: 'Wesker' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { playClick(); setActiveEventTab(tab.id); setShowCenterSettings(false); }}
                onMouseEnter={playHover}
                className={`px-4 py-2 font-mono text-[11px] md:text-xs uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${activeEventTab === tab.id ? 'border-neon-red text-neon-red bg-blood-red/10' : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeEventTab === 'valley' && (
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="font-mono text-xs text-gray-400">Configuración de Centros:</span>
              <button 
                onClick={() => setShowCenterSettings(!showCenterSettings)}
                className="flex items-center gap-2 font-mono text-[10px] text-gray-400 hover:text-white"
              >
                <Settings size={14} /> Editar Centros
              </button>
            </div>
          )}

          {activeEventTab === 'valley' && showCenterSettings && (
            <div className="mb-4 p-4 border border-gray-800 bg-[#111] flex flex-col gap-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="new-center-input"
                  placeholder="Ej: Centro A (Lvl 2)"
                  className="bg-black border border-gray-700 text-white px-3 py-1 font-mono text-xs focus:outline-none focus:border-neon-red flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val && !activeCenters.includes(val)) {
                        const newCenters = [...activeCenters, val];
                        setActiveCenters(newCenters);
                        saveCenters(newCenters);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('new-center-input') as HTMLInputElement;
                    const val = input.value;
                    if (val && !activeCenters.includes(val)) {
                      const newCenters = [...activeCenters, val];
                      setActiveCenters(newCenters);
                      saveCenters(newCenters);
                      input.value = '';
                    }
                  }}
                  className="bg-blood-red/20 text-neon-red border border-blood-red px-3 flex items-center"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCenters.map(center => (
                  <div key={center} className="flex items-center gap-2 bg-black border border-gray-700 px-2 py-1 font-mono text-xs">
                    <span>{center}</span>
                    <button 
                      onClick={() => {
                        const newCenters = activeCenters.filter(c => c !== center);
                        setActiveCenters(newCenters);
                        saveCenters(newCenters);
                      }}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="font-mono text-[10px] text-gray-500">Nota: Al guardar se actualiza para toda la alianza.</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-neon-red" size={32} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-[#111] shadow-md z-10 border-b border-gray-700">
                <tr>
                  <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4">Nombre</th>
                  <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-2 w-16 text-center">Ran</th>
                  
                  {activeEventTab === 'general' && (
                    <>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Poder Ant.</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-40">Poder Nuevo</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Subida</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32 text-center">Mansión</th>
                    </>
                  )}
                  
                  {activeEventTab === 'union' && (
                    <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-40">Puntos Alianza</th>
                  )}
                  
                  {activeEventTab === 'tac' && (
                    <>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-20 text-center">TAC ✅</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Poder Ant.</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-40">Poder Nuevo</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Subida</th>
                    </>
                  )}
                  
                  {activeEventTab === 'lab' && (
                    <>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-20 text-center">Lab ✅</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Pts Ant.</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-40">Pts Nuevo</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Subida</th>
                    </>
                  )}
                  
                  {activeEventTab === 'nemesis' && (
                    <>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32 text-center">Fase</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Dificultad</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-24 text-center">Nivel</th>
                    </>
                  )}
                  
                  {activeEventTab === 'crocodile' && (
                    <>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Daño Ant.</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-40">Daño Nuevo</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Subida</th>
                    </>
                  )}
                  
                  {activeEventTab === 'valley' && (
                    <>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-24 text-center">Valle ✅</th>
                      {activeCenters.map((center, i) => (
                        <th key={i} className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32 text-center truncate" title={center}>{center}</th>
                      ))}
                    </>
                  )}
                  
                  {activeEventTab === 'wesker' && (
                    <>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Pts Ant.</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-40">Pts Nuevo</th>
                      <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-3 w-32">Subida</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.filter(m => m.alliance_name === activeAlliance).map(member => {
                  const act = activities[member.id] || {} as ActivityRecord;
                  const prevAct = prevActivities[member.id] || {} as ActivityRecord;
                  
                  return (
                    <tr key={member.id} className="hover:bg-white/5 even:bg-white/[0.02] border-b border-gray-800/50 transition-colors group">
                      <td className="py-4 px-4 font-mono text-sm text-white sticky left-0 group-hover:bg-[#151515] bg-[#0a0a0a] z-0">{member.nickname}</td>
                      <td className="py-4 px-2 font-mono text-xs text-gray-500 text-center">{member.rank}</td>

                      {/* GENERAL (CRECIMIENTO) */}
                      {activeEventTab === 'general' && (
                        <>
                          <td className="py-4 px-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                            {formatPower(member.power)}
                          </td>
                          <td className="py-4 px-3">
                            <PowerInput 
                              value={act.power || 0}
                              onChange={(val) => handleCellChange(member.id, 'power', val)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-300 font-mono text-sm focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-4 px-3">
                            {act.power && act.power > member.power ? (
                              <span className="text-green-500 font-mono text-xs">+{formatPower(act.power - member.power)}</span>
                            ) : act.power && act.power < member.power ? (
                              <span className="text-red-500 font-mono text-xs">{formatPower(act.power - member.power)}</span>
                            ) : (
                              <span className="text-gray-600 font-mono text-xs">-</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center">
                            <MansionSelect 
                              value={act.mansion_level || member.mansion_level}
                              onChange={(val) => handleCellChange(member.id, 'mansion_level', val)}
                            />
                          </td>
                        </>
                      )}

                      {/* UNION ALIANZA */}
                      {activeEventTab === 'union' && (
                        <td className="py-4 px-3">
                          <input 
                            type="number" value={act.alliance_points || ''} 
                            onChange={(e) => handleCellChange(member.id, 'alliance_points', parseInt(e.target.value)||0)}
                            className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-300 font-mono text-sm focus:outline-none transition-colors px-2 py-1"
                          />
                        </td>
                      )}

                      {/* TAC */}
                      {activeEventTab === 'tac' && (
                        <>
                          <td className="py-4 px-3 text-center">
                            <input 
                              type="checkbox" checked={act.tac_joined || false}
                              onChange={(e) => handleCellChange(member.id, 'tac_joined', e.target.checked)}
                              className="accent-neon-red cursor-pointer w-4 h-4"
                            />
                          </td>
                          <td className="py-4 px-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                            {formatPower(prevAct.tac_power || 0)}
                          </td>
                          <td className="py-4 px-3">
                            <PowerInput 
                              value={act.tac_power || 0}
                              onChange={(val) => handleCellChange(member.id, 'tac_power', val)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-300 font-mono text-sm focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-4 px-3">
                            {act.tac_power && prevAct.tac_power && act.tac_power > prevAct.tac_power ? (
                              <span className="text-green-500 font-mono text-xs">+{formatPower(act.tac_power - prevAct.tac_power)}</span>
                            ) : act.tac_power && prevAct.tac_power && act.tac_power < prevAct.tac_power ? (
                              <span className="text-red-500 font-mono text-xs">{formatPower(act.tac_power - prevAct.tac_power)}</span>
                            ) : (
                              <span className="text-gray-600 font-mono text-xs">-</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* LAB */}
                      {activeEventTab === 'lab' && (
                        <>
                          <td className="py-4 px-3 text-center">
                            <input 
                              type="checkbox" checked={act.lab_joined || false}
                              onChange={(e) => handleCellChange(member.id, 'lab_joined', e.target.checked)}
                              className="accent-neon-red cursor-pointer w-4 h-4"
                            />
                          </td>
                          <td className="py-4 px-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                            {(prevAct.lab_points || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-3">
                            <input 
                              type="number" value={act.lab_points || ''} 
                              onChange={(e) => handleCellChange(member.id, 'lab_points', parseInt(e.target.value)||0)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-300 font-mono text-sm focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-4 px-3">
                            {act.lab_points && prevAct.lab_points && act.lab_points > prevAct.lab_points ? (
                              <span className="text-green-500 font-mono text-xs">+{act.lab_points - prevAct.lab_points}</span>
                            ) : act.lab_points && prevAct.lab_points && act.lab_points < prevAct.lab_points ? (
                              <span className="text-red-500 font-mono text-xs">{act.lab_points - prevAct.lab_points}</span>
                            ) : (
                              <span className="text-gray-600 font-mono text-xs">-</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* NEMESIS */}
                      {activeEventTab === 'nemesis' && (
                        <>
                          <td className="py-4 px-3">
                            <PhaseSelect 
                              value={act.nemesis_phase || 1}
                              onChange={(val) => handleCellChange(member.id, 'nemesis_phase', val)}
                            />
                          </td>
                          <td className="py-4 px-3">
                            <NemesisSelect 
                              value={act.nemesis_difficulty || 'Normal'}
                              onChange={(val) => handleCellChange(member.id, 'nemesis_difficulty', val)}
                            />
                          </td>
                          <td className="py-4 px-3 text-center">
                            <input 
                              type="number" min="0" max="50" value={act.nemesis_level || ''} 
                              onChange={(e) => {
                                let val = parseInt(e.target.value)||0;
                                if (val > 50) val = 50;
                                handleCellChange(member.id, 'nemesis_level', val);
                              }}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-300 font-mono text-sm focus:outline-none transition-colors px-2 py-1 text-center"
                            />
                          </td>
                        </>
                      )}

                      {/* CROCODILE */}
                      {activeEventTab === 'crocodile' && (
                        <>
                          <td className="py-4 px-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                            {formatPower(prevAct.crocodile_damage || 0)}
                          </td>
                          <td className="py-4 px-3">
                            <PowerInput 
                              value={act.crocodile_damage || 0}
                              onChange={(val) => handleCellChange(member.id, 'crocodile_damage', val)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-300 font-mono text-sm focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-4 px-3">
                            {act.crocodile_damage && prevAct.crocodile_damage && act.crocodile_damage > prevAct.crocodile_damage ? (
                              <span className="text-green-500 font-mono text-xs">+{formatPower(act.crocodile_damage - prevAct.crocodile_damage)}</span>
                            ) : act.crocodile_damage && prevAct.crocodile_damage && act.crocodile_damage < prevAct.crocodile_damage ? (
                              <span className="text-red-500 font-mono text-xs">{formatPower(act.crocodile_damage - prevAct.crocodile_damage)}</span>
                            ) : (
                              <span className="text-gray-600 font-mono text-xs">-</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* VALLEY & SEC */}
                      {activeEventTab === 'valley' && (
                        <>
                          <td className="py-4 px-3 text-center">
                            <input 
                              type="checkbox" checked={act.saint_valley || false}
                              onChange={(e) => handleCellChange(member.id, 'saint_valley', e.target.checked)}
                              className="accent-neon-red cursor-pointer w-4 h-4"
                            />
                          </td>
                          {activeCenters.map((center, i) => (
                            <td key={i} className="py-4 px-3 text-center">
                              <input 
                                type="checkbox" checked={(act.security_centers_data || []).includes(center)}
                                onChange={(e) => {
                                  const currentData = act.security_centers_data || [];
                                  const newData = e.target.checked 
                                    ? [...currentData, center] 
                                    : currentData.filter(c => c !== center);
                                  handleCellChange(member.id, 'security_centers_data', newData);
                                }}
                                className="accent-neon-red cursor-pointer w-4 h-4"
                              />
                            </td>
                          ))}
                        </>
                      )}

                      {/* WESKER */}
                      {activeEventTab === 'wesker' && (
                        <>
                          <td className="py-4 px-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                            {(prevAct.wesker_points || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-3">
                            <input 
                              type="number" value={act.wesker_points || ''} 
                              onChange={(e) => handleCellChange(member.id, 'wesker_points', parseInt(e.target.value)||0)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-300 font-mono text-sm focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-4 px-3">
                            {act.wesker_points && prevAct.wesker_points && act.wesker_points > prevAct.wesker_points ? (
                              <span className="text-green-500 font-mono text-xs">+{act.wesker_points - prevAct.wesker_points}</span>
                            ) : act.wesker_points && prevAct.wesker_points && act.wesker_points < prevAct.wesker_points ? (
                              <span className="text-red-500 font-mono text-xs">{act.wesker_points - prevAct.wesker_points}</span>
                            ) : (
                              <span className="text-gray-600 font-mono text-xs">-</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <AdminModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm || closeModal} onClose={closeModal} />
    </div>
  );
};

export default ActivityPanel;
