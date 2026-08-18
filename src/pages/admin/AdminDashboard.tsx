import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Activity, Shield, LineChart, ChevronDown, Plus } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';
import MembersPanel from './MembersPanel';
import ActivityPanel from './ActivityPanel';
import AnalyticsPanel from './AnalyticsPanel';

const AdminDashboard = () => {
  const { logout } = useAdminAuth();
  const { playHover, playClick } = useSound();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'analytics'>('activity');
  const [activeAlliance, setActiveAlliance] = useState('Umbrella Network');
  const [alliances, setAlliances] = useState<string[]>(['Umbrella Network']);
  const [showAllianceMenu, setShowAllianceMenu] = useState(false);

  useEffect(() => {
    fetchAlliances();
  }, []);

  const fetchAlliances = async () => {
    try {
      const { data } = await supabase
        .from('guild_settings')
        .select('*')
        .eq('key', 'alliances')
        .maybeSingle();
      if (data && data.value && Array.isArray(data.value)) {
        setAlliances(data.value);
        if (data.value.length > 0 && !data.value.includes(activeAlliance)) {
          setActiveAlliance(data.value[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching alliances:', err);
    }
  };

  const handleAddAlliance = async () => {
    const newName = prompt('Nombre de la nueva alianza:');
    if (newName && !alliances.includes(newName)) {
      const newList = [...alliances, newName];
      setAlliances(newList);
      setActiveAlliance(newName);
      try {
        await supabase
          .from('guild_settings')
          .upsert({ key: 'alliances', value: newList });
      } catch (err) {
        console.error('Error saving new alliance:', err);
      }
    }
  };

  const handleLogout = () => {
    playClick();
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row relative z-10">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-black/90 border-r border-gray-800 flex flex-col h-auto md:h-screen sticky top-0 shrink-0 self-start">
        <div className="p-6 border-b border-gray-800 relative">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blood-red/20 border border-blood-red/50 flex items-center justify-center rounded-sm">
              <Shield className="text-neon-red" size={16} />
            </div>
            <div 
              className="cursor-pointer group flex items-center gap-2"
              onClick={() => setShowAllianceMenu(!showAllianceMenu)}
            >
              <div>
                <h2 className="font-bebas text-xl tracking-widest uppercase">Admin</h2>
                <p className="font-mono text-xs text-gray-400 tracking-widest uppercase group-hover:text-neon-red transition-colors">{activeAlliance}</p>
              </div>
              <ChevronDown size={14} className="text-gray-500 group-hover:text-white" />
            </div>
          </div>
          
          {showAllianceMenu && (
            <div className="absolute top-full left-0 w-full bg-black border border-gray-800 shadow-xl z-50">
              {alliances.map(alliance => (
                <button
                  key={alliance}
                  onClick={() => {
                    setActiveAlliance(alliance);
                    setShowAllianceMenu(false);
                    playClick();
                  }}
                  className={`w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-widest hover:bg-white/5 transition-colors ${activeAlliance === alliance ? 'text-neon-red' : 'text-gray-400'}`}
                >
                  {alliance}
                </button>
              ))}
              <div className="border-t border-gray-800">
                <button
                  onClick={() => {
                    handleAddAlliance();
                    setShowAllianceMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-widest text-green-500 hover:bg-green-500/10 transition-colors flex items-center gap-2"
                >
                  <Plus size={14} /> Nueva Alianza
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col gap-2">
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('activity'); }}
            className={`flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${activeTab === 'activity' ? 'bg-blood-red/20 text-white border-l-2 border-blood-red' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Activity size={16} /> Actividad Semanal
          </button>

          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('analytics'); }}
            className={`flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${activeTab === 'analytics' ? 'bg-blood-red/20 text-white border-l-2 border-blood-red' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LineChart size={16} /> Análisis Semanal
          </button>
          
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('members'); }}
            className={`flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${activeTab === 'members' ? 'bg-blood-red/20 text-white border-l-2 border-blood-red' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={16} /> Gestión Miembros
          </button>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onMouseEnter={playHover}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 font-mono text-xs uppercase tracking-widest transition-colors"
          >
            <LogOut size={14} /> Desconectar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/50 sticky top-0 z-20 backdrop-blur-md">
          <h1 className="font-bebas text-2xl tracking-widest text-white">
            {activeTab === 'activity' ? 'Auditoría Semanal' : activeTab === 'analytics' ? 'Análisis de Crecimiento' : 'Registro de Operativos'}
          </h1>
        </div>

        <div className="flex-1 p-6">
          {activeTab === 'activity' && <ActivityPanel activeAlliance={activeAlliance} />}
          {activeTab === 'members' && <MembersPanel activeAlliance={activeAlliance} />}
          {activeTab === 'analytics' && <AnalyticsPanel activeAlliance={activeAlliance} />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
