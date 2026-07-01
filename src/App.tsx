import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Particles from './components/Particles';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Calculadoras from './pages/Calculadoras';
import Operativos from './pages/Operativos';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-umbrella-black text-white font-inter relative overflow-hidden flex flex-col">
        <Particles />
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculadoras" element={<Calculadoras />} />
            <Route path="/operativos" element={<Operativos />} />
          </Routes>
        </main>
        
        <footer className="relative z-10 py-12 border-t border-gray-900 bg-[#020202] text-center mt-auto">
          <div className="max-w-4xl mx-auto flex flex-col items-center px-6">
            <div className="flex gap-6 mb-6">
              <a href="https://www.residentevil-survivalunit.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors">Official Website</a>
              <a href="https://x.com/RE_SU_EN" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors">Twitter (X)</a>
              <a href="https://discord.com/invite/3q63SSBeeW" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors">Discord</a>
            </div>
            <p className="text-xs text-gray-700 font-inter max-w-xl leading-relaxed">
              Este es un sitio web informativo creado por fans para fines educativos y de guía. 
              Resident Evil: Survival Unit es un juego co-desarrollado por Aniplex, JOYCITY y Capcom.
              <br/><br/>
              © 2026 UMBRELLA CORP. TACTICAL DATABASE HUB.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
