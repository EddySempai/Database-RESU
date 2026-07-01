import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield, BookOpen, Calculator, Newspaper, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', icon: <Shield size={16} />, href: '/' },
    { name: 'Guías', icon: <BookOpen size={16} />, href: '#' },
    { name: 'Noticias', icon: <Newspaper size={16} />, href: '#' },
    { name: 'Calculadoras', icon: <Calculator size={16} />, href: '/calculadoras' },
    { name: 'Tier List', icon: <Trophy size={16} />, href: '#' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#050505]/90 backdrop-blur-md border-b border-blood-red/30 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 bg-blood-red rounded-sm flex items-center justify-center transform rotate-45">
              <div className="w-6 h-6 border border-black transform -rotate-45 flex items-center justify-center">
                <span className="font-bebas text-black text-xl leading-none pt-1">RE</span>
              </div>
            </div>
            <div>
              <h1 className="font-bebas text-2xl text-white tracking-widest leading-none">Survival Unit</h1>
              <span className="font-mono text-[10px] text-neon-red uppercase tracking-widest">Database Hub</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, idx) => (
              <Link 
                key={idx} 
                to={link.href}
                className="group flex items-center gap-2 font-mono text-sm text-gray-300 hover:text-white transition-colors"
              >
                <span className="text-gray-600 group-hover:text-neon-red transition-colors">{link.icon}</span>
                <span className="uppercase tracking-wider">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#050505] pt-24 px-6"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, idx) => (
                <Link 
                  key={idx} 
                  to={link.href}
                  className="flex items-center gap-4 border-b border-gray-800 pb-4 text-gray-300 hover:text-neon-red transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-neon-red">{link.icon}</span>
                  <span className="font-bebas text-2xl tracking-widest">{link.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
