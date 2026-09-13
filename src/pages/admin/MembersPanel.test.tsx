import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MembersPanel from './MembersPanel';

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDark: true }),
}));

vi.mock('../../contexts/SoundContext', () => ({
  useSound: () => ({ playHover: vi.fn(), playClick: vi.fn() }),
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

describe('MembersPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders members and handles loading state', async () => {
    // Mock Supabase chained calls
    const mockOrder2 = vi.fn().mockResolvedValue({ 
      data: [{ id: '1', nickname: 'TestMember', rank: 'R4', account_type: 'main', power: 1000, status: 'active', alliance_name: 'Test' }], 
      error: null 
    });
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
    const mockEqMem = vi.fn().mockReturnValue({ order: mockOrder1 });
    
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { value: {} } });
    const mockEqAlias = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'members') {
        return { select: vi.fn().mockReturnValue({ eq: mockEqMem }) };
      }
      if (table === 'guild_settings') {
        return { select: vi.fn().mockReturnValue({ eq: mockEqAlias }) };
      }
      return { select: vi.fn(), insert: vi.fn() };
    });

    render(<MembersPanel activeAlliance="Test" />);
    
    // Initially shows loading
    expect(screen.queryByText('TestMember')).not.toBeInTheDocument();
    
    // After fetch
    await waitFor(() => {
      expect(screen.getByText('TestMember')).toBeInTheDocument();
    });
  });

  it('handles empty state', async () => {
    const mockOrder2 = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
    const mockEqMem = vi.fn().mockReturnValue({ order: mockOrder1 });
    
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { value: {} } });
    const mockEqAlias = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'members') {
        return { select: vi.fn().mockReturnValue({ eq: mockEqMem }) };
      }
      if (table === 'guild_settings') {
        return { select: vi.fn().mockReturnValue({ eq: mockEqAlias }) };
      }
      return { select: vi.fn(), insert: vi.fn() };
    });

    render(<MembersPanel activeAlliance="Test" />);
    
    await waitFor(() => {
      expect(screen.getByText(/No se encontraron operativos que coincidan con los filtros actuales/)).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    const mockOrder2 = vi.fn().mockResolvedValue({ data: null, error: new Error('Supabase error') });
    const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
    const mockEqMem = vi.fn().mockReturnValue({ order: mockOrder1 });
    
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: new Error('Settings error') });
    const mockEqAlias = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'members') {
        return { select: vi.fn().mockReturnValue({ eq: mockEqMem }) };
      }
      if (table === 'guild_settings') {
        return { select: vi.fn().mockReturnValue({ eq: mockEqAlias }) };
      }
      return { select: vi.fn(), insert: vi.fn() };
    });

    render(<MembersPanel activeAlliance="Test" />);
    
    await waitFor(() => {
      expect(screen.getByText(/No se encontraron operativos que coincidan con los filtros actuales/)).toBeInTheDocument();
    });
  });
});
