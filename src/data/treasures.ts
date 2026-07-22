export type TreasureRarity = 'None' | 'Rare' | 'Epic' | 'Epic+' | 'Legend' | 'Legend+' | 'Legend++' | 'Mythic' | 'Mythic+' | 'Mythic++' | 'Mythic+++' | 'Mythic++++';

export interface TreasureTier {
  id: string;
  rarity: TreasureRarity;
  level: number;
  index: number; // 0 = None, 1 = Rare T1, etc.
  cost: {
    goldFrag: number;
    polish: number;
    bluePrint: number;
    advancePolish: number;
  };
}

export const TREASURE_TIERS: TreasureTier[] = [
  { id: 'None', rarity: 'None', level: 0, index: 0, cost: { goldFrag: 0, polish: 0, bluePrint: 0, advancePolish: 0 } },
  
  // RARE
  { id: 'Rare T1', rarity: 'Rare', level: 1, index: 1, cost: { goldFrag: 0, polish: 0, bluePrint: 0, advancePolish: 0 } },
  { id: 'Rare T2', rarity: 'Rare', level: 2, index: 2, cost: { goldFrag: 9500, polish: 95, bluePrint: 0, advancePolish: 0 } },
  { id: 'Rare T3', rarity: 'Rare', level: 3, index: 3, cost: { goldFrag: 0, polish: 0, bluePrint: 45, advancePolish: 0 } },
  { id: 'Rare T4', rarity: 'Rare', level: 4, index: 4, cost: { goldFrag: 0, polish: 0, bluePrint: 50, advancePolish: 0 } },
  
  // EPIC
  { id: 'Epic T1', rarity: 'Epic', level: 1, index: 5, cost: { goldFrag: 0, polish: 0, bluePrint: 60, advancePolish: 0 } },
  { id: 'Epic T2', rarity: 'Epic', level: 2, index: 6, cost: { goldFrag: 0, polish: 0, bluePrint: 70, advancePolish: 0 } },
  { id: 'Epic T3', rarity: 'Epic', level: 3, index: 7, cost: { goldFrag: 0, polish: 0, bluePrint: 50, advancePolish: 0 } },
  { id: 'Epic T4', rarity: 'Epic', level: 4, index: 8, cost: { goldFrag: 8000, polish: 80, bluePrint: 55, advancePolish: 0 } },
  
  // EPIC+
  { id: 'Epic+ T1', rarity: 'Epic+', level: 1, index: 9, cost: { goldFrag: 9500, polish: 95, bluePrint: 60, advancePolish: 0 } },
  { id: 'Epic+ T2', rarity: 'Epic+', level: 2, index: 10, cost: { goldFrag: 11000, polish: 110, bluePrint: 65, advancePolish: 0 } },
  { id: 'Epic+ T3', rarity: 'Epic+', level: 3, index: 11, cost: { goldFrag: 12500, polish: 125, bluePrint: 70, advancePolish: 0 } },
  { id: 'Epic+ T4', rarity: 'Epic+', level: 4, index: 12, cost: { goldFrag: 16000, polish: 160, bluePrint: 100, advancePolish: 0 } },
  
  // LEGEND
  { id: 'Legend T1', rarity: 'Legend', level: 1, index: 13, cost: { goldFrag: 20000, polish: 200, bluePrint: 45, advancePolish: 0 } },
  { id: 'Legend T2', rarity: 'Legend', level: 2, index: 14, cost: { goldFrag: 22000, polish: 220, bluePrint: 50, advancePolish: 0 } },
  { id: 'Legend T3', rarity: 'Legend', level: 3, index: 15, cost: { goldFrag: 24000, polish: 240, bluePrint: 55, advancePolish: 0 } },
  { id: 'Legend T4', rarity: 'Legend', level: 4, index: 16, cost: { goldFrag: 26000, polish: 260, bluePrint: 60, advancePolish: 0 } },

  // LEGEND+
  { id: 'Legend+ T1', rarity: 'Legend+', level: 1, index: 17, cost: { goldFrag: 28000, polish: 280, bluePrint: 55, advancePolish: 0 } },
  { id: 'Legend+ T2', rarity: 'Legend+', level: 2, index: 18, cost: { goldFrag: 30000, polish: 300, bluePrint: 55, advancePolish: 0 } },
  { id: 'Legend+ T3', rarity: 'Legend+', level: 3, index: 19, cost: { goldFrag: 32000, polish: 320, bluePrint: 60, advancePolish: 0 } },
  { id: 'Legend+ T4', rarity: 'Legend+', level: 4, index: 20, cost: { goldFrag: 35000, polish: 350, bluePrint: 70, advancePolish: 0 } },

  // LEGEND++
  { id: 'Legend++ T1', rarity: 'Legend++', level: 1, index: 21, cost: { goldFrag: 38000, polish: 380, bluePrint: 70, advancePolish: 0 } },
  { id: 'Legend++ T2', rarity: 'Legend++', level: 2, index: 22, cost: { goldFrag: 42000, polish: 420, bluePrint: 80, advancePolish: 0 } },
  { id: 'Legend++ T3', rarity: 'Legend++', level: 3, index: 23, cost: { goldFrag: 46000, polish: 460, bluePrint: 90, advancePolish: 0 } },
  { id: 'Legend++ T4', rarity: 'Legend++', level: 4, index: 24, cost: { goldFrag: 50000, polish: 500, bluePrint: 100, advancePolish: 0 } },

  // MYTHIC
  { id: 'Mythic T1', rarity: 'Mythic', level: 1, index: 25, cost: { goldFrag: 50000, polish: 528, bluePrint: 84, advancePolish: 8 } },
  { id: 'Mythic T2', rarity: 'Mythic', level: 2, index: 26, cost: { goldFrag: 52000, polish: 560, bluePrint: 88, advancePolish: 8 } },
  { id: 'Mythic T3', rarity: 'Mythic', level: 3, index: 27, cost: { goldFrag: 54000, polish: 588, bluePrint: 92, advancePolish: 8 } },
  { id: 'Mythic T4', rarity: 'Mythic', level: 4, index: 28, cost: { goldFrag: 56000, polish: 620, bluePrint: 100, advancePolish: 8 } },

  // MYTHIC+ (Valores Extrapolados/Aproximados - Editables si difieren del juego)
  { id: 'Mythic+ T1', rarity: 'Mythic+', level: 1, index: 29, cost: { goldFrag: 58000, polish: 650, bluePrint: 105, advancePolish: 10 } },
  { id: 'Mythic+ T2', rarity: 'Mythic+', level: 2, index: 30, cost: { goldFrag: 60000, polish: 680, bluePrint: 110, advancePolish: 10 } },
  { id: 'Mythic+ T3', rarity: 'Mythic+', level: 3, index: 31, cost: { goldFrag: 62000, polish: 710, bluePrint: 115, advancePolish: 10 } },
  { id: 'Mythic+ T4', rarity: 'Mythic+', level: 4, index: 32, cost: { goldFrag: 65000, polish: 750, bluePrint: 125, advancePolish: 10 } },

  // MYTHIC++
  { id: 'Mythic++ T1', rarity: 'Mythic++', level: 1, index: 33, cost: { goldFrag: 68000, polish: 780, bluePrint: 130, advancePolish: 12 } },
  { id: 'Mythic++ T2', rarity: 'Mythic++', level: 2, index: 34, cost: { goldFrag: 72000, polish: 820, bluePrint: 140, advancePolish: 12 } },
  { id: 'Mythic++ T3', rarity: 'Mythic++', level: 3, index: 35, cost: { goldFrag: 76000, polish: 860, bluePrint: 150, advancePolish: 12 } },
  { id: 'Mythic++ T4', rarity: 'Mythic++', level: 4, index: 36, cost: { goldFrag: 80000, polish: 900, bluePrint: 160, advancePolish: 12 } },

  // MYTHIC+++
  { id: 'Mythic+++ T1', rarity: 'Mythic+++', level: 1, index: 37, cost: { goldFrag: 85000, polish: 950, bluePrint: 170, advancePolish: 15 } },
  { id: 'Mythic+++ T2', rarity: 'Mythic+++', level: 2, index: 38, cost: { goldFrag: 90000, polish: 1000, bluePrint: 180, advancePolish: 15 } },
  { id: 'Mythic+++ T3', rarity: 'Mythic+++', level: 3, index: 39, cost: { goldFrag: 95000, polish: 1050, bluePrint: 190, advancePolish: 15 } },
  { id: 'Mythic+++ T4', rarity: 'Mythic+++', level: 4, index: 40, cost: { goldFrag: 100000, polish: 1100, bluePrint: 200, advancePolish: 15 } },

  // MYTHIC++++
  { id: 'Mythic++++ T1', rarity: 'Mythic++++', level: 1, index: 41, cost: { goldFrag: 110000, polish: 1200, bluePrint: 220, advancePolish: 20 } },
  { id: 'Mythic++++ T2', rarity: 'Mythic++++', level: 2, index: 42, cost: { goldFrag: 120000, polish: 1300, bluePrint: 240, advancePolish: 20 } },
  { id: 'Mythic++++ T3', rarity: 'Mythic++++', level: 3, index: 43, cost: { goldFrag: 130000, polish: 1400, bluePrint: 260, advancePolish: 20 } },
  { id: 'Mythic++++ T4', rarity: 'Mythic++++', level: 4, index: 44, cost: { goldFrag: 140000, polish: 1500, bluePrint: 280, advancePolish: 20 } }
];

