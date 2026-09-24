import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Particles from './components/Particles';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import LoadingScreen from './components/LoadingScreen';
import { Analytics } from '@vercel/analytics/react';
import { SoundProvider } from './contexts/SoundContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
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
const Guias = React.lazy(() => import('./pages/Guias'));
const GuiaDetalle = React.lazy(() => import('./pages/GuiaDetalle'));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { isDark } = useTheme();
  
  return (
    <div className={`font-inter relative flex flex-col transition-colors duration-200 ${
      isAdmin 
        ? (isDark ? 'min-h-screen bg-[#0c0e14] text-slate-100' : 'min-h-screen bg-[#f8fafc] text-slate-800') 
        : 'min-h-screen bg-umbrella-black text-white overflow-x-hidden'
    }`}>
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
          <Route path="/guias" element={<PageTransition><Guias /></PageTransition>} />
          <Route path="/guias/:slug" element={<PageTransition><GuiaDetalle /></PageTransition>} />
          
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
      
      {!isAdmin && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <AdminAuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AdminAuthProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
