import React, { useState } from 'react';
import { LUMINIO_NODES } from '../data/luminio';
import type { LuminioNodeConfig, LuminioBranch } from '../data/luminio';
import LuminioNode from './LuminioNode';
import { useTranslation } from 'react-i18next';
import { X, Shield, Crosshair, Droplet, Check } from 'lucide-react';

interface LuminioTreeProps {
  baseLevels: Record<string, number>;
  targetLevels: Record<string, number>;
  onBaseChange: (id: string, newLevel: number) => void;
  onTargetChange: (id: string, newLevel: number) => void;
}

const LuminioTree: React.FC<LuminioTreeProps> = ({ baseLevels, targetLevels, onBaseChange, onTargetChange }) => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<LuminioNodeConfig | null>(null);

  const branches: { id: LuminioBranch, title: string, color: string, icon: any, imageIcon?: string }[] = [
    { id: 'blue', title: 'ATACANTE', color: 'blue', icon: Droplet, imageIcon: 'Icon_Hero_Skill_Attack.webp' },
    { id: 'green', title: 'DEFENSOR', color: 'green', icon: Shield, imageIcon: 'Icon_Hero_Skill_Shield.webp' },
    { id: 'red', title: 'RANGER', color: 'red', icon: Crosshair, imageIcon: 'Icon_Hero_Skill_AccuracyRate.webp' },
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
              onClick={() => setSelectedNode(node)} 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 bg-black/40 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
      <div className="relative p-6 md:p-8 border-b border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 via-black/40 to-transparent overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-yellow-500/10 to-transparent blur-xl pointer-events-none" />
        <h2 className="relative z-10 text-3xl md:text-5xl font-bebas tracking-widest text-white drop-shadow-md text-center uppercase">
          {t('luminio.title_prefix')} <span className="text-yellow-500">{t('luminio.title_highlight')}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
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
            <div className={`w-20 h-20 rounded-full border-2 mb-6 flex items-center justify-center relative z-20 transition-transform duration-500 group-hover:scale-110 overflow-hidden
              ${branch.color === 'blue' ? 'border-blue-500 bg-blue-900/20 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)]' : ''}
              ${branch.color === 'red' ? 'border-red-500 bg-red-900/20 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)]' : ''}
              ${branch.color === 'green' ? 'border-green-500 bg-green-900/20 text-green-400 shadow-[0_0_25px_rgba(34,197,94,0.4)]' : ''}
            `}>
              {branch.imageIcon ? (
                <img src={`/icons/skill/${branch.imageIcon}`} alt={branch.title} className="w-full h-full object-cover scale-[1.35]" />
              ) : (
                <branch.icon size={36} strokeWidth={1.5} />
              )}
            </div>
            
            {renderBranch(branch.id)}
          </div>
        ))}
      </div>
      
      {/* Popover / Modal for upgrading a node */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedNode(null)}>
          <div className="w-full max-w-sm bg-slate-950/95 border border-slate-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 backdrop-blur-xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors">
              <X size={18} />
            </button>
            
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-4 rounded-xl border flex items-center justify-center
                ${selectedNode.branch === 'blue' ? 'bg-blue-900/20 border-blue-500/30 text-blue-400' : ''}
                ${selectedNode.branch === 'red' ? 'bg-red-900/20 border-red-500/30 text-red-400' : ''}
                ${selectedNode.branch === 'green' ? 'bg-green-900/20 border-green-500/30 text-green-400' : ''}
              `}>
                 <span className="font-bebas text-2xl">I</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white pr-6">{t(selectedNode.nameKey, selectedNode.defaultName)}</h3>
                <p className="text-sm text-gray-400 mt-1 font-mono">Max: <span className="text-white font-bold">{selectedNode.maxLevel}</span></p>
              </div>
            </div>

            {/* Base Level Controls */}
            <div className="mb-4">
              <label className="text-sm font-mono text-gray-400 mb-2 block">{t('luminio.current_level', 'Nivel Actual')}</label>
              <div className="flex justify-between items-center bg-black/40 rounded-xl p-2 border border-gray-800">
                <button 
                  onClick={() => onBaseChange(selectedNode.id, Math.max(0, (baseLevels[selectedNode.id] || 0) - 1))}
                  disabled={(baseLevels[selectedNode.id] || 0) === 0}
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 transition-colors"
                >
                  -
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max={selectedNode.maxLevel} 
                  value={baseLevels[selectedNode.id] || 0}
                  onChange={(e) => onBaseChange(selectedNode.id, parseInt(e.target.value))}
                  className="flex-1 mx-4 accent-gray-500"
                />
                <button 
                  onClick={() => onBaseChange(selectedNode.id, Math.min(selectedNode.maxLevel, (baseLevels[selectedNode.id] || 0) + 1))}
                  disabled={(baseLevels[selectedNode.id] || 0) === selectedNode.maxLevel}
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-600 hover:bg-gray-500 text-white disabled:opacity-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Target Level Controls */}
            <div className="mb-4">
              <label className="text-sm font-mono text-gray-400 mb-2 block">{t('luminio.target_level', 'Nivel Objetivo (Meta)')}</label>
              <div className="flex justify-between items-center bg-black/40 rounded-xl p-2 border border-gray-800">
                <button 
                  onClick={() => onTargetChange(selectedNode.id, Math.max(baseLevels[selectedNode.id] || 0, (targetLevels[selectedNode.id] || 0) - 1))}
                  disabled={(targetLevels[selectedNode.id] || 0) <= (baseLevels[selectedNode.id] || 0)}
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 transition-colors"
                >
                  -
                </button>
                <input 
                  type="range" 
                  min={baseLevels[selectedNode.id] || 0} 
                  max={selectedNode.maxLevel} 
                  value={targetLevels[selectedNode.id] || 0}
                  onChange={(e) => onTargetChange(selectedNode.id, parseInt(e.target.value))}
                  className="flex-1 mx-4 accent-yellow-500"
                />
                <button 
                  onClick={() => onTargetChange(selectedNode.id, Math.min(selectedNode.maxLevel, (targetLevels[selectedNode.id] || 0) + 1))}
                  disabled={(targetLevels[selectedNode.id] || 0) === selectedNode.maxLevel}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg text-white disabled:opacity-50 transition-colors
                    ${selectedNode.branch === 'blue' ? 'bg-blue-600 hover:bg-blue-500' : ''}
                    ${selectedNode.branch === 'red' ? 'bg-red-600 hover:bg-red-500' : ''}
                    ${selectedNode.branch === 'green' ? 'bg-green-600 hover:bg-green-500' : ''}
                  `}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-yellow-900/30">
              <button 
                onClick={() => onTargetChange(selectedNode.id, selectedNode.maxLevel)}
                className="text-xs text-yellow-500 hover:text-yellow-400 uppercase font-mono tracking-wider transition-colors drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
              >
                {t('luminio.max_out', 'MAX AL Nivel')} {selectedNode.maxLevel}
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    onBaseChange(selectedNode.id, 0);
                    onTargetChange(selectedNode.id, 0);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-300 uppercase font-mono tracking-wider transition-colors"
                >
                  {t('luminio.reset_node', 'Resetear')}
                </button>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="w-6 h-6 flex items-center justify-center rounded bg-green-600 hover:bg-green-500 text-white transition-colors"
                  title="Aceptar"
                >
                  <Check size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Module */}
      <div className="bg-gradient-to-t from-black/95 via-yellow-900/10 to-black/60 border-t border-yellow-900/30 p-6 md:p-8 flex flex-col items-center">
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
    </div>
  );
};

export default LuminioTree;
