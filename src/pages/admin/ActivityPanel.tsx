import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useSound } from '../../contexts/SoundContext';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { AdminModal, type AdminModalType } from '../../components/admin/AdminModal';
import { 
  Loader2, Save, Calendar, X, Search,
  Camera, Share2, Copy, Skull,
  Crown, Medal, Award, Boxes, AlertCircle, Lock,
  TrendingUp, Crosshair, AlertTriangle, Download,
  ArrowUpRight, ArrowDownRight, ShieldAlert, Zap, Filter,
  ChevronLeft, ChevronRight, CheckSquare, Settings
} from 'lucide-react';
import { 
  MansionSelect, 
  PowerInput, 
  PhaseSelect, 
  NemesisStarsSelect,
  TacticalCheckbox,
  VacunasRoleSelect,
  type VacunasRole
} from '../../components/admin/AdminInputs';
import { ScreenshotOcrModal, type EventTargetType } from '../../components/admin/ScreenshotOcrModal';
import { DiscordExportModal, type MortemMemberData, type MortemAllianceMeta } from '../../components/admin/DiscordExportModal';
import { downloadExcelTemplate } from '../../utils/excelParser';

interface Member {
  id: string;
  nickname: string;
  rank: string;
  account_type: 'main' | 'alt';
  power: number;
  mansion_level: number;
  alliance_name: string;
  status?: string;
  is_active?: boolean;
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
  mortem_prep_points?: number;
  mortem_damage?: number;
  mortem_shield_damage?: number;
  vacunas_role?: string;
}

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ActivityPanel = ({ activeAlliance }: { activeAlliance: string }) => {
  const { playHover, playClick } = useSound();
  const { user, isAdmin, canEditEvent } = useAdminAuth();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Record<string, ActivityRecord>>({});
  const [prevActivities, setPrevActivities] = useState<Record<string, ActivityRecord>>({});
  const [knownAliases, setKnownAliases] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterRank, setFilterRank] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Vacunas (Teams: 2 teams, 30 titular + 10 suplente)
  const [vacunasTeams, setVacunasTeams] = useState<Record<string, VacunasRole>>({});
  const [vacunasTeamFilter, setVacunasTeamFilter] = useState<'all' | 'team1' | 'team2' | 'unassigned'>('all');

  // Mortem Data & Alliance Strategy
  const [mortemData, setMortemData] = useState<Record<string, MortemMemberData>>({});
  const [mortemMeta, setMortemMeta] = useState<MortemAllianceMeta>({
    server_rank: '#3 en Servidor',
    strategy_notes: 'Fase 1: Derribar el escudo de Mortem en los primeros 45 segundos usando operativos tácticos de alto daño por segundo. Fase 2: Daño concentrado en puntos débiles.'
  });

  // Modals
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: AdminModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'alert', title: '', message: '' });
  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isDiscordOpen, setIsDiscordOpen] = useState(false);

  // Master Views: 'rewards' (Auditoría & Botín) | 'events' (Carga de Operaciones) | 'growth' (Crecimiento & Rendimiento)
  const [masterView, setMasterView] = useState<'rewards' | 'events' | 'growth'>('rewards');
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [activeEventTab, setActiveEventTab] = useState('crocodile');
  const [activeCenters, setActiveCenters] = useState<string[]>(['Centro 1', 'Centro 2']);

  const handleConfigureCenters = async () => {
    const current = activeCenters.join(', ');
    const input = prompt('Ingrese los nombres de los Centros de Seguridad separados por comas:', current);
    if (input !== null) {
      const newCenters = input.split(',').map(s => s.trim()).filter(s => s);
      setActiveCenters(newCenters);
      try {
        await supabase
          .from('guild_settings')
          .upsert({ key: 'security_centers', value: newCenters });
      } catch (err) {
        console.error('Error saving centers:', err);
      }
    }
  };

  const getInitialDate = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };
  
  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [hasChanges, setHasChanges] = useState(false);
  const [weeklyScores, setWeeklyScores] = useState<Record<string, { total: number; items: { name: string; pts: number }[] }>>({});

  useEffect(() => {
    fetchData();
  }, [selectedDate, activeAlliance]);

  const fetchData = async () => {
    setLoading(true);
    setHasChanges(false);
    try {
      // 1. Fetch active members
      const { data: memData, error: memErr } = await supabase
        .from('members')
        .select('*')
        .eq('alliance_name', activeAlliance)
        .order('rank', { ascending: false })
        .order('nickname', { ascending: true });
        
      if (memErr) throw memErr;
      const validMembers = (memData || []).filter(m => m.status !== 'kicked' && (m.status === 'active' || m.is_active !== false));
      setMembers(validMembers);

      // 2. Fetch cycle activities
      const { data: actData, error: actErr } = await supabase
        .from('guild_activity_cycles')
        .select('*')
        .eq('cycle_date', selectedDate);
        
      if (actErr) throw actErr;
      
      const actMap: Record<string, ActivityRecord> = {};
      const mortMap: Record<string, MortemMemberData> = {};
      const vacMap: Record<string, VacunasRole> = {};

      (actData || []).forEach(record => {
        actMap[record.member_id] = record;
        // If Postgres already has mortem columns populated
        if (record.mortem_damage || record.mortem_shield_damage || record.mortem_prep_points) {
          mortMap[record.member_id] = {
            prep_points: record.mortem_prep_points || 0,
            damage: record.mortem_damage || 0,
            shield_damage: record.mortem_shield_damage || 0
          };
        }
        if (record.vacunas_role) {
          vacMap[record.member_id] = record.vacunas_role as VacunasRole;
        }
      });
      setActivities(actMap);

      // 3. Fetch aliases from guild_settings
      const { data: aliasData } = await supabase
        .from('guild_settings')
        .select('*')
        .eq('key', 'member_aliases')
        .maybeSingle();

      if (aliasData && aliasData.value && typeof aliasData.value === 'object') {
        setKnownAliases(aliasData.value);
      } else {
        setKnownAliases({});
      }

      // 4. Fetch Vacunas team assignments (sync with guild_settings fallback)
      const { data: vacunasData } = await supabase
        .from('guild_settings')
        .select('*')
        .eq('key', `vacunas_teams_${activeAlliance}`)
        .maybeSingle();

      if (vacunasData && vacunasData.value && typeof vacunasData.value === 'object') {
        setVacunasTeams({ ...vacMap, ...vacunasData.value });
      } else {
        setVacunasTeams(vacMap);
      }

      // 5. Fetch Mortem cycle data from guild_settings fallback
      const { data: mortemSetting } = await supabase
        .from('guild_settings')
        .select('*')
        .eq('key', `mortem_${activeAlliance}_${selectedDate}`)
        .maybeSingle();

      if (mortemSetting && mortemSetting.value) {
        if (mortemSetting.value.members) {
          setMortemData({ ...mortMap, ...mortemSetting.value.members });
        } else {
          setMortemData(mortMap);
        }
        if (mortemSetting.value.meta) setMortemMeta(mortemSetting.value.meta);
      } else {
        setMortemData(mortMap);
      }

      // 6. Fetch security centers
      const { data: settingsData } = await supabase
        .from('guild_settings')
        .select('*')
        .eq('key', 'security_centers')
        .maybeSingle();

      if (settingsData && settingsData.value) {
        setActiveCenters(settingsData.value);
      }

      // 7. Fetch previous cycle for delta comparisons
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

      // 8. Calculate weekly score for the strict 7-day chronological window ending on selectedDate
      const selectedObj = new Date(selectedDate);
      selectedObj.setUTCHours(0, 0, 0, 0);
      selectedObj.setDate(selectedObj.getDate() - 6);
      const sevenDaysAgo = selectedObj.toISOString().split('T')[0];

      const { data: allActData } = await supabase
        .from('guild_activity_cycles')
        .select('*')
        .lte('cycle_date', selectedDate)
        .gte('cycle_date', sevenDaysAgo);

      if (allActData) {
        // Exclude the currently selected date so we can add its live version dynamically
        const historicalActs = allActData.filter(a => a.cycle_date !== selectedDate);
        const scoreMap: Record<string, { total: number; items: { name: string; pts: number }[] }> = {};
        
        validMembers.forEach(m => {
          let score = 0;
          const itemTotals: Record<string, number> = {};

          historicalActs.filter(a => a.member_id === m.id).forEach(act => {
            if (act.crocodile_damage > 0) { score += 1; itemTotals['Cocodrilo'] = (itemTotals['Cocodrilo'] || 0) + 1; }
            if (act.saint_valley) { score += 5; itemTotals['Saint Vale'] = (itemTotals['Saint Vale'] || 0) + 5; }
            if (act.security_centers || (act as any).security_centers_data?.length > 0) { score += 2; itemTotals['Centros Seg.'] = (itemTotals['Centros Seg.'] || 0) + 2; }
            if (act.tac_joined || act.tac_power > 0) { score += 2; itemTotals['T.A.C.'] = (itemTotals['T.A.C.'] || 0) + 2; }
            if ((act.mortem_damage && act.mortem_damage > 0) || (act.mortem_shield_damage && act.mortem_shield_damage > 0) || (act.mortem_prep_points && act.mortem_prep_points > 0)) { score += 3; itemTotals['Mortem'] = (itemTotals['Mortem'] || 0) + 3; }
            if (act.wesker_points > 0) { score += 4; itemTotals['Wesker'] = (itemTotals['Wesker'] || 0) + 4; }
            if (act.lab_joined || act.lab_points > 0) { score += 5; itemTotals['Vacunas'] = (itemTotals['Vacunas'] || 0) + 5; }
            const unionScore = Math.min(4, Math.floor((act.alliance_points || 0) / 1000));
            if (unionScore > 0) { score += unionScore; itemTotals['Unión'] = (itemTotals['Unión'] || 0) + unionScore; }
            if (Number(act.nemesis_level) > 0) { score += 2; itemTotals['Némesis'] = (itemTotals['Némesis'] || 0) + 2; }
          });
          
          scoreMap[m.id] = {
            total: score,
            items: Object.entries(itemTotals).map(([name, pts]) => ({ name, pts }))
          };
        });
        setWeeklyScores(scoreMap);
      } else {
        setWeeklyScores({});
      }

    } catch (err) {
      console.error('Error fetching activity data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPower = (num: number) => {
    if (!num) return '0M';
    return (num / 1000000).toFixed(2) + 'M';
  };

  // Drag-to-scroll event handlers for Tab Bar
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!tabBarRef.current) return;
    setIsDraggingTabs(true);
    hasMovedRef.current = false;
    startXRef.current = e.pageX - tabBarRef.current.offsetLeft;
    scrollLeftRef.current = tabBarRef.current.scrollLeft;
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTabs || !tabBarRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabBarRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.6;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    tabBarRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTabsMouseUp = () => {
    setIsDraggingTabs(false);
  };

  const handleTabsWheel = (e: React.WheelEvent) => {
    if (tabBarRef.current && e.deltaY !== 0) {
      tabBarRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollTabs = (amount: number) => {
    playClick();
    if (tabBarRef.current) {
      tabBarRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // RBAC permission check per field
  const canEditField = (field: keyof ActivityRecord): boolean => {
    if (isAdmin) return true;
    switch (field) {
      case 'power':
      case 'mansion_level':
        return canEditEvent('general');
      case 'alliance_points':
        return canEditEvent('union');
      case 'tac_joined':
      case 'tac_power':
        return canEditEvent('tac');
      case 'lab_joined':
      case 'lab_points':
      case 'vacunas_role':
        return canEditEvent('vacunas');
      case 'nemesis_difficulty':
      case 'nemesis_level':
      case 'nemesis_phase':
        return canEditEvent('nemesis');
      case 'crocodile_damage':
        return canEditEvent('crocodile');
      case 'saint_valley':
      case 'security_centers':
      case 'security_centers_data':
        return canEditEvent('valley');
      case 'wesker_points':
        return canEditEvent('wesker');
      default:
        return false;
    }
  };

  // Is current tab authorized for editing by the logged-in user
  const isAuthorizedForCurrentTab = useMemo(() => {
    if (isAdmin) return true;
    if (masterView === 'growth') return canEditEvent('general');
    return canEditEvent(activeEventTab);
  }, [isAdmin, canEditEvent, activeEventTab, masterView]);

  // Generic cell update with auto-check on TAC
  const handleCellChange = (memberId: string, field: keyof ActivityRecord, value: any) => {
    if (!canEditField(field)) return;
    setHasChanges(true);
    setActivities(prev => {
      const member = members.find(m => m.id === memberId);
      const current = prev[memberId] || {
        id: generateUUID(),
        member_id: memberId,
        cycle_date: selectedDate,
        power: member?.power || 0,
        mansion_level: member?.mansion_level || 1,
        alliance_points: 0,
        tac_joined: false,
        tac_power: 0,
        lab_joined: false,
        lab_points: 0,
        nemesis_phase: 0,
        nemesis_difficulty: '2★',
        nemesis_level: 0,
        crocodile_damage: 0,
        saint_valley: false,
        wesker_points: 0,
        security_centers: false,
        security_centers_data: []
      };
      
      const updated = { ...current, [field]: value };

      // Auto-check TAC participation when power is entered
      if (field === 'tac_power' && Number(value) > 0) {
        updated.tac_joined = true;
      }

      return {
        ...prev,
        [memberId]: updated
      };
    });
  };

  // Mortem cell change handler
  const handleMortemChange = (memberId: string, field: keyof MortemMemberData, value: number) => {
    if (!isAdmin && !canEditEvent('mortem')) return;
    setHasChanges(true);
    setMortemData(prev => {
      const current = prev[memberId] || { prep_points: 0, damage: 0, shield_damage: 0 };
      return {
        ...prev,
        [memberId]: {
          ...current,
          [field]: value
        }
      };
    });
  };

  // Vacunas role change handler
  const handleVacunasRoleChange = (memberId: string, role: VacunasRole) => {
    if (!isAdmin && !canEditEvent('vacunas')) return;
    setHasChanges(true);
    setVacunasTeams(prev => ({
      ...prev,
      [memberId]: role
    }));

    // If assigned to a team (Titular or Suplente), mark lab_joined as true!
    if (role !== 'none') {
      handleCellChange(memberId, 'lab_joined', true);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    playClick();
    setSaving(true);
    
    try {
      // 1. Prepare records for guild_activity_cycles with Mortem and Vacunas columns
      const fullRecords = Object.values(activities).map(act => {
        const { mansion_level, created_at, ...rest } = act as any;
        return {
          ...rest,
          cycle_date: selectedDate,
          mortem_prep_points: mortemData[act.member_id]?.prep_points || 0,
          mortem_damage: mortemData[act.member_id]?.damage || 0,
          mortem_shield_damage: mortemData[act.member_id]?.shield_damage || 0,
          vacunas_role: vacunasTeams[act.member_id] || 'none'
        };
      });
      
      let columnFallback = false;

      if (fullRecords.length > 0) {
        const { error } = await supabase
          .from('guild_activity_cycles')
          .upsert(fullRecords);
          
        if (error) {
          // If Supabase table does not yet have the new columns, fallback to baseline and save in settings
          if (error.message && (error.message.includes('mortem') || error.message.includes('vacunas') || error.message.includes('column'))) {
            columnFallback = true;
            const fallbackRecords = fullRecords.map(act => {
              const { mortem_prep_points, mortem_damage, mortem_shield_damage, vacunas_role, ...rest } = act as any;
              return rest;
            });
            const { error: fErr } = await supabase
              .from('guild_activity_cycles')
              .upsert(fallbackRecords);
            if (fErr) throw fErr;
          } else {
            throw error;
          }
        }
      }

      // 2. Always persist Vacunas teams and Mortem data in guild_settings for guaranteed persistence
      await supabase
        .from('guild_settings')
        .upsert({ key: `vacunas_teams_${activeAlliance}`, value: vacunasTeams });

      await supabase
        .from('guild_settings')
        .upsert({
          key: `mortem_${activeAlliance}_${selectedDate}`,
          value: {
            members: mortemData,
            meta: mortemMeta
          }
        });
      
      // 3. Log the action to audit_logs
      const adminName = user ? user.displayName : 'Sistema';
      await supabase.from('audit_logs').insert([{
        alliance_name: activeAlliance,
        admin_name: adminName,
        action_type: 'UPDATED_CYCLE',
        target_name: `Ciclo: ${selectedDate}`,
        details: `Actualizó o registró los datos del ciclo de actividades.`
      }]);

      setHasChanges(false);

      if (columnFallback) {
        setModal({
          isOpen: true,
          type: 'alert',
          title: 'Guardado con Respaldo en Ajustes',
          message: 'Los datos de Mortem y Vacunas se guardaron correctamente en los registros de respaldo de la alianza.'
        });
      } else {
        setModal({ 
          isOpen: true, 
          type: 'success', 
          title: 'Éxito', 
          message: 'Todos los datos del ciclo, equipos de Vacunas y Mortem han sido guardados exitosamente.' 
        });
      }
    } catch (err) {
      console.error('Error saving activity cycle:', err);
      setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Error al guardar los datos del ciclo. Revisa la consola.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleColumnAll = (field: keyof ActivityRecord, value: boolean) => {
    if (!canEditField(field)) return;
    setHasChanges(true);
    playClick();
    const newActivities = { ...activities };
    members.forEach(m => {
      if (!newActivities[m.id]) {
        newActivities[m.id] = {
          id: generateUUID(),
          member_id: m.id,
          cycle_date: selectedDate,
          power: m.power || 0,
          mansion_level: m.mansion_level || 1,
          alliance_points: 0,
          tac_joined: false,
          tac_power: 0,
          lab_joined: false,
          lab_points: 0,
          nemesis_phase: 0,
          nemesis_difficulty: '2★',
          nemesis_level: 0,
          crocodile_damage: 0,
          saint_valley: false,
          wesker_points: 0,
          security_centers: false,
          security_centers_data: []
        };
      }
      newActivities[m.id] = { ...newActivities[m.id], [field]: value };
    });
    setActivities(newActivities);
  };

  // Clone baseline data from previous cycle
  const handleClonePreviousCycle = () => {
    if (!isAdmin && !canEditEvent('general')) {
      setModal({
        isOpen: true,
        type: 'alert',
        title: 'Acceso Restringido',
        message: 'No tienes autorización para modificar el poder base de la alianza.'
      });
      return;
    }
    playClick();
    if (Object.keys(prevActivities).length === 0) {
      setModal({
        isOpen: true,
        type: 'alert',
        title: 'Sin Datos Previos',
        message: 'No se encontraron registros de ciclos anteriores para clonar.'
      });
      return;
    }

    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Clonar Ciclo Anterior',
      message: 'Esto importará el poder base y el nivel de mansión del ciclo anterior a este ciclo actual. Los eventos especiales (Caimán, TAC, Vacunas, Mortem) comenzarán limpios para la nueva semana. ¿Deseas continuar?',
      onConfirm: () => {
        closeModal();
        const updated: Record<string, ActivityRecord> = { ...activities };
        let clonedCount = 0;

        members.forEach(m => {
          const prev = prevActivities[m.id];
          const curr = updated[m.id] || {
            id: generateUUID(),
            member_id: m.id,
            cycle_date: selectedDate,
            power: m.power || 0,
            mansion_level: m.mansion_level || 1,
            alliance_points: 0,
            tac_joined: false,
            tac_power: 0,
            lab_joined: false,
            lab_points: 0,
            nemesis_phase: 0,
            nemesis_difficulty: '2★',
            nemesis_level: 0,
            crocodile_damage: 0,
            saint_valley: false,
            wesker_points: 0,
            security_centers: false,
            security_centers_data: []
          };

          if (prev) {
            curr.power = prev.power || curr.power;
            curr.mansion_level = prev.mansion_level || curr.mansion_level;
            clonedCount++;
          }
          updated[m.id] = curr;
        });

        setActivities(updated);
        setHasChanges(true);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Ciclo Clonado',
          message: `Se clonaron los datos base de ${clonedCount} operativos. Recuerda hacer clic en 'Guardar Cambios' para persistirlos.`
        });
      }
    });
  };

  // OCR Apply handler
  const handleApplyOcr = async (
    updates: { memberId: string; field: string; value: any; extraFields?: Record<string, any> }[],
    newAliases: Record<string, string[]>
  ) => {
    // Filter updates according to organizer permissions
    const permittedUpdates = isAdmin ? updates : updates.filter(u => {
      if (u.field === 'mortem_damage' || u.field === 'mortem_shield_damage' || u.field === 'mortem_prep_points') {
        return canEditEvent('mortem');
      }
      return canEditField(u.field as keyof ActivityRecord);
    });

    if (permittedUpdates.length === 0) {
      setModal({
        isOpen: true,
        type: 'alert',
        title: 'Sin Permisos para Aplicar',
        message: 'No tienes autorización asignada para modificar los datos de este evento vía OCR.'
      });
      return;
    }

    setHasChanges(true);
    const newActs = { ...activities };
    const newMortem = { ...mortemData };

    permittedUpdates.forEach(u => {
      if (u.field === 'mortem_damage') {
        const currMortem = newMortem[u.memberId] || { prep_points: 0, damage: 0, shield_damage: 0 };
        newMortem[u.memberId] = { ...currMortem, damage: u.value };
        return;
      }

      const member = members.find(m => m.id === u.memberId);
      const curr = newActs[u.memberId] || {
        id: generateUUID(),
        member_id: u.memberId,
        cycle_date: selectedDate,
        power: member?.power || 0,
        mansion_level: member?.mansion_level || 1,
        alliance_points: 0,
        tac_joined: false,
        tac_power: 0,
        lab_joined: false,
        lab_points: 0,
        nemesis_phase: 0,
        nemesis_difficulty: '2★',
        nemesis_level: 0,
        crocodile_damage: 0,
        saint_valley: false,
        wesker_points: 0,
        security_centers: false,
        security_centers_data: []
      };

      (curr as any)[u.field] = u.value;

      if (u.field === 'tac_power' && u.value > 0) {
        curr.tac_joined = true;
      }

      if (u.extraFields) {
        Object.assign(curr, u.extraFields);
      }
      newActs[u.memberId] = curr;
    });

    setActivities(newActs);
    setMortemData(newMortem);

    // Save newly associated aliases to Supabase
    if (newAliases && Object.keys(newAliases).length > 0) {
      setKnownAliases(newAliases);
      try {
        await supabase
          .from('guild_settings')
          .upsert({ key: 'member_aliases', value: newAliases });
      } catch (err) {
        console.error('Error saving updated member_aliases:', err);
      }
    }

    setModal({
      isOpen: true,
      type: 'success',
      title: 'Datos Inyectados',
      message: `Se aplicaron ${permittedUpdates.length} registros a la tabla del ciclo. Haz clic en 'Guardar Cambios' para persistirlos en la base de datos.`
    });
  };

  // Determine OCR default event based on current tab and user permissions
  const getOcrDefaultEvent = (): EventTargetType => {
    const tabToEvent: Record<string, EventTargetType> = {
      crocodile: 'crocodile',
      tac: 'tac',
      vacunas: 'lab',
      mortem: 'mortem',
      wesker: 'wesker',
    };

    const requested = tabToEvent[activeEventTab] || 'crocodile';

    if (isAdmin) return requested;

    if (canEditEvent(activeEventTab)) {
      return requested;
    }

    // Fallback to first permitted event
    if (user?.allowedEvents && user.allowedEvents.length > 0) {
      const first = user.allowedEvents[0];
      if (first === 'vacunas') return 'lab';
      if (first === 'crocodile' || first === 'tac' || first === 'mortem' || first === 'wesker') {
        return first;
      }
    }

    return 'crocodile';
  };

  // Participation Score Calculator (Dynamic scoring without artificial limits)
  // Cocodrilo = +1
  // Saint Vale = +5
  // Centros de Seguridad = +2
  // T.A.C. = +2
  // Mortem = +3
  // Wesker = +4
  // Vacunas = +5
  // Unión Alianza = +4 máx (1 pt por cada 1k)
  // Némesis = +2
  const calculateParticipationScore = (memberId: string) => {
    const historical = weeklyScores[memberId] || { total: 0, items: [] };
    const act = activities[memberId];
    const role = vacunasTeams[memberId];
    const mort = mortemData[memberId];

    let liveTotal = historical.total;
    const itemTotals: Record<string, number> = {};
    historical.items.forEach(it => { itemTotals[it.name] = it.pts; });

    // Live daily checks
    if (act && act.crocodile_damage > 0) { liveTotal += 1; itemTotals['Cocodrilo'] = (itemTotals['Cocodrilo'] || 0) + 1; }
    if (act && act.saint_valley) { liveTotal += 5; itemTotals['Saint Vale'] = (itemTotals['Saint Vale'] || 0) + 5; }
    const hasSecurityCenters = Boolean((act?.security_centers_data && act.security_centers_data.length > 0) || act?.security_centers);
    if (hasSecurityCenters) { liveTotal += 2; itemTotals['Centros Seg.'] = (itemTotals['Centros Seg.'] || 0) + 2; }
    if (act && (act.tac_joined || act.tac_power > 0)) { liveTotal += 2; itemTotals['T.A.C.'] = (itemTotals['T.A.C.'] || 0) + 2; }
    const hasMortem = Boolean((mort && ((mort.damage || 0) > 0 || (mort.shield_damage || 0) > 0 || (mort.prep_points || 0) > 0)) || (act && ((act.mortem_damage || 0) > 0 || (act.mortem_shield_damage || 0) > 0 || (act.mortem_prep_points || 0) > 0)));
    if (hasMortem) { liveTotal += 3; itemTotals['Mortem'] = (itemTotals['Mortem'] || 0) + 3; }
    if (act && act.wesker_points > 0) { liveTotal += 4; itemTotals['Wesker'] = (itemTotals['Wesker'] || 0) + 4; }
    const hasVacunas = Boolean((role && role !== 'none') || (act && (act.lab_joined || act.lab_points > 0)));
    if (hasVacunas) { liveTotal += 5; itemTotals['Vacunas'] = (itemTotals['Vacunas'] || 0) + 5; }
    const alliancePts = act?.alliance_points || 0;
    const unionScore = Math.min(4, Math.floor(alliancePts / 1000));
    if (unionScore > 0) { liveTotal += unionScore; itemTotals['Unión'] = (itemTotals['Unión'] || 0) + unionScore; }
    const hasNemesis = Boolean(act && (Number(act.nemesis_level) > 0));
    if (hasNemesis) { liveTotal += 2; itemTotals['Némesis'] = (itemTotals['Némesis'] || 0) + 2; }

    return {
      total: liveTotal,
      items: Object.entries(itemTotals).map(([name, pts]) => ({ name, pts }))
    };
  };

  // 1. Raw scores map
  const rawParticipationMap = useMemo(() => {
    return members.reduce((acc, m) => {
      acc[m.id] = calculateParticipationScore(m.id);
      return acc;
    }, {} as Record<string, { total: number; items: { name: string; pts: number }[] }>);
  }, [members, activities, vacunasTeams, mortemData]);

  // 2. Global ranking sorted by score descending (tie-breaker: power)
  const sortedByParticipation = useMemo(() => {
    return [...members].sort((a, b) => {
      const scoreA = rawParticipationMap[a.id]?.total || 0;
      const scoreB = rawParticipationMap[b.id]?.total || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (activities[b.id]?.power || b.power || 0) - (activities[a.id]?.power || a.power || 0);
    });
  }, [members, rawParticipationMap, activities]);

  // 3. Complete participation map with top positions and reward tiers
  const participationMap = useMemo(() => {
    const map: Record<string, {
      total: number;
      items: { name: string; pts: number }[];
      rankPos: number;
      tier: 'elite' | 'reduced' | 'basic' | 'none';
      tierLabel: string;
      tierDescription: string;
    }> = {};

    sortedByParticipation.forEach((m, idx) => {
      const raw = rawParticipationMap[m.id] || { total: 0, items: [] };
      const rankPos = idx + 1;
      let tier: 'elite' | 'reduced' | 'basic' | 'none' = 'none';
      let tierLabel = 'Sin Recompensa';
      let tierDescription = 'Puesto > 50';

      if (raw.total === 0) {
        tier = 'none';
        tierLabel = 'Sin Recompensa';
        tierDescription = 'Inactivo / 0 pts';
      } else if (rankPos <= 10) {
        tier = 'elite';
        tierLabel = 'Recompensa Completa';
        tierDescription = 'Top 1-10 (100% Botín)';
      } else if (rankPos <= 30) {
        tier = 'reduced';
        tierLabel = 'Recompensa Reducida';
        tierDescription = 'Top 11-30 (Botín Estándar)';
      } else if (rankPos <= 50) {
        tier = 'basic';
        tierLabel = 'Recompensa Básica';
        tierDescription = 'Top 31-50 (< 50% Botín)';
      }

      map[m.id] = {
        total: raw.total,
        items: raw.items,
        rankPos,
        tier,
        tierLabel,
        tierDescription
      };
    });

    return map;
  }, [sortedByParticipation, rawParticipationMap]);

  // Tier counts for summary banner
  const tierCounts = useMemo(() => {
    let elite = 0;
    let reduced = 0;
    let basic = 0;
    let none = 0;

    Object.values(participationMap).forEach(p => {
      if (p.tier === 'elite') elite++;
      else if (p.tier === 'reduced') reduced++;
      else if (p.tier === 'basic') basic++;
      else none++;
    });

    return { elite, reduced, basic, none };
  }, [participationMap]);

  // Vacunas team counts
  const team1Titulares = members.filter(m => vacunasTeams[m.id] === 'team1_titular');
  const team1Suplentes = members.filter(m => vacunasTeams[m.id] === 'team1_suplente');
  const team2Titulares = members.filter(m => vacunasTeams[m.id] === 'team2_titular');
  const team2Suplentes = members.filter(m => vacunasTeams[m.id] === 'team2_suplente');

  const ranks = ['R5', 'R4', 'R3', 'R2', 'R1'];

  // Tactical events grouped by periodicity
  const weeklyEvents = [
    { id: 'crocodile', label: 'Caimán / Cocodrilo', pts: '+1 pt', freq: 'Cada 2 días' },
    { id: 'tac', label: 'T.A.C. (Torneo)', pts: '+2 pts', freq: 'Semanal' },
    { id: 'valley', label: 'Centros Seg. & Valle', pts: '+2 / +5 pts', freq: 'Viernes / Sáb' },
    { id: 'mortem', label: 'Repeler a Mortem', pts: '+3 pts', freq: 'Semanal' },
  ];

  const rotatingEvents = [
    { id: 'vacunas', label: 'Vacunas / Laboratorio', pts: '+5 pts', freq: 'Cada 2 sem' },
    { id: 'wesker', label: 'Asalto a Wesker', pts: '+4 pts', freq: 'Cada 2 sem' },
    { id: 'union', label: 'Unión Alianza', pts: '+1 a +4 pts', freq: '7 días (Rotativo)' },
    { id: 'nemesis', label: 'Incursión Némesis', pts: '+2 pts', freq: 'Evento Especial' },
  ];

  // Alliance growth and inactivity KPI metrics (Proposal 3 & 4)
  const growthMetrics = useMemo(() => {
    let totalCurrent = 0;
    let totalPrevious = 0;
    let maxDiff = -Infinity;
    let topGrower: { name: string; diff: number } | null = null;
    let inactiveCount = 0;

    members.forEach(m => {
      const act = activities[m.id];
      const prev = prevActivities[m.id];
      const currPower = act?.power || m.power || 0;
      const prevPower = prev?.power || m.power || 0;
      
      totalCurrent += currPower;
      totalPrevious += prevPower;

      if (act && prev && currPower !== prevPower) {
        const diff = currPower - prevPower;
        if (diff > maxDiff) {
          maxDiff = diff;
          topGrower = { name: m.nickname, diff };
        }
      }

      const score = rawParticipationMap[m.id]?.total || 0;
      if (score === 0) {
        inactiveCount++;
      }
    });

    const netGrowth = totalCurrent - totalPrevious;
    return {
      totalCurrent,
      totalPrevious,
      netGrowth,
      topGrower: topGrower as { name: string; diff: number } | null,
      inactiveCount
    };
  }, [members, activities, prevActivities, rawParticipationMap]);

  const activeCount = members.filter(m => m.account_type === 'main').length;
  const altCount = members.filter(m => m.account_type === 'alt').length;
  const recordedCount = Object.keys(activities).length;

  const filteredMembers = members.filter(m => {
    const matchesRank = 
      filterRank === 'ALL' || m.rank === filterRank;

    const matchesVacunasTeam = 
      masterView !== 'events' ||
      activeEventTab !== 'vacunas' ||
      vacunasTeamFilter === 'all' ||
      (vacunasTeamFilter === 'team1' && (vacunasTeams[m.id] === 'team1_titular' || vacunasTeams[m.id] === 'team1_suplente')) ||
      (vacunasTeamFilter === 'team2' && (vacunasTeams[m.id] === 'team2_titular' || vacunasTeams[m.id] === 'team2_suplente')) ||
      (vacunasTeamFilter === 'unassigned' && (!vacunasTeams[m.id] || vacunasTeams[m.id] === 'none'));

    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search ||
      m.nickname.toLowerCase().includes(search) ||
      (knownAliases[m.id] && knownAliases[m.id].some(a => a.toLowerCase().includes(search)));

    const matchesRisk = !filterRiskOnly || (participationMap[m.id]?.total || 0) === 0;

    return matchesRank && matchesVacunasTeam && matchesSearch && matchesRisk;
  });

  const displayedMembers = useMemo(() => {
    let list = [...filteredMembers];
    if (masterView === 'rewards') {
      return list.sort((a, b) => {
        const posA = participationMap[a.id]?.rankPos || 999;
        const posB = participationMap[b.id]?.rankPos || 999;
        return posA - posB;
      });
    }
    if (masterView === 'growth') {
      return list.sort((a, b) => {
        const pA = activities[a.id]?.power || a.power || 0;
        const pB = activities[b.id]?.power || b.power || 0;
        return pB - pA;
      });
    }
    return list;
  }, [filteredMembers, masterView, participationMap, activities]);

  // Excel template downloader for currently active event
  const handleDownloadExcelTemplate = () => {
    playClick();
    const allEvents = [...weeklyEvents, ...rotatingEvents];
    const currentTabObj = allEvents.find(e => e.id === activeEventTab);
    const eventName = currentTabObj ? currentTabObj.label : 'General';
    downloadExcelTemplate(members, activeAlliance, eventName);
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col gap-5">
      
      {/* Top Header & Alliance Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className={`font-bebas text-3xl tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('admin.sidebar.activity')}
            </h2>
            <span className={`border font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold ${
              isDark ? 'bg-rose-950/30 border-rose-500/40 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              {activeAlliance}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 font-mono text-xs text-slate-400 mt-1.5">
            <span>Operativos: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{members.length}</strong></span>
            <span>Principales: <strong className="text-emerald-500 font-bold">{activeCount}</strong></span>
            <span>Secundarias: <strong className="text-blue-500 font-bold">{altCount}</strong></span>
            <span>Registrados: <strong className="text-rose-500 font-bold">{recordedCount}/{members.length}</strong></span>
            {growthMetrics.inactiveCount > 0 && (
              <span className="text-rose-500 font-bold flex items-center gap-1 animate-pulse">
                <AlertTriangle size={12} /> {growthMetrics.inactiveCount} en Riesgo (0 pts)
              </span>
            )}
          </div>
        </div>
        
        {/* Global Cycle Date & Save Bar */}
        <div className="flex gap-2.5 items-center flex-wrap">
          {/* Cycle Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`border pl-9 pr-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 rounded-xl transition-colors ${
                isDark 
                  ? 'bg-[#141824] border-slate-800 text-white' 
                  : 'bg-white border-slate-300 text-slate-900 shadow-sm'
              }`}
              title="Fecha de corte del ciclo"
            />
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            onMouseEnter={playHover}
            disabled={!hasChanges || saving}
            className={`px-4 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all ${
              !hasChanges 
                ? (isDark ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-transparent' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent')
                : 'bg-rose-600 border border-rose-500 text-white hover:bg-rose-500 shadow-sm font-bold'
            }`}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} 
            {saving ? t('admin.buttons.saving') : t('admin.buttons.save_cycle')} {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
          </button>
        </div>
      </div>

      {/* 3 MASTER NAVIGATION TABS: Stress-free separated views with Border Radius & Soft Palette */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 border rounded-2xl transition-colors ${
        isDark ? 'bg-[#141824]/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* 1. Botín y Auditoría */}
        <button
          onClick={() => { playClick(); setMasterView('rewards'); }}
          onMouseEnter={playHover}
          className={`px-4 py-3 font-bebas text-lg tracking-wider transition-all rounded-xl flex items-center justify-between border ${
            masterView === 'rewards'
              ? (isDark 
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm' 
                  : 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm font-bold')
              : (isDark 
                  ? 'border-transparent text-slate-400 hover:text-white hover:bg-white/5' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Crown size={18} className={masterView === 'rewards' ? 'text-amber-400' : 'text-slate-400'} />
            <span className="text-left leading-none">{t('admin.master_tabs.rewards')}</span>
          </div>
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
            masterView === 'rewards' 
              ? (isDark ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-800')
              : (isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600')
          }`}>
            {t('admin.master_tabs.rewards_sub')}
          </span>
        </button>

        {/* 2. Carga de Operaciones */}
        <button
          onClick={() => {
            playClick();
            setMasterView('events');
            if (activeEventTab === 'rewards' || activeEventTab === 'general') {
              setActiveEventTab('crocodile');
            }
          }}
          onMouseEnter={playHover}
          className={`px-4 py-3 font-bebas text-lg tracking-wider transition-all rounded-xl flex items-center justify-between border ${
            masterView === 'events'
              ? (isDark 
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-sm' 
                  : 'bg-rose-50 border-rose-400 text-rose-900 shadow-sm font-bold')
              : (isDark 
                  ? 'border-transparent text-slate-400 hover:text-white hover:bg-white/5' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Crosshair size={18} className={masterView === 'events' ? 'text-rose-400' : 'text-slate-400'} />
            <span className="text-left leading-none">{t('admin.master_tabs.operations')}</span>
          </div>
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
            masterView === 'events' 
              ? (isDark ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-100 border-rose-300 text-rose-800')
              : (isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600')
          }`}>
            {t('admin.master_tabs.operations_sub')}
          </span>
        </button>

        {/* 3. Crecimiento y Rendimiento */}
        <button
          onClick={() => {
            playClick();
            setMasterView('growth');
            setActiveEventTab('general');
          }}
          onMouseEnter={playHover}
          className={`px-4 py-3 font-bebas text-lg tracking-wider transition-all rounded-xl flex items-center justify-between border ${
            masterView === 'growth'
              ? (isDark 
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm' 
                  : 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm font-bold')
              : (isDark 
                  ? 'border-transparent text-slate-400 hover:text-white hover:bg-white/5' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100')
          }`}
        >
          <div className="flex items-center gap-2.5">
            <TrendingUp size={18} className={masterView === 'growth' ? 'text-emerald-400' : 'text-slate-400'} />
            <span className="text-left leading-none">{t('admin.master_tabs.growth')}</span>
          </div>
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
            masterView === 'growth' 
              ? (isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-800')
              : (isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600')
          }`}>
            {t('admin.master_tabs.growth_sub')}
          </span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className={`border rounded-2xl flex flex-col shadow-sm transition-colors ${
        isDark ? 'bg-[#10131d] border-slate-800/80' : 'bg-white border-slate-200'
      }`}>
        
        {/* VIEW 1: AUDITORÍA & BOTÍN */}
        {masterView === 'rewards' && (
          <div className={`p-4 border-b flex flex-col gap-4 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            {/* 4 Tier Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* TIER 1: TOP 1-10 */}
              <div 
                title={t('admin.tiers.elite_desc')}
                className={`border p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all cursor-help ${
                isDark 
                  ? 'bg-gradient-to-b from-amber-500/10 via-[#141824] to-[#10131d] border-amber-500/30 shadow-sm hover:border-amber-500/50' 
                  : 'bg-gradient-to-b from-amber-50/80 to-white border-amber-200 shadow-sm hover:border-amber-300'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Crown size={15} className="text-amber-400" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                      Top 1–10
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    100% {t('admin.tiers.quota')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <h4 className={`font-bebas text-lg tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t('admin.tiers.elite')}
                    </h4>
                  </div>
                  <span className="font-bebas text-3xl text-amber-400 font-bold">
                    {tierCounts.elite}<span className="text-sm font-mono text-slate-400">/10</span>
                  </span>
                </div>
              </div>

              {/* TIER 2: TOP 11-30 */}
              <div 
                title={t('admin.tiers.reduced_desc')}
                className={`border p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all cursor-help ${
                isDark 
                  ? 'bg-gradient-to-b from-emerald-500/10 via-[#141824] to-[#10131d] border-emerald-500/30 shadow-sm hover:border-emerald-500/50' 
                  : 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-200 shadow-sm hover:border-emerald-300'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Medal size={15} className="text-emerald-400" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                      Top 11–30 (20 ops)
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {t('admin.tiers.reduced')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <h4 className={`font-bebas text-lg tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t('admin.tiers.reduced')}
                    </h4>
                  </div>
                  <span className="font-bebas text-3xl text-emerald-400 font-bold">
                    {tierCounts.reduced}<span className="text-sm font-mono text-slate-400">/20</span>
                  </span>
                </div>
              </div>

              {/* TIER 3: TOP 31-50 */}
              <div 
                title={t('admin.tiers.basic_desc')}
                className={`border p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all cursor-help ${
                isDark 
                  ? 'bg-gradient-to-b from-blue-500/10 via-[#141824] to-[#10131d] border-blue-500/30 shadow-sm hover:border-blue-500/50' 
                  : 'bg-gradient-to-b from-blue-50/80 to-white border-blue-200 shadow-sm hover:border-blue-300'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Boxes size={15} className="text-blue-400" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-blue-400 font-bold">
                      Top 31–50 (20 ops)
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    &lt; 50% {t('admin.tiers.quota')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <h4 className={`font-bebas text-lg tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t('admin.tiers.basic')}
                    </h4>
                  </div>
                  <span className="font-bebas text-3xl text-blue-400 font-bold">
                    {tierCounts.basic}<span className="text-sm font-mono text-slate-400">/20</span>
                  </span>
                </div>
              </div>

              {/* TIER 4: TOP 51+ / 0 PTS */}
              <div 
                title={t('admin.tiers.none_desc')}
                className={`border p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between transition-all cursor-help ${
                isDark 
                  ? 'bg-[#141824] border-slate-800/80 shadow-sm hover:border-slate-700' 
                  : 'bg-slate-50 border-slate-200 shadow-sm hover:border-slate-300'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={15} className="text-slate-400" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Puesto 51+ / 0 Pts
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isDark ? 'bg-rose-950/40 text-rose-300 border-rose-900/40' : 'bg-rose-100 text-rose-800 border-rose-200'
                  }`}>
                    {t('admin.tiers.none')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <h4 className="font-bebas text-lg tracking-wider text-slate-400">
                      {t('admin.tiers.none')}
                    </h4>
                  </div>
                  <span className="font-bebas text-3xl text-slate-400 font-bold">
                    {tierCounts.none}
                  </span>
                </div>
              </div>
            </div>

            {/* High-visibility Inactivity Alert Banner with Border Radius & Soft Colors */}
            {growthMetrics.inactiveCount > 0 && (
              <div 
                title={`${growthMetrics.inactiveCount} ${t('admin.risk_alert.desc')}`}
                className={`border p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-colors cursor-help ${
                isDark 
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-200' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                    <AlertTriangle size={19} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className={`font-bebas text-lg tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <span>{t('admin.risk_alert.title')}:</span>
                      <span className="text-rose-500 font-bold">{growthMetrics.inactiveCount} Ops</span>
                    </h4>
                  </div>
                </div>

                <button
                  onClick={() => { playClick(); setFilterRiskOnly(!filterRiskOnly); }}
                  onMouseEnter={playHover}
                  className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider rounded-xl border transition-all shrink-0 flex items-center gap-2 ${
                    filterRiskOnly
                      ? 'bg-rose-600 text-white border-rose-500 font-bold shadow-sm'
                      : (isDark 
                          ? 'bg-[#141824] text-rose-400 border-rose-500/40 hover:bg-rose-950/30' 
                          : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-100 shadow-sm')
                  }`}
                >
                  <Filter size={13} />
                  <span>{filterRiskOnly ? t('admin.risk_alert.show_all') : `${t('admin.risk_alert.filter_only')} (${growthMetrics.inactiveCount})`}</span>
                </button>
              </div>
            )}

            {/* Scoring Rules Bar with Border Radius */}
            <div className={`border px-3.5 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono transition-colors ${
              isDark ? 'bg-[#141824] border-slate-800/80' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center gap-2 text-slate-400">
                <Award size={14} className="text-rose-500" />
                <span className={`uppercase font-bold text-[11px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Puntuación:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  Vacunas: <strong className="text-emerald-500">+5</strong>
                </span>
                <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  Saint Vale: <strong className="text-emerald-500">+5</strong>
                </span>
                <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  Wesker: <strong className="text-emerald-500">+4</strong>
                </span>
                <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  Unión: <strong className="text-emerald-500">+1/1k (máx +4)</strong>
                </span>
                <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  Mortem: <strong className="text-emerald-500">+3</strong>
                </span>
                <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  Centros: <strong className="text-emerald-500">+2</strong>
                </span>
                <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  T.A.C.: <strong className="text-emerald-500">+2</strong>
                </span>
                <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  Némesis: <strong className="text-emerald-500">+2</strong>
                </span>
                <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  Cocodrilo: <strong className="text-emerald-500">+1</strong>
                </span>
              </div>
            </div>

            {/* Filter & Export Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center flex-1">
                {/* Search */}
                <div className="relative min-w-[200px] sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('admin.table.search_placeholder')}
                    className={`w-full border pl-9 pr-8 py-1.5 text-xs placeholder-slate-500 font-mono rounded-xl outline-none transition-colors ${
                      isDark 
                        ? 'bg-[#141824] border-slate-800 text-white focus:border-rose-500' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 shadow-sm'
                    }`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Rank Filter */}
                <div className="flex gap-1.5 items-center overflow-x-auto scrollbar-none">
                  <span className="font-mono text-xs text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">{t('admin.table.rank')}:</span>
                  <button
                    onClick={() => { playClick(); setFilterRank('ALL'); }}
                    className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors border rounded-xl ${
                      filterRank === 'ALL' 
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold' 
                        : (isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white')
                    }`}
                  >
                    {t('admin.table.all')}
                  </button>
                  {ranks.map(r => (
                    <button
                      key={r}
                      onClick={() => { playClick(); setFilterRank(r); }}
                      className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors border rounded-xl ${
                        filterRank === r 
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold' 
                          : (isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white')
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discord Export Button */}
              <button
                onClick={() => { playClick(); setIsDiscordOpen(true); }}
                onMouseEnter={playHover}
                className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-xl shrink-0 border ${
                  isDark 
                    ? 'bg-[#141824] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' 
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm'
                }`}
                title="Generar formato especial para Discord"
              >
                <Share2 size={14} className="text-blue-400" />
                <span>{t('admin.buttons.export_discord')}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: CARGA DE OPERACIONES */}
        {masterView === 'events' && (
          <div className={`p-4 border-b flex flex-col gap-4 ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
            {/* Drag-to-Scroll Event Navigation Bar with Border Radius & Soft Colors */}
            <div className={`flex items-center gap-2 p-2 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#141824] border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
              {/* Scroll Left Button */}
              <button
                onClick={() => scrollTabs(-240)}
                className={`p-2 rounded-xl border transition-all shrink-0 ${
                  isDark 
                    ? 'bg-[#10131d] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                }`}
                title="Desplazar a la izquierda"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Draggable Track */}
              <div
                ref={tabBarRef}
                onMouseDown={handleTabsMouseDown}
                onMouseMove={handleTabsMouseMove}
                onMouseUp={handleTabsMouseUp}
                onMouseLeave={handleTabsMouseUp}
                onWheel={handleTabsWheel}
                className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scrollbar-none cursor-grab active:cursor-grabbing select-none"
              >
                {[...weeklyEvents, ...rotatingEvents].map(evt => {
                  const isTabAuthorized = isAdmin || canEditEvent(evt.id);
                  const isActive = activeEventTab === evt.id;
                  const isWeekly = weeklyEvents.some(w => w.id === evt.id);
                  return (
                    <button
                      key={evt.id}
                      onClick={() => {
                        if (hasMovedRef.current) return;
                        playClick();
                        setActiveEventTab(evt.id);
                      }}
                      onMouseEnter={playHover}
                      className={`px-3.5 py-2 rounded-xl border flex items-center gap-2.5 shrink-0 transition-all font-mono text-xs uppercase tracking-wider ${
                        isActive
                          ? (isDark 
                              ? 'bg-rose-950/30 border-rose-500/50 text-rose-200 font-bold shadow-sm' 
                              : 'bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-sm')
                          : (isDark 
                              ? 'bg-[#10131d] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200' 
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 shadow-sm')
                      }`}
                    >
                      <span>{evt.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive 
                          ? (isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700')
                          : (isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500')
                      }`}>
                        {evt.pts}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono ${
                        isWeekly 
                          ? (isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-100 text-slate-500')
                          : (isDark ? 'bg-amber-950/40 text-amber-300/80' : 'bg-amber-100 text-amber-700')
                      }`}>
                        {evt.freq}
                      </span>
                      {!isAdmin && !isTabAuthorized && (
                        <span title="Solo lectura">
                          <Lock size={12} className="text-slate-400" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scroll Right Button */}
              <button
                onClick={() => scrollTabs(240)}
                className={`p-2 rounded-xl border transition-all shrink-0 ${
                  isDark 
                    ? 'bg-[#10131d] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                }`}
                title="Desplazar a la derecha"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Read-Only Audit Mode Banner */}
            {!isAdmin && !isAuthorizedForCurrentTab && (
              <div className="bg-amber-950/20 border border-amber-500/40 px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-amber-300 font-mono text-xs shadow-sm">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-200 uppercase tracking-wider">Modo Auditoría (Solo Lectura):</span> Tu cuenta no tiene permisos asignados para modificar datos en este evento.
                </div>
              </div>
            )}

            {/* Event Specific Sub-Headers */}
            {/* Vacunas Teams Allocation */}
            {activeEventTab === 'vacunas' && (
              <div className={`p-3.5 border rounded-2xl flex flex-wrap items-center justify-between gap-3 transition-colors ${
                isDark ? 'bg-[#141824] border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">Equipo 1:</span>
                    <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                      Titulares: <strong className={team1Titulares.length > 30 ? 'text-red-400' : 'text-emerald-500'}>{team1Titulares.length}/30</strong>
                    </span>
                    <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                      Suplentes: <strong className={team1Suplentes.length > 10 ? 'text-red-400' : 'text-blue-400'}>{team1Suplentes.length}/10</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">Equipo 2:</span>
                    <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                      Titulares: <strong className={team2Titulares.length > 30 ? 'text-red-400' : 'text-emerald-500'}>{team2Titulares.length}/30</strong>
                    </span>
                    <span className={`border px-2 py-0.5 rounded-lg ${isDark ? 'bg-[#10131d] border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                      Suplentes: <strong className={team2Suplentes.length > 10 ? 'text-red-400' : 'text-purple-400'}>{team2Suplentes.length}/10</strong>
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5 font-mono text-[11px]">
                  <button
                    onClick={() => setVacunasTeamFilter('all')}
                    className={`px-2.5 py-1 border rounded-xl transition-colors ${vacunasTeamFilter === 'all' ? 'border-rose-500 text-rose-300 bg-rose-500/20' : (isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 bg-white')}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setVacunasTeamFilter('team1')}
                    className={`px-2.5 py-1 border rounded-xl transition-colors ${vacunasTeamFilter === 'team1' ? 'border-blue-500 text-blue-300 bg-blue-500/15' : (isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 bg-white')}`}
                  >
                    Equipo 1
                  </button>
                  <button
                    onClick={() => setVacunasTeamFilter('team2')}
                    className={`px-2.5 py-1 border rounded-xl transition-colors ${vacunasTeamFilter === 'team2' ? 'border-purple-500 text-purple-300 bg-purple-500/15' : (isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 bg-white')}`}
                  >
                    Equipo 2
                  </button>
                  <button
                    onClick={() => setVacunasTeamFilter('unassigned')}
                    className={`px-2.5 py-1 border rounded-xl transition-colors ${vacunasTeamFilter === 'unassigned' ? 'border-amber-500 text-amber-300 bg-amber-500/15' : (isDark ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-600 bg-white')}`}
                  >
                    Sin Asignar
                  </button>
                </div>
              </div>
            )}

            {/* Mortem Meta & Notes */}
            {activeEventTab === 'mortem' && (
              <div className={`p-3.5 border rounded-2xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between transition-colors ${
                isDark ? 'bg-[#141824] border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-950/40 border border-rose-500/50 flex items-center justify-center rounded-xl text-rose-400 shadow-sm">
                    <Skull size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-slate-400">Ranking Servidor:</span>
                      <input
                        type="text"
                        value={mortemMeta.server_rank || ''}
                        disabled={!isAuthorizedForCurrentTab}
                        onChange={(e) => {
                          setHasChanges(true);
                          setMortemMeta(prev => ({ ...prev, server_rank: e.target.value }));
                        }}
                        placeholder="Ej: #3 en Servidor 45"
                        className={`border px-2.5 py-0.5 rounded-lg text-xs font-mono transition-colors ${
                          isDark ? 'bg-[#10131d] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-sm'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contextual Toolbar for Active Event */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center flex-1">
                {/* Search */}
                <div className="relative min-w-[200px] sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('admin.table.search_placeholder')}
                    className={`w-full border pl-9 pr-8 py-1.5 text-xs placeholder-slate-500 font-mono rounded-xl outline-none transition-colors ${
                      isDark 
                        ? 'bg-[#141824] border-slate-800 text-white focus:border-rose-500' 
                        : 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 shadow-sm'
                    }`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Rank Filter */}
                <div className="flex gap-1.5 items-center overflow-x-auto scrollbar-none">
                  <span className="font-mono text-xs text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">{t('admin.table.rank')}:</span>
                  <button
                    onClick={() => { playClick(); setFilterRank('ALL'); }}
                    className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors border rounded-xl ${
                      filterRank === 'ALL' 
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold' 
                        : (isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white')
                    }`}
                  >
                    {t('admin.table.all')}
                  </button>
                  {ranks.map(r => (
                    <button
                      key={r}
                      onClick={() => { playClick(); setFilterRank(r); }}
                      className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-colors border rounded-xl ${
                        filterRank === r 
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold' 
                          : (isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white')
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Excel Template, OCR, Bulk */}
              <div className="flex gap-2 items-center flex-wrap shrink-0">
                {/* Proposal 2: Download Excel Template */}
                <button
                  onClick={handleDownloadExcelTemplate}
                  onMouseEnter={playHover}
                  className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 rounded-xl transition-all ${
                    isDark 
                      ? 'bg-[#141824] border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30' 
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 shadow-sm font-bold'
                  }`}
                  title="Descargar plantilla de Excel precargada con los miembros del clan"
                >
                  <Download size={13} />
                  <span>{t('admin.buttons.excel_template')}</span>
                </button>

                {/* OCR & Excel Importer */}
                <button
                  onClick={() => { playClick(); setIsOcrOpen(true); }}
                  onMouseEnter={playHover}
                  className="bg-rose-600 border border-rose-500 text-white hover:bg-rose-500 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all shadow-sm font-bold"
                  title="Importar capturas múltiples con IA o cargar archivo Excel"
                >
                  <Camera size={14} />
                  <span>{t('admin.buttons.ai_ocr')}</span>
                </button>

                {/* Quick Bulk Action Buttons */}
                {activeEventTab === 'tac' && (isAdmin || canEditEvent('tac')) && (
                  <button 
                    onClick={() => toggleColumnAll('tac_joined', true)} 
                    className={`font-mono border p-2 transition-colors rounded-xl flex items-center justify-center ${
                      isDark ? 'border-slate-800 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100'
                    }`}
                    title="Marcar asistencia para todos en TAC"
                  >
                    <CheckSquare size={16} />
                  </button>
                )}
                {activeEventTab === 'vacunas' && (isAdmin || canEditEvent('vacunas')) && (
                  <button 
                    onClick={() => toggleColumnAll('lab_joined', true)} 
                    className={`font-mono border p-2 transition-colors rounded-xl flex items-center justify-center ${
                      isDark ? 'border-slate-800 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100'
                    }`}
                    title="Marcar asistencia para todos en Vacunas"
                  >
                    <CheckSquare size={16} />
                  </button>
                )}
                {activeEventTab === 'valley' && (isAdmin || canEditEvent('valley')) && (
                  <>
                    <button 
                      onClick={() => toggleColumnAll('saint_valley', true)} 
                      className={`font-mono border p-2 transition-colors rounded-xl flex items-center justify-center ${
                        isDark ? 'border-slate-800 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-100'
                      }`}
                      title="Marcar asistencia para todos en Valle"
                    >
                      <CheckSquare size={16} />
                    </button>
                    <button 
                      onClick={handleConfigureCenters} 
                      className={`font-mono border p-2 transition-colors rounded-xl flex items-center justify-center ${
                        isDark ? 'border-amber-500/30 text-amber-400 hover:bg-amber-950/30' : 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                      }`}
                      title="Configurar columnas de Centros de Seguridad"
                    >
                      <Settings size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CRECIMIENTO & RENDIMIENTO */}
        {masterView === 'growth' && (
          <div className={`p-4 border-b ${isDark ? 'border-slate-800/80 bg-[#0d1017]/60' : 'border-slate-200 bg-slate-50/70'} flex flex-col gap-4 transition-colors`}>
            {/* Proposal 4: 4 Growth KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* KPI 1: Total Power */}
              <div 
                title={t('admin.growth_kpis.total_power_desc')}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden shadow-sm cursor-help ${
                isDark ? 'bg-gradient-to-b from-[#161a26] to-[#10131d] border-slate-800/80 hover:border-slate-700' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 hover:border-slate-300'
              }`}>
                <div className={`flex items-center justify-between mb-1.5 font-mono text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>{t('admin.growth_kpis.total_power')}</span>
                  <Zap size={14} className="text-amber-400" />
                </div>
                <div className={`font-bebas text-3xl font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatPower(growthMetrics.totalCurrent)}
                </div>
              </div>

              {/* KPI 2: Net Growth */}
              <div 
                title={t('admin.growth_kpis.net_growth_desc')}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden shadow-sm cursor-help ${
                isDark ? 'bg-gradient-to-b from-[#161a26] to-[#10131d] border-slate-800/80 hover:border-slate-700' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 hover:border-slate-300'
              }`}>
                <div className={`flex items-center justify-between mb-1.5 font-mono text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>{t('admin.growth_kpis.net_growth')}</span>
                  <TrendingUp size={14} className={growthMetrics.netGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
                </div>
                <div className={`font-bebas text-3xl font-bold tracking-wide ${growthMetrics.netGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {growthMetrics.netGrowth >= 0 ? `+${formatPower(growthMetrics.netGrowth)}` : `-${formatPower(Math.abs(growthMetrics.netGrowth))}`}
                </div>
              </div>

              {/* KPI 3: Top Weekly Grower */}
              <div 
                title={t('admin.growth_kpis.top_grower')}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden shadow-sm cursor-help ${
                isDark ? 'bg-gradient-to-b from-[#161a26] to-[#10131d] border-slate-800/80 hover:border-slate-700' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 hover:border-slate-300'
              }`}>
                <div className={`flex items-center justify-between mb-1.5 font-mono text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>{t('admin.growth_kpis.top_grower')}</span>
                  <ArrowUpRight size={14} className="text-emerald-400" />
                </div>
                <div className={`font-bebas text-2xl truncate font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {growthMetrics.topGrower ? growthMetrics.topGrower.name : t('admin.growth_kpis.top_grower_empty')}
                </div>
                {growthMetrics.topGrower && (
                  <div className="font-mono text-xs text-emerald-400 font-bold mt-1">
                    {t('admin.growth_kpis.top_grower_diff', { diff: formatPower(growthMetrics.topGrower.diff) })}
                  </div>
                )}
              </div>

              {/* KPI 4: Recorded coverage */}
              <div 
                title={t('admin.growth_kpis.coverage_desc')}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden shadow-sm cursor-help ${
                isDark ? 'bg-gradient-to-b from-[#161a26] to-[#10131d] border-slate-800/80 hover:border-slate-700' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 hover:border-slate-300'
              }`}>
                <div className={`flex items-center justify-between mb-1.5 font-mono text-[11px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>{t('admin.growth_kpis.coverage')}</span>
                  <ShieldAlert size={14} className="text-sky-400" />
                </div>
                <div className="font-bebas text-3xl text-sky-400 font-bold tracking-wide">
                  {recordedCount}<span className={`text-sm font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/{members.length}</span>
                </div>
              </div>
            </div>

            {/* Growth Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center flex-1">
                {/* Search */}
                <div className="relative min-w-[200px] sm:w-64">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="BUSCAR OPERATIVO O ALIAS..."
                    className={`w-full pl-9 pr-8 py-2 text-xs font-mono rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-[#10131d] border border-slate-800/80 text-white placeholder-slate-500 focus:border-rose-500/70' 
                        : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-rose-500 shadow-sm'
                    }`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Rank Filter */}
                <div className="flex gap-1.5 items-center overflow-x-auto scrollbar-none">
                  <span className={`font-mono text-xs uppercase tracking-widest mr-1 hidden sm:inline ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rango:</span>
                  <button
                    onClick={() => { playClick(); setFilterRank('ALL'); }}
                    className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all border rounded-xl ${
                      filterRank === 'ALL' 
                        ? (isDark ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold' : 'bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-sm')
                        : (isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 bg-[#10131d]' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 bg-white shadow-sm')
                    }`}
                  >
                    Todos
                  </button>
                  {ranks.map(r => (
                    <button
                      key={r}
                      onClick={() => { playClick(); setFilterRank(r); }}
                      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all border rounded-xl ${
                        filterRank === r 
                          ? (isDark ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold' : 'bg-rose-50 border-rose-400 text-rose-700 font-bold shadow-sm')
                          : (isDark ? 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 bg-[#10131d]' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 bg-white shadow-sm')
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clone Previous Cycle Button */}
              {(isAdmin || canEditEvent('general')) && (
                <button
                  onClick={handleClonePreviousCycle}
                  onMouseEnter={playHover}
                  className={`px-4 py-2 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all rounded-xl border shrink-0 ${
                    isDark 
                      ? 'bg-[#141824] border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600' 
                      : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-sm'
                  }`}
                  title="Importar poder base del ciclo anterior"
                >
                  <Copy size={13} />
                  <span>{t('admin.buttons.clone_prev')}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className={`overflow-x-auto rounded-2xl border ${isDark ? 'border-slate-800/80 bg-[#10131d]' : 'border-slate-200 bg-white shadow-sm'} transition-colors`}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-rose-500" size={32} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead className={`${isDark ? 'bg-[#141824] border-slate-800/80' : 'bg-slate-100 border-slate-200'} border-b shadow-sm transition-colors`}>
                <tr>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 sticky left-0 z-20 w-56 border-r ${
                    isDark ? 'bg-[#141824] text-slate-400 border-slate-800/60' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {t('admin.table.operative')}
                  </th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-2 w-16 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('admin.table.rank')}
                  </th>

                  {/* REWARDS / PARTICIPATION TAB */}
                  {masterView === 'rewards' && (
                    <>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-24 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.top_cut')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.total_pts')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-52 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.loot_alloc')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.events_contrib')}
                      </th>
                    </>
                  )}
                  
                  {/* GENERAL (CRECIMIENTO) */}
                  {masterView === 'growth' && (
                    <>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.prev_power')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-40 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.new_power')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-36 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.weekly_delta')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.mansion')}
                      </th>
                    </>
                  )}
                  
                  {/* UNION ALIANZA */}
                  {masterView === 'events' && activeEventTab === 'union' && (
                    <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-40 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('admin.table.alliance_pts')}
                    </th>
                  )}
                  
                  {/* TAC */}
                  {masterView === 'events' && activeEventTab === 'tac' && (
                    <>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-28 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.participated')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.prev_power')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-40 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.new_power')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.increase')}
                      </th>
                    </>
                  )}
                  
                  {/* VACUNAS */}
                  {masterView === 'events' && activeEventTab === 'vacunas' && (
                    <>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-44 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.team_role')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-24 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.attends')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-36 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.vaccines_pts')}
                      </th>
                    </>
                  )}

                  {/* MORTEM */}
                  {masterView === 'events' && activeEventTab === 'mortem' && (
                    <>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-36 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.prep_pts')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-40 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.shield_dmg')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-40 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.main_dmg')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.total_dmg')}
                      </th>
                    </>
                  )}
                  
                  {/* NEMESIS */}
                  {masterView === 'events' && activeEventTab === 'nemesis' && (
                    <>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.phase')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-44 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.difficulty')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-24 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.level')}
                      </th>
                    </>
                  )}
                  
                  {/* CROCODILE */}
                  {masterView === 'events' && activeEventTab === 'crocodile' && (
                    <>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.prev_power')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-40 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.new_power')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.increase')}
                      </th>
                    </>
                  )}
                  
                  {/* VALLEY */}
                  {masterView === 'events' && activeEventTab === 'valley' && (
                    <>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-24 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.valley')}
                      </th>
                      {activeCenters.map((center, i) => (
                        <th key={i} className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 text-center truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`} title={center}>
                          {center}
                        </th>
                      ))}
                    </>
                  )}
                  
                  {/* WESKER */}
                  {masterView === 'events' && activeEventTab === 'wesker' && (
                    <>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.prev_power')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-40 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.new_power')}
                      </th>
                      <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-32 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t('admin.table.increase')}
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-200'}`}>
                {displayedMembers.map(member => {
                  const act = activities[member.id] || {} as ActivityRecord;
                  const prevAct = prevActivities[member.id] || {} as ActivityRecord;
                  const memberAliases = knownAliases[member.id] || [];
                  const vacunasRole = vacunasTeams[member.id] || 'none';
                  const mort = mortemData[member.id] || {};
                  const partScore = participationMap[member.id] || { 
                    total: 0, 
                    items: [], 
                    rankPos: 999, 
                    tier: 'none' as const, 
                    tierLabel: 'Sin Recompensa', 
                    tierDescription: '0 pts' 
                  };

                  return (
                    <tr key={member.id} className={`transition-colors group ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                      
                      {/* Member Sticky Cell */}
                      <td className={`py-3 px-4 font-mono text-sm sticky left-0 z-10 border-r transition-colors ${
                        isDark 
                          ? 'bg-[#10131d] group-hover:bg-[#151928] text-white border-slate-800/60' 
                          : 'bg-white group-hover:bg-slate-50 text-slate-900 border-slate-200 shadow-sm'
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold truncate">{member.nickname}</span>
                            {memberAliases.length > 0 && (
                              <span className={`font-mono text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`} title={`Alias: ${memberAliases.join(', ')}`}>
                                aka: {memberAliases[0]}
                              </span>
                            )}
                          </div>
                          {masterView === 'rewards' && partScore.total === 0 && (
                            <span className="bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[9px] font-mono px-2 py-0.5 rounded-full tracking-wider shrink-0 animate-pulse font-bold" title="0 puntos en este ciclo: En riesgo de expulsión">
                              {t('admin.risk_alert.risk_badge')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={`py-3 px-2 font-mono text-xs text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{member.rank}</td>

                      {/* REWARDS / PARTICIPATION ROW */}
                      {masterView === 'rewards' && (
                        <>
                          {/* Top Rank Badge */}
                          <td className="py-3 px-3 text-center font-mono text-xs">
                            {partScore.rankPos === 1 ? (
                              <span className="text-amber-400 font-bold flex items-center justify-center gap-1">
                                <Crown size={12} /> #1
                              </span>
                            ) : partScore.rankPos === 2 ? (
                              <span className="text-slate-400 font-bold flex items-center justify-center gap-1">
                                <Medal size={12} /> #2
                              </span>
                            ) : partScore.rankPos === 3 ? (
                              <span className="text-amber-600 font-bold flex items-center justify-center gap-1">
                                <Medal size={12} /> #3
                              </span>
                            ) : (
                              <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border ${
                                partScore.rankPos <= 10 ? (isDark ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : 'text-amber-700 bg-amber-50 border-amber-300') :
                                partScore.rankPos <= 30 ? (isDark ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-700 bg-emerald-50 border-emerald-300') :
                                partScore.rankPos <= 50 ? (isDark ? 'text-sky-300 bg-sky-500/10 border-sky-500/30' : 'text-sky-700 bg-sky-50 border-sky-300') : 
                                (isDark ? 'text-slate-600 border-transparent' : 'text-slate-400 border-transparent')
                              }`}>
                                #{partScore.rankPos}
                              </span>
                            )}
                          </td>

                          {/* Total Points */}
                          <td className="py-3 px-3 text-center">
                            <span className={`font-mono text-base font-bold ${
                              partScore.total > 0 ? (
                                partScore.tier === 'elite' ? 'text-amber-400' :
                                partScore.tier === 'reduced' ? 'text-emerald-400' :
                                partScore.tier === 'basic' ? 'text-sky-400' : (isDark ? 'text-slate-300' : 'text-slate-700')
                              ) : (isDark ? 'text-slate-600' : 'text-slate-400')
                            }`}>
                              {partScore.total} <span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>pts</span>
                            </span>
                          </td>

                          {/* Reward Tier */}
                          <td className="py-3 px-3 text-center">
                            <span className={`font-mono text-xs px-3 py-1 rounded-full border uppercase font-bold inline-flex items-center gap-1.5 ${
                              partScore.tier === 'elite' ? (isDark ? 'border-amber-500/40 text-amber-300 bg-amber-500/10' : 'border-amber-400 text-amber-700 bg-amber-50') :
                              partScore.tier === 'reduced' ? (isDark ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-emerald-400 text-emerald-700 bg-emerald-50') :
                              partScore.tier === 'basic' ? (isDark ? 'border-sky-500/40 text-sky-300 bg-sky-500/10' : 'border-sky-400 text-sky-700 bg-sky-50') :
                              (isDark ? 'border-rose-900/30 text-rose-400/60 bg-rose-950/10' : 'border-rose-300 text-rose-600 bg-rose-50')
                            }`}>
                              {partScore.tier === 'elite' && <Crown size={12} className="text-amber-400" />}
                              {partScore.tier === 'reduced' && <Medal size={12} className="text-emerald-400" />}
                              {partScore.tierLabel}
                            </span>
                          </td>

                          {/* Events Pills with points breakdown */}
                          <td className={`py-3 px-3 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {partScore.items.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {partScore.items.map((it, idx) => (
                                  <span key={idx} className={`border px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1.5 ${
                                    isDark ? 'bg-[#141824] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
                                  }`}>
                                    <span>{it.name}</span>
                                    <strong className="text-emerald-500 font-bold">+{it.pts}</strong>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className={`${isDark ? 'text-slate-600' : 'text-slate-400'} text-xs italic`}>Sin eventos registrados</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* GENERAL (CRECIMIENTO) */}
                      {masterView === 'growth' && (
                        <>
                          <td className={`py-3 px-3 font-mono text-xs whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {formatPower(prevAct.power || member.power)}
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={act.power || 0}
                              onChange={(val) => handleCellChange(member.id, 'power', val)}
                              disabled={!isAuthorizedForCurrentTab}
                            />
                          </td>
                          <td className="py-3 px-3">
                            {act.power && prevAct.power ? (
                              act.power > prevAct.power ? (
                                <span className="text-emerald-400 font-mono text-xs font-bold flex items-center gap-1">
                                  <ArrowUpRight size={13} />
                                  +{formatPower(act.power - prevAct.power)}
                                </span>
                              ) : act.power < prevAct.power ? (
                                <span className="text-rose-400 font-mono text-xs font-bold flex items-center gap-1">
                                  <ArrowDownRight size={13} />
                                  -{formatPower(prevAct.power - act.power)}
                                </span>
                              ) : (
                                <span className={`font-mono text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>= 0M</span>
                              )
                            ) : act.power && !prevAct.power ? (
                              <span className="text-emerald-400/80 font-mono text-xs font-bold">Nuevo</span>
                            ) : (
                              <span className={`font-mono text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <MansionSelect 
                              value={act.mansion_level || member.mansion_level}
                              onChange={(val) => handleCellChange(member.id, 'mansion_level', val)}
                              disabled={!isAuthorizedForCurrentTab}
                            />
                          </td>
                        </>
                      )}

                      {/* UNION ALIANZA */}
                      {masterView === 'events' && activeEventTab === 'union' && (
                        <td className="py-3 px-3">
                          <input 
                            type="number" 
                            value={act.alliance_points || ''} 
                            disabled={!isAuthorizedForCurrentTab}
                            onChange={(e) => handleCellChange(member.id, 'alliance_points', parseInt(e.target.value) || 0)}
                            className={`w-full bg-transparent border-b ${
                              isDark ? 'border-slate-800 hover:border-slate-600 focus:border-rose-500 text-slate-200 focus:bg-slate-900/40' : 'border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-900 focus:bg-slate-100/70'
                            } font-mono text-xs focus:outline-none transition-colors px-2 py-1 ${!isAuthorizedForCurrentTab ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                        </td>
                      )}

                      {/* TAC (Torneo de Alianza): Auto-check on power + accessible tactical checkbox */}
                      {masterView === 'events' && activeEventTab === 'tac' && (
                        <>
                          <td className="py-3 px-3 text-center">
                            <TacticalCheckbox 
                              checked={act.tac_joined || false}
                              onChange={(val) => handleCellChange(member.id, 'tac_joined', val)}
                              disabled={!isAuthorizedForCurrentTab}
                              title={!isAuthorizedForCurrentTab ? 'Modo solo lectura' : 'Presiona Enter o Espacio para alternar'}
                            />
                          </td>
                          <td className={`py-3 px-3 font-mono text-xs whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {formatPower(prevAct.tac_power || 0)}
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={act.tac_power || 0}
                              onChange={(val) => handleCellChange(member.id, 'tac_power', val)}
                              onEnterPress={() => handleCellChange(member.id, 'tac_joined', true)}
                              disabled={!isAuthorizedForCurrentTab}
                            />
                          </td>
                          <td className="py-3 px-3">
                            {act.tac_power && prevAct.tac_power && act.tac_power > prevAct.tac_power ? (
                              <span className="text-emerald-400 font-mono text-xs font-bold">+{formatPower(act.tac_power - prevAct.tac_power)}</span>
                            ) : act.tac_power && prevAct.tac_power && act.tac_power < prevAct.tac_power ? (
                              <span className="text-rose-400 font-mono text-xs font-bold">{formatPower(act.tac_power - prevAct.tac_power)}</span>
                            ) : (
                              <span className={`font-mono text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>-</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* VACUNAS: Team role & points */}
                      {masterView === 'events' && activeEventTab === 'vacunas' && (
                        <>
                          <td className="py-3 px-3">
                            <VacunasRoleSelect
                              value={vacunasRole}
                              onChange={(role) => handleVacunasRoleChange(member.id, role)}
                              disabled={!isAuthorizedForCurrentTab}
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <TacticalCheckbox
                              checked={act.lab_joined || vacunasRole !== 'none'}
                              onChange={(val) => handleCellChange(member.id, 'lab_joined', val)}
                              disabled={!isAuthorizedForCurrentTab}
                              title={!isAuthorizedForCurrentTab ? 'Modo solo lectura' : 'Marca asistencia (los suplentes cuentan como participantes)'}
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input 
                              type="number" 
                              value={act.lab_points || ''} 
                              disabled={!isAuthorizedForCurrentTab}
                              onChange={(e) => handleCellChange(member.id, 'lab_points', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className={`w-full bg-transparent border-b ${
                                isDark ? 'border-slate-800 hover:border-slate-600 focus:border-rose-500 text-slate-200 focus:bg-slate-900/40' : 'border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-900 focus:bg-slate-100/70'
                              } font-mono text-xs focus:outline-none transition-colors px-2 py-1 ${!isAuthorizedForCurrentTab ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                          </td>
                        </>
                      )}

                      {/* MORTEM: Prep points, Shield damage, Boss damage */}
                      {masterView === 'events' && activeEventTab === 'mortem' && (
                        <>
                          <td className="py-3 px-3">
                            <input 
                              type="number" 
                              value={mort.prep_points || ''} 
                              disabled={!isAuthorizedForCurrentTab}
                              onChange={(e) => handleMortemChange(member.id, 'prep_points', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className={`w-full bg-transparent border-b ${
                                isDark ? 'border-slate-800 hover:border-slate-600 focus:border-rose-500 text-slate-200 focus:bg-slate-900/40' : 'border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-900 focus:bg-slate-100/70'
                              } font-mono text-xs focus:outline-none transition-colors px-2 py-1 ${!isAuthorizedForCurrentTab ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={mort.shield_damage || 0}
                              onChange={(val) => handleMortemChange(member.id, 'shield_damage', val)}
                              disabled={!isAuthorizedForCurrentTab}
                              className={`w-full bg-transparent border-b ${isDark ? 'hover:border-slate-500' : 'hover:border-slate-400'} focus:border-rose-500 text-sky-400 font-mono text-xs focus:outline-none transition-colors px-2 py-1`}
                            />
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={mort.damage || 0}
                              onChange={(val) => handleMortemChange(member.id, 'damage', val)}
                              disabled={!isAuthorizedForCurrentTab}
                              className={`w-full bg-transparent border-b ${isDark ? 'hover:border-slate-500' : 'hover:border-slate-400'} focus:border-rose-500 text-rose-400 font-mono text-xs focus:outline-none transition-colors px-2 py-1`}
                            />
                          </td>
                          <td className={`py-3 px-3 font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {formatPower((mort.damage || 0) + (mort.shield_damage || 0))}
                          </td>
                        </>
                      )}

                      {/* NEMESIS: 1 to 5 Stars selector */}
                      {masterView === 'events' && activeEventTab === 'nemesis' && (
                        <>
                          <td className="py-3 px-3">
                            <PhaseSelect 
                              value={act.nemesis_phase || 1}
                              onChange={(val) => handleCellChange(member.id, 'nemesis_phase', val)}
                              disabled={!isAuthorizedForCurrentTab}
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <NemesisStarsSelect 
                              value={act.nemesis_difficulty || '2★'}
                              onChange={(val) => handleCellChange(member.id, 'nemesis_difficulty', val)}
                              disabled={!isAuthorizedForCurrentTab}
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input 
                              type="number" 
                              min="0" 
                              max="50" 
                              value={act.nemesis_level || ''} 
                              disabled={!isAuthorizedForCurrentTab}
                              onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                if (val > 50) val = 50;
                                handleCellChange(member.id, 'nemesis_level', val);
                              }}
                              className={`w-full bg-transparent border-b ${
                                isDark ? 'border-slate-800 hover:border-slate-600 focus:border-rose-500 text-slate-200 focus:bg-slate-900/40' : 'border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-900 focus:bg-slate-100/70'
                              } font-mono text-xs focus:outline-none transition-colors px-2 py-1 text-center ${!isAuthorizedForCurrentTab ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                          </td>
                        </>
                      )}

                      {/* CROCODILE */}
                      {masterView === 'events' && activeEventTab === 'crocodile' && (
                        <>
                          <td className={`py-3 px-3 font-mono text-xs whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {formatPower(prevAct.crocodile_damage || 0)}
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={act.crocodile_damage || 0}
                              onChange={(val) => handleCellChange(member.id, 'crocodile_damage', val)}
                              disabled={!isAuthorizedForCurrentTab}
                            />
                          </td>
                          <td className="py-3 px-3">
                            {act.crocodile_damage && prevAct.crocodile_damage && act.crocodile_damage > prevAct.crocodile_damage ? (
                              <span className="text-emerald-400 font-mono text-xs font-bold">+{formatPower(act.crocodile_damage - prevAct.crocodile_damage)}</span>
                            ) : act.crocodile_damage && prevAct.crocodile_damage && act.crocodile_damage < prevAct.crocodile_damage ? (
                              <span className="text-rose-400 font-mono text-xs font-bold">{formatPower(act.crocodile_damage - prevAct.crocodile_damage)}</span>
                            ) : (
                              <span className={`font-mono text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>-</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* VALLEY & SEC */}
                      {masterView === 'events' && activeEventTab === 'valley' && (
                        <>
                          <td className="py-3 px-3 text-center">
                            <TacticalCheckbox 
                              checked={act.saint_valley || false}
                              onChange={(val) => handleCellChange(member.id, 'saint_valley', val)}
                              disabled={!isAuthorizedForCurrentTab}
                            />
                          </td>
                          {activeCenters.map((center, i) => (
                            <td key={i} className="py-3 px-3 text-center">
                              <TacticalCheckbox 
                                checked={(act.security_centers_data || []).includes(center)}
                                disabled={!isAuthorizedForCurrentTab}
                                onChange={(checked) => {
                                  const currentData = act.security_centers_data || [];
                                  const newData = checked 
                                    ? [...currentData, center] 
                                    : currentData.filter(c => c !== center);
                                  handleCellChange(member.id, 'security_centers_data', newData);
                                }}
                              />
                            </td>
                          ))}
                        </>
                      )}

                      {/* WESKER */}
                      {masterView === 'events' && activeEventTab === 'wesker' && (
                        <>
                          <td className={`py-3 px-3 font-mono text-xs whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {(prevAct.wesker_points || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <input 
                              type="number" 
                              value={act.wesker_points || ''} 
                              disabled={!isAuthorizedForCurrentTab}
                              onChange={(e) => handleCellChange(member.id, 'wesker_points', parseInt(e.target.value) || 0)}
                              className={`w-full bg-transparent border-b ${
                                isDark ? 'border-slate-800 hover:border-slate-600 focus:border-rose-500 text-slate-200 focus:bg-slate-900/40' : 'border-slate-300 hover:border-slate-400 focus:border-rose-500 text-slate-900 focus:bg-slate-100/70'
                              } font-mono text-xs focus:outline-none transition-colors px-2 py-1 ${!isAuthorizedForCurrentTab ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                          </td>
                          <td className="py-3 px-3">
                            {act.wesker_points && prevAct.wesker_points && act.wesker_points > prevAct.wesker_points ? (
                              <span className="text-emerald-400 font-mono text-xs font-bold">+{act.wesker_points - prevAct.wesker_points}</span>
                            ) : act.wesker_points && prevAct.wesker_points && act.wesker_points < prevAct.wesker_points ? (
                              <span className="text-rose-400 font-mono text-xs font-bold">{act.wesker_points - prevAct.wesker_points}</span>
                            ) : (
                              <span className={`font-mono text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>-</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className={`py-12 text-center font-mono text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      No hay operativos que coincidan con la búsqueda o filtro seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* OCR Modal */}
      <ScreenshotOcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        members={members}
        activeAlliance={activeAlliance}
        knownAliases={knownAliases}
        defaultEvent={getOcrDefaultEvent()}
        allowedEvents={isAdmin ? undefined : user?.allowedEvents}
        onApply={handleApplyOcr}
      />

      {/* Discord Export Modal */}
      <DiscordExportModal
        isOpen={isDiscordOpen}
        onClose={() => setIsDiscordOpen(false)}
        activeAlliance={activeAlliance}
        selectedDate={selectedDate}
        members={members}
        activities={activities}
        activeCenters={activeCenters}
        vacunasTeams={vacunasTeams}
        mortemData={mortemData}
        mortemAllianceMeta={mortemMeta}
        participationScores={participationMap}
        initialTab={activeEventTab}
      />


      {/* Alert / Confirm Modal */}
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

export default ActivityPanel;
