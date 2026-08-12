import React from 'react';
import type { LuminioNodeConfig } from '../data/luminio';
import * as LucideIcons from 'lucide-react';

interface LuminioNodeProps {
  node: LuminioNodeConfig;
  level: number;
  onClick: () => void;
}

const LuminioNode: React.FC<LuminioNodeProps> = ({ node, level, onClick }) => {
  const IconComponent = (LucideIcons as any)[node.icon] || LucideIcons.Circle;
  const isMax = level === node.maxLevel;
  const isActive = level > 0;
  
  let glowColor = '';
  let bgColor = 'bg-gray-900';
  let borderColor = 'border-gray-700';
  let iconColor = 'text-gray-500';

  if (isActive) {
    if (node.branch === 'blue') {
      glowColor = 'shadow-[0_0_15px_rgba(59,130,246,0.6)]';
      bgColor = 'bg-blue-900';
      borderColor = 'border-blue-400';
      iconColor = 'text-blue-300';
    } else if (node.branch === 'red') {
      glowColor = 'shadow-[0_0_15px_rgba(239,68,68,0.6)]';
      bgColor = 'bg-red-900';
      borderColor = 'border-red-400';
      iconColor = 'text-red-300';
    } else if (node.branch === 'green') {
      glowColor = 'shadow-[0_0_15px_rgba(34,197,94,0.6)]';
      bgColor = 'bg-green-900';
      borderColor = 'border-green-400';
      iconColor = 'text-green-300';
    }
  }

  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer group z-20"
      onClick={onClick}
    >
      <div className={`relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-2 transition-all duration-300
        ${bgColor} ${borderColor} ${glowColor} group-hover:scale-110`}
      >
        <IconComponent size={24} className={iconColor} strokeWidth={isActive ? 2.5 : 1.5} />
        
        {/* Level Badge */}
        <div className={`absolute -bottom-2 px-2 py-0.5 rounded-full border text-[10px] md:text-xs font-mono font-bold whitespace-nowrap
          ${isActive ? 'bg-black border-gray-600 text-white' : 'bg-gray-900 border-gray-800 text-gray-500'}
          ${isMax ? 'text-yellow-400 border-yellow-600/50 shadow-[0_0_5px_rgba(234,179,8,0.3)]' : ''}
        `}>
          {level}/{node.maxLevel}
        </div>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute top-full mt-4 bg-black/95 border border-gray-700 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
        <p className="text-sm font-medium text-white">{node.defaultName}</p>
      </div>
    </div>
  );
};

export default LuminioNode;
