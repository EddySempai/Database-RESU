import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ShieldAlert, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const { playHover, playClick } = useSound();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (login(password)) {
      navigate('/admin/dashboard');
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-blood-red/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blood-red/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-black/80 border border-gray-800 backdrop-blur-md p-8 shadow-[0_0_50px_rgba(255,0,0,0.1)]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blood-red/20 border border-blood-red/50 flex items-center justify-center rounded-full mb-4 shadow-[0_0_15px_rgba(255,42,42,0.3)]">
              <ShieldAlert className="text-neon-red" size={32} />
            </div>
            <h1 className="font-bebas text-4xl text-white tracking-widest uppercase">Admin Access</h1>
            <p className="font-mono text-gray-500 text-xs tracking-widest mt-2 uppercase">Umbrella Level 5 Clearance Required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Master Password..."
                  className={`w-full bg-black/50 border ${error ? 'border-neon-red' : 'border-gray-800'} text-white pl-10 pr-4 py-3 font-mono text-sm focus:outline-none focus:border-blood-red transition-colors`}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-neon-red font-mono text-[10px] uppercase mt-2 tracking-wider">Access Denied. Invalid Password.</p>
              )}
            </div>

            <button
              type="submit"
              onMouseEnter={playHover}
              className="w-full bg-blood-red/20 border border-blood-red text-white py-3 font-mono text-sm uppercase tracking-widest hover:bg-blood-red transition-colors flex items-center justify-center gap-2 group"
            >
              Authenticate <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => { playClick(); navigate('/'); }}
              onMouseEnter={playHover}
              className="w-full bg-transparent border border-gray-800 text-gray-500 py-3 font-mono text-sm uppercase tracking-widest hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2 group mt-4"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Regresar a la Base
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
