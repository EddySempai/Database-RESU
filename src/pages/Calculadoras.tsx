import { useState } from 'react';
import TrainingCalculator from '../components/TrainingCalculator';
import Treasures from '../components/Treasures';
import RedQueenAI from '../components/RedQueenAI';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const Calculadoras = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('training');

  return (
    <div className="pt-24 min-h-screen relative z-10">
      <div className="text-center px-6 mb-8">
        <h1 className="font-bebas text-5xl md:text-7xl tracking-widest text-white uppercase mb-4">{t('tools_page.tactical_tools')}</h1>
        <p className="font-inter text-gray-400 max-w-2xl mx-auto">{t('tools_page.tools_desc')}</p>
      </div>

      {/* TABS */}
      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('training')}
          className={`px-6 py-2 font-mono text-sm uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'training' ? 'bg-blood-red text-white shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'bg-transparent text-gray-500 border border-gray-800 hover:text-white hover:border-gray-500'}`}
        >
          Exp / Fragmentos
        </button>
        <button 
          onClick={() => setActiveTab('treasures')}
          className={`px-6 py-2 font-mono text-sm uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'treasures' ? 'bg-purple-700 text-white shadow-[0_0_15px_rgba(128,0,128,0.5)]' : 'bg-transparent text-gray-500 border border-gray-800 hover:text-white hover:border-gray-500'}`}
        >
          Tesoros / Joyas
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'training' && (
          <motion.div
            key="training"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TrainingCalculator />
          </motion.div>
        )}
        
        {activeTab === 'treasures' && (
          <motion.div
            key="treasures"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Treasures />
          </motion.div>
        )}
      </AnimatePresence>
      
      <RedQueenAI />
    </div>
  );
};

export default Calculadoras;
