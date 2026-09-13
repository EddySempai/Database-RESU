import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useSound } from '../../contexts/SoundContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AdminModal, type AdminModalType } from '../../components/admin/AdminModal';
import { Search, Loader2, Cpu, FileText, Bot } from 'lucide-react';
import { getAuditReport } from '../../services/geminiService';

interface AuditLog {
  id: string;
  alliance_name: string;
  admin_name: string;
  action_type: string;
  target_name: string;
  details: string;
  created_at: string;
}

const AuditPanel = ({ activeAlliance }: { activeAlliance: string }) => {
  const { playClick, playHover } = useSound();
  const { isDark } = useTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<{isOpen: boolean, type: AdminModalType, title: string, message: string, onConfirm?: () => void}>({isOpen: false, type: 'alert', title: '', message: ''});
  const closeModal = () => setModal(prev => ({...prev, isOpen: false}));
  const [filterAction, setFilterAction] = useState('all');
  
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [activeAlliance]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('alliance_name', activeAlliance)
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (logs.length === 0) {
      setModal({isOpen: true, type: 'alert', title: 'Aviso', message: 'No hay suficientes registros para analizar.'});
      return;
    }
    playClick();
    setGenerating(true);
    try {
      // Tomamos solo los últimos 50 logs para el reporte
      const report = await getAuditReport(logs.slice(0, 50), activeAlliance);
      setAiReport(report);
    } catch (err) {
      console.error(err);
      setModal({isOpen: true, type: 'error', title: 'Error', message: 'Error generando reporte. Revisa la consola o tu clave de API.'});
    } finally {
      setGenerating(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = (l.target_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (l.details?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || l.action_type === filterAction;
    return matchesSearch && matchesFilter;
  });

  const getActionFormat = (action: string) => {
    switch(action) {
      case 'ADD_MEMBER': return { label: 'ALTA DE OPERATIVO', color: 'text-green-500' };
      case 'KICK_MEMBER': return { label: 'EXPULSIÓN', color: 'text-red-500' };
      case 'RESTORE_MEMBER': return { label: 'REINCORPORACIÓN', color: 'text-blue-500' };
      case 'INACTIVE_MEMBER': return { label: 'SUSPENSIÓN', color: 'text-yellow-500' };
      case 'UPDATED_CYCLE': return { label: 'ACTUALIZACIÓN', color: 'text-purple-500' };
      default: return { label: action, color: 'text-gray-400' };
    }
  };

  return (
    <div className="h-full w-full min-w-0 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-6 p-3 sm:p-5">
      <div className="flex justify-between items-center">
        <p className={`font-mono text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          Bitácora de seguridad y análisis de IA
        </p>
        
        <button
          onClick={handleGenerateReport}
          onMouseEnter={playHover}
          disabled={generating}
          className={`px-4 py-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border rounded-xl ${
            isDark 
              ? 'bg-blood-red/20 border-blood-red text-neon-red hover:bg-blood-red hover:text-white'
              : 'bg-rose-100 border-black text-rose-700 hover:bg-rose-600 hover:text-white shadow-sm'
          }`}
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
          {generating ? 'PROCESANDO...' : 'REPORTE RED QUEEN'}
        </button>
      </div>

      {aiReport && (
        <div className={`border p-6 rounded-2xl relative overflow-hidden ${isDark ? 'bg-[#0a0a0a] border-blood-red/50' : 'bg-rose-50 border-black shadow-sm'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Cpu size={120} />
          </div>
          <h3 className={`font-bebas text-xl mb-4 flex items-center gap-2 ${isDark ? 'text-neon-red' : 'text-rose-600'}`}>
            <Bot size={20} /> INFORME TÁCTICO GENERADO
          </h3>
          <div className={`font-mono text-sm whitespace-pre-wrap leading-relaxed relative z-10 custom-scrollbar max-h-64 overflow-y-auto pr-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            {aiReport}
          </div>
        </div>
      )}

      {/* List */}
      <div className={`flex-1 rounded-2xl overflow-hidden shadow-sm flex flex-col border ${isDark ? 'bg-[#0a0a0a] border-gray-800' : 'bg-white border-black'}`}>
        <div className={`p-4 flex gap-4 items-center border-b ${isDark ? 'border-gray-800' : 'border-black'}`}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar operativo o detalles..."
              className={`w-full border pl-9 pr-3 py-1.5 font-mono text-xs focus:outline-none focus:border-rose-500 rounded-xl ${
                isDark ? 'bg-black border-gray-700 text-white' : 'bg-white border-black text-slate-900 shadow-sm'
              }`}
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className={`border font-mono text-xs focus:outline-none focus:border-rose-500 py-1.5 px-3 rounded-xl ${
              isDark ? 'bg-black border-gray-700 text-gray-300' : 'bg-white border-black text-slate-700 shadow-sm'
            }`}
          >
            <option value="all">Todas las Acciones</option>
            <option value="ADD_MEMBER">Altas</option>
            <option value="KICK_MEMBER">Expulsiones</option>
            <option value="INACTIVE_MEMBER">Suspensiones</option>
            <option value="RESTORE_MEMBER">Reincorporaciones</option>
            <option value="UPDATED_CYCLE">Registros de Eventos</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-neon-red" size={24} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 shadow-sm z-10 border-b ${isDark ? 'bg-[#111] border-gray-700' : 'bg-slate-50 border-black'}`}>
              <tr>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 w-40">Fecha</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 w-48">Acción</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 w-48">Objetivo</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4">Detalles</th>
                <th className="font-mono text-xs text-gray-400 uppercase tracking-widest pb-4 pt-4 px-4 w-32 text-right">Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const action = getActionFormat(log.action_type);
                return (
                  <tr key={log.id} className={`transition-colors border-b ${
                    isDark 
                      ? 'hover:bg-white/5 even:bg-white/[0.02] border-gray-800/50' 
                      : 'hover:bg-slate-50 even:bg-slate-50/50 border-slate-100'
                  }`}>
                    <td className={`py-4 px-4 font-mono text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                      {new Date(log.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-mono text-xs uppercase px-2 py-0.5 rounded-sm border ${
                        isDark ? 'bg-black/50 border-gray-800' : 'bg-white border-slate-200'
                      } ${action.color}`}>
                        {action.label}
                      </span>
                    </td>
                    <td className={`py-4 px-4 font-mono text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {log.target_name || '-'}
                    </td>
                    <td className={`py-4 px-4 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                      {log.details || '-'}
                    </td>
                    <td className={`py-4 px-4 font-mono text-xs text-right ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
                      {log.admin_name}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className={`py-12 text-center border-dashed border ${isDark ? 'border-gray-800/50' : 'border-slate-200'}`}>
                    <FileText className={`mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-slate-400'}`} size={24} />
                    <p className={`font-mono text-xs uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>No se encontraron registros</p>
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <AdminModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm || closeModal} onClose={closeModal} />
    </div>
  );
};

export default AuditPanel;