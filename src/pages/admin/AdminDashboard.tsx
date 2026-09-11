import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Users, Activity, Shield, LineChart, ChevronDown, 
  Plus, ShieldAlert, ArrowLeft, Radio, ShieldCheck, UserCheck,
  Sun, Moon, Globe
} from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';
import MembersPanel from './MembersPanel';
import ActivityPanel from './ActivityPanel';
import AnalyticsPanel from './AnalyticsPanel';
import AuditPanel from './AuditPanel';
import UsersPanel from './UsersPanel';

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAdminAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { playHover, playClick } = useSound();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'analytics' | 'audit' | 'users'>('activity');
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
    const newName = prompt(t('admin.sidebar.new_alliance') + ':');
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
    navigate('/admin/login');
  };

  const toggleLanguage = () => {
    playClick();
    const nextLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 ${
      isDark 
        ? 'bg-[#0c0e14] text-slate-200' 
        : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* Sidebar - Fixed with soft border and rounded elements */}
      <div className={`w-full md:w-64 border-r flex flex-col h-auto md:h-screen md:sticky md:top-0 shrink-0 self-start backdrop-blur-xl z-30 overflow-y-auto transition-colors duration-200 ${
        isDark 
          ? 'bg-[#0f121a]/95 border-slate-800/80 text-slate-200' 
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
      }`}>
        
        {/* Logo / Brand Header */}
        <div className={`p-5 border-b flex items-center gap-3 transition-colors ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div className="w-10 h-10 bg-rose-500/15 border border-rose-500/30 flex items-center justify-center rounded-xl shadow-sm">
            <Shield className="text-rose-500" size={22} />
          </div>
          <div>
            <h2 className={`font-bebas text-2xl tracking-widest leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Umbrella Corp
            </h2>
            <span className="font-mono text-[10px] text-slate-400 tracking-wider">
              {t('admin.command_center')}
            </span>
          </div>
        </div>

        {/* Logged in User Tactical Badge */}
        <div className={`mx-3 mt-3 p-3 border rounded-xl flex items-center gap-2.5 transition-colors ${
          isDark 
            ? 'bg-[#141824] border-slate-800/80' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
            isAdmin 
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-400' 
              : 'bg-blue-950/40 border-blue-500/40 text-blue-400'
          }`}>
            {isAdmin ? <ShieldAlert size={16} /> : <UserCheck size={16} />}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className={`font-mono text-xs font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {user?.displayName || (isAdmin ? 'Admin' : 'Organizador')}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md uppercase font-bold ${
                isAdmin 
                  ? (isDark ? 'text-rose-300 bg-rose-950/50' : 'text-rose-700 bg-rose-100')
                  : (isDark ? 'text-blue-300 bg-blue-950/50' : 'text-blue-700 bg-blue-100')
              }`}>
                {isAdmin ? 'Admin' : 'Oficial'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 truncate">
              {isAdmin 
                ? t('admin.sidebar.level5') 
                : `${user?.allowedEvents?.length || 0} ${t('admin.sidebar.events_assigned')}`}
            </span>
          </div>
        </div>

        {/* Alliance Selector */}
        <div className="p-3 relative">
          <div 
            onClick={() => setShowAllianceMenu(!showAllianceMenu)}
            className={`w-full border px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
              isDark 
                ? 'bg-[#141824] border-slate-800 hover:border-slate-700' 
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col text-left">
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                {t('admin.sidebar.active_alliance')}
              </span>
              <span className="font-mono text-xs text-rose-500 font-bold truncate max-w-[140px]">
                {activeAlliance}
              </span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showAllianceMenu ? 'rotate-180' : ''}`} />
          </div>
          
          {showAllianceMenu && (
            <div className={`absolute top-full left-3 right-3 mt-1 border rounded-xl shadow-xl z-50 overflow-hidden ${
              isDark ? 'bg-[#141824] border-slate-700' : 'bg-white border-slate-200'
            }`}>
              {alliances.map(alliance => (
                <button
                  key={alliance}
                  onClick={() => {
                    setActiveAlliance(alliance);
                    setShowAllianceMenu(false);
                    playClick();
                  }}
                  className={`w-full text-left px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-between ${
                    activeAlliance === alliance 
                      ? (isDark ? 'text-rose-400 bg-rose-950/30 font-bold' : 'text-rose-600 bg-rose-50 font-bold') 
                      : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100')
                  }`}
                >
                  <span className="truncate">{alliance}</span>
                  {activeAlliance === alliance && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                </button>
              ))}
              <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  onClick={() => {
                    handleAddAlliance();
                    setShowAllianceMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider text-emerald-500 hover:bg-emerald-500/10 transition-colors flex items-center gap-2"
                >
                  <Plus size={14} /> {t('admin.sidebar.new_alliance')}
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
            className={`flex items-center gap-3 px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all rounded-xl border ${
              activeTab === 'activity' 
                ? (isDark 
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                    : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                : (isDark 
                    ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <Activity size={16} className={activeTab === 'activity' ? 'text-rose-500' : 'text-slate-400'} /> 
            {t('admin.sidebar.activity')}
          </button>

          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('analytics'); }}
            className={`flex items-center gap-3 px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all rounded-xl border ${
              activeTab === 'analytics' 
                ? (isDark 
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                    : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                : (isDark 
                    ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <LineChart size={16} className={activeTab === 'analytics' ? 'text-rose-500' : 'text-slate-400'} /> 
            {t('admin.sidebar.analytics')}
          </button>
          
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('members'); }}
            className={`flex items-center gap-3 px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all rounded-xl border ${
              activeTab === 'members' 
                ? (isDark 
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                    : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                : (isDark 
                    ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <Users size={16} className={activeTab === 'members' ? 'text-rose-500' : 'text-slate-400'} /> 
            {t('admin.sidebar.members')}
          </button>

          {/* Access Control Tab (Admin Only) */}
          {isAdmin && (
            <button
              onMouseEnter={playHover}
              onClick={() => { playClick(); setActiveTab('users'); }}
              className={`flex items-center gap-3 px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all rounded-xl border ${
                activeTab === 'users' 
                  ? (isDark 
                      ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                      : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                  : (isDark 
                      ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              <ShieldCheck size={16} className={activeTab === 'users' ? 'text-rose-500' : 'text-slate-400'} /> 
              {t('admin.sidebar.access_control')}
            </button>
          )}

          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('audit'); }}
            className={`flex items-center gap-3 px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider transition-all rounded-xl border ${
              activeTab === 'audit' 
                ? (isDark 
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                    : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                : (isDark 
                    ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <ShieldAlert size={16} className={activeTab === 'audit' ? 'text-rose-500' : 'text-slate-400'} /> 
            {t('admin.sidebar.logs')}
          </button>
        </div>

        {/* Bottom Actions */}
        <div className={`p-4 border-t flex flex-col gap-2 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); navigate('/'); }}
            className={`w-full flex items-center justify-center gap-2 px-3.5 py-2 border rounded-xl font-mono text-xs uppercase tracking-wider transition-colors ${
              isDark 
                ? 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' 
                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ArrowLeft size={13} /> {t('admin.sidebar.public_base')}
          </button>

          <button
            onMouseEnter={playHover}
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-3.5 py-2 border rounded-xl font-mono text-xs uppercase tracking-wider transition-colors ${
              isDark 
                ? 'border-rose-950/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300' 
                : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
            }`}
          >
            <LogOut size={13} /> {t('admin.sidebar.logout')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Theme and Language Toggles */}
        <div className={`px-5 py-3.5 border-b flex flex-wrap justify-between items-center sticky top-0 z-20 backdrop-blur-md transition-colors duration-200 gap-3 ${
          isDark 
            ? 'bg-[#0c0e14]/90 border-slate-800/80' 
            : 'bg-white/90 border-slate-200 shadow-sm'
        }`}>
          {/* Active Tab Title */}
          <div className="flex items-center gap-2.5">
            <Radio size={16} className="text-rose-500 animate-pulse" />
            <h1 className={`font-bebas text-2xl tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeTab === 'activity' ? t('admin.sidebar.activity') : 
               activeTab === 'analytics' ? t('admin.sidebar.analytics') : 
               activeTab === 'members' ? t('admin.sidebar.members') : 
               activeTab === 'users' ? t('admin.sidebar.access_control') :
               t('admin.sidebar.logs')}
            </h1>
          </div>

          {/* Right Controls: Protocol Badge + Language Toggle + Theme Toggle */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-[11px] text-slate-400 hidden lg:inline uppercase tracking-widest pr-2 border-r border-slate-700/50">
              {t('admin.protocol')}
            </span>

            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLanguage}
              onMouseEnter={playHover}
              title={i18n.language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                isDark 
                  ? 'bg-[#141824] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              <Globe size={13} className="text-rose-400" />
              <span className="font-bold">{i18n.language === 'en' ? 'EN' : 'ES'}</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={() => { playClick(); toggleTheme(); }}
              onMouseEnter={playHover}
              title={isDark ? t('admin.theme.light') : t('admin.theme.dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                isDark 
                  ? 'bg-[#141824] border-slate-800 text-amber-400 hover:border-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-indigo-600 hover:border-slate-300'
              }`}
            >
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
              <span className={`font-bold hidden sm:inline ${isDark ? 'text-amber-300' : 'text-indigo-600'}`}>
                {isDark ? t('admin.theme.dark') : t('admin.theme.light')}
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6">
          {activeTab === 'activity' && <ActivityPanel activeAlliance={activeAlliance} />}
          {activeTab === 'members' && <MembersPanel activeAlliance={activeAlliance} />}
          {activeTab === 'analytics' && <AnalyticsPanel activeAlliance={activeAlliance} />}
          {activeTab === 'users' && isAdmin && <UsersPanel />}
          {activeTab === 'audit' && <AuditPanel activeAlliance={activeAlliance} />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
