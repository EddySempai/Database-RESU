import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Activity, Shield, LineChart, ChevronDown, Plus, ShieldAlert, ArrowLeft, Radio } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';
import MembersPanel from './MembersPanel';
import ActivityPanel from './ActivityPanel';
import AnalyticsPanel from './AnalyticsPanel';
import AuditPanel from './AuditPanel';

const AdminDashboard = () => {
  const { logout } = useAdminAuth();
  const { playHover, playClick } = useSound();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'analytics' | 'audit'>('activity');
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
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden relative z-10 selection:bg-neon-red/30">
      
      {/* Sidebar - Always visible in viewport */}
      <div className="w-full md:w-64 bg-black/95 border-r border-gray-800/80 flex flex-col h-auto md:h-full shrink-0 self-stretch backdrop-blur-xl z-30 overflow-y-auto custom-scrollbar">
        <div className="p-5 border-b border-gray-800/80 relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blood-red/20 border border-blood-red/50 flex items-center justify-center rounded-sm shadow-[0_0_15px_rgba(255,42,42,0.25)]">
              <Shield className="text-neon-red" size={18} />
            </div>
            <div 
              className="cursor-pointer group flex items-center gap-2 flex-1 min-w-0"
              onClick={() => setShowAllianceMenu(!showAllianceMenu)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bebas text-xl tracking-widest uppercase">Umbrella HUD</h2>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Sistema en línea" />
                </div>
                <p className="font-mono text-xs text-gray-400 tracking-wider truncate group-hover:text-neon-red transition-colors">
                  {activeAlliance}
                </p>
              </div>
              <ChevronDown size={14} className="text-gray-500 group-hover:text-white shrink-0" />
            </div>
          </div>
          
          {showAllianceMenu && (
            <div className="absolute top-full left-0 w-full bg-[#0d0d0d] border border-gray-800 shadow-2xl z-50 animate-fade-in">
              {alliances.map(alliance => (
                <button
                  key={alliance}
                  onClick={() => {
                    setActiveAlliance(alliance);
                    setShowAllianceMenu(false);
                    playClick();
                  }}
                  className={`w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-widest hover:bg-white/5 transition-colors flex items-center justify-between ${activeAlliance === alliance ? 'text-neon-red bg-blood-red/10 font-bold' : 'text-gray-400'}`}
                >
                  <span className="truncate">{alliance}</span>
                  {activeAlliance === alliance && <span className="w-1.5 h-1.5 rounded-full bg-neon-red" />}
                </button>
              ))}
              <div className="border-t border-gray-800">
                <button
                  onClick={() => {
                    handleAddAlliance();
                    setShowAllianceMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 font-mono text-xs uppercase tracking-widest text-green-400 hover:bg-green-500/10 transition-colors flex items-center gap-2"
                >
                  <Plus size={14} /> Nueva Alianza
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <div className="flex-1 p-3 flex flex-col gap-1.5">
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('activity'); }}
            className={`flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-all rounded-sm ${activeTab === 'activity' ? 'bg-blood-red/20 text-white border-l-2 border-neon-red shadow-[inset_0_0_12px_rgba(255,42,42,0.15)] font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Activity size={16} className={activeTab === 'activity' ? 'text-neon-red' : 'text-gray-500'} /> 
            Actividad Semanal
          </button>

          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('analytics'); }}
            className={`flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-all rounded-sm ${activeTab === 'analytics' ? 'bg-blood-red/20 text-white border-l-2 border-neon-red shadow-[inset_0_0_12px_rgba(255,42,42,0.15)] font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LineChart size={16} className={activeTab === 'analytics' ? 'text-neon-red' : 'text-gray-500'} /> 
            Análisis Crecimiento
          </button>
          
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('members'); }}
            className={`flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-all rounded-sm ${activeTab === 'members' ? 'bg-blood-red/20 text-white border-l-2 border-neon-red shadow-[inset_0_0_12px_rgba(255,42,42,0.15)] font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={16} className={activeTab === 'members' ? 'text-neon-red' : 'text-gray-500'} /> 
            Gestión Operativos
          </button>

          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('audit'); }}
            className={`flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-all rounded-sm ${activeTab === 'audit' ? 'bg-blood-red/20 text-white border-l-2 border-neon-red shadow-[inset_0_0_12px_rgba(255,42,42,0.15)] font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ShieldAlert size={16} className={activeTab === 'audit' ? 'text-neon-red' : 'text-gray-500'} /> 
            Registro Sistema
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800/80 flex flex-col gap-2">
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 font-mono text-xs uppercase tracking-widest transition-colors rounded-sm"
          >
            <ArrowLeft size={13} /> Base Pública
          </button>

          <button
            onMouseEnter={playHover}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-950/60 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300 font-mono text-xs uppercase tracking-widest transition-colors rounded-sm"
          >
            <LogOut size={13} /> Desconectar
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-[#050505]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800/80 flex justify-between items-center bg-black/40 shrink-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Radio size={16} className="text-neon-red animate-pulse" />
            <h1 className="font-bebas text-2xl tracking-widest text-white">
              {activeTab === 'activity' ? 'Auditoría Semanal de Alianza' : activeTab === 'analytics' ? 'Análisis de Rendimiento y Crecimiento' : activeTab === 'audit' ? 'Registro del Sistema (Logs)' : 'Directorio de Operativos'}
            </h1>
          </div>
          <span className="font-mono text-[11px] text-gray-500 hidden sm:inline uppercase tracking-widest">
            Protocolo Umbrella v2.6
          </span>
        </div>

        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'activity' && <ActivityPanel activeAlliance={activeAlliance} />}
          {activeTab === 'members' && <MembersPanel activeAlliance={activeAlliance} />}
          {activeTab === 'analytics' && <AnalyticsPanel activeAlliance={activeAlliance} />}
          {activeTab === 'audit' && <AuditPanel activeAlliance={activeAlliance} />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