export const getCostBetweenTiers = (startIdx: number, endIdx: number) => {
  let totals = { goldFrag: 0, polish: 0, bluePrint: 0, advancePolish: 0 };
  if (startIdx >= endIdx) return totals;

  // The cost at index 'i' represents the cost to upgrade TO index 'i' FROM 'i-1'.
  for (let i = startIdx + 1; i <= endIdx; i++) {
    const tier = TREASURE_TIERS[i];
    if (tier) {
      totals.goldFrag += tier.cost.goldFrag;
      totals.polish += tier.cost.polish;
      totals.bluePrint += tier.cost.bluePrint;
      totals.advancePolish += tier.cost.advancePolish;
    }
  }
  return totals;
};

export const getRarityStyle = (rarity: TreasureRarity) => {
  switch(rarity) {
    case 'Rare': return { border: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-900/10', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]', gradient: 'from-blue-500/0 via-blue-500 to-blue-500/0', hover: 'hover:border-blue-500/50 hover:bg-blue-900/20', from: 'from-blue-900/30', to: 'to-blue-900/30', glow: 'bg-blue-500' };
    case 'Epic': return { border: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-900/10', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]', gradient: 'from-purple-500/0 via-purple-500 to-purple-500/0', hover: 'hover:border-purple-500/50 hover:bg-purple-900/20', from: 'from-purple-900/30', to: 'to-purple-900/30', glow: 'bg-purple-500' };
    case 'Epic+': return { border: 'border-fuchsia-500/50', text: 'text-fuchsia-400', bg: 'bg-fuchsia-900/10', shadow: 'shadow-[0_0_20px_rgba(217,70,239,0.3)]', gradient: 'from-fuchsia-500/0 via-fuchsia-500 to-fuchsia-500/0', hover: 'hover:border-fuchsia-500/50 hover:bg-fuchsia-900/20', from: 'from-fuchsia-900/30', to: 'to-fuchsia-900/30', glow: 'bg-fuchsia-500' };
    case 'Legend': return { border: 'border-yellow-500/50', text: 'text-yellow-400', bg: 'bg-yellow-900/10', shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]', gradient: 'from-yellow-500/0 via-yellow-500 to-yellow-500/0', hover: 'hover:border-yellow-500/50 hover:bg-yellow-900/20', from: 'from-yellow-900/30', to: 'to-yellow-900/30', glow: 'bg-yellow-500' };
    case 'Legend+': return { border: 'border-amber-500/50', text: 'text-amber-400', bg: 'bg-amber-900/10', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', gradient: 'from-amber-500/0 via-amber-500 to-amber-500/0', hover: 'hover:border-amber-500/50 hover:bg-amber-900/20', from: 'from-amber-900/30', to: 'to-amber-900/30', glow: 'bg-amber-500' };
    case 'Legend++': return { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-900/10', shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]', gradient: 'from-orange-500/0 via-orange-500 to-orange-500/0', hover: 'hover:border-orange-500/50 hover:bg-orange-900/20', from: 'from-orange-900/30', to: 'to-orange-900/30', glow: 'bg-orange-500' };
    case 'Mythic': return { border: 'border-red-500/50', text: 'text-red-400', bg: 'bg-red-900/10', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', gradient: 'from-red-500/0 via-red-500 to-red-500/0', hover: 'hover:border-red-500/50 hover:bg-red-900/20', from: 'from-red-900/30', to: 'to-red-900/30', glow: 'bg-red-500' };
    case 'Mythic+': return { border: 'border-rose-500/50', text: 'text-rose-400', bg: 'bg-rose-900/10', shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]', gradient: 'from-rose-500/0 via-rose-500 to-rose-500/0', hover: 'hover:border-rose-500/50 hover:bg-rose-900/20', from: 'from-rose-900/30', to: 'to-rose-900/30', glow: 'bg-rose-500' };
    case 'Mythic++': return { border: 'border-pink-500/50', text: 'text-pink-400', bg: 'bg-pink-900/10', shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]', gradient: 'from-pink-500/0 via-pink-500 to-pink-500/0', hover: 'hover:border-pink-500/50 hover:bg-pink-900/20', from: 'from-pink-900/30', to: 'to-pink-900/30', glow: 'bg-pink-500' };
    case 'Mythic+++': return { border: 'border-red-600/50', text: 'text-red-500', bg: 'bg-red-950/20', shadow: 'shadow-[0_0_25px_rgba(220,38,38,0.4)]', gradient: 'from-red-600/0 via-red-600 to-red-600/0', hover: 'hover:border-red-600/50 hover:bg-red-950/40', from: 'from-red-950/30', to: 'to-red-950/30', glow: 'bg-red-600' };
    case 'Mythic++++': return { border: 'border-red-700/50', text: 'text-red-500', bg: 'bg-red-950/30', shadow: 'shadow-[0_0_30px_rgba(185,28,28,0.5)]', gradient: 'from-red-700/0 via-red-700 to-red-700/0', hover: 'hover:border-red-700/50 hover:bg-red-950/60', from: 'from-red-950/40', to: 'to-red-950/40', glow: 'bg-red-700' };
    default: return { border: 'border-gray-600/50', text: 'text-gray-500', bg: 'bg-gray-900/10', shadow: 'shadow-none', gradient: 'from-transparent via-gray-600 to-transparent', hover: 'hover:border-gray-600 hover:bg-gray-800/30', from: 'from-transparent', to: 'to-transparent', glow: 'bg-transparent' };
  }
};
