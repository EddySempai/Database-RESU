import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSound } from '../../contexts/SoundContext';
import { Plus, Search, Loader2 } from 'lucide-react';
import { MansionSelect, PowerInput, RankSelect, AccountTypeSelect } from '../../components/admin/AdminInputs';

interface Member {
  id: string;
  nickname: string;
  rank: string;
  account_type: 'main' | 'alt';
  power: number;
  mansion_level: number;
  is_active: boolean;
  alliance_name: string;
}

const MembersPanel = ({ activeAlliance }: { activeAlliance: string }) => {
  const { playHover, playClick } = useSound();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [newNickname, setNewNickname] = useState('');
  const [newRank, setNewRank] = useState('R1');
  const [newType, setNewType] = useState<'main' | 'alt'>('main');
  const [newPower, setNewPower] = useState(0);
  const [newMansionLevel, setNewMansionLevel] = useState(1);

  useEffect(() => {
    fetchMembers();
  }, [activeAlliance]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('alliance_name', activeAlliance)
        .order('rank', { ascending: false })
        .order('nickname', { ascending: true });
        
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
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
      }
    } catch (err) {
      console.error('Error adding member:', err);
      alert('Error adding member. Check console.');
    }
  };

  const updateMember = async (id: string, field: string, value: any) => {
    try {
      // Optimistic update
      setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
      
      const { error } = await supabase
        .from('members')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating member:', err);
      fetchMembers(); // Revert on error
    }
  };

  const filteredMembers = members.filter(m => 
    m.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-bebas text-3xl tracking-widest text-white">Directorio del Gremio</h2>
          <p className="font-mono text-gray-400 text-xs mt-1">Total: {members.length} Operativos</p>
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAddMember} className="bg-[#0a0a0a] border border-gray-800 p-6">
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-6 gap-6">
          <div>
            <label className="block font-mono text-xs text-gray-500 mb-2">Nombre</label>
            <input 
              type="text" 
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="w-full bg-[#111] border border-gray-700 hover:border-gray-500 focus:border-neon-red text-white font-mono text-sm focus:outline-none transition-colors px-3 py-2"
              placeholder="Ej: CondePatula"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-gray-500 mb-2">Rango</label>
            <RankSelect 
              value={newRank}
              onChange={(val) => setNewRank(val)}
              className="w-full bg-[#111] border border-gray-700 hover:border-gray-500 focus:border-neon-red text-gray-300 font-mono text-sm text-left px-3 py-2 flex justify-between items-center transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-gray-500 mb-2">Tipo de Cuenta</label>
            <AccountTypeSelect 
              value={newType}
              onChange={(val) => setNewType(val as 'main'|'alt')}
              className="w-full bg-[#111] border border-gray-700 hover:border-gray-500 focus:border-neon-red text-gray-300 font-mono text-sm text-left px-3 py-2 flex justify-between items-center transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-gray-500 mb-2">Poder</label>
            <PowerInput 
              value={newPower}
              onChange={setNewPower}
              className="w-full bg-[#111] border border-gray-700 hover:border-gray-500 focus:border-neon-red text-white font-mono text-sm focus:outline-none transition-colors px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-gray-500 mb-2">Mansión</label>
            <MansionSelect 
              value={newMansionLevel}
              onChange={setNewMansionLevel}
              className="w-full bg-[#111] border border-gray-700 hover:border-gray-500 focus:border-neon-red text-gray-300 font-mono text-sm text-left px-3 py-2 flex justify-between items-center transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              onMouseEnter={playHover}
              className="w-full bg-blood-red/20 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white px-4 py-2 font-mono text-sm uppercase flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={16} /> Añadir
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="bg-[#0a0a0a] border border-gray-800 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar operativo..."
              className="w-full bg-black border border-gray-700 text-white pl-9 pr-3 py-1.5 font-mono text-xs focus:outline-none focus:border-neon-red"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-neon-red" size={24} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#111] shadow-md z-10 border-b border-gray-700">
              <tr>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4">Operativo</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 w-32">Rango</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 w-32">Tipo</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 w-40 text-right">Poder</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 w-24 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-white/5 even:bg-white/[0.02] border-b border-gray-800/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm text-white">
                    <input 
                      type="text" 
                      value={member.nickname}
                      onChange={(e) => updateMember(member.id, 'nickname', e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-gray-600 focus:border-neon-red focus:bg-black w-full text-white font-mono text-sm focus:outline-none transition-colors"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <RankSelect 
                      value={member.rank}
                      onChange={(val) => updateMember(member.id, 'rank', val)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <AccountTypeSelect 
                      value={member.account_type}
                      onChange={(val) => updateMember(member.id, 'account_type', val)}
                    />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <PowerInput 
                      value={member.power}
                      onChange={(val) => updateMember(member.id, 'power', val)}
                      className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-300 font-mono text-sm text-right focus:outline-none transition-colors px-2 py-1"
                    />
                  </td>
                  <td className="py-4 px-4 flex flex-col gap-2 items-center">
                    <button 
                      onClick={() => updateMember(member.id, 'is_active', !member.is_active)}
                      className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${member.is_active ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-gray-700 text-gray-500 bg-gray-800'}`}
                    >
                      {member.is_active ? 'Activo' : 'Inactivo'}
                    </button>
                    <MansionSelect 
                      value={member.mansion_level}
                      onChange={(val) => updateMember(member.id, 'mansion_level', val)}
                    />
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersPanel;
