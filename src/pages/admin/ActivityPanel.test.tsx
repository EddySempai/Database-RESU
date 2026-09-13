import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActivityPanel from './ActivityPanel';

// Mock contexts
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: true }),
}));

vi.mock('../../contexts/SoundContext', () => ({
  useSound: () => ({ playHover: vi.fn(), playClick: vi.fn() }),
}));

vi.mock('../../contexts/AdminAuthContext', () => ({
  useAdminAuth: () => ({
    user: { email: 'admin@test.com' },
    isAdmin: true,
    canEditEvent: vi.fn().mockReturnValue(true),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  }
}));

const { mockSupabase } = vi.hoisted(() => {
  return {
    mockSupabase: {
      from: vi.fn(),
    }
  };
});

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('ActivityPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles empty state and renders', async () => {
    const mockOrder2 = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
    const mockEqMem = vi.fn().mockReturnValue({ order: mockOrder1 });
    
    const mockEqEmpty = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockEqSettings = vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: null }) });
    
    const mockLte = vi.fn().mockReturnValue({ gte: vi.fn().mockResolvedValue({ data: [] }) });
    const mockLt = vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [] }) });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'members') return { select: vi.fn().mockReturnValue({ eq: mockEqMem }) };
      if (table === 'guild_activity_cycles') {
        return { 
          select: vi.fn().mockReturnValue({ 
            eq: mockEqEmpty,
            lt: mockLt,
            lte: mockLte
          }) 
        };
      }
      if (table === 'guild_settings') return { select: vi.fn().mockReturnValue({ eq: mockEqSettings }) };
      return { select: vi.fn(), insert: vi.fn() };
    });

    render(<ActivityPanel activeAlliance="Test Alliance" />);
    
    // Check if the component finishes loading and renders the empty state or table headers
    await waitFor(() => {
      // Look for a table header or an empty state message
      expect(screen.getByText(/Operativos:/i)).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    const mockOrder2 = vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') });
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
    const mockEqMem = vi.fn().mockReturnValue({ order: mockOrder1 });
    
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'members') return { select: vi.fn().mockReturnValue({ eq: mockEqMem }) };
      // other calls will just return null/empty to simulate failure cascade
      return { select: vi.fn().mockReturnValue({ 
        eq: vi.fn().mockResolvedValue({ data: [], error: new Error('Error') }),
        lt: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [] }) }),
        lte: vi.fn().mockReturnValue({ gte: vi.fn().mockResolvedValue({ data: [] }) }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null })
      }) };
    });

    render(<ActivityPanel activeAlliance="Test Alliance" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Operativos:/i)).toBeInTheDocument();
    });
  });
});
