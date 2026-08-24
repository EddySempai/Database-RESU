import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Particles from './components/Particles';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import LoadingScreen from './components/LoadingScreen';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@vercel/analytics/react';
import { SoundProvider } from './contexts/SoundContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Code Splitting for performance optimization
const Home = React.lazy(() => import('./pages/Home'));
const Calculadoras = React.lazy(() => import('./pages/Calculadoras'));
const Operativos = React.lazy(() => import('./pages/Operativos'));
const OperativoDetalle = React.lazy(() => import('./pages/OperativoDetalle'));
const ComingSoon = React.lazy(() => import('./pages/ComingSoon'));
const TierList = React.lazy(() => import('./pages/TierList'));
const Comparador = React.lazy(() => import('./pages/Comparador'));
const Llaveros = React.lazy(() => import('./pages/Llaveros'));
// const Guias = React.lazy(() => import('./pages/Guias'));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-umbrella-black text-white font-inter relative overflow-hidden flex flex-col">
      {!isAdmin && <Particles />}
      <Analytics />
      {!isAdmin && <Navbar />}
      
      <main className="flex-1">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/herramientas" element={<PageTransition><Calculadoras /></PageTransition>} />
          <Route path="/comparador" element={<PageTransition><Comparador /></PageTransition>} />
          <Route path="/heroes" element={<PageTransition><Operativos /></PageTransition>} />
          <Route path="/heroes/:id" element={<PageTransition><OperativoDetalle /></PageTransition>} />
          <Route path="/llaveros" element={<PageTransition><Llaveros /></PageTransition>} />
          <Route path="/tier-list" element={<PageTransition><TierList /></PageTransition>} />
          <Route path="/guias" element={<PageTransition><ComingSoon /></PageTransition>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Backwards compatibility redirects */}
          <Route path="/operativos" element={<Navigate to="/heroes" replace />} />
          <Route path="*" element={<PageTransition><ComingSoon /></PageTransition>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      
      {!isAdmin && (
        <footer className="relative z-10 py-12 border-t border-gray-900 bg-[#020202] text-center mt-auto">
          <div className="max-w-4xl mx-auto flex flex-col items-center px-6">
            <div className="flex gap-6 mb-6">
              <a href="https://www.residentevil-survivalunit.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors">Official Website</a>
              <a href="https://x.com/RE_SU_EN" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors">Twitter (X)</a>
              <a href="https://discord.com/invite/3q63SSBeeW" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors">Discord</a>
            </div>
            <p className="text-xs text-gray-700 font-inter max-w-xl leading-relaxed">
              {t('footer.disclaimer')}
              <br/><br/>
              © 2026 UMBRELLA CORP. TACTICAL DATABASE HUB.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <SoundProvider>
      <AdminAuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AdminAuthProvider>
    </SoundProvider>
  );
}

export default App;
