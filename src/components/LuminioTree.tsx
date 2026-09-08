import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LUMINIO_NODES } from '../data/luminio';
import type { LuminioNodeConfig, LuminioBranch } from '../data/luminio';
import LuminioNode from './LuminioNode';
import { useTranslation } from 'react-i18next';
import type { Step } from 'react-joyride';
import { X, Shield, Crosshair, Droplet, Check } from 'lucide-react';
import { useOnboarding, OnboardingTour, TutorialButton } from './OnboardingTour';
import { motion, AnimatePresence } from 'framer-motion';

interface LuminioTreeProps {
  baseLevels: Record<string, number>;
  targetLevels: Record<string, number>;
  onBaseChange: (id: string, newLevel: number) => void;
  onTargetChange: (id: string, newLevel: number) => void;
}

const LuminioTree: React.FC<LuminioTreeProps> = ({ baseLevels, targetLevels, onBaseChange, onTargetChange }) => {
  const { t } = useTranslation();
  const { run, startTour, handleJoyrideCallback, stepIndex, advanceTour } = useOnboarding('luminio_calc');
  const [selectedNode, setSelectedNode] = useState<LuminioNodeConfig | null>(null);

  const branches: { id: LuminioBranch, title: string, color: string, icon: any, imageIcon: string }[] = [
    { id: 'blue', title: 'ATACANTE', color: 'blue', icon: Droplet, imageIcon: 'UI_Hero_Heavy.webp' },
    { id: 'green', title: 'DEFENSOR', color: 'green', icon: Shield, imageIcon: 'UI_Hero_Infantry.webp' },
    { id: 'red', title: 'RANGER', color: 'red', icon: Crosshair, imageIcon: 'UI_Hero_Rifle.webp' },
  ];

  const calculateTotalPowder = () => {
    let total = 0;
    Object.keys(targetLevels).forEach(id => {
      const target = targetLevels[id] || 0;
      const base = baseLevels[id] || 0;
      if (target > base) {
        const node = LUMINIO_NODES.find(n => n.id === id);
        if (node && node.powderCosts) {
          // Calculate cost from base to target (0-indexed array)
          for (let i = base; i < target; i++) {
            total += node.powderCosts[i] || 0;
          }
        }
      }
    });
    return total;
  };

  const renderBranch = (branch: LuminioBranch) => {
    const nodes = LUMINIO_NODES.filter(n => n.branch === branch);
    
    // Y: 10% to 90% (Row 0 to 4) -> 10 + row * 20
    // X: -1, 0, 1 -> 50 + col * 30
    const getY = (r: number) => `${10 + (r * 20)}%`;
    const getX = (c: number) => `${50 + (c * 30)}%`;
    
    return (
      <div className="relative w-full h-[550px] md:h-[650px] z-10">
        {/* Draw connections with absolute SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10">
          {nodes.map(node => (
             node.dependencies.map(depId => {
               const getY = (r: number) => `calc(${10 + (r * 20)}% + ${r * 8}px)`;
               const getX = (c: number) => `${50 + (c * 33.33)}%`;
               
               const depNode = nodes.find(n => n.id === depId);
               if (!depNode) return null;
               
               const isDepActive = (targetLevels[depNode.id] || 0) > 0;
               const isNodeActive = (targetLevels[node.id] || 0) > 0;
               const isActive = isDepActive && isNodeActive;
               const isUnlocked = isDepActive;
               
               let strokeColor = '#222';
               if (isActive) {
                 if (branch === 'blue') strokeColor = '#3b82f6';
                 else if (branch === 'red') strokeColor = '#ef4444';
                 else if (branch === 'green') strokeColor = '#22c55e';
               } else if (isUnlocked) {
                 strokeColor = '#444';
               }

               return (
                 <line
                   key={`${depId}-${node.id}`}
                   x1={getX(depNode.col)}
                   y1={getY(depNode.row)}
                   x2={getX(node.col)}
                   y2={getY(node.row)}
                   stroke={strokeColor}
                   strokeWidth={isActive ? "3" : "2"}
                   className="transition-all duration-500"
                   style={{
                     filter: isActive ? `drop-shadow(0 0 5px ${strokeColor})` : 'none',
                     opacity: isActive ? 1 : 0.6
                   }}
                 />
               );
             })
          ))}
        </svg>

        {/* Nodes positioned absolutely to match SVG lines */}
        {nodes.map(node => (
          <div 
            key={node.id} 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: getX(node.col), top: getY(node.row) }}
          >
            <LuminioNode 
              node={node} 
              baseLevel={baseLevels[node.id] || 0} 
              targetLevel={targetLevels[node.id] || 0}
              onClick={() => { setSelectedNode(node); if (run && stepIndex === 0) advanceTour(); }} 
            />
          </div>
        ))}
      </div>
    );
  };

  const steps: Step[] = [
    {
      target: '.tour-luminio-tree',
      content: t('tour.luminio_step1'),
      
      buttons: ['close', 'skip'],
    },
    {
      target: '.tour-luminio-results',
      content: t('tour.luminio_step2'),
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto my-8 relative">
      <OnboardingTour run={run} steps={steps} stepIndex={stepIndex} handleJoyrideCallback={handleJoyrideCallback} />
      <div className="bg-black/40 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
      <div className="relative p-6 md:p-8 border-b border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 via-black/40 to-transparent overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-yellow-500/10 to-transparent blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-3xl md:text-5xl font-bebas tracking-widest text-white drop-shadow-md text-center uppercase flex-1">
            {t('luminio.title_prefix')} <span className="text-yellow-500">{t('luminio.title_highlight')}</span>
          </h2>
          <TutorialButton onClick={startTour} className="relative z-20 flex items-center gap-2 bg-black/60 hover:bg-yellow-500/20 border border-gray-700 hover:border-yellow-500 text-gray-400 hover:text-white px-3 py-1.5 rounded-full transition-colors cursor-pointer group" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-800 tour-luminio-tree">
        {branches.map(branch => (
          <div key={branch.id} className="relative p-6 md:p-8 flex flex-col items-center group">
            {/* Background Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-gradient-to-b
              ${branch.color === 'blue' ? 'from-blue-500' : ''}
              ${branch.color === 'red' ? 'from-red-500' : ''}
              ${branch.color === 'green' ? 'from-green-500' : ''}
              to-transparent pointer-events-none`} 
            />

            {/* Branch Header Node (Aesthetic) */}
            <div className={`w-20 h-20 rounded-full border-2 mb-3 flex items-center justify-center relative z-20 transition-transform duration-500 group-hover:scale-110 overflow-hidden
              ${branch.color === 'blue' ? 'border-blue-500 bg-blue-900/30 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)]' : ''}
              ${branch.color === 'red' ? 'border-red-500 bg-red-900/30 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)]' : ''}
              ${branch.color === 'green' ? 'border-green-500 bg-green-900/30 text-green-400 shadow-[0_0_25px_rgba(34,197,94,0.4)]' : ''}
            `}>
              {branch.imageIcon ? (
                <img src={`/icons/units/${branch.imageIcon}`} alt={branch.title} className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              ) : (
                <branch.icon size={36} strokeWidth={1.5} />
              )}
            </div>

            {/* Branch Badge */}
            <div className={`mb-6 px-4 py-1 rounded-full border text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2
              ${branch.color === 'blue' ? 'border-blue-500/40 bg-blue-950/60 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : ''}
              ${branch.color === 'red' ? 'border-red-500/40 bg-red-950/60 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}
              ${branch.color === 'green' ? 'border-green-500/40 bg-green-950/60 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : ''}
            `}>
              <img src={`/icons/units/${branch.imageIcon}`} alt="" className="w-3.5 h-3.5 object-contain" />
              <span>{branch.title}</span>
            </div>
            
            {renderBranch(branch.id)}
          </div>
        ))}
      </div>
      
      {/* Summary Module */}
      <div className="bg-gradient-to-t from-black/95 via-yellow-900/10 to-black/60 border-t border-yellow-900/30 p-6 md:p-8 flex flex-col items-center tour-luminio-results">
        <h3 className="text-xl font-mono text-yellow-500/70 mb-4 tracking-widest uppercase">{t('luminio.total_resources', 'Recursos Totales Requeridos')}</h3>
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 w-full max-w-4xl">
          
          {/* Powder */}
          <div className="bg-gray-900/80 border border-yellow-500/40 rounded-2xl p-6 flex flex-col items-center flex-1 min-w-[200px] shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden group hover:shadow-[0_0_40px_rgba(234,179,8,0.25)] transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
            <span className="text-sm font-mono text-yellow-300 mb-2 drop-shadow-[0_0_5px_rgba(253,224,71,0.5)]">{t('luminio.powder', 'Polvo de Luminio')}</span>
            <span className="text-3xl md:text-5xl font-bebas text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-300 tracking-widest drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
              {calculateTotalPowder().toLocaleString()}
            </span>
          </div>

          {/* Stones */}
          <div className="bg-gray-900/80 border border-amber-600/40 rounded-2xl p-6 flex flex-col items-center flex-1 min-w-[200px] shadow-[0_0_30px_rgba(217,119,6,0.15)] opacity-60 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent pointer-events-none" />
            <span className="text-sm font-mono text-amber-400 mb-2">{t('luminio.stones', 'Piedras de Luminio')}</span>
            <span className="text-3xl md:text-5xl font-bebas text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-200 tracking-widest">
              ?
            </span>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-xs font-mono text-amber-200 bg-amber-950/80 px-4 py-1.5 rounded-full border border-amber-500/50 shadow-[0_0_10px_rgba(217,119,6,0.3)]">
                Pendiente de Datos
              </span>
            </div>
          </div>

        </div>
      </div>
      {/* Node Upgrade Modal Portal (renders in document.body to follow viewport exactly) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
              onClick={() => setSelectedNode(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-[#0f0f0f] border border-gray-700 rounded-xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl" 
                onClick={e => e.stopPropagation()}
              >
                {/* Header Bar */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#151515]">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border p-1.5 ${
                      selectedNode.branch === 'blue' ? 'bg-blue-900/20 border-blue-500/40 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
                      selectedNode.branch === 'red' ? 'bg-red-900/20 border-red-500/40 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                      'bg-green-900/20 border-green-500/40 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                    }`}>
                      <img 
                        src={`/icons/units/${branches.find(b => b.id === selectedNode.branch)?.imageIcon || 'UI_Hero_Heavy.webp'}`} 
                        alt={selectedNode.branch} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div>
                      <h3 className="font-bebas text-2xl text-white tracking-widest leading-none">
                        {t(selectedNode.nameKey, selectedNode.defaultName)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                          {branches.find(b => b.id === selectedNode.branch)?.title || selectedNode.branch}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-[10px] font-mono text-gray-400 tracking-wider">
                          MAX: <strong className="text-white">{selectedNode.maxLevel}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)} 
                    className="text-gray-400 hover:text-white p-1 transition-colors"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Controls Body */}
                <div className="p-5 flex flex-col gap-4 bg-[#0f0f0f]">
                  {/* Base Level Controls */}
                  <div>
                    <div className="flex justify-between items-center mb-2 font-mono text-xs">
                      <span className="text-gray-400 uppercase tracking-widest">{t('luminio.current_level', 'Nivel Actual')}</span>
                      <span className="text-white font-bold bg-black/60 px-2 py-0.5 rounded border border-gray-800">
                        Nv. {baseLevels[selectedNode.id] || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-black/50 rounded-lg p-2 border border-gray-800">
                      <button 
                        onClick={() => onBaseChange(selectedNode.id, Math.max(0, (baseLevels[selectedNode.id] || 0) - 1))}
                        disabled={(baseLevels[selectedNode.id] || 0) === 0}
                        className="w-10 h-10 flex items-center justify-center rounded bg-[#181818] border border-gray-700 hover:border-gray-500 text-white font-mono text-lg font-bold disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        -
                      </button>
                      <input 
                        type="range" 
                        min="0" 
                        max={selectedNode.maxLevel} 
                        value={baseLevels[selectedNode.id] || 0}
                        onChange={(e) => onBaseChange(selectedNode.id, parseInt(e.target.value))}
                        className="flex-1 mx-3 accent-yellow-500 cursor-pointer"
                      />
                      <button 
                        onClick={() => onBaseChange(selectedNode.id, Math.min(selectedNode.maxLevel, (baseLevels[selectedNode.id] || 0) + 1))}
                        disabled={(baseLevels[selectedNode.id] || 0) === selectedNode.maxLevel}
                        className="w-10 h-10 flex items-center justify-center rounded bg-[#181818] border border-gray-700 hover:border-gray-500 text-white font-mono text-lg font-bold disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Target Level Controls */}
                  <div>
                    <div className="flex justify-between items-center mb-2 font-mono text-xs">
                      <span className="text-yellow-500 font-bold uppercase tracking-widest">{t('luminio.target_level', 'Nivel Objetivo (Meta)')}</span>
                      <span className="text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                        Nv. {targetLevels[selectedNode.id] || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-black/50 rounded-lg p-2 border border-gray-800">
                      <button 
                        onClick={() => onTargetChange(selectedNode.id, Math.max(baseLevels[selectedNode.id] || 0, (targetLevels[selectedNode.id] || 0) - 1))}
                        disabled={(targetLevels[selectedNode.id] || 0) <= (baseLevels[selectedNode.id] || 0)}
                        className="w-10 h-10 flex items-center justify-center rounded bg-[#181818] border border-gray-700 hover:border-gray-500 text-white font-mono text-lg font-bold disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        -
                      </button>
                      <input 
                        type="range" 
                        min={baseLevels[selectedNode.id] || 0} 
                        max={selectedNode.maxLevel} 
                        value={targetLevels[selectedNode.id] || 0}
                        onChange={(e) => onTargetChange(selectedNode.id, parseInt(e.target.value))}
                        className="flex-1 mx-3 accent-yellow-500 cursor-pointer"
                      />
                      <button 
                        onClick={() => onTargetChange(selectedNode.id, Math.min(selectedNode.maxLevel, (targetLevels[selectedNode.id] || 0) + 1))}
                        disabled={(targetLevels[selectedNode.id] || 0) === selectedNode.maxLevel}
                        className="w-10 h-10 flex items-center justify-center rounded bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30 text-yellow-400 font-mono text-lg font-bold disabled:opacity-30 disabled:pointer-events-none transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="p-4 border-t border-gray-800 bg-[#121212] flex items-center justify-between">
                  <button 
                    onClick={() => onTargetChange(selectedNode.id, selectedNode.maxLevel)}
                    className="px-3 py-1.5 rounded border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 uppercase font-mono text-xs font-bold tracking-wider hover:bg-yellow-500/20 transition-all"
                  >
                    {t('luminio.max_out', 'MAX AL NIVEL')} {selectedNode.maxLevel}
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        onBaseChange(selectedNode.id, 0);
                        onTargetChange(selectedNode.id, 0);
                      }}
                      className="px-2 py-1 text-xs text-gray-500 hover:text-red-400 uppercase font-mono tracking-wider transition-colors"
                    >
                      {t('luminio.reset_node', 'Resetear')}
                    </button>
                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="px-4 py-1.5 flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
                    >
                      <Check size={16} strokeWidth={2.5} />
                      <span>Listo</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
    </div>
  );
};

export default LuminioTree;
