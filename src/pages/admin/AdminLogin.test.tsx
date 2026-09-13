import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLogin from './AdminLogin';
import { BrowserRouter } from 'react-router-dom';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../contexts/AdminAuthContext', () => ({
  useAdminAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: true,
  }),
}));

vi.mock('../../contexts/SoundContext', () => ({
  useSound: () => ({
    playHover: vi.fn(),
    playClick: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AdminLogin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );
    expect(screen.getByText('Centro Táctico')).toBeInTheDocument();
  });

  it('shows error if submitting empty credentials', async () => {
    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );
    const submitBtn = screen.getByText(/Ingresar al Sistema/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Ingresa tus credenciales de acceso.')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login with username and password, navigates on success', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    
    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );

    const usernameInput = screen.getByPlaceholderText('admin o usuario...');
    const passwordInput = screen.getByPlaceholderText('••••••••••••');
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'secret' } });
    
    const submitBtn = screen.getByText(/Ingresar al Sistema/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin', 'secret');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });
});
