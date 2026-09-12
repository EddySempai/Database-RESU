import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Users, Activity, Shield, LineChart, ChevronDown, 
  Plus, ShieldAlert, ArrowLeft, Radio, ShieldCheck, UserCheck,
  Sun, Moon, Globe, ChevronLeft, ChevronRight
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      {/* Sidebar - Horizontal on mobile, vertical on desktop */}
      <div className={`w-full ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} border-b md:border-b-0 md:border-r flex flex-col md:h-screen md:sticky md:top-0 shrink-0 md:self-start backdrop-blur-xl z-30 transition-all duration-300 ${
        isDark 
          ? 'bg-[#0f121a]/95 border-slate-800/80 text-slate-200' 
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
      }`}>
        
        {/* Logo / Brand Header */}
        <div className={`p-3 ${isSidebarCollapsed ? 'md:p-5 flex justify-center' : 'md:p-5 flex justify-between md:justify-start'} border-b items-center gap-3 transition-colors ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-500/15 border border-rose-500/30 flex items-center justify-center rounded-xl shadow-sm shrink-0">
              <Shield className="text-rose-500" size={18} />
            </div>
            <div className={`flex flex-col transition-opacity duration-200 ${isSidebarCollapsed ? 'hidden' : 'flex'}`}>
              <h1 className="font-bebas text-lg md:text-2xl tracking-widest leading-none bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-rose-300 whitespace-nowrap">
                {t('admin.command_center')}
              </h1>
              <p className="font-mono text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block whitespace-nowrap">
                {t('admin.protocol')}
              </p>
            </div>
          </div>
          
          {/* Theme & Language Toggles (Moved here for mobile, hidden on desktop) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-[#141824] border-slate-700 text-slate-400 hover:text-white' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
              }`}
            >
              <Globe size={14} />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-[#141824] border-slate-700 text-amber-400' 
                  : 'bg-white border-slate-200 text-slate-600 shadow-sm'
              }`}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {/* User Profile & Alliance Selector */}
        <div className={`p-3 md:p-5 flex flex-row md:flex-col gap-3 md:gap-4 items-center justify-between md:justify-start md:items-stretch overflow-x-auto md:overflow-visible custom-scrollbar border-b md:border-b-0 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3 shrink-0 min-w-0 flex-1 md:flex-none'}`}>
            <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center relative shadow-sm">
              <span className="font-bebas text-sm md:text-lg text-emerald-400 tracking-wider">
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </span>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0c0e14]"></span>
            </div>
            <div className={`flex flex-col min-w-0 flex-1 ${isSidebarCollapsed ? 'hidden' : 'flex'}`}>
              <span className="font-bebas tracking-wider text-sm md:text-base leading-none truncate">
                {user?.username || 'Admin'}
              </span>
              <span className="font-mono text-[9px] md:text-[10px] text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 truncate w-max">
                {t('admin.sidebar.level5')}
              </span>
            </div>
          </div>
          
          {/* Alliance Selector */}
          <div className={`relative shrink-0 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            <div 
              onClick={() => {
                setShowAllianceMenu(!showAllianceMenu);
                playClick();
              }}
              className={`px-3 py-1.5 md:p-3 border rounded-xl cursor-pointer flex items-center justify-between transition-colors shadow-sm ${
                isDark 
                  ? 'bg-[#141824] border-slate-800 hover:border-slate-700' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col text-left mr-2 md:mr-0">
                <span className="font-mono text-[8px] md:text-[9px] text-slate-400 uppercase tracking-wider">
                  {t('admin.sidebar.active_alliance')}
                </span>
                <span className="font-mono text-[10px] md:text-xs text-rose-500 font-bold truncate max-w-[100px] md:max-w-[140px]">
                  {activeAlliance}
                </span>
              </div>
              <ChevronDown size={12} className={`text-slate-400 transition-transform ${showAllianceMenu ? 'rotate-180' : ''}`} />
            </div>
            
            {showAllianceMenu && (
              <div className={`absolute top-full left-0 md:left-3 md:right-3 mt-1 min-w-[200px] border rounded-xl shadow-xl z-50 overflow-y-auto max-h-60 custom-scrollbar ${
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
        </div>

        {/* Navigation links */}
        <div className="flex-1 p-2 md:p-3 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto gap-1.5 custom-scrollbar">
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('activity'); }}
            className={`shrink-0 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2 md:gap-3 px-3 md:px-3.5'} py-2 md:py-2.5 font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all rounded-xl border ${
              activeTab === 'activity' 
                ? (isDark 
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                    : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                : (isDark 
                    ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <Activity size={14} className={activeTab === 'activity' ? 'text-rose-500' : 'text-slate-400'} /> 
            <span className={isSidebarCollapsed ? 'hidden' : 'block whitespace-nowrap'}>{t('admin.sidebar.activity')}</span>
          </button>

          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('analytics'); }}
            className={`shrink-0 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2 md:gap-3 px-3 md:px-3.5'} py-2 md:py-2.5 font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all rounded-xl border ${
              activeTab === 'analytics' 
                ? (isDark 
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                    : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                : (isDark 
                    ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <LineChart size={14} className={activeTab === 'analytics' ? 'text-rose-500' : 'text-slate-400'} /> 
            <span className={isSidebarCollapsed ? 'hidden' : 'block whitespace-nowrap'}>{t('admin.sidebar.analytics')}</span>
          </button>
          
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('members'); }}
            className={`shrink-0 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2 md:gap-3 px-3 md:px-3.5'} py-2 md:py-2.5 font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all rounded-xl border ${
              activeTab === 'members' 
                ? (isDark 
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                    : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                : (isDark 
                    ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <Users size={14} className={activeTab === 'members' ? 'text-rose-500' : 'text-slate-400'} /> 
            <span className={isSidebarCollapsed ? 'hidden' : 'block whitespace-nowrap'}>{t('admin.sidebar.members')}</span>
          </button>

          {/* Access Control Tab (Admin Only) */}
          {isAdmin && (
            <button
              onMouseEnter={playHover}
              onClick={() => { playClick(); setActiveTab('users'); }}
              className={`shrink-0 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2 md:gap-3 px-3 md:px-3.5'} py-2 md:py-2.5 font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all rounded-xl border ${
                activeTab === 'users' 
                  ? (isDark 
                      ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                      : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                  : (isDark 
                      ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              <ShieldCheck size={14} className={activeTab === 'users' ? 'text-rose-500' : 'text-slate-400'} /> 
              <span className={isSidebarCollapsed ? 'hidden' : 'block whitespace-nowrap'}>{t('admin.sidebar.access_control')}</span>
            </button>
          )}

          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveTab('audit'); }}
            className={`shrink-0 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2 md:gap-3 px-3 md:px-3.5'} py-2 md:py-2.5 font-mono text-[10px] md:text-xs uppercase tracking-wider transition-all rounded-xl border ${
              activeTab === 'audit' 
                ? (isDark 
                    ? 'bg-rose-950/25 border-rose-500/40 text-rose-300 font-bold shadow-sm' 
                    : 'bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm')
                : (isDark 
                    ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
            }`}
          >
            <ShieldAlert size={14} className={activeTab === 'audit' ? 'text-rose-500' : 'text-slate-400'} /> 
            <span className={isSidebarCollapsed ? 'hidden' : 'block whitespace-nowrap'}>{t('admin.sidebar.logs')}</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className={`p-3 md:p-4 border-t flex flex-row md:flex-col gap-2 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <button
            onMouseEnter={playHover}
            onClick={() => { playClick(); navigate('/'); }}
            className={`flex-1 md:w-full flex items-center justify-center ${isSidebarCollapsed ? 'px-0' : 'gap-2 px-3 md:px-3.5'} py-1.5 md:py-2 border rounded-xl font-mono text-[10px] md:text-xs uppercase tracking-wider transition-colors ${
              isDark 
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white' 
                : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
            }`}
          >
            <ArrowLeft size={14} /> <span className={isSidebarCollapsed ? 'hidden' : 'hidden sm:inline whitespace-nowrap'}>{t('admin.sidebar.public_base')}</span>
          </button>
          <button
            onMouseEnter={playHover}
            onClick={handleLogout}
            className={`flex-1 md:w-full flex items-center justify-center ${isSidebarCollapsed ? 'px-0' : 'gap-2 px-3 md:px-3.5'} py-1.5 md:py-2 bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 rounded-xl font-mono text-[10px] md:text-xs uppercase tracking-wider transition-colors shadow-sm font-bold`}
          >
            <LogOut size={14} /> <span className={isSidebarCollapsed ? 'hidden' : 'block whitespace-nowrap'}>{t('admin.sidebar.logout')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-170px)] md:h-screen relative w-full min-w-0 overflow-hidden">
        
        {/* Top Title Bar */}
        <div className={`px-4 md:px-6 py-3 md:py-3.5 border-b flex flex-wrap justify-between items-center sticky top-0 z-20 backdrop-blur-md transition-colors duration-200 gap-3 ${
          isDark 
            ? 'bg-[#0c0e14]/90 border-slate-800/80' 
            : 'bg-white/90 border-slate-200 shadow-sm'
        }`}>
          {/* Active Tab Title */}
          <div className="flex items-center gap-2.5">
            <Radio size={16} className="text-rose-500 animate-pulse" />
            <h1 className={`font-bebas text-xl md:text-2xl tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeTab === 'activity' ? t('admin.sidebar.activity') : 
               activeTab === 'analytics' ? t('admin.sidebar.analytics') : 
               activeTab === 'members' ? t('admin.sidebar.members') : 
               activeTab === 'users' ? t('admin.sidebar.access_control') :
               t('admin.sidebar.logs')}
            </h1>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-widest px-2 border-slate-700/50 hidden lg:inline">
              {t('admin.protocol')}
            </span>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => {
                  playClick();
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }}
                className={`p-1.5 rounded-xl border transition-colors shadow-sm backdrop-blur-md ${
                  isDark 
                    ? 'bg-[#141824]/90 border-slate-700 text-slate-400 hover:text-white' 
                    : 'bg-white/90 border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Ocultar/Mostrar Menú"
              >
                {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
              
              <button
                onClick={toggleLanguage}
                className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-widest ${
                  isDark 
                    ? 'bg-[#141824]/90 border-slate-700 text-slate-300 hover:text-white backdrop-blur-md' 
                    : 'bg-white/90 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm backdrop-blur-md'
                }`}
                title="Cambiar idioma"
              >
                <Globe size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                {i18n.language === 'en' ? 'ES' : 'EN'}
              </button>
              
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-xl border transition-colors shadow-sm backdrop-blur-md ${
                  isDark 
                    ? 'bg-[#141824]/90 border-slate-700 text-amber-400 hover:bg-slate-800' 
                    : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={isDark ? t('admin.theme.light') : t('admin.theme.dark')}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative w-full h-full">
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
