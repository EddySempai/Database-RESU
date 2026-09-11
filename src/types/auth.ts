export type UserRole = 'admin' | 'organizer';

export type EventKey = 
  | 'crocodile'
  | 'saint_valley'
  | 'security_centers'
  | 'tac'
  | 'mortem'
  | 'wesker'
  | 'vacunas'
  | 'union'
  | 'nemesis';

export interface EventDefinition {
  id: EventKey;
  label: string;
  shortName: string;
  defaultSchedule?: string;
  periodicity?: string;
  points: number;
}

export const ALLIANCE_EVENTS: EventDefinition[] = [
  { id: 'crocodile', label: 'Caimán / Cocodrilo', shortName: 'Cocodrilo', periodicity: 'Cada 2 días', points: 1 },
  { id: 'saint_valley', label: 'Saint Vale (Valle Santo)', shortName: 'Saint Vale', periodicity: 'Sábados (Cada 2 semanas)', points: 5 },
  { id: 'security_centers', label: 'Centros de Seguridad', shortName: 'Centros', periodicity: 'Viernes (Semanal)', points: 2 },
  { id: 'tac', label: 'Torneo T.A.C.', shortName: 'T.A.C.', periodicity: 'Semanal', points: 2 },
  { id: 'mortem', label: 'Mortem (Escudo y Daño)', shortName: 'Mortem', periodicity: 'Semanal', points: 3 },
  { id: 'wesker', label: 'Desafío Wesker', shortName: 'Wesker', periodicity: 'Cada 2 semanas (2 días)', points: 4 },
  { id: 'vacunas', label: 'Laboratorio de Vacunas', shortName: 'Vacunas', periodicity: 'Cada 2 semanas', points: 5 },
  { id: 'union', label: 'Unión de la Alianza', shortName: 'Unión', periodicity: 'Cada 2 semanas (7 días)', points: 4 },
  { id: 'nemesis', label: 'Némesis', shortName: 'Némesis', periodicity: 'Cada 3 a 4 semanas', points: 2 },
];

export interface OrganizerUser {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  allowedEvents: EventKey[];
  canManageMembers: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}
