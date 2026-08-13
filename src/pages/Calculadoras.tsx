import { useState } from 'react';
import TrainingCalculator from '../components/TrainingCalculator';
import Treasures from '../components/Treasures';
import Jewels from '../components/Jewels';
import LuminioTree from '../components/LuminioTree';
import { LUMINIO_NODES } from '../data/luminio';
import RedQueenAI from '../components/RedQueenAI';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const Calculadoras = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('training');
  const [luminioBase, setLuminioBase] = useState<Record<string, number>>({});
  const [luminioTarget, setLuminioTarget] = useState<Record<string, number>>({});

  const handleLuminioBaseChange = (id: string, newLevel: number) => {
    setLuminioBase(prevBase => {
      const updatedBase = { ...prevBase, [id]: newLevel };
      
      if (newLevel > 0) {
        const autoActivate = (nodeId: string) => {
          const node = LUMINIO_NODES.find(n => n.id === nodeId);
          if (!node) return;
          node.dependencies.forEach(depId => {
            const depNode = LUMINIO_NODES.find(n => n.id === depId);
            if (depNode) {
              if (!updatedBase[depId] || updatedBase[depId] < depNode.maxLevel) {
                updatedBase[depId] = depNode.maxLevel;
              }
              autoActivate(depId);
            }
          });
        };
        autoActivate(id);
      }
      
      if (newLevel === 0) {
        const autoDeactivate = (nodeId: string) => {
           const dependents = LUMINIO_NODES.filter(n => n.dependencies.includes(nodeId));
           dependents.forEach(dep => {
             if (updatedBase[dep.id] > 0) {
               updatedBase[dep.id] = 0;
               autoDeactivate(dep.id);
             }
           });
        };
        autoDeactivate(id);
      }
      
      // Also ensure target is at least base
      setLuminioTarget(prevTarget => {
        const newTarget = { ...prevTarget };
        let targetChanged = false;
        
        // Ensure all bases are reflected in targets
        Object.entries(updatedBase).forEach(([bId, bLevel]) => {
           if ((newTarget[bId] || 0) < bLevel) {
             newTarget[bId] = bLevel;
             targetChanged = true;
           }
        });
        
        return targetChanged ? newTarget : prevTarget;
      });

      return updatedBase;
    });
  };

  const handleLuminioTargetChange = (id: string, newLevel: number) => {
    setLuminioTarget(prevTarget => {
      const updatedTarget = { ...prevTarget, [id]: newLevel };
      
      if (newLevel > 0) {
        const autoActivate = (nodeId: string) => {
          const node = LUMINIO_NODES.find(n => n.id === nodeId);
          if (!node) return;
          node.dependencies.forEach(depId => {
            const depNode = LUMINIO_NODES.find(n => n.id === depId);
            if (depNode) {
              if (!updatedTarget[depId] || updatedTarget[depId] < depNode.maxLevel) {
                updatedTarget[depId] = depNode.maxLevel;
              }
              autoActivate(depId);
            }
          });
        };
        autoActivate(id);
      }
      
      if (newLevel === 0) {
        const autoDeactivate = (nodeId: string) => {
           const dependents = LUMINIO_NODES.filter(n => n.dependencies.includes(nodeId));
           dependents.forEach(dep => {
             if (updatedTarget[dep.id] > 0) {
               updatedTarget[dep.id] = 0;
               autoDeactivate(dep.id);
             }
           });
        };
        autoDeactivate(id);
      }

      return updatedTarget;
    });
  };

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
          {t('tools_page.tab_training', 'Exp / Fragmentos')}
        </button>
        <button 
          onClick={() => setActiveTab('treasures')}
          className={`px-6 py-2 font-mono text-sm uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'treasures' ? 'bg-purple-700 text-white shadow-[0_0_15px_rgba(128,0,128,0.5)]' : 'bg-transparent text-gray-500 border border-gray-800 hover:text-white hover:border-gray-500'}`}
        >
          {t('tools_page.tab_treasures', 'Tesoros / Joyas')}
        </button>
        <button 
          onClick={() => setActiveTab('luminio')}
          className={`px-6 py-2 font-mono text-sm uppercase tracking-widest rounded-full transition-all duration-300 ${activeTab === 'luminio' ? 'bg-yellow-600 text-white shadow-[0_0_15px_rgba(202,138,4,0.5)]' : 'bg-transparent text-gray-500 border border-gray-800 hover:text-white hover:border-gray-500'}`}
        >
          {t('tools_page.tab_luminio', 'Luminio')}
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
            <Jewels />
          </motion.div>
        )}

        {activeTab === 'luminio' && (
          <motion.div
            key="luminio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <LuminioTree 
              baseLevels={luminioBase} 
              targetLevels={luminioTarget} 
              onBaseChange={handleLuminioBaseChange} 
              onTargetChange={handleLuminioTargetChange} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <RedQueenAI />
    </div>
  );
};

export default Calculadoras;
