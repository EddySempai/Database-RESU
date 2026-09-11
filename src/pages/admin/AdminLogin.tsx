import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ShieldAlert, Lock, User, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const { playHover, playClick } = useSound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setErrorMessage(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanPass && !cleanUser) {
      setErrorMessage('Ingresa tus credenciales de acceso.');
      return;
    }

    setLoading(true);
    try {
      // If user is empty, attempt direct admin password login
      const result = cleanUser 
        ? await login(cleanUser, cleanPass)
        : await login(cleanPass);

      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setErrorMessage(result.error || 'Acceso denegado. Credenciales incorrectas.');
      }
    } catch {
      setErrorMessage('Error al verificar credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-blood-red/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blood-red/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-black/90 border border-gray-800 backdrop-blur-md p-8 shadow-[0_0_50px_rgba(255,0,0,0.1)] rounded-sm">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blood-red/20 border border-blood-red/50 flex items-center justify-center rounded-full mb-4 shadow-[0_0_20px_rgba(255,42,42,0.3)]">
              <ShieldAlert className="text-neon-red" size={32} />
            </div>
            <h1 className="font-bebas text-4xl text-white tracking-widest uppercase">Centro Táctico</h1>
            <p className="font-mono text-gray-500 text-xs tracking-widest mt-1 uppercase text-center">
              Acceso Restringido • Protocolo Umbrella
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username input */}
            <div>
              <label className="block font-mono text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">
                Usuario / Identificador:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin o tu nombre de usuario..."
                  className="w-full bg-black/60 border border-gray-800 text-white pl-10 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:border-neon-red transition-colors rounded-sm"
                  autoFocus
                />
              </div>
              <span className="font-mono text-[10px] text-gray-600 mt-1 block">
                * Si eres Admin, puedes ingresar directo con tu contraseña maestra.
              </span>
            </div>

            {/* Password input */}
            <div>
              <label className="block font-mono text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">
                Contraseña Táctica:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/60 border border-gray-800 text-white pl-10 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:border-neon-red transition-colors rounded-sm"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 bg-red-950/30 border border-red-900/50 rounded-sm">
                <p className="text-neon-red font-mono text-xs uppercase tracking-wider text-center font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={playHover}
              className="w-full mt-2 bg-blood-red/20 border border-blood-red text-white py-3 font-mono text-xs uppercase tracking-widest hover:bg-blood-red transition-colors flex items-center justify-center gap-2 group rounded-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Return Button */}
            <button
              type="button"
              onClick={() => { playClick(); navigate('/'); }}
              onMouseEnter={playHover}
              className="w-full bg-transparent border border-gray-800/80 text-gray-500 py-2.5 font-mono text-xs uppercase tracking-widest hover:text-white hover:border-gray-600 transition-colors flex items-center justify-center gap-2 rounded-sm mt-2"
            >
              <ArrowLeft size={14} /> Regresar a Base de Datos
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
