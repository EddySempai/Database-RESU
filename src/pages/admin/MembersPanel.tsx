import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSound } from '../../contexts/SoundContext';
import { AdminModal, type AdminModalType } from '../../components/admin/AdminModal';
import { Plus, Search, Loader2, Tag, X } from 'lucide-react';
import { MansionSelect, PowerInput, RankSelect, AccountTypeSelect } from '../../components/admin/AdminInputs';

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
          <div className="flex items-center gap-3">
            <h2 className="font-bebas text-3xl tracking-widest text-white">Directorio de Operativos</h2>
            <span className="bg-blood-red/20 border border-blood-red/40 text-neon-red font-mono text-[10px] px-2 py-0.5 uppercase tracking-wider">
              {activeAlliance}
            </span>
          </div>
          <p className="font-mono text-gray-400 text-xs mt-1">
            Total: <strong className="text-white">{members.length}</strong> Operativos | Conectados a Mapeo OCR
          </p>
        </div>
      </div>

      {/* Add Operative Quick Card */}
      <form onSubmit={handleAddMember} className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-gray-800/80 p-5 rounded-sm shadow-lg">
        <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
          <Plus size={14} className="text-neon-red" /> Nuevo Registro de Operativo
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-500 mb-1">Nombre</label>
            <input 
              type="text" 
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="w-full bg-black/80 border border-gray-700 hover:border-gray-500 focus:border-neon-red text-white font-mono text-xs focus:outline-none transition-colors px-3 py-2"
              placeholder="Ej: CondePatula"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-500 mb-1">Rango</label>
            <RankSelect 
              value={newRank}
              onChange={(val) => setNewRank(val)}
              className="w-full bg-black/80 border border-gray-700 hover:border-gray-500 focus:border-neon-red text-gray-300 font-mono text-xs text-left px-3 py-2 flex justify-between items-center transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-500 mb-1">Tipo Cuenta</label>
            <AccountTypeSelect 
              value={newType}
              onChange={(val) => setNewType(val as 'main'|'alt')}
              className="w-full bg-black/80 border border-gray-700 hover:border-gray-500 focus:border-neon-red text-gray-300 font-mono text-xs text-left px-3 py-2 flex justify-between items-center transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-500 mb-1">Poder</label>
            <PowerInput 
              value={newPower}
              onChange={setNewPower}
              className="w-full bg-black/80 border border-gray-700 hover:border-gray-500 focus:border-neon-red text-white font-mono text-xs focus:outline-none transition-colors px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-gray-500 mb-1">Mansión</label>
            <MansionSelect 
              value={newMansionLevel}
              onChange={setNewMansionLevel}
              className="w-full bg-black/80 border border-gray-700 hover:border-gray-500 focus:border-neon-red text-gray-300 font-mono text-xs text-left px-3 py-2 flex justify-between items-center transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              onMouseEnter={playHover}
              className="w-full bg-blood-red/20 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(255,42,42,0.15)]"
            >
              <Plus size={14} /> Registrar
            </button>
          </div>
        </div>
      </form>

      {/* Modern Filter Toolbar */}
      <div className="bg-[#090909] border border-gray-800/80 rounded-sm flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          
          {/* Search + Status */}
          <div className="flex gap-3 items-center flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o apodo..."
                className="w-full bg-black border border-gray-700 text-white pl-9 pr-3 py-1.5 font-mono text-xs focus:outline-none focus:border-neon-red"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-black border border-gray-700 text-gray-300 font-mono text-xs focus:outline-none focus:border-neon-red py-1.5 px-3"
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
              className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors border ${filterRank === 'ALL' ? 'bg-blood-red/20 border-neon-red text-white' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
            >
              Todos ({members.length})
            </button>
            {ranks.map(r => (
              <button
                key={r}
                onClick={() => { playClick(); setFilterRank(r); }}
                className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors border ${filterRank === r ? 'bg-blood-red/20 border-neon-red text-white' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
              >
                {r} <span className="text-gray-500 ml-0.5">({countByRank[r] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin text-neon-red" size={28} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#121212] z-10 border-b border-gray-800">
                <tr>
                  <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4">Operativo & Apodos OCR</th>
                  <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4 w-28 text-center">Rango</th>
                  <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4 w-32 text-center">Tipo</th>
                  <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4 w-40 text-right">Poder Base</th>
                  <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4 w-36 text-center">Estado & Mansión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {filteredMembers.map(member => {
                  const memberAliases = aliases[member.id] || [];
                  const isEditingThisAlias = editingAliasMemberId === member.id;

                  return (
                    <tr key={member.id} className="hover:bg-white/[0.03] transition-colors group">
                      
                      {/* Nickname & Japanese/In-game Aliases */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1.5">
                          <input 
                            type="text" 
                            value={member.nickname}
                            onChange={(e) => updateMember(member.id, 'nickname', e.target.value)}
                            className="bg-transparent border-b border-transparent hover:border-gray-700 focus:border-neon-red focus:bg-black/80 w-full text-white font-mono text-sm font-medium focus:outline-none transition-colors py-0.5"
                          />

                          {/* Aliases Tag Cloud */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {memberAliases.map((al, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center gap-1 bg-[#151515] border border-gray-700 text-gray-300 font-mono text-[10px] px-2 py-0.5 rounded-sm"
                                title="Apodo reconocido por el asistente OCR"
                              >
                                <span>{al}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAlias(member.id, al)}
                                  className="text-gray-500 hover:text-red-400 transition-colors ml-0.5"
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
                                  className="bg-black border border-neon-red text-white font-mono text-[10px] px-1.5 py-0.5 focus:outline-none w-28"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddAlias(member.id)}
                                  className="text-neon-red hover:text-white text-[10px] font-mono"
                                >
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingAliasMemberId(null)}
                                  className="text-gray-500 hover:text-white text-[10px]"
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
                                className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-neon-red transition-colors py-0.5"
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
                          className="w-full bg-transparent border-b border-transparent hover:border-gray-700 focus:border-neon-red focus:bg-black/50 text-gray-200 font-mono text-sm text-right focus:outline-none transition-colors px-2 py-1"
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
                            className={`font-mono text-[10px] uppercase px-2 py-1 rounded-sm border transition-colors flex-1 ${(!member.status && member.is_active) || member.status === 'active' ? 'border-green-500/40 text-green-400 bg-green-500/10 hover:bg-green-500/20' : 'border-gray-700 text-gray-500 bg-gray-900 hover:bg-gray-800'}`}
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
                              className="font-mono text-[10px] uppercase px-2 py-1 rounded-sm border border-red-900/60 text-red-500 bg-red-950/40 hover:bg-red-900/60 transition-colors"
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
