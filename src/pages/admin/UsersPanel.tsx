import React, { useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useSound } from '../../contexts/SoundContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ALLIANCE_EVENTS, type EventKey, type OrganizerUser } from '../../types/auth';
import { 
  UserPlus, Key, ShieldCheck, ShieldAlert, Edit2, 
  Trash2, Check, X, Users, Loader2
} from 'lucide-react';
import { AdminModal, type AdminModalType } from '../../components/admin/AdminModal';

export const UsersPanel = () => {
  const { playClick, playHover } = useSound();
  const { isDark } = useTheme();
  const { 
    users, 
    loadingUsers, 
    createUser, 
    updateUserPassword, 
    updateUserPermissions, 
    toggleUserStatus, 
    deleteUser,
    updateMasterPassword 
  } = useAdminAuth();

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEvents, setNewEvents] = useState<EventKey[]>([]);
  const [newCanManageMembers, setNewCanManageMembers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit permissions modal state
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<OrganizerUser | null>(null);
  const [editEvents, setEditEvents] = useState<EventKey[]>([]);
  const [editCanManage, setEditCanManage] = useState(true);

  // Change password modal state
  const [changingPassUser, setChangingPassUser] = useState<OrganizerUser | null>(null);
  const [newPassInput, setNewPassInput] = useState('');

  // Master password change state
  const [showMasterPassModal, setShowMasterPassModal] = useState(false);
  const [masterPassInput, setMasterPassInput] = useState('');

  // General alert modal
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: AdminModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: ''
  });

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  // Event selection toggles
  const toggleNewEvent = (ev: EventKey) => {
    playClick();
    setNewEvents(prev => 
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  const toggleEditEvent = (ev: EventKey) => {
    playClick();
    setEditEvents(prev => 
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  const selectAllNewEvents = () => {
    playClick();
    if (newEvents.length === ALLIANCE_EVENTS.length) {
      setNewEvents([]);
    } else {
      setNewEvents(ALLIANCE_EVENTS.map(e => e.id));
    }
  };

  // Submit create user
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setSubmitting(true);

    try {
      const res = await createUser({
        username: newUsername,
        displayName: newDisplayName,
        passwordPlain: newPassword,
        allowedEvents: newEvents,
        canManageMembers: newCanManageMembers
      });

      if (res.success) {
        setNewUsername('');
        setNewDisplayName('');
        setNewPassword('');
        setNewEvents([]);
        setShowCreateForm(false);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Organizador Creado',
          message: 'El nuevo organizador ha sido registrado y ya puede iniciar sesión con sus permisos configurados.'
        });
      } else {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Error al Crear',
          message: res.error || 'No se pudo crear el organizador.'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Submit change password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changingPassUser || !newPassInput.trim()) return;
    playClick();

    const res = await updateUserPassword(changingPassUser.id, newPassInput);
    if (res.success) {
      setChangingPassUser(null);
      setNewPassInput('');
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Contraseña Actualizada',
        message: `La clave de ${changingPassUser.displayName} ha sido modificada con éxito.`
      });
    } else {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: res.error || 'Error al actualizar contraseña.'
      });
    }
  };

  // Submit edit permissions
  const handlePermissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPermissionsUser) return;
    playClick();

    const success = await updateUserPermissions(editingPermissionsUser.id, editEvents, editCanManage);
    if (success) {
      setEditingPermissionsUser(null);
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Permisos Actualizados',
        message: `Los permisos de eventos de ${editingPermissionsUser.displayName} se actualizaron correctamente.`
      });
    } else {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudieron actualizar los permisos.'
      });
    }
  };

  // Submit master password
  const handleMasterPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassInput.trim()) return;
    playClick();

    const res = await updateMasterPassword(masterPassInput);
    if (res.success) {
      setShowMasterPassModal(false);
      setMasterPassInput('');
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Clave Maestra Actualizada',
        message: 'Tu contraseña de Administrador ha sido actualizada de forma segura.'
      });
    } else {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: res.error || 'Error al cambiar clave maestra.'
      });
    }
  };

  // Confirm delete user
  const confirmDelete = (u: OrganizerUser) => {
    playClick();
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Eliminar Organizador',
      message: `¿Estás seguro de que deseas eliminar permanentemente la cuenta de "${u.displayName}" (@${u.username})?`,
      onConfirm: async () => {
        closeModal();
        await deleteUser(u.id);
      }
    });
  };

  return (
    <div className="h-full w-full min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-5 custom-scrollbar">
      <div className="flex flex-col gap-6 max-w-[1600px] w-full min-w-0 mx-auto">
      
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl shadow-sm border ${
        isDark ? 'bg-[#090909] border-gray-800/80' : 'bg-white border-black'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-neon-red animate-pulse" />
            <h2 className={`font-bebas text-2xl sm:text-3xl tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Control de Accesos & Organizadores
            </h2>
          </div>
          <p className={`font-mono text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Gestiona líderes, asigna permisos de eventos y administra credenciales tácticas.
          </p>
        </div>

        <div className="flex gap-2.5 items-center flex-wrap">
          {/* Change Master Password */}
          <button
            onClick={() => { playClick(); setShowMasterPassModal(true); }}
            onMouseEnter={playHover}
            className={`px-3.5 py-2 font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors rounded-xl border ${
              isDark 
                ? 'bg-black border-gray-700 text-gray-300 hover:text-white hover:border-gray-500' 
                : 'bg-slate-100 border-black text-slate-700 hover:bg-slate-200 shadow-sm'
            }`}
          >
            <Key size={14} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span>Clave Maestra Admin</span>
          </button>

          {/* Add Organizer Button */}
          <button
            onClick={() => { playClick(); setShowCreateForm(!showCreateForm); }}
            onMouseEnter={playHover}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all rounded-xl border ${
              isDark 
                ? 'bg-blood-red/20 border-blood-red text-white hover:bg-blood-red shadow-[0_0_12px_rgba(255,42,42,0.2)]' 
                : 'bg-rose-100 border-black text-rose-700 hover:bg-rose-600 hover:text-white shadow-sm'
            }`}
          >
            <UserPlus size={15} />
            <span>{showCreateForm ? 'Cerrar Formulario' : 'Nuevo Organizador'}</span>
          </button>
        </div>
      </div>

      {/* CREATE ORGANIZER FORM (COLLAPSIBLE) */}
      {showCreateForm && (
        <div className={`p-5 rounded-2xl shadow-xl animate-fade-in border ${
          isDark ? 'bg-[#0b0b0b] border-blood-red/40' : 'bg-white border-black shadow-sm'
        }`}>
          <div className={`flex items-center justify-between pb-3 mb-4 border-b ${isDark ? 'border-gray-800' : 'border-black'}`}>
            <div className="flex items-center gap-2">
              <UserPlus size={18} className={isDark ? 'text-neon-red' : 'text-rose-600'} />
              <h3 className={`font-bebas text-xl tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Crear Nuevo Acceso de Organizador
              </h3>
            </div>
            <button 
              onClick={() => setShowCreateForm(false)} 
              className={isDark ? "text-gray-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Username */}
              <div>
                <label className={`block font-mono text-[11px] uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Usuario (Login único) *
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="ej: jxx.taek o sebastian"
                  className={`w-full px-3 py-2 font-mono text-xs focus:outline-none focus:border-rose-500 rounded-xl border ${
                    isDark ? 'bg-black border-gray-700 text-white' : 'bg-white border-black text-slate-900 shadow-sm'
                  }`}
                />
              </div>

              {/* Display Name */}
              <div>
                <label className={`block font-mono text-[11px] uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Nombre Táctico / Apodo
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="ej: Taek o King Sebastian"
                  className={`w-full px-3 py-2 font-mono text-xs focus:outline-none focus:border-rose-500 rounded-xl border ${
                    isDark ? 'bg-black border-gray-700 text-white' : 'bg-white border-black text-slate-900 shadow-sm'
                  }`}
                />
              </div>

              {/* Password */}
              <div>
                <label className={`block font-mono text-[11px] uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Contraseña Inicial *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full px-3 py-2 font-mono text-xs focus:outline-none focus:border-rose-500 rounded-xl border ${
                    isDark ? 'bg-black border-gray-700 text-white' : 'bg-white border-black text-slate-900 shadow-sm'
                  }`}
                />
              </div>
            </div>

            {/* Event Permissions Grid */}
            <div className={`mt-4 pt-3 border-t ${isDark ? 'border-gray-800/80' : 'border-black/20'}`}>
              <div className="flex items-center justify-between mb-2.5">
                <label className={`font-mono text-xs uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-slate-800 font-bold'}`}>
                  <ShieldCheck size={14} className={isDark ? 'text-neon-red' : 'text-rose-600'} />
                  <span>Eventos Autorizados para Modificar:</span>
                </label>
                <button
                  type="button"
                  onClick={selectAllNewEvents}
                  className={`font-mono text-[11px] underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-black'}`}
                >
                  {newEvents.length === ALLIANCE_EVENTS.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {ALLIANCE_EVENTS.map(ev => {
                  const isSelected = newEvents.includes(ev.id);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => toggleNewEvent(ev.id)}
                      className={`p-2.5 border rounded-xl text-left transition-all font-mono text-xs flex flex-col justify-between ${
                        isSelected 
                          ? (isDark ? 'bg-blood-red/20 border-neon-red text-white shadow-[0_0_10px_rgba(255,42,42,0.15)]' : 'bg-rose-100 border-black text-rose-800 font-bold shadow-sm')
                          : (isDark ? 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300' : 'bg-slate-50 border-black/40 text-slate-700 hover:border-black')
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold truncate">{ev.shortName}</span>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] border ${
                          isSelected 
                            ? (isDark ? 'bg-neon-red text-black border-neon-red font-bold' : 'bg-rose-600 text-white border-black font-bold') 
                            : (isDark ? 'border-gray-700' : 'border-slate-400')
                        }`}>
                          {isSelected ? '✓' : ''}
                        </span>
                      </div>
                      <span className={`text-[10px] truncate ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{ev.periodicity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Member Management Privilege Checkbox */}
            <div className={`mt-3 p-3 rounded-xl border flex items-center gap-3 ${
              isDark ? 'bg-black/60 border-gray-800' : 'bg-slate-50 border-black'
            }`}>
              <input
                type="checkbox"
                id="can-manage-members"
                checked={newCanManageMembers}
                onChange={(e) => setNewCanManageMembers(e.target.checked)}
                className="accent-neon-red w-4 h-4 cursor-pointer"
              />
              <label htmlFor="can-manage-members" className={`font-mono text-xs cursor-pointer ${isDark ? 'text-gray-300' : 'text-slate-800'}`}>
                <strong>Permitir Gestión de Operativos:</strong> El organizador podrá registrar, editar y dar de baja miembros en la alianza.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className={`px-4 py-2 border font-mono text-xs uppercase tracking-wider rounded-xl transition-colors ${
                  isDark ? 'border-gray-800 text-gray-400 hover:text-white' : 'border-black text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blood-red border border-neon-red text-white font-mono text-xs uppercase tracking-widest hover:bg-red-700 transition-colors rounded-xl shadow-[0_0_15px_rgba(255,42,42,0.3)] disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                <span>Guardar Organizador</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* USERS TABLE */}
      <div className={`rounded-2xl overflow-hidden shadow-sm border ${
        isDark ? 'bg-[#090909] border-gray-800/80' : 'bg-white border-black'
      }`}>
        <div className={`p-3 sm:p-4 border-b flex items-center justify-between ${
          isDark ? 'bg-black/40 border-gray-800' : 'bg-slate-50 border-black'
        }`}>
          <div className="flex items-center gap-2">
            <Users size={16} className={isDark ? 'text-neon-red' : 'text-rose-600'} />
            <h3 className={`font-bebas text-lg sm:text-xl tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Lista de Organizadores y Oficiales Registrados
            </h3>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-lg border ${
              isDark ? 'text-gray-500 bg-white/5 border-gray-800' : 'text-slate-700 bg-white border-black'
            }`}>
              {users.length} cuentas
            </span>
          </div>
        </div>

        {loadingUsers ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className={`animate-spin ${isDark ? 'text-neon-red' : 'text-rose-600'}`} size={28} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className={`border-b ${isDark ? 'bg-[#111] border-gray-800' : 'bg-slate-100 border-black'}`}>
                <tr>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Usuario & Apodo</th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-28 text-center ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Rol</th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Eventos Autorizados</th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-28 text-center ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Miembros</th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-3 w-24 text-center ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Estado</th>
                  <th className={`font-mono text-[11px] uppercase tracking-widest py-3 px-4 w-48 text-right ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-800/40' : 'divide-slate-200'}`}>
                {/* Admin Master Row */}
                <tr className={isDark ? "bg-blood-red/5 hover:bg-blood-red/10 transition-colors" : "bg-rose-50 hover:bg-rose-100 transition-colors"}>
                  <td className={`py-3 px-4 font-mono text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isDark ? 'text-neon-red' : 'text-rose-600'}`}>admin</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                          isDark ? 'bg-red-950/60 border-neon-red/40 text-red-300' : 'bg-red-100 border-red-300 text-red-700'
                        }`}>
                          Master
                        </span>
                      </div>
                      <span className={`font-mono text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Comandante Supremo</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-950/40 border border-red-800 text-red-300 uppercase font-bold">
                      Admin
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">
                    <span className="text-amber-400 font-semibold">Acceso Total a todos los 9 Eventos</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-green-400 font-mono text-xs">Total</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-green-950/40 border border-green-800 text-green-400 uppercase">
                      Activo
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => { playClick(); setShowMasterPassModal(true); }}
                      className="text-xs font-mono text-amber-400 hover:text-amber-300 underline"
                    >
                      Cambiar Clave
                    </button>
                  </td>
                </tr>

                {/* Organizer Users */}
                {users.map(u => (
                  <tr key={u.id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                    <td className={`py-3 px-4 font-mono text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <div className="flex flex-col">
                        <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>@{u.username}</span>
                        <span className={`font-mono text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{u.displayName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase font-medium ${
                        isDark ? 'bg-blue-950/40 border-blue-800 text-blue-300' : 'bg-blue-100 border-blue-300 text-blue-700'
                      }`}>
                        Organizador
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.allowedEvents.length === 0 ? (
                          <span className={`font-mono text-[11px] italic ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>Sin eventos asignados</span>
                        ) : (
                          u.allowedEvents.map(evId => {
                            const def = ALLIANCE_EVENTS.find(e => e.id === evId);
                            return (
                              <span 
                                key={evId} 
                                className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                                  isDark ? 'bg-black border-gray-700 text-gray-300' : 'bg-white border-slate-300 text-slate-700 shadow-sm'
                                }`}
                              >
                                {def?.shortName || evId}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-xs">
                      {u.canManageMembers ? (
                        <span className="text-green-500 font-bold" title="Puede agregar/editar/quitar miembros">Sí</span>
                      ) : (
                        <span className={isDark ? "text-gray-600" : "text-slate-400"}>No</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold border transition-colors ${
                          u.isActive 
                            ? (isDark ? 'bg-green-950/30 border-green-800 text-green-400 hover:bg-green-900/40' : 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200')
                            : (isDark ? 'bg-red-950/30 border-red-900 text-red-400 hover:bg-red-900/40' : 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200')
                        }`}
                        title="Haz clic para alternar activo/suspendido"
                      >
                        {u.isActive ? 'Activo' : 'Suspendido'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Permissions */}
                        <button
                          onClick={() => {
                            playClick();
                            setEditingPermissionsUser(u);
                            setEditEvents(u.allowedEvents);
                            setEditCanManage(u.canManageMembers);
                          }}
                          className={`p-1.5 rounded-xl transition-colors border ${
                            isDark ? 'text-gray-400 hover:text-white hover:bg-white/10 border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-black/30 shadow-sm'
                          }`}
                          title="Modificar permisos de eventos"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Change Password */}
                        <button
                          onClick={() => {
                            playClick();
                            setChangingPassUser(u);
                            setNewPassInput('');
                          }}
                          className={`p-1.5 rounded-xl transition-colors border ${
                            isDark ? 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 border-transparent' : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50 border-black/30 shadow-sm'
                          }`}
                          title="Cambiar contraseña de este organizador"
                        >
                          <Key size={13} />
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => confirmDelete(u)}
                          className={`p-1.5 rounded-xl transition-colors border ${
                            isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 border-transparent' : 'text-slate-600 hover:text-red-600 hover:bg-red-50 border-black/30 shadow-sm'
                          }`}
                          title="Eliminar permanentemente a este organizador"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className={`py-8 text-center font-mono text-xs ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                      No hay organizadores creados todavía. Haz clic en "Nuevo Organizador" para registrar cuentas para tus oficiales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: EDIT PERMISSIONS */}
      {editingPermissionsUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl animate-fade-in border ${
            isDark ? 'bg-[#0e0e0e] border-gray-700 text-white' : 'bg-white border-black text-slate-900 shadow-xl'
          }`}>
            <div className={`flex justify-between items-center pb-3 mb-4 border-b ${isDark ? 'border-gray-800' : 'border-black'}`}>
              <div className="flex items-center gap-2">
                <Edit2 size={16} className={isDark ? 'text-neon-red' : 'text-rose-600'} />
                <h3 className={`font-bebas text-xl tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Permisos de: {editingPermissionsUser.displayName} (@{editingPermissionsUser.username})
                </h3>
              </div>
              <button onClick={() => setEditingPermissionsUser(null)} className={isDark ? "text-gray-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePermissionsSubmit} className="space-y-4">
              <p className={`font-mono text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                Selecciona los eventos que este organizador podrá auditar y modificar:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALLIANCE_EVENTS.map(ev => {
                  const isSelected = editEvents.includes(ev.id);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => toggleEditEvent(ev.id)}
                      className={`p-2 border rounded-xl text-left transition-all font-mono text-xs flex justify-between items-center ${
                        isSelected 
                          ? (isDark ? 'bg-blood-red/20 border-neon-red text-white' : 'bg-rose-100 border-black text-rose-800 font-bold shadow-sm')
                          : (isDark ? 'bg-black border-gray-800 text-gray-400 hover:border-gray-700' : 'bg-slate-50 border-black/40 text-slate-700 hover:border-black')
                      }`}
                    >
                      <span className="truncate">{ev.shortName}</span>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] border ${
                        isSelected 
                          ? (isDark ? 'bg-neon-red text-black border-neon-red font-bold' : 'bg-rose-600 text-white border-black font-bold') 
                          : (isDark ? 'border-gray-700' : 'border-slate-400')
                      }`}>
                        {isSelected ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={`pt-3 border-t flex items-center gap-3 ${isDark ? 'border-gray-800' : 'border-black/20'}`}>
                <input
                  type="checkbox"
                  id="edit-can-manage"
                  checked={editCanManage}
                  onChange={(e) => setEditCanManage(e.target.checked)}
                  className="accent-neon-red w-4 h-4 cursor-pointer"
                />
                <label htmlFor="edit-can-manage" className={`font-mono text-xs cursor-pointer ${isDark ? 'text-gray-300' : 'text-slate-800'}`}>
                  Permitir gestión de operativos (agregar/editar/eliminar)
                </label>
              </div>

              <div className={`flex justify-end gap-3 pt-3 border-t ${isDark ? 'border-gray-800' : 'border-black/20'}`}>
                <button
                  type="button"
                  onClick={() => setEditingPermissionsUser(null)}
                  className={`px-4 py-2 border font-mono text-xs uppercase rounded-xl transition-colors ${
                    isDark ? 'border-gray-800 text-gray-400 hover:text-white' : 'border-black text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blood-red border border-neon-red text-white font-mono text-xs uppercase tracking-wider hover:bg-red-700 rounded-xl shadow-[0_0_12px_rgba(255,42,42,0.25)]"
                >
                  Actualizar Permisos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE USER PASSWORD */}
      {changingPassUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl animate-fade-in border ${
            isDark ? 'bg-[#0e0e0e] border-gray-700 text-white' : 'bg-white border-black text-slate-900 shadow-xl'
          }`}>
            <div className={`flex justify-between items-center pb-3 mb-4 border-b ${isDark ? 'border-gray-800' : 'border-black'}`}>
              <div className="flex items-center gap-2">
                <Key size={16} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                <h3 className={`font-bebas text-xl tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Cambiar Contraseña: @{changingPassUser.username}
                </h3>
              </div>
              <button onClick={() => setChangingPassUser(null)} className={isDark ? "text-gray-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={`block font-mono text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Nueva Contraseña para {changingPassUser.displayName}:
                </label>
                <input
                  type="password"
                  required
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="Escribe la nueva contraseña..."
                  className={`w-full px-3 py-2 font-mono text-xs focus:outline-none focus:border-amber-500 rounded-xl border ${
                    isDark ? 'bg-black border-gray-700 text-white' : 'bg-white border-black text-slate-900 shadow-sm'
                  }`}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setChangingPassUser(null)}
                  className={`px-4 py-2 border font-mono text-xs uppercase rounded-xl transition-colors ${
                    isDark ? 'border-gray-800 text-gray-400 hover:text-white' : 'border-black text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600/30 border border-amber-500 text-amber-400 font-mono text-xs uppercase tracking-wider hover:bg-amber-600 hover:text-white rounded-xl shadow-sm"
                >
                  Guardar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE MASTER PASSWORD */}
      {showMasterPassModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl animate-fade-in border ${
            isDark ? 'bg-[#0e0e0e] border-blood-red/60 text-white' : 'bg-white border-black text-slate-900 shadow-xl'
          }`}>
            <div className={`flex justify-between items-center pb-3 mb-4 border-b ${isDark ? 'border-gray-800' : 'border-black'}`}>
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className={isDark ? 'text-neon-red' : 'text-rose-600'} />
                <h3 className={`font-bebas text-xl tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Cambiar Contraseña Maestra (Admin)
                </h3>
              </div>
              <button onClick={() => setShowMasterPassModal(false)} className={isDark ? "text-gray-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMasterPassSubmit} className="space-y-4">
              <div>
                <label className={`block font-mono text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Nueva Clave Maestra de Administrador:
                </label>
                <input
                  type="password"
                  required
                  value={masterPassInput}
                  onChange={(e) => setMasterPassInput(e.target.value)}
                  placeholder="Escribe tu nueva clave maestra..."
                  className={`w-full px-3 py-2 font-mono text-xs focus:outline-none focus:border-rose-500 rounded-xl border ${
                    isDark ? 'bg-black border-gray-700 text-white' : 'bg-white border-black text-slate-900 shadow-sm'
                  }`}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMasterPassModal(false)}
                  className={`px-4 py-2 border font-mono text-xs uppercase rounded-xl transition-colors ${
                    isDark ? 'border-gray-800 text-gray-400 hover:text-white' : 'border-black text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blood-red border border-neon-red text-white font-mono text-xs uppercase tracking-wider hover:bg-red-700 rounded-xl shadow-[0_0_15px_rgba(255,42,42,0.25)]"
                >
                  Guardar Clave Maestra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
};
export default UsersPanel;
