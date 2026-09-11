import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSound } from '../../contexts/SoundContext';
import { AdminModal, type AdminModalType } from '../../components/admin/AdminModal';
import { Plus, Search, Loader2, Tag, X, Users, Database } from 'lucide-react';
import { MansionSelect, PowerInput, RankSelect, AccountTypeSelect } from '../../components/admin/AdminInputs';
import { useTheme } from '../../contexts/ThemeContext';

interface Member {
  id: string;
  nickname: string;
  rank: string;
  account_type: 'main' | 'alt';
  power: number;
  mansion_level: number;
  is_active: boolean;
  status: 'active' | 'inactive' | 'kicked';
  alliance_name: string;
}

const MembersPanel = ({ activeAlliance }: { activeAlliance: string }) => {
  const { isDark } = useTheme();
  const { playHover, playClick } = useSound();
  const [members, setMembers] = useState<Member[]>([]);
  const [aliases, setAliases] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'kicked'>('active');
  const [editingAliasMemberId, setEditingAliasMemberId] = useState<string | null>(null);
  const [newAliasText, setNewAliasText] = useState('');

  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: AdminModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'alert', title: '', message: '' });
  
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  // Form state for adding new member
  const [newNickname, setNewNickname] = useState('');
  const [newRank, setNewRank] = useState('R1');
  const [newType, setNewType] = useState<'main' | 'alt'>('main');
  const [newPower, setNewPower] = useState(0);
  const [newMansionLevel, setNewMansionLevel] = useState(1);

  useEffect(() => {
    fetchData();
  }, [activeAlliance]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch members
      const { data: memData, error: memErr } = await supabase
        .from('members')
        .select('*')
        .eq('alliance_name', activeAlliance)
        .order('rank', { ascending: false })
        .order('nickname', { ascending: true });
        
      if (memErr) throw memErr;
      setMembers(memData || []);

      // 2. Fetch alias mappings from guild_settings
      const { data: aliasData } = await supabase
        .from('guild_settings')
        .select('*')
        .eq('key', 'member_aliases')
        .maybeSingle();

      if (aliasData && aliasData.value && typeof aliasData.value === 'object') {
        setAliases(aliasData.value);
      } else {
        setAliases({});
      }
    } catch (err) {
      console.error('Error fetching members data:', err);
    } finally {
      setLoading(false);
    }
  };

  const logAudit = async (action_type: string, target_name: string, details?: string) => {
    try {
      await supabase.from('audit_logs').insert([{
        alliance_name: activeAlliance,
        admin_name: 'Admin',
        action_type,
        target_name,
        details
      }]);
    } catch (err) {
      console.error('Audit log failed', err);
    }
  };

  const saveAliasMap = async (updated: Record<string, string[]>) => {
    setAliases(updated);
    try {
      await supabase
        .from('guild_settings')
        .upsert({ key: 'member_aliases', value: updated });
    } catch (err) {
      console.error('Error saving alias map:', err);
    }
  };

  const handleAddAlias = (memberId: string) => {
    const trimmed = newAliasText.trim();
    if (!trimmed) return;
    
    playClick();
    const existing = aliases[memberId] || [];
    if (!existing.includes(trimmed)) {
      const updated = {
        ...aliases,
        [memberId]: [...existing, trimmed]
      };
      saveAliasMap(updated);
    }
    setNewAliasText('');
    setEditingAliasMemberId(null);
  };

  const handleRemoveAlias = (memberId: string, aliasToRemove: string) => {
    playClick();
    const existing = aliases[memberId] || [];
    const updated = {
      ...aliases,
      [memberId]: existing.filter(a => a !== aliasToRemove)
    };
    saveAliasMap(updated);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname.trim()) return;
    
    playClick();
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([{
          nickname: newNickname.trim(),
          rank: newRank,
          account_type: newType,
          power: newPower,
          mansion_level: newMansionLevel,
          status: 'active',
          alliance_name: activeAlliance
        }])
        .select();

      if (error) throw error;
      if (data) {
        setMembers([...members, data[0]].sort((a, b) => b.rank.localeCompare(a.rank) || a.nickname.localeCompare(b.nickname)));
        setNewNickname('');
        setNewRank('R1');
        setNewType('main');
        setNewPower(0);
        setNewMansionLevel(1);
        await logAudit('ADD_MEMBER', data[0].nickname, `Rango: ${newRank}, Poder: ${newPower}`);
      }
    } catch (err) {
      console.error('Error adding member:', err);
      setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Error adding member. Check console.' });
    }
  };

  const updateMember = async (id: string, field: string, value: any) => {
    try {
      const member = members.find(m => m.id === id);
      setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
      
      const { error } = await supabase
        .from('members')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      
      if (member) {
        if (field === 'status' && value === 'kicked') {
          await logAudit('KICK_MEMBER', member.nickname, 'Expulsado de la alianza');
        } else if (field === 'status' && value === 'active') {
          await logAudit('RESTORE_MEMBER', member.nickname, 'Restaurado a la alianza');
        } else if (field === 'status' && value === 'inactive') {
          await logAudit('INACTIVE_MEMBER', member.nickname, 'Marcado como inactivo');
        }
      }
    } catch (err) {
      console.error('Error updating member:', err);
      fetchData();
    }
  };

  const ranks = ['R5', 'R4', 'R3', 'R2', 'R1'];

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (aliases[m.id] && aliases[m.id].some(a => a.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus = 
      filterStatus === 'all' || (m.status || (m.is_active ? 'active' : 'inactive')) === filterStatus;

    const matchesRank = 
      filterRank === 'ALL' || m.rank === filterRank;

    return matchesSearch && matchesStatus && matchesRank;
  });

  const countByRank = ranks.reduce((acc, r) => {
    acc[r] = members.filter(m => m.rank === r && (filterStatus === 'all' || (m.status || (m.is_active ? 'active' : 'inactive')) === filterStatus)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className={`font-bebas text-3xl tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Directorio de Operativos</h2>
            <span className={`font-mono text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold rounded-md border ${
              isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-rose-100 border-rose-300 text-rose-700'
            }`}>
              {activeAlliance}
            </span>
          </div>
          <div 
            className={`font-mono text-xs flex items-center gap-2 w-max px-3 py-1.5 rounded-xl border cursor-help ${
              isDark ? 'bg-[#141824] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
            title="Total de operativos en la base de datos sincronizados con el Mapeo OCR"
          >
            <Users size={14} className={isDark ? 'text-rose-400' : 'text-rose-600'} />
            <span>Total: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{members.length}</strong></span>
            <Database size={12} className={`ml-2 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          </div>
        </div>
      </div>

      {/* Add Operative Quick Card */}
      <form onSubmit={handleAddMember} className={`p-5 rounded-2xl border transition-colors shadow-sm ${
        isDark ? 'bg-gradient-to-b from-[#141824] to-[#10131d] border-slate-800/80' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'
      }`}>
        <div className={`text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-2 font-bold ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <Plus size={16} className={isDark ? 'text-rose-400' : 'text-rose-500'} /> Nuevo Registro de Operativo
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className={`block font-mono text-[10px] uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Nombre</label>
            <input 
              type="text" 
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className={`w-full border font-mono text-xs focus:outline-none rounded-xl transition-all px-3 py-2 ${
                isDark 
                  ? 'bg-[#10131d] border-slate-800 hover:border-slate-700 focus:border-rose-500 text-white placeholder-slate-600' 
                  : 'bg-white border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-900 placeholder-slate-400 shadow-sm'
              }`}
              placeholder="Ej: CondePatula"
            />
          </div>
          <div>
            <label className={`block font-mono text-[10px] uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Rango</label>
            <RankSelect 
              value={newRank}
              onChange={(val) => setNewRank(val)}
              className={`w-full border font-mono text-xs text-left px-3 py-2 rounded-xl flex justify-between items-center transition-all ${
                isDark 
                  ? 'bg-[#10131d] border-slate-800 hover:border-slate-700 focus:border-rose-500 text-slate-200' 
                  : 'bg-white border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-800 shadow-sm'
              }`}
            />
          </div>
          <div>
            <label className={`block font-mono text-[10px] uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Tipo Cuenta</label>
            <AccountTypeSelect 
              value={newType}
              onChange={(val) => setNewType(val as 'main'|'alt')}
              className={`w-full border font-mono text-xs text-left px-3 py-2 rounded-xl flex justify-between items-center transition-all ${
                isDark 
                  ? 'bg-[#10131d] border-slate-800 hover:border-slate-700 focus:border-rose-500 text-slate-200' 
                  : 'bg-white border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-800 shadow-sm'
              }`}
            />
          </div>
          <div>
            <label className={`block font-mono text-[10px] uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Poder</label>
            <PowerInput 
              value={newPower}
              onChange={setNewPower}
              className={`w-full border font-mono text-xs focus:outline-none rounded-xl transition-all px-3 py-2 ${
                isDark 
                  ? 'bg-[#10131d] border-slate-800 hover:border-slate-700 focus:border-rose-500 text-white' 
                  : 'bg-white border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-900 shadow-sm'
              }`}
            />
          </div>
          <div>
            <label className={`block font-mono text-[10px] uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Mansión</label>
            <MansionSelect 
              value={newMansionLevel}
              onChange={setNewMansionLevel}
              className={`w-full border font-mono text-xs text-left px-3 py-2 rounded-xl flex justify-between items-center transition-all ${
                isDark 
                  ? 'bg-[#10131d] border-slate-800 hover:border-slate-700 focus:border-rose-500 text-slate-200' 
                  : 'bg-white border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-800 shadow-sm'
              }`}
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              onMouseEnter={playHover}
              className={`w-full px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all shadow-sm font-bold border ${
                isDark 
                  ? 'bg-rose-600/20 border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white' 
                  : 'bg-rose-50 border-rose-400 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <Plus size={14} /> Registrar
            </button>
          </div>
        </div>
      </form>

      {/* Modern Filter Toolbar */}
      <div className={`border rounded-2xl flex-1 overflow-hidden flex flex-col transition-colors shadow-sm ${
        isDark ? 'bg-[#0d1017]/60 border-slate-800/80' : 'bg-slate-50/70 border-slate-200'
      }`}>
        <div className={`p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center transition-colors ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          
          {/* Search + Status */}
          <div className="flex gap-3 items-center flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o apodo..."
                className={`w-full border pl-9 pr-3 py-1.5 font-mono text-xs focus:outline-none rounded-xl transition-all ${
                  isDark 
                    ? 'bg-[#141824] border-slate-800 text-white focus:border-rose-500 placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 placeholder-slate-400 shadow-sm'
                }`}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`border font-mono text-xs focus:outline-none py-1.5 px-3 rounded-xl transition-all ${
                isDark 
                  ? 'bg-[#141824] border-slate-800 text-slate-300 focus:border-rose-500' 
                  : 'bg-white border-slate-300 text-slate-700 focus:border-rose-500 shadow-sm'
              }`}
            >
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="kicked">Ex-Miembros</option>
              <option value="all">Todos los Estados</option>
            </select>
          </div>

          {/* Rank Pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none items-center">
            <button
              onClick={() => { playClick(); setFilterRank('ALL'); }}
              className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-all border rounded-xl ${
                filterRank === 'ALL' 
                  ? (isDark ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold' : 'bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-sm')
                  : (isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700 bg-[#10131d]' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white shadow-sm')
              }`}
            >
              Todos ({members.length})
            </button>
            {ranks.map(r => (
              <button
                key={r}
                onClick={() => { playClick(); setFilterRank(r); }}
                className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-all border rounded-xl flex items-center gap-1 ${
                  filterRank === r 
                    ? (isDark ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold' : 'bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-sm')
                    : (isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700 bg-[#10131d]' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white shadow-sm')
                }`}
              >
                {r} <span className={`text-[9px] px-1 py-0.5 rounded-md ${
                  filterRank === r 
                    ? (isDark ? 'bg-rose-950/50' : 'bg-rose-200/50') 
                    : (isDark ? 'bg-white/5' : 'bg-slate-100')
                }`}>({countByRank[r] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className={`animate-spin ${isDark ? 'text-rose-400' : 'text-rose-500'}`} size={28} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className={`sticky top-0 z-10 border-b backdrop-blur-md ${isDark ? 'bg-[#10131d]/95 border-slate-800' : 'bg-slate-50/95 border-slate-200'}`}>
                <tr>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Operativo & Apodos OCR</th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 w-28 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rango</th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 w-32 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tipo</th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 w-40 text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Poder Base</th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 w-36 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Estado & Mansión</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {filteredMembers.map(member => {
                  const memberAliases = aliases[member.id] || [];
                  const isEditingThisAlias = editingAliasMemberId === member.id;

                  return (
                    <tr key={member.id} className={`transition-colors group ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-100/50'}`}>
                      
                      {/* Nickname & Japanese/In-game Aliases */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1.5">
                          <input 
                            type="text" 
                            value={member.nickname}
                            onChange={(e) => updateMember(member.id, 'nickname', e.target.value)}
                            className={`bg-transparent border-b border-transparent w-full font-mono text-sm font-medium focus:outline-none transition-colors py-0.5 px-1 rounded-sm ${
                              isDark 
                                ? 'text-white hover:border-slate-700 focus:border-rose-500 focus:bg-[#141824]' 
                                : 'text-slate-900 hover:border-slate-300 focus:border-rose-500 focus:bg-white'
                            }`}
                          />

                          {/* Aliases Tag Cloud */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {memberAliases.map((al, idx) => (
                              <span 
                                key={idx} 
                                className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-md border ${
                                  isDark ? 'bg-[#141824] border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                                }`}
                                title="Apodo reconocido por el asistente OCR"
                              >
                                <span>{al}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAlias(member.id, al)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5"
                                  title="Eliminar apodo"
                                >
                                  <X size={10} />
                                </button>
                              </span>
                            ))}

                            {isEditingThisAlias ? (
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Ej: ヤスノリ..."
                                  value={newAliasText}
                                  onChange={(e) => setNewAliasText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddAlias(member.id);
                                    } else if (e.key === 'Escape') {
                                      setEditingAliasMemberId(null);
                                    }
                                  }}
                                  className={`border font-mono text-[10px] px-1.5 py-0.5 focus:outline-none w-28 rounded-md ${
                                    isDark ? 'bg-[#141824] border-rose-500 text-white' : 'bg-white border-rose-400 text-slate-900 shadow-sm'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddAlias(member.id)}
                                  className={`text-[10px] font-mono ${isDark ? 'text-rose-400 hover:text-white' : 'text-rose-600 hover:text-rose-800'}`}
                                >
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingAliasMemberId(null)}
                                  className="text-slate-400 hover:text-rose-500 text-[10px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAliasMemberId(member.id);
                                  setNewAliasText('');
                                }}
                                className={`inline-flex items-center gap-1 text-[10px] font-mono transition-colors py-0.5 ${
                                  isDark ? 'text-slate-500 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'
                                }`}
                                title="Asociar apodo o nombre japonés a este miembro"
                              >
                                <Tag size={10} />
                                <span>+ Apodo OCR</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rank */}
                      <td className="py-3 px-4 text-center">
                        <RankSelect 
                          value={member.rank}
                          onChange={(val) => updateMember(member.id, 'rank', val)}
                        />
                      </td>

                      {/* Account Type */}
                      <td className="py-3 px-4 text-center">
                        <AccountTypeSelect 
                          value={member.account_type}
                          onChange={(val) => updateMember(member.id, 'account_type', val)}
                        />
                      </td>

                      {/* Power */}
                      <td className="py-3 px-4 text-right">
                        <PowerInput 
                          value={member.power}
                          onChange={(val) => updateMember(member.id, 'power', val)}
                          className={`w-full bg-transparent border-b border-transparent font-mono text-sm text-right focus:outline-none transition-colors px-2 py-1 rounded-sm ${
                            isDark 
                              ? 'text-slate-200 hover:border-slate-700 focus:border-rose-500 focus:bg-[#141824]' 
                              : 'text-slate-800 hover:border-slate-300 focus:border-rose-500 focus:bg-white'
                          }`}
                        />
                      </td>

                      {/* Status & Mansion */}
                      <td className="py-3 px-4 flex flex-col gap-2 items-center">
                        <div className="flex gap-2 w-full justify-center">
                          <button 
                            onClick={() => {
                              const currentStatus = member.status || (member.is_active ? 'active' : 'inactive');
                              updateMember(member.id, 'status', currentStatus === 'active' ? 'inactive' : 'active');
                            }}
                            className={`font-mono text-[10px] uppercase px-2 py-1 rounded-md border transition-colors flex-1 ${
                              (!member.status && member.is_active) || member.status === 'active' 
                                ? (isDark ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 shadow-sm')
                                : (isDark ? 'border-slate-700 text-slate-500 bg-slate-900 hover:bg-slate-800' : 'border-slate-200 text-slate-500 bg-slate-100 hover:bg-slate-200 shadow-sm')
                            }`}
                          >
                            {(!member.status && member.is_active) || member.status === 'active' ? 'Activo' : 'Inactivo'}
                          </button>

                          {member.status !== 'kicked' && (
                            <button
                              onClick={() => {
                                setModal({
                                  isOpen: true,
                                  type: 'confirm',
                                  title: 'Expulsar Miembro',
                                  message: `¿Estás seguro de que quieres expulsar a ${member.nickname}? Pasará al registro de Ex-Miembros.`,
                                  onConfirm: () => updateMember(member.id, 'status', 'kicked')
                                });
                              }}
                              className={`font-mono text-[10px] uppercase px-2 py-1 rounded-md border transition-colors ${
                                isDark 
                                  ? 'border-red-900/60 text-red-500 bg-red-950/40 hover:bg-red-900/60' 
                                  : 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100 shadow-sm'
                              }`}
                              title="Expulsar de la alianza"
                            >
                              X
                            </button>
                          )}
                        </div>

                        <MansionSelect 
                          value={member.mansion_level}
                          onChange={(val) => updateMember(member.id, 'mansion_level', val)}
                        />
                      </td>
                    </tr>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 font-mono text-xs">
                      No se encontraron operativos que coincidan con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AdminModal 
        isOpen={modal.isOpen} 
        type={modal.type} 
        title={modal.title} 
        message={modal.message} 
        onConfirm={modal.onConfirm || closeModal} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default MembersPanel;
