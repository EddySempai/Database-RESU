import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
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
import Noticias from './pages/Noticias';
import NoticiaDetalle from './pages/NoticiaDetalle';

// Code Splitting for performance optimization
const Home = React.lazy(() => import('./pages/Home'));
const Calculadoras = React.lazy(() => import('./pages/Calculadoras'));
const Conversores = React.lazy(() => import('./pages/Conversores'));
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
  
  const isArticleDetail = location.pathname.startsWith('/noticias/');
  
  return (
    <div className={`font-inter relative flex flex-col transition-colors duration-200 ${
      isAdmin 
        ? (isDark ? 'min-h-screen bg-[#0c0e14] text-slate-100' : 'min-h-screen bg-[#f8fafc] text-slate-800') 
        : 'min-h-screen bg-umbrella-black text-white overflow-x-hidden'
    }`}>
      {!isAdmin && !isArticleDetail && <Particles />}
      <Analytics />
      {!isAdmin && <Navbar />}
      
      <main className="flex-1">
        <LayoutGroup>
          <AnimatePresence
            mode={location.pathname.startsWith('/noticias') ? 'popLayout' : 'wait'}
            onExitComplete={() => window.scrollTo(0, 0)}
          >
            <PageTransition key={location.pathname}>
              <Suspense fallback={<LoadingScreen />}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/herramientas" element={<Calculadoras />} />
                  <Route path="/conversores" element={<Conversores />} />
                  <Route path="/comparador" element={<Comparador />} />
                  <Route path="/heroes" element={<Operativos />} />
                  <Route path="/heroes/:id" element={<OperativoDetalle />} />
                  <Route path="/llaveros" element={<Llaveros />} />
                  <Route path="/tier-list" element={<TierList />} />
                  <Route path="/guias" element={<Guias />} />
                  <Route path="/guias/:slug" element={<GuiaDetalle />} />
                  <Route path="/noticias" element={<Noticias />} />
                  <Route path="/noticias/:id" element={<NoticiaDetalle />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  
                  {/* Backwards compatibility redirects */}
                  <Route path="/operativos" element={<Navigate to="/heroes" replace />} />
                  <Route path="*" element={<ComingSoon />} />
                </Routes>
              </Suspense>
            </PageTransition>
          </AnimatePresence>
        </LayoutGroup>
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
