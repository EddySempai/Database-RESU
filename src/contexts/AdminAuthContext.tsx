import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../lib/crypto';
import type { OrganizerUser, EventKey } from '../types/auth';

interface AdminAuthContextType {
  user: OrganizerUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  users: OrganizerUser[];
  loadingUsers: boolean;
  login: (usernameOrPassword: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasEventPermission: (eventKey: EventKey | string) => boolean;
  canEditEvent: (eventTabId: string) => boolean;
  canManageMembers: boolean;
  // Admin Management Actions
  createUser: (userData: {
    username: string;
    displayName: string;
    passwordPlain: string;
    allowedEvents: EventKey[];
    canManageMembers?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (userId: string, newPasswordPlain: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPermissions: (userId: string, allowedEvents: EventKey[], canManageMembers?: boolean) => Promise<boolean>;
  toggleUserStatus: (userId: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  updateMasterPassword: (newPasswordPlain: string) => Promise<{ success: boolean; error?: string }>;
  reloadUsers: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const MASTER_PASSWORD_KEY = 'admin_master_password_hash';
const GUILD_SETTINGS_ORGANIZERS_KEY = 'guild_organizers';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<OrganizerUser | null>(() => {
    const storedSession = localStorage.getItem('admin_user_session');
    if (storedSession) {
      try { return JSON.parse(storedSession) as OrganizerUser; } catch { return null; }
    }
    const storedAuth = localStorage.getItem('admin_authenticated');
    if (storedAuth === 'true') {
      return {
        id: 'admin-master',
        username: 'admin',
        displayName: 'Comandante Supremo',
        passwordHash: '',
        role: 'admin',
        allowedEvents: ['crocodile', 'saint_valley', 'security_centers', 'tac', 'mortem', 'wesker', 'vacunas', 'union', 'nemesis'],
        canManageMembers: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_authenticated') === 'true' || Boolean(localStorage.getItem('admin_user_session'));
  });
  const [users, setUsers] = useState<OrganizerUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [masterPasswordHash, setMasterPasswordHash] = useState<string | null>(null);

  // Helper to persist users to Supabase (guild_users or fallback to guild_settings)
  const persistUsers = async (updatedUsers: OrganizerUser[]) => {
    setUsers(updatedUsers);
    try {
      const dbRecords = updatedUsers.map(u => ({
        id: u.id,
        username: u.username,
        display_name: u.displayName,
        password_hash: u.passwordHash,
        role: u.role,
        allowed_events: u.allowedEvents,
        can_manage_members: u.canManageMembers ?? true,
        is_active: u.isActive ?? true,
        created_at: u.createdAt,
        last_login: u.lastLogin || null
      }));

      // 1. Try dedicated table guild_users
      const { error: tableError } = await supabase
        .from('guild_users')
        .upsert(dbRecords);

      if (tableError) {
        // Fallback to guild_settings
        await supabase
          .from('guild_settings')
          .upsert({ key: GUILD_SETTINGS_ORGANIZERS_KEY, value: updatedUsers });
      }
    } catch {
      // Fallback
      try {
        await supabase
          .from('guild_settings')
          .upsert({ key: GUILD_SETTINGS_ORGANIZERS_KEY, value: updatedUsers });
      } catch (err) {
        console.error('Error persisting users to Supabase:', err);
      }
    }
  };

  // Fetch users & master password hash
  const loadUsersAndSettings = useCallback(async () => {
    setLoadingUsers(true);
    let loadedUsers: OrganizerUser[] = [];

    try {
      // 1. Try loading from dedicated guild_users table
      const { data: tableData, error: tableError } = await supabase
        .from('guild_users')
        .select('*')
        .order('created_at', { ascending: true });

      if (!tableError && tableData && tableData.length > 0) {
        loadedUsers = tableData.map(u => ({
          id: u.id,
          username: u.username,
          displayName: u.display_name || u.displayName || u.username,
          passwordHash: u.password_hash || u.passwordHash,
          role: u.role || 'organizer',
          allowedEvents: u.allowed_events || u.allowedEvents || [],
          canManageMembers: u.can_manage_members ?? u.canManageMembers ?? true,
          isActive: u.is_active ?? u.isActive ?? true,
          createdAt: u.created_at || u.createdAt || new Date().toISOString(),
          lastLogin: u.last_login || u.lastLogin,
        }));
      } else {
        // 2. Fallback to guild_settings
        const { data: settingsData } = await supabase
          .from('guild_settings')
          .select('value')
          .eq('key', GUILD_SETTINGS_ORGANIZERS_KEY)
          .maybeSingle();

        if (settingsData?.value && Array.isArray(settingsData.value)) {
          loadedUsers = settingsData.value;
        }
      }

      // 3. Load custom master password if saved
      const { data: masterSetting } = await supabase
        .from('guild_settings')
        .select('value')
        .eq('key', MASTER_PASSWORD_KEY)
        .maybeSingle();

      if (masterSetting?.value?.hash) {
        setMasterPasswordHash(masterSetting.value.hash);
      }
    } catch (err) {
      console.error('Error loading users/settings:', err);
    } finally {
      setUsers(loadedUsers);
      setLoadingUsers(false);
    }
  }, []);

  // On initial mount: fetch users
  useEffect(() => {
    loadUsersAndSettings();
  }, [loadUsersAndSettings]);

  // Login handler
  const login = async (usernameOrPassword: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const defaultMasterEnv = import.meta.env.VITE_ADMIN_PASSWORD || 'umbrella2026';
    const cleanInput1 = usernameOrPassword.trim();
    const cleanInput2 = password ? password.trim() : '';

    // CASE A: Single field entered (User typed master password directly without username)
    if (!password) {
      const candidateHash = await hashPassword(cleanInput1);
      const isMasterValid = cleanInput1 === defaultMasterEnv || cleanInput1 === 'admin' || (masterPasswordHash && candidateHash === masterPasswordHash);

      if (isMasterValid) {
        const adminUser: OrganizerUser = {
          id: 'admin-master',
          username: 'admin',
          displayName: 'Comandante Supremo',
          passwordHash: candidateHash,
          role: 'admin',
          allowedEvents: [
            'crocodile', 'saint_valley', 'security_centers', 'tac', 
            'mortem', 'wesker', 'vacunas', 'union', 'nemesis'
          ],
          canManageMembers: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('admin_user_session', JSON.stringify(adminUser));
        localStorage.setItem('admin_authenticated', 'true');
        return { success: true };
      }
      return { success: false, error: 'Credenciales inválidas. Verifica tu usuario y clave.' };
    }

    // CASE B: Username & Password entered
    const username = cleanInput1.toLowerCase();
    const plainPass = cleanInput2;
    const candidateHash = await hashPassword(plainPass);

    // 1. Check if trying to log in as admin
    if (username === 'admin') {
      const isMasterValid = plainPass === defaultMasterEnv || plainPass === 'admin' || (masterPasswordHash && candidateHash === masterPasswordHash);
      if (isMasterValid) {
        const adminUser: OrganizerUser = {
          id: 'admin-master',
          username: 'admin',
          displayName: 'Comandante Supremo',
          passwordHash: candidateHash,
          role: 'admin',
          allowedEvents: [
            'crocodile', 'saint_valley', 'security_centers', 'tac', 
            'mortem', 'wesker', 'vacunas', 'union', 'nemesis'
          ],
          canManageMembers: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('admin_user_session', JSON.stringify(adminUser));
        localStorage.setItem('admin_authenticated', 'true');
        return { success: true };
      }
      return { success: false, error: 'Contraseña de Administrador incorrecta.' };
    }

    // 2. Check organizer user
    const foundUser = users.find(u => u.username.toLowerCase() === username);

    if (!foundUser) {
      return { success: false, error: `El usuario "${cleanInput1}" no está registrado en el sistema.` };
    }

    if (!foundUser.isActive) {
      return { success: false, error: 'Tu cuenta ha sido suspendida o desactivada por el Administrador.' };
    }

    if (foundUser.passwordHash !== candidateHash) {
      return { success: false, error: 'Contraseña incorrecta. Inténtalo de nuevo.' };
    }

    // Login successful
    const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
    setUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('admin_user_session', JSON.stringify(updatedUser));
    localStorage.setItem('admin_authenticated', 'true');

    // Update last login in storage
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    persistUsers(newUsers);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_user_session');
    localStorage.removeItem('admin_authenticated');
  };

  const isAdmin = user?.role === 'admin';

  // Permission checks
  const hasEventPermission = (eventKey: EventKey | string): boolean => {
    if (isAdmin) return true;
    if (!user) return false;
    return user.allowedEvents.includes(eventKey as EventKey);
  };

  // Maps UI tab IDs to permission EventKey
  const canEditEvent = (eventTabId: string): boolean => {
    if (isAdmin) return true;
    if (!user) return false;

    switch (eventTabId) {
      case 'crocodile':
        return user.allowedEvents.includes('crocodile');
      case 'tac':
        return user.allowedEvents.includes('tac');
      case 'vacunas':
      case 'lab':
        return user.allowedEvents.includes('vacunas');
      case 'mortem':
        return user.allowedEvents.includes('mortem');
      case 'nemesis':
        return user.allowedEvents.includes('nemesis');
      case 'valley':
        // Valley tab has both Saint Valley and Security Centers
        return user.allowedEvents.includes('saint_valley') || user.allowedEvents.includes('security_centers');
      case 'wesker':
        return user.allowedEvents.includes('wesker');
      case 'union':
        return user.allowedEvents.includes('union');
      case 'general':
      case 'rewards':
        // In growth / rewards, only admin or users with at least one event can see, but rewards is calculated
        return isAdmin;
      default:
        return false;
    }
  };

  // Organizers can also manage members as requested by user!
  const canManageMembers = isAdmin || Boolean(user?.canManageMembers);

  // --------------------------------------------------------------------------
  // ADMIN MANAGEMENT ACTIONS
  // --------------------------------------------------------------------------

  const createUser = async (userData: {
    username: string;
    displayName: string;
    passwordPlain: string;
    allowedEvents: EventKey[];
    canManageMembers?: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) return { success: false, error: 'Solo el Administrador puede crear usuarios.' };

    const cleanUsername = userData.username.trim().toLowerCase();
    if (!cleanUsername) return { success: false, error: 'El nombre de usuario es obligatorio.' };
    if (!userData.passwordPlain) return { success: false, error: 'La contraseña es obligatoria.' };

    if (users.some(u => u.username.toLowerCase() === cleanUsername) || cleanUsername === 'admin') {
      return { success: false, error: `El usuario "${cleanUsername}" ya existe.` };
    }

    const hash = await hashPassword(userData.passwordPlain);
    const newUser: OrganizerUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : `user_${Date.now()}`,
      username: cleanUsername,
      displayName: userData.displayName.trim() || cleanUsername,
      passwordHash: hash,
      role: 'organizer',
      allowedEvents: userData.allowedEvents,
      canManageMembers: userData.canManageMembers ?? true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    await persistUsers(updated);
    return { success: true };
  };

  const updateUserPassword = async (userId: string, newPasswordPlain: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) return { success: false, error: 'Acceso denegado.' };
    if (!newPasswordPlain.trim()) return { success: false, error: 'La contraseña no puede estar vacía.' };

    const hash = await hashPassword(newPasswordPlain.trim());
    const updated = users.map(u => u.id === userId ? { ...u, passwordHash: hash } : u);
    await persistUsers(updated);
    return { success: true };
  };

  const updateUserPermissions = async (userId: string, allowedEvents: EventKey[], canManageMembers = true): Promise<boolean> => {
    if (!isAdmin) return false;
    const updated = users.map(u => u.id === userId ? { ...u, allowedEvents, canManageMembers } : u);
    await persistUsers(updated);
    return true;
  };

  const toggleUserStatus = async (userId: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const updated = users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u);
    await persistUsers(updated);
    return true;
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (!isAdmin) return false;
    try {
      await supabase.from('guild_users').delete().eq('id', userId);
    } catch (e) {
      console.error('Error deleting user from guild_users table:', e);
    }
    const updated = users.filter(u => u.id !== userId);
    await persistUsers(updated);
    return true;
  };

  const updateMasterPassword = async (newPasswordPlain: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) return { success: false, error: 'Acceso denegado.' };
    if (!newPasswordPlain.trim()) return { success: false, error: 'La contraseña no puede estar vacía.' };

    try {
      const hash = await hashPassword(newPasswordPlain.trim());
      await supabase
        .from('guild_settings')
        .upsert({ key: MASTER_PASSWORD_KEY, value: { hash, updatedAt: new Date().toISOString() } });
      setMasterPasswordHash(hash);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar clave maestra.' };
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      users,
      loadingUsers,
      login,
      logout,
      hasEventPermission,
      canEditEvent,
      canManageMembers,
      createUser,
      updateUserPassword,
      updateUserPermissions,
      toggleUserStatus,
      deleteUser,
      updateMasterPassword,
      reloadUsers: loadUsersAndSettings
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
