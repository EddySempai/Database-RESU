import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ShieldAlert, Lock, User, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const { playHover, playClick } = useSound();
  const { isDark } = useTheme();

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
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors ${
      isDark ? 'bg-[#050505]' : 'bg-slate-50'
    }`}>
      {/* Background Elements */}
      <div className={`absolute inset-0 ${isDark ? 'bg-rose-500/5' : 'bg-rose-500/5'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none transition-colors ${
        isDark ? 'bg-rose-500/10' : 'bg-rose-500/5'
      }`} />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`backdrop-blur-md p-8 rounded-2xl border transition-colors ${
          isDark 
            ? 'bg-[#090909]/90 border-slate-800 shadow-[0_0_50px_rgba(244,63,94,0.05)]' 
            : 'bg-white/90 border-slate-300 shadow-xl'
        }`}>
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              animate={{ y: [0, -5, 0] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-4 border transition-colors ${
              isDark 
                ? 'bg-rose-500/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]' 
                : 'bg-rose-100 border-rose-200 shadow-md'
            }`}>
              <ShieldAlert className={isDark ? 'text-rose-500' : 'text-rose-600'} size={32} />
            </motion.div>
            <h1 className={`font-bebas text-3xl md:text-4xl text-center tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Centro Táctico
            </h1>
            <p className={`font-mono text-[9px] md:text-xs tracking-wider md:tracking-widest mt-1 uppercase text-center ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Acceso Restringido • Protocolo Umbrella
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username input */}
            <div>
              <label className={`block font-mono text-[11px] uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Usuario / Identificador:
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin o usuario..."
                  className={`w-full pl-10 pr-4 py-2.5 font-mono text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all rounded-xl border ${
                    isDark 
                      ? 'bg-[#10131d] border-slate-800 text-white placeholder-slate-600 focus:border-rose-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-400 shadow-sm'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className={`block font-mono text-[11px] uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Contraseña Táctica:
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 font-mono text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all rounded-xl border ${
                    isDark 
                      ? 'bg-[#10131d] border-slate-800 text-white placeholder-slate-600 focus:border-rose-500' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-400 shadow-sm'
                  }`}
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className={`p-2.5 border rounded-xl ${
                isDark ? 'bg-rose-950/30 border-rose-900/50' : 'bg-rose-50 border-rose-200'
              }`}>
                <p className={`font-mono text-xs uppercase tracking-wider text-center font-bold ${
                  isDark ? 'text-rose-400' : 'text-rose-600'
                }`}>
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={playHover}
              className={`w-full mt-2 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group rounded-xl border disabled:opacity-50 shadow-sm ${
                isDark 
                  ? 'bg-rose-500/20 border-rose-500/50 text-white hover:bg-rose-500 hover:border-rose-400' 
                  : 'bg-rose-600 border-rose-700 text-white hover:bg-rose-700 hover:shadow-md'
              }`}
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
              className={`w-full py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-xl border mt-2 ${
                isDark 
                  ? 'bg-transparent border-slate-800/80 text-slate-500 hover:text-white hover:border-slate-600 hover:bg-[#141824]' 
                  : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <ArrowLeft size={14} /> Regresar a Base de Datos
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
