import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield, BookOpen, Calculator, Trophy, Users, BarChart2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();
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
    { name: t('nav.home'), icon: <Shield size={16} />, href: '/' },
    { name: t('nav.heroes'), icon: <Users size={16} />, href: '/heroes' },
    { name: t('nav.compare'), icon: <BarChart2 size={16} />, href: '/comparador' },
    { name: t('nav.tools'), icon: <Calculator size={16} />, href: '/herramientas' },
    { name: t('nav.guides'), icon: <BookOpen size={16} />, href: '/guias' },
    { name: t('nav.tierlist'), icon: <Trophy size={16} />, href: '/tier-list' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

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
                onClick={() => {
                  if (window.location.pathname === link.href) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="group flex items-center gap-2 font-mono text-sm text-gray-300 hover:text-white transition-colors"
              >
                <span className="text-gray-600 group-hover:text-neon-red transition-colors">{link.icon}</span>
                <span className="uppercase tracking-wider">{link.name}</span>
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="relative group ml-4">
              <button className="flex items-center gap-2 text-gray-300 hover:text-white font-mono text-xs uppercase transition-colors">
                <Globe size={16} className="text-neon-red" />
                {i18n.language.toUpperCase()}
              </button>
              <div className="absolute right-0 top-full mt-2 w-32 bg-black border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col">
                <button onClick={() => changeLanguage('es')} className={`px-4 py-3 text-left font-mono text-xs uppercase hover:bg-blood-red/20 hover:text-white transition-colors ${i18n.language === 'es' ? 'text-white border-l-2 border-blood-red' : 'text-gray-400'}`}>ES Español</button>
                <button onClick={() => changeLanguage('en')} className={`px-4 py-3 text-left font-mono text-xs uppercase hover:bg-blood-red/20 hover:text-white transition-colors ${i18n.language === 'en' ? 'text-white border-l-2 border-blood-red' : 'text-gray-400'}`}>EN English</button>
                <button onClick={() => changeLanguage('ja')} className={`px-4 py-3 text-left font-mono text-xs uppercase hover:bg-blood-red/20 hover:text-white transition-colors ${i18n.language === 'ja' ? 'text-white border-l-2 border-blood-red' : 'text-gray-400'}`}>JA 日本語</button>
              </div>
            </div>
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
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (window.location.pathname === link.href) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
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
