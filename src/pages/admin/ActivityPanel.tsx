import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useSound } from '../../contexts/SoundContext';
import { AdminModal, type AdminModalType } from '../../components/admin/AdminModal';
import { 
  Search, Loader2, Save, Calendar, Settings, Plus, X, 
  Camera, Share2, Copy, Skull, Database, ChevronLeft, ChevronRight
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
import { SupabaseSqlModal } from '../../components/admin/SupabaseSqlModal';

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

const ActivityPanel = ({ activeAlliance }: { activeAlliance: string }) => {
  const { playHover, playClick } = useSound();
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Record<string, ActivityRecord>>({});
  const [prevActivities, setPrevActivities] = useState<Record<string, ActivityRecord>>({});
  const [knownAliases, setKnownAliases] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState<string>('ALL');

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
  const [isSqlOpen, setIsSqlOpen] = useState(false);

  // Tabs: 'rewards' | 'general' | 'tac' | 'vacunas' | 'mortem' | 'crocodile' | 'nemesis' | 'valley' | 'wesker' | 'union'
  const [activeEventTab, setActiveEventTab] = useState('rewards');
  const [activeCenters, setActiveCenters] = useState<string[]>(['Centro 1', 'Centro 2']);
  const [showCenterSettings, setShowCenterSettings] = useState(false);
  
  // Drag-to-scroll refs and state for Tab Bar
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const getInitialDate = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
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

    } catch (err) {
      console.error('Error fetching activity data:', err);
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
    if (!num) return '0M';
    return (num / 1000000).toFixed(2) + 'M';
  };

  // Drag-to-scroll event handlers for Tab Bar
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

  // Generic cell update with auto-check on TAC
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
      const fullRecords = Object.values(activities).map(act => ({
        ...act,
        cycle_date: selectedDate,
        mortem_prep_points: mortemData[act.member_id]?.prep_points || 0,
        mortem_damage: mortemData[act.member_id]?.damage || 0,
        mortem_shield_damage: mortemData[act.member_id]?.shield_damage || 0,
        vacunas_role: vacunasTeams[act.member_id] || 'none'
      }));
      
      let columnFallback = false;

      if (fullRecords.length > 0) {
        const { error } = await supabase
          .from('guild_activity_cycles')
          .upsert(fullRecords, { onConflict: 'cycle_date,member_id' });
          
        if (error) {
          // If Supabase table does not yet have the new columns, fallback to baseline and save in settings
          if (error.message && (error.message.includes('mortem') || error.message.includes('vacunas') || error.message.includes('column'))) {
            columnFallback = true;
            const fallbackRecords = Object.values(activities).map(act => {
              const { mortem_prep_points, mortem_damage, mortem_shield_damage, vacunas_role, ...rest } = act as any;
              return { ...rest, cycle_date: selectedDate };
            });
            const { error: fErr } = await supabase
              .from('guild_activity_cycles')
              .upsert(fallbackRecords, { onConflict: 'cycle_date,member_id' });
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
      
      setHasChanges(false);

      if (columnFallback) {
        setModal({
          isOpen: true,
          type: 'alert',
          title: 'Guardado con Respaldo en Ajustes',
          message: 'Los datos de Mortem y Vacunas se guardaron correctamente. Recuerda hacer clic en "SQL Supabase" en la barra superior para agregar las columnas permanentes en tu consola de Supabase.'
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
    setHasChanges(true);
    playClick();
    const newActivities = { ...activities };
    members.forEach(m => {
      if (!newActivities[m.id]) {
        newActivities[m.id] = {
          member_id: m.id,
          cycle_date: selectedDate,
          power: m.power || 0,
          mansion_level: m.mansion_level || 1,
          alliance_points: 0,
          tac_joined: false,
          tac_power: 0,
          lab_joined: false,
          lab_points: 0,
          nemesis_phase: 1,
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
            member_id: m.id,
            cycle_date: selectedDate,
            power: m.power || 0,
            mansion_level: m.mansion_level || 1,
            alliance_points: 0,
            tac_joined: false,
            tac_power: 0,
            lab_joined: false,
            lab_points: 0,
            nemesis_phase: 1,
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
    setHasChanges(true);
    const newActs = { ...activities };
    const newMortem = { ...mortemData };

    updates.forEach(u => {
      if (u.field === 'mortem_damage') {
        const currMortem = newMortem[u.memberId] || { prep_points: 0, damage: 0, shield_damage: 0 };
        newMortem[u.memberId] = { ...currMortem, damage: u.value };
        return;
      }

      const member = members.find(m => m.id === u.memberId);
      const curr = newActs[u.memberId] || {
        member_id: u.memberId,
        cycle_date: selectedDate,
        power: member?.power || 0,
        mansion_level: member?.mansion_level || 1,
        alliance_points: 0,
        tac_joined: false,
        tac_power: 0,
        lab_joined: false,
        lab_points: 0,
        nemesis_phase: 1,
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
      message: `Se aplicaron ${updates.length} registros a la tabla del ciclo. Haz clic en 'Guardar Cambios' para persistirlos en la base de datos.`
    });
  };

  // Determine OCR default event based on current tab
  const getOcrDefaultEvent = (): EventTargetType => {
    switch (activeEventTab) {
      case 'crocodile': return 'crocodile';
      case 'tac': return 'tac';
      case 'vacunas': return 'lab';
      case 'mortem': return 'mortem';
      case 'wesker': return 'wesker';
      case 'general':
      default: return 'crocodile';
    }
  };

  // Participation Score Calculator (Out of 7 points)
  const calculateParticipationScore = (memberId: string) => {
    const act = activities[memberId];
    const role = vacunasTeams[memberId];
    const mort = mortemData[memberId];

    let score = 0;
    const items: string[] = [];

    // 1. Cocodrilo
    if (act && act.crocodile_damage > 0) {
      score += 1;
      items.push('Cocodrilo');
    }

    // 2. TAC
    if (act && (act.tac_joined || act.tac_power > 0)) {
      score += 1;
      items.push('TAC');
    }

    // 3. Vacunas (Asignado en equipo o puntos)
    if ((role && role !== 'none') || (act && (act.lab_joined || act.lab_points > 0))) {
      score += 1;
      items.push('Vacunas');
    }

    // 4. Valle Santo
    if (act && act.saint_valley) {
      score += 1;
      items.push('Valle');
    }

    // 5. Centros de Seguridad
    if (act && (act.security_centers_data || []).length > 0) {
      score += 1;
      items.push('Centros');
    }

    // 6. Wesker
    if (act && act.wesker_points > 0) {
      score += 1;
      items.push('Wesker');
    }

    // 7. Mortem (Daño, Escudo o Preparación)
    if (mort && ((mort.damage || 0) > 0 || (mort.shield_damage || 0) > 0 || (mort.prep_points || 0) > 0)) {
      score += 1;
      items.push('Mortem');
    }

    const level = score >= 7 ? 'Élite Supremo' : score >= 5 ? 'Muy Activo' : score >= 3 ? 'Regular' : 'Baja Actividad';

    return { total: score, max: 7, level, items };
  };

  const participationMap = members.reduce((acc, m) => {
    acc[m.id] = calculateParticipationScore(m.id);
    return acc;
  }, {} as Record<string, { total: number; max: number; level: string; items: string[] }>);

  // Vacunas team counts
  const team1Titulares = members.filter(m => vacunasTeams[m.id] === 'team1_titular');
  const team1Suplentes = members.filter(m => vacunasTeams[m.id] === 'team1_suplente');
  const team2Titulares = members.filter(m => vacunasTeams[m.id] === 'team2_titular');
  const team2Suplentes = members.filter(m => vacunasTeams[m.id] === 'team2_suplente');

  const ranks = ['R5', 'R4', 'R3', 'R2', 'R1'];

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (knownAliases[m.id] && knownAliases[m.id].some(a => a.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesRank = 
      filterRank === 'ALL' || m.rank === filterRank;

    const matchesVacunasTeam = 
      activeEventTab !== 'vacunas' ||
      vacunasTeamFilter === 'all' ||
      (vacunasTeamFilter === 'team1' && (vacunasTeams[m.id] === 'team1_titular' || vacunasTeams[m.id] === 'team1_suplente')) ||
      (vacunasTeamFilter === 'team2' && (vacunasTeams[m.id] === 'team2_titular' || vacunasTeams[m.id] === 'team2_suplente')) ||
      (vacunasTeamFilter === 'unassigned' && (!vacunasTeams[m.id] || vacunasTeams[m.id] === 'none'));

    return matchesSearch && matchesRank && matchesVacunasTeam;
  });

  const activeCount = members.filter(m => m.account_type === 'main').length;
  const altCount = members.filter(m => m.account_type === 'alt').length;
  const recordedCount = Object.keys(activities).length;

  const eventTabsList = [
    { id: 'rewards', label: 'Recompensas (Puntos)' },
    { id: 'general', label: 'Crecimiento (Poder)' },
    { id: 'tac', label: 'TAC (Torneo)' },
    { id: 'vacunas', label: 'Vacunas (Lab)' },
    { id: 'mortem', label: 'Mortem (Escudo)' },
    { id: 'crocodile', label: 'Caimán / Cocodrilo' },
    { id: 'nemesis', label: 'Némesis' },
    { id: 'valley', label: 'Valle & Centros' },
    { id: 'wesker', label: 'Wesker' },
    { id: 'union', label: 'Unión Alianza' },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      
      {/* Top Header & Tactical Action Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-bebas text-3xl tracking-widest text-white">Auditoría Semanal de Alianza</h2>
            <span className="bg-blood-red/20 border border-blood-red/40 text-neon-red font-mono text-[10px] px-2 py-0.5 uppercase tracking-wider">
              {activeAlliance}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 font-mono text-xs text-gray-400 mt-2">
            <span>Operativos: <strong className="text-white">{members.length}</strong></span>
            <span>Principales: <strong className="text-green-400">{activeCount}</strong></span>
            <span>Secundarias: <strong className="text-blue-400">{altCount}</strong></span>
            <span>Registrados en Ciclo: <strong className="text-neon-red">{recordedCount}/{members.length}</strong></span>
          </div>
        </div>
        
        {/* Actions Toolbar */}
        <div className="flex gap-2.5 items-center flex-wrap">
          {/* Date Selector */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-black border border-gray-700 text-white pl-9 pr-3 py-2 font-mono text-xs focus:outline-none focus:border-neon-red"
            />
          </div>

          {/* OCR Button */}
          <button
            onClick={() => { playClick(); setIsOcrOpen(true); }}
            onMouseEnter={playHover}
            className="bg-blood-red/20 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white px-3.5 py-2 font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(255,42,42,0.25)]"
            title="Escanear capturas de pantalla con IA"
          >
            <Camera size={15} />
            <span>Asistente OCR (IA)</span>
          </button>

          {/* Discord Export Button */}
          <button
            onClick={() => { playClick(); setIsDiscordOpen(true); }}
            onMouseEnter={playHover}
            className="bg-black/80 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 px-3.5 py-2 font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
            title="Generar formato especial para Discord"
          >
            <Share2 size={15} className="text-blue-400" />
            <span className="hidden sm:inline">Copiar para Discord</span>
          </button>

          {/* Clone Previous Cycle */}
          <button
            onClick={handleClonePreviousCycle}
            onMouseEnter={playHover}
            className="bg-black/80 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-3 py-2 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            title="Importar poder base del ciclo anterior"
          >
            <Copy size={14} />
            <span className="hidden md:inline">Clonar Anterior</span>
          </button>

          {/* Supabase SQL button */}
          <button
            onClick={() => { playClick(); setIsSqlOpen(true); }}
            onMouseEnter={playHover}
            className="bg-black/80 border border-green-800/60 text-green-400 hover:text-green-300 hover:border-green-600 px-3 py-2 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(34,197,94,0.1)]"
            title="Ver y copiar el script SQL para actualizar Supabase"
          >
            <Database size={14} />
            <span className="hidden md:inline">SQL Supabase</span>
          </button>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            onMouseEnter={playHover}
            disabled={!hasChanges || saving}
            className={`px-5 py-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${!hasChanges ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-transparent' : 'bg-blood-red/30 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white shadow-[0_0_15px_rgba(255,42,42,0.35)]'}`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
            Guardar
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#090909] border border-gray-800/80 rounded-sm flex-1 overflow-hidden flex flex-col">
        
        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-gray-800 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            
            {/* Search + Rank Filters */}
            <div className="flex flex-wrap gap-3 items-center flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar operativo o apodo..."
                  className="w-full bg-black border border-gray-700 text-white pl-9 pr-3 py-1.5 font-mono text-xs focus:outline-none focus:border-neon-red"
                />
              </div>

              {/* Rank Pills */}
              <div className="flex gap-1 items-center overflow-x-auto scrollbar-none">
                <button
                  onClick={() => { playClick(); setFilterRank('ALL'); }}
                  className={`px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors border ${filterRank === 'ALL' ? 'bg-blood-red/20 border-neon-red text-white' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
                >
                  Todos
                </button>
                {ranks.map(r => (
                  <button
                    key={r}
                    onClick={() => { playClick(); setFilterRank(r); }}
                    className={`px-2 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors border ${filterRank === r ? 'bg-blood-red/20 border-neon-red text-white' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Bulk Action Buttons */}
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => toggleColumnAll('tac_joined', true)} 
                className="text-[11px] font-mono text-gray-400 border border-gray-800 px-2.5 py-1 hover:bg-white/5 hover:text-white transition-colors"
                title="Marcar asistencia para todos en TAC"
              >
                + Todo TAC
              </button>
              <button 
                onClick={() => toggleColumnAll('lab_joined', true)} 
                className="text-[11px] font-mono text-gray-400 border border-gray-800 px-2.5 py-1 hover:bg-white/5 hover:text-white transition-colors"
                title="Marcar asistencia para todos en Vacunas"
              >
                + Todo Vacunas
              </button>
              <button 
                onClick={() => toggleColumnAll('saint_valley', true)} 
                className="text-[11px] font-mono text-gray-400 border border-gray-800 px-2.5 py-1 hover:bg-white/5 hover:text-white transition-colors"
                title="Marcar asistencia para todos en Valle"
              >
                + Todo Valle
              </button>
            </div>
          </div>

          {/* EVENT SUB-TABS: DRAG-TO-SCROLL & CHEVRON BUTTONS */}
          <div className="relative flex items-center group/tabbar bg-black/40 border border-gray-800/80 rounded-sm">
            {/* Scroll Left Button */}
            <button
              onClick={() => scrollTabs(-240)}
              className="p-2 bg-black/90 hover:bg-[#151515] text-gray-400 hover:text-neon-red border-r border-gray-800 flex items-center justify-center shrink-0 z-10 transition-colors"
              title="Desplazar eventos hacia la izquierda"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Draggable Tab List */}
            <div
              ref={tabBarRef}
              onMouseDown={handleTabsMouseDown}
              onMouseMove={handleTabsMouseMove}
              onMouseUp={handleTabsMouseUp}
              onMouseLeave={handleTabsMouseUp}
              onWheel={handleTabsWheel}
              className={`flex gap-1 overflow-x-auto select-none py-1 px-2 flex-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isDraggingTabs ? 'cursor-grabbing' : 'cursor-grab'}`}
              title="Haz clic y arrastra horizontalmente, o usa la rueda del ratón para ver todos los eventos"
            >
              {eventTabsList.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (!hasMovedRef.current) {
                      playClick();
                      setActiveEventTab(tab.id);
                      setShowCenterSettings(false);
                    }
                  }}
                  onMouseEnter={playHover}
                  className={`px-3.5 py-2 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-all border-b-2 shrink-0 ${activeEventTab === tab.id ? 'border-neon-red text-neon-red bg-blood-red/15 font-bold shadow-[0_0_10px_rgba(255,42,42,0.2)]' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={() => scrollTabs(240)}
              className="p-2 bg-black/90 hover:bg-[#151515] text-gray-400 hover:text-neon-red border-l border-gray-800 flex items-center justify-center shrink-0 z-10 transition-colors"
              title="Desplazar eventos hacia la derecha"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* VACUNAS SUB-HEADER: Team allocation badges and quick filter */}
          {activeEventTab === 'vacunas' && (
            <div className="p-3 bg-[#111] border border-gray-800 flex flex-wrap items-center justify-between gap-3 rounded-sm">
              <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">Equipo 1:</span>
                  <span className="bg-black border border-gray-700 px-2 py-0.5 text-gray-300">
                    Titulares: <strong className={team1Titulares.length > 30 ? 'text-red-400' : 'text-green-400'}>{team1Titulares.length}/30</strong>
                  </span>
                  <span className="bg-black border border-gray-700 px-2 py-0.5 text-gray-300">
                    Suplentes: <strong className={team1Suplentes.length > 10 ? 'text-red-400' : 'text-blue-400'}>{team1Suplentes.length}/10</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">Equipo 2:</span>
                  <span className="bg-black border border-gray-700 px-2 py-0.5 text-gray-300">
                    Titulares: <strong className={team2Titulares.length > 30 ? 'text-red-400' : 'text-green-400'}>{team2Titulares.length}/30</strong>
                  </span>
                  <span className="bg-black border border-gray-700 px-2 py-0.5 text-gray-300">
                    Suplentes: <strong className={team2Suplentes.length > 10 ? 'text-red-400' : 'text-purple-400'}>{team2Suplentes.length}/10</strong>
                  </span>
                </div>
              </div>

              {/* Team Filter Pills */}
              <div className="flex gap-1.5 font-mono text-[11px]">
                <button
                  onClick={() => setVacunasTeamFilter('all')}
                  className={`px-2 py-0.5 border ${vacunasTeamFilter === 'all' ? 'border-neon-red text-white bg-blood-red/20' : 'border-gray-800 text-gray-400 hover:text-white'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setVacunasTeamFilter('team1')}
                  className={`px-2 py-0.5 border ${vacunasTeamFilter === 'team1' ? 'border-blue-500 text-blue-300 bg-blue-500/10' : 'border-gray-800 text-gray-400 hover:text-white'}`}
                >
                  Equipo 1
                </button>
                <button
                  onClick={() => setVacunasTeamFilter('team2')}
                  className={`px-2 py-0.5 border ${vacunasTeamFilter === 'team2' ? 'border-purple-500 text-purple-300 bg-purple-500/10' : 'border-gray-800 text-gray-400 hover:text-white'}`}
                >
                  Equipo 2
                </button>
                <button
                  onClick={() => setVacunasTeamFilter('unassigned')}
                  className={`px-2 py-0.5 border ${vacunasTeamFilter === 'unassigned' ? 'border-yellow-500 text-yellow-300 bg-yellow-500/10' : 'border-gray-800 text-gray-400 hover:text-white'}`}
                >
                  Sin Asignar
                </button>
              </div>
            </div>
          )}

          {/* MORTEM SUB-HEADER: Server ranking & strategy notes */}
          {activeEventTab === 'mortem' && (
            <div className="p-3 bg-[#111] border border-gray-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-950/50 border border-neon-red flex items-center justify-center rounded-sm text-neon-red">
                  <Skull size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-gray-400">Ranking Servidor:</span>
                    <input
                      type="text"
                      value={mortemMeta.server_rank || ''}
                      onChange={(e) => {
                        setHasChanges(true);
                        setMortemMeta(prev => ({ ...prev, server_rank: e.target.value }));
                      }}
                      placeholder="Ej: #3 en Servidor 45"
                      className="bg-black border border-gray-700 text-white font-mono text-xs px-2 py-0.5 focus:outline-none focus:border-neon-red w-44"
                    />
                  </div>
                  <p className="font-mono text-[10px] text-gray-500 mt-0.5">
                    Registra daño cooperativo a escudo y daño principal para optimizar la estrategia de la alianza
                  </p>
                </div>
              </div>

              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  value={mortemMeta.strategy_notes || ''}
                  onChange={(e) => {
                    setHasChanges(true);
                    setMortemMeta(prev => ({ ...prev, strategy_notes: e.target.value }));
                  }}
                  placeholder="Notas tácticas (ej: romper escudo en los primeros 45 seg)..."
                  className="w-full bg-black border border-gray-700 text-gray-300 font-mono text-xs px-3 py-1.5 focus:outline-none focus:border-neon-red truncate"
                  title={mortemMeta.strategy_notes}
                />
              </div>
            </div>
          )}

          {/* Valley sub-header */}
          {activeEventTab === 'valley' && (
            <div className="flex justify-between items-center px-1">
              <span className="font-mono text-xs text-gray-400">Centros de Seguridad Activos:</span>
              <button 
                onClick={() => setShowCenterSettings(!showCenterSettings)}
                className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400 hover:text-white"
              >
                <Settings size={13} /> Configurar Centros
              </button>
            </div>
          )}

          {activeEventTab === 'valley' && showCenterSettings && (
            <div className="p-4 border border-gray-800 bg-[#121212] flex flex-col gap-3 rounded-sm">
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
                  <Plus size={15} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCenters.map(center => (
                  <div key={center} className="flex items-center gap-2 bg-black border border-gray-700 px-2.5 py-1 font-mono text-xs">
                    <span>{center}</span>
                    <button 
                      onClick={() => {
                        const newCenters = activeCenters.filter(c => c !== center);
                        setActiveCenters(newCenters);
                        saveCenters(newCenters);
                      }}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-neon-red" size={32} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead className="sticky top-0 bg-[#121212] z-10 border-b border-gray-800">
                <tr>
                  <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-4 sticky left-0 bg-[#121212] z-20 w-56">
                    Operativo
                  </th>
                  <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-2 w-16 text-center">
                    Ran
                  </th>

                  {/* REWARDS / PARTICIPATION TAB */}
                  {activeEventTab === 'rewards' && (
                    <>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-40 text-center">Puntos Asistencia</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-48 text-center">Nivel Compromiso</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3">Eventos Registrados</th>
                    </>
                  )}
                  
                  {/* GENERAL (CRECIMIENTO) */}
                  {activeEventTab === 'general' && (
                    <>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32">Poder Ant.</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-40">Poder Nuevo</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32">Subida</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32 text-center">Mansión</th>
                    </>
                  )}
                  
                  {/* UNION ALIANZA */}
                  {activeEventTab === 'union' && (
                    <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-40">Puntos Alianza</th>
                  )}
                  
                  {/* TAC */}
                  {activeEventTab === 'tac' && (
                    <>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-28 text-center">Participó (Enter)</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32">Poder Ant.</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-40">Poder Nuevo (Auto-check)</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32">Subida</th>
                    </>
                  )}
                  
                  {/* VACUNAS */}
                  {activeEventTab === 'vacunas' && (
                    <>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-44">Equipo / Rol</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-24 text-center">Asiste</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-36">Puntos Vacunas</th>
                    </>
                  )}

                  {/* MORTEM */}
                  {activeEventTab === 'mortem' && (
                    <>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-36">Pts Preparación</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-40">Destrucción Escudo</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-40">Daño Principal Mortem</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32">Total Daño</th>
                    </>
                  )}
                  
                  {/* NEMESIS */}
                  {activeEventTab === 'nemesis' && (
                    <>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32 text-center">Fase</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-44 text-center">Dificultad (1-5★)</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-24 text-center">Nivel</th>
                    </>
                  )}
                  
                  {/* CROCODILE */}
                  {activeEventTab === 'crocodile' && (
                    <>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32">Daño Ant.</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-40">Daño Nuevo</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32">Subida</th>
                    </>
                  )}
                  
                  {/* VALLEY */}
                  {activeEventTab === 'valley' && (
                    <>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-24 text-center">Valle</th>
                      {activeCenters.map((center, i) => (
                        <th key={i} className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32 text-center truncate" title={center}>
                          {center}
                        </th>
                      ))}
                    </>
                  )}
                  
                  {/* WESKER */}
                  {activeEventTab === 'wesker' && (
                    <>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32">Pts Ant.</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-40">Pts Nuevo</th>
                      <th className="font-mono text-[11px] text-gray-400 uppercase tracking-widest py-3 px-3 w-32">Subida</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {filteredMembers.map(member => {
                  const act = activities[member.id] || {} as ActivityRecord;
                  const prevAct = prevActivities[member.id] || {} as ActivityRecord;
                  const memberAliases = knownAliases[member.id] || [];
                  const vacunasRole = vacunasTeams[member.id] || 'none';
                  const mort = mortemData[member.id] || {};
                  const partScore = participationMap[member.id] || { total: 0, max: 7, level: 'Baja Actividad', items: [] };

                  return (
                    <tr key={member.id} className="hover:bg-white/[0.03] transition-colors group">
                      
                      {/* Member Sticky Cell */}
                      <td className="py-3 px-4 font-mono text-sm text-white sticky left-0 group-hover:bg-[#151515] bg-[#090909] z-0 border-r border-gray-800/30">
                        <div className="flex flex-col">
                          <span className="font-medium truncate">{member.nickname}</span>
                          {memberAliases.length > 0 && (
                            <span className="font-mono text-[10px] text-gray-500 truncate" title={`Alias: ${memberAliases.join(', ')}`}>
                              aka: {memberAliases[0]}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-2 font-mono text-xs text-gray-400 text-center">{member.rank}</td>

                      {/* REWARDS / PARTICIPATION ROW */}
                      {activeEventTab === 'rewards' && (
                        <>
                          <td className="py-3 px-3 text-center">
                            <span className={`font-mono text-sm font-bold ${
                              partScore.total >= 7 ? 'text-amber-400' :
                              partScore.total >= 5 ? 'text-green-400' :
                              partScore.total >= 3 ? 'text-blue-400' : 'text-red-400'
                            }`}>
                              {partScore.total} / {partScore.max} pts
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`font-mono text-xs px-2 py-0.5 rounded-sm border uppercase ${
                              partScore.total >= 7 ? 'border-amber-500/40 text-amber-300 bg-amber-500/10' :
                              partScore.total >= 5 ? 'border-green-500/40 text-green-300 bg-green-500/10' :
                              partScore.total >= 3 ? 'border-blue-500/40 text-blue-300 bg-blue-500/10' : 'border-red-500/40 text-red-400 bg-red-500/10'
                            }`}>
                              {partScore.level}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-gray-400">
                            {partScore.items.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {partScore.items.map((it, idx) => (
                                  <span key={idx} className="bg-black/60 border border-gray-800 px-1.5 py-0.5 rounded text-[10px] text-gray-300">
                                    {it}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-600">Sin eventos registrados</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* GENERAL (CRECIMIENTO) */}
                      {activeEventTab === 'general' && (
                        <>
                          <td className="py-3 px-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                            {formatPower(prevAct.power || member.power)}
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={act.power || 0}
                              onChange={(val) => handleCellChange(member.id, 'power', val)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-200 font-mono text-xs focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-3">
                            {act.power && act.power > (prevAct.power || member.power) ? (
                              <span className="text-green-500 font-mono text-xs">+{formatPower(act.power - (prevAct.power || member.power))}</span>
                            ) : act.power && act.power < (prevAct.power || member.power) ? (
                              <span className="text-red-500 font-mono text-xs">{formatPower(act.power - (prevAct.power || member.power))}</span>
                            ) : (
                              <span className="text-gray-600 font-mono text-xs">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <MansionSelect 
                              value={act.mansion_level || member.mansion_level}
                              onChange={(val) => handleCellChange(member.id, 'mansion_level', val)}
                            />
                          </td>
                        </>
                      )}

                      {/* UNION ALIANZA */}
                      {activeEventTab === 'union' && (
                        <td className="py-3 px-3">
                          <input 
                            type="number" 
                            value={act.alliance_points || ''} 
                            onChange={(e) => handleCellChange(member.id, 'alliance_points', parseInt(e.target.value) || 0)}
                            className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-200 font-mono text-xs focus:outline-none transition-colors px-2 py-1"
                          />
                        </td>
                      )}

                      {/* TAC (Torneo de Alianza): Auto-check on power + accessible tactical checkbox */}
                      {activeEventTab === 'tac' && (
                        <>
                          <td className="py-3 px-3 text-center">
                            <TacticalCheckbox 
                              checked={act.tac_joined || false}
                              onChange={(val) => handleCellChange(member.id, 'tac_joined', val)}
                              title="Presiona Enter o Espacio para alternar"
                            />
                          </td>
                          <td className="py-3 px-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                            {formatPower(prevAct.tac_power || 0)}
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={act.tac_power || 0}
                              onChange={(val) => handleCellChange(member.id, 'tac_power', val)}
                              onEnterPress={() => handleCellChange(member.id, 'tac_joined', true)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-200 font-mono text-xs focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-3">
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

                      {/* VACUNAS: Team role & points */}
                      {activeEventTab === 'vacunas' && (
                        <>
                          <td className="py-3 px-3">
                            <VacunasRoleSelect
                              value={vacunasRole}
                              onChange={(role) => handleVacunasRoleChange(member.id, role)}
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <TacticalCheckbox
                              checked={act.lab_joined || vacunasRole !== 'none'}
                              onChange={(val) => handleCellChange(member.id, 'lab_joined', val)}
                              title="Marca asistencia (los suplentes cuentan como participantes)"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input 
                              type="number" 
                              value={act.lab_points || ''} 
                              onChange={(e) => handleCellChange(member.id, 'lab_points', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-200 font-mono text-xs focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                        </>
                      )}

                      {/* MORTEM: Prep points, Shield damage, Boss damage */}
                      {activeEventTab === 'mortem' && (
                        <>
                          <td className="py-3 px-3">
                            <input 
                              type="number"
                              value={mort.prep_points || ''}
                              onChange={(e) => handleMortemChange(member.id, 'prep_points', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-200 font-mono text-xs focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={mort.shield_damage || 0}
                              onChange={(val) => handleMortemChange(member.id, 'shield_damage', val)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-blue-300 font-mono text-xs focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={mort.damage || 0}
                              onChange={(val) => handleMortemChange(member.id, 'damage', val)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-neon-red font-mono text-xs focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-gray-300">
                            {formatPower((mort.damage || 0) + (mort.shield_damage || 0))}
                          </td>
                        </>
                      )}

                      {/* NEMESIS: 1 to 5 Stars selector */}
                      {activeEventTab === 'nemesis' && (
                        <>
                          <td className="py-3 px-3">
                            <PhaseSelect 
                              value={act.nemesis_phase || 1}
                              onChange={(val) => handleCellChange(member.id, 'nemesis_phase', val)}
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <NemesisStarsSelect 
                              value={act.nemesis_difficulty || '2★'}
                              onChange={(val) => handleCellChange(member.id, 'nemesis_difficulty', val)}
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input 
                              type="number" 
                              min="0" 
                              max="50" 
                              value={act.nemesis_level || ''} 
                              onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                if (val > 50) val = 50;
                                handleCellChange(member.id, 'nemesis_level', val);
                              }}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-200 font-mono text-xs focus:outline-none transition-colors px-2 py-1 text-center"
                            />
                          </td>
                        </>
                      )}

                      {/* CROCODILE */}
                      {activeEventTab === 'crocodile' && (
                        <>
                          <td className="py-3 px-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                            {formatPower(prevAct.crocodile_damage || 0)}
                          </td>
                          <td className="py-3 px-3">
                            <PowerInput 
                              value={act.crocodile_damage || 0}
                              onChange={(val) => handleCellChange(member.id, 'crocodile_damage', val)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-200 font-mono text-xs focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-3">
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
                          <td className="py-3 px-3 text-center">
                            <TacticalCheckbox 
                              checked={act.saint_valley || false}
                              onChange={(val) => handleCellChange(member.id, 'saint_valley', val)}
                            />
                          </td>
                          {activeCenters.map((center, i) => (
                            <td key={i} className="py-3 px-3 text-center">
                              <TacticalCheckbox 
                                checked={(act.security_centers_data || []).includes(center)}
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
                      {activeEventTab === 'wesker' && (
                        <>
                          <td className="py-3 px-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                            {(prevAct.wesker_points || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <input 
                              type="number" 
                              value={act.wesker_points || ''} 
                              onChange={(e) => handleCellChange(member.id, 'wesker_points', parseInt(e.target.value) || 0)}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-500 focus:border-neon-red focus:bg-black/50 text-gray-200 font-mono text-xs focus:outline-none transition-colors px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-3">
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

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 font-mono text-xs">
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

      {/* Supabase SQL Migration Modal */}
      <SupabaseSqlModal
        isOpen={isSqlOpen}
        onClose={() => setIsSqlOpen(false)}
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
