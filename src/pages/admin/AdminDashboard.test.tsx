import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { BrowserRouter } from 'react-router-dom';

// Mock contexts and hooks
vi.mock('../../contexts/AdminAuthContext', () => ({
  useAdminAuth: () => ({
    user: { email: 'admin@test.com' },
    isAdmin: true,
    logout: vi.fn(),
  }),
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: { value: ['Umbrella Network'] } }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({}),
    })),
  },
}));

vi.mock('../../contexts/SoundContext', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Panels to avoid deep rendering complexity
vi.mock('./ActivityPanel', () => ({ default: () => <div data-testid="activity-panel">Activity Panel</div> }));
vi.mock('./MembersPanel', () => ({ default: () => <div data-testid="members-panel">Members Panel</div> }));
vi.mock('./AnalyticsPanel', () => ({ default: () => <div data-testid="analytics-panel">Analytics Panel</div> }));
vi.mock('./AuditPanel', () => ({ default: () => <div data-testid="audit-panel">Audit Panel</div> }));
vi.mock('./UsersPanel', () => ({ default: () => <div data-testid="users-panel">Users Panel</div> }));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId('activity-panel')).toBeInTheDocument();
    });
  });

  it('toggles tabs correctly', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    // By default, Activity is active
    expect(screen.getByTestId('activity-panel')).toBeInTheDocument();

    // Click on Members tab
    const membersTab = screen.getByText('admin.sidebar.members');
    fireEvent.click(membersTab);
    await waitFor(() => {
      expect(screen.getByTestId('members-panel')).toBeInTheDocument();
    });

    // Click on Analytics tab
    const analyticsTab = screen.getByText('admin.sidebar.analytics');
    fireEvent.click(analyticsTab);
    await waitFor(() => {
      expect(screen.getByTestId('analytics-panel')).toBeInTheDocument();
    });
  });

  it('calls logout on logout button click', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('activity-panel')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('admin.sidebar.logout');
    fireEvent.click(logoutButton);
    // Depending on the implementation in useAdminAuth mock, it should call logout 
    // and navigate to /admin/login
    expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
  });
});
