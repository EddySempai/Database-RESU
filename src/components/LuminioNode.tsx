import React from 'react';
import { useTranslation } from 'react-i18next';
import type { LuminioNodeConfig } from '../data/luminio';
import * as LucideIcons from 'lucide-react';

interface LuminioNodeProps {
  node: LuminioNodeConfig;
  baseLevel: number;
  targetLevel: number;
  onClick: () => void;
}

const LuminioNode: React.FC<LuminioNodeProps> = ({ node, baseLevel, targetLevel, onClick }) => {
  const { t } = useTranslation();
  const IconComponent = (LucideIcons as any)[node.icon] || LucideIcons.Circle;
  const isMax = targetLevel === node.maxLevel;
  const isActive = targetLevel > 0;
  
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
          {baseLevel === targetLevel ? `${targetLevel}/${node.maxLevel}` : `${baseLevel} ➔ ${targetLevel}/${node.maxLevel}`}
        </div>
      </div>
      
      {/* Persistent Wrapping Label */}
      <div className="absolute top-full mt-3 w-20 md:w-24 flex flex-col items-center pointer-events-none">
        <p className="text-[9px] md:text-[10px] leading-tight text-center text-gray-400 font-medium font-sans drop-shadow-md">
          {t(node.nameKey, node.defaultName)}
        </p>
      </div>
    </div>
  );
};

export default LuminioNode;
