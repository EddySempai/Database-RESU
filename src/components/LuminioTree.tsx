import React, { useState } from 'react';
import { LUMINIO_NODES } from '../data/luminio';
import type { LuminioNodeConfig, LuminioBranch } from '../data/luminio';
import LuminioNode from './LuminioNode';
import { useTranslation } from 'react-i18next';
import { X, Shield, Crosshair, Droplet } from 'lucide-react';

interface LuminioTreeProps {
  levels: Record<string, number>;
  onLevelChange: (id: string, newLevel: number) => void;
}

const LuminioTree: React.FC<LuminioTreeProps> = ({ levels, onLevelChange }) => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<LuminioNodeConfig | null>(null);

  const branches: { id: LuminioBranch, title: string, color: string, icon: any }[] = [
    { id: 'blue', title: 'ATACANTE', color: 'blue', icon: Droplet },
    { id: 'green', title: 'DEFENSOR', color: 'green', icon: Shield },
    { id: 'red', title: 'RANGER', color: 'red', icon: Crosshair },
  ];

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
               const depNode = nodes.find(n => n.id === depId);
               if (!depNode) return null;
               
               const isDepActive = (levels[depNode.id] || 0) > 0;
               const isNodeActive = (levels[node.id] || 0) > 0;
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
              level={levels[node.id] || 0} 
              onClick={() => setSelectedNode(node)} 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8 bg-black/40 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
      <div className="p-6 md:p-8 border-b border-gray-800 bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-3xl md:text-5xl font-bebas tracking-widest text-white drop-shadow-md text-center md:text-left">
          SIMULADOR DE INVESTIGACION DE <span className="text-yellow-500">LUMINIO</span>
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
            <div className={`w-20 h-20 rounded-full border-2 mb-6 flex items-center justify-center relative z-20 transition-transform duration-500 group-hover:scale-110
              ${branch.color === 'blue' ? 'border-blue-500 bg-blue-900/20 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)]' : ''}
              ${branch.color === 'red' ? 'border-red-500 bg-red-900/20 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.4)]' : ''}
              ${branch.color === 'green' ? 'border-green-500 bg-green-900/20 text-green-400 shadow-[0_0_25px_rgba(34,197,94,0.4)]' : ''}
            `}>
              <branch.icon size={36} strokeWidth={1.5} />
            </div>
            
            {renderBranch(branch.id)}
          </div>
        ))}
      </div>
      
      {/* Popover / Modal for upgrading a node */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedNode(null)}>
          <div className="w-full max-w-md bg-gray-900/95 border border-gray-700 rounded-2xl shadow-2xl p-6 backdrop-blur-md animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
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
                <p className="text-sm text-gray-400 mt-1 font-mono">{t('luminio.level', 'Nivel')}: <span className="text-white font-bold">{levels[selectedNode.id] || 0}</span> / {selectedNode.maxLevel}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center bg-black/40 rounded-xl p-2 border border-gray-800">
              <button 
                onClick={() => onLevelChange(selectedNode.id, Math.max(0, (levels[selectedNode.id] || 0) - 1))}
                disabled={(levels[selectedNode.id] || 0) === 0}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50 transition-colors"
              >
                -
              </button>
              
              <input 
                type="range" 
                min="0" 
                max={selectedNode.maxLevel} 
                value={levels[selectedNode.id] || 0}
                onChange={(e) => onLevelChange(selectedNode.id, parseInt(e.target.value))}
                className="flex-1 mx-4 accent-red-500"
              />

              <button 
                onClick={() => onLevelChange(selectedNode.id, Math.min(selectedNode.maxLevel, (levels[selectedNode.id] || 0) + 1))}
                disabled={(levels[selectedNode.id] || 0) === selectedNode.maxLevel}
                className={`w-12 h-12 flex items-center justify-center rounded-lg text-white disabled:opacity-50 transition-colors
                  ${selectedNode.branch === 'blue' ? 'bg-blue-600 hover:bg-blue-500' : ''}
                  ${selectedNode.branch === 'red' ? 'bg-red-600 hover:bg-red-500' : ''}
                  ${selectedNode.branch === 'green' ? 'bg-green-600 hover:bg-green-500' : ''}
                `}
              >
                +
              </button>
            </div>
            
            <div className="mt-4 flex justify-between">
              <button 
                onClick={() => onLevelChange(selectedNode.id, selectedNode.maxLevel)}
                className="text-xs text-gray-400 hover:text-white uppercase font-mono tracking-wider transition-colors"
              >
                {t('luminio.max_out', 'MAX AL Nivel')} {selectedNode.maxLevel}
              </button>
              <button 
                onClick={() => onLevelChange(selectedNode.id, 0)}
                className="text-xs text-red-500 hover:text-red-400 uppercase font-mono tracking-wider transition-colors"
              >
                {t('luminio.reset_node', 'Resetear')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuminioTree;
