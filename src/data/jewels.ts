export type JewelTier = 
  | 'None'
  | 'Advance' 
  | 'Advance+' 
  | 'Rare' 
  | 'Rare+' 
  | 'Epic' 
  | 'Epic+' 
  | 'Epic++' 
  | 'Legend' 
  | 'Legend+' 
  | 'Legend++' 
  | 'Legend+++'
  | 'Mythic'
  | 'Mythic+'
  | 'Mythic++'
  | 'Mythic+++'
  | 'Mythic++++';

export interface JewelCost {
  roughJewel: number;
  jewelTool: number;
  advanceTool: number;
}

export const JEWEL_TIERS: JewelTier[] = [
  'None',
  'Advance', 
  'Advance+', 
  'Rare', 
  'Rare+', 
  'Epic', 
  'Epic+', 
  'Epic++', 
  'Legend', 
  'Legend+', 
  'Legend++', 
  'Legend+++',
  'Mythic',
  'Mythic+',
  'Mythic++',
  'Mythic+++',
  'Mythic++++'
];

export const JEWEL_COSTS: Record<JewelTier, JewelCost> = {
  'None': { roughJewel: 0, jewelTool: 0, advanceTool: 0 },
  'Advance': { roughJewel: 5, jewelTool: 5, advanceTool: 0 },
  'Advance+': { roughJewel: 40, jewelTool: 15, advanceTool: 0 },
  'Rare': { roughJewel: 60, jewelTool: 40, advanceTool: 0 },
  'Rare+': { roughJewel: 80, jewelTool: 100, advanceTool: 0 },
  'Epic': { roughJewel: 100, jewelTool: 200, advanceTool: 0 },
  'Epic+': { roughJewel: 120, jewelTool: 300, advanceTool: 0 },
  'Epic++': { roughJewel: 140, jewelTool: 350, advanceTool: 0 },
  'Legend': { roughJewel: 200, jewelTool: 400, advanceTool: 0 },
  'Legend+': { roughJewel: 300, jewelTool: 430, advanceTool: 0 },
  'Legend++': { roughJewel: 400, jewelTool: 460, advanceTool: 0 },
  'Legend+++': { roughJewel: 500, jewelTool: 490, advanceTool: 0 },
  'Mythic': { roughJewel: 580, jewelTool: 500, advanceTool: 15 },
  'Mythic+': { roughJewel: 860, jewelTool: 570, advanceTool: 30 },
  'Mythic++': { roughJewel: 1140, jewelTool: 640, advanceTool: 45 },
  'Mythic+++': { roughJewel: 1420, jewelTool: 710, advanceTool: 60 },
  'Mythic++++': { roughJewel: 1700, jewelTool: 780, advanceTool: 75 }
};

export const getJewelCostBetweenTiers = (currentTier: JewelTier, targetTier: JewelTier): JewelCost => {
  const currentIndex = JEWEL_TIERS.indexOf(currentTier);
  const targetIndex = JEWEL_TIERS.indexOf(targetTier);

  if (currentIndex >= targetIndex) {
    return { roughJewel: 0, jewelTool: 0, advanceTool: 0 };
  }

  let totalRoughJewel = 0;
  let totalJewelTool = 0;
  let totalAdvanceTool = 0;

  for (let i = currentIndex + 1; i <= targetIndex; i++) {
    const tier = JEWEL_TIERS[i];
    totalRoughJewel += JEWEL_COSTS[tier].roughJewel;
    totalJewelTool += JEWEL_COSTS[tier].jewelTool;
    totalAdvanceTool += JEWEL_COSTS[tier].advanceTool;
  }

  return { 
    roughJewel: totalRoughJewel, 
    jewelTool: totalJewelTool,
    advanceTool: totalAdvanceTool
  };
};

export const getJewelImageUrl = (tier: JewelTier, colorIndex: number): string => {
  if (tier === 'None') return 'https://via.placeholder.com/80/000000/000000?text=+';
  const tierIndex = JEWEL_TIERS.indexOf(tier); // 'None' is 0, 'Advance' is 1 (Item_Jewel_1_X.webp), ..., 'Mythic++++' is 16 (Item_Jewel_16_X.webp)
  return `/jewels/Item_Jewel_${tierIndex}_${colorIndex}.webp`;
};

export const getJewelRarityStyle = (tier: JewelTier) => {
  switch (tier) {
    case 'Advance': return { border: 'border-green-500/50', text: 'text-green-400', bg: 'bg-green-900/10', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]', hover: 'hover:border-green-500/50 hover:bg-green-900/20' };
    case 'Advance+': return { border: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-900/10', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]', hover: 'hover:border-emerald-500/50 hover:bg-emerald-900/20' };
    case 'Rare': return { border: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-900/10', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]', hover: 'hover:border-blue-500/50 hover:bg-blue-900/20' };
    case 'Rare+': return { border: 'border-cyan-500/50', text: 'text-cyan-400', bg: 'bg-cyan-900/10', shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]', hover: 'hover:border-cyan-500/50 hover:bg-cyan-900/20' };
    case 'Epic': return { border: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-900/10', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]', hover: 'hover:border-purple-500/50 hover:bg-purple-900/20' };
    case 'Epic+': return { border: 'border-fuchsia-500/50', text: 'text-fuchsia-400', bg: 'bg-fuchsia-900/10', shadow: 'shadow-[0_0_20px_rgba(217,70,239,0.3)]', hover: 'hover:border-fuchsia-500/50 hover:bg-fuchsia-900/20' };
    case 'Epic++': return { border: 'border-pink-500/50', text: 'text-pink-400', bg: 'bg-pink-900/10', shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]', hover: 'hover:border-pink-500/50 hover:bg-pink-900/20' };
    case 'Legend': return { border: 'border-yellow-500/50', text: 'text-yellow-400', bg: 'bg-yellow-900/10', shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]', hover: 'hover:border-yellow-500/50 hover:bg-yellow-900/20' };
    case 'Legend+': return { border: 'border-amber-500/50', text: 'text-amber-400', bg: 'bg-amber-900/10', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', hover: 'hover:border-amber-500/50 hover:bg-amber-900/20' };
    case 'Legend++': return { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-900/10', shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]', hover: 'hover:border-orange-500/50 hover:bg-orange-900/20' };
    case 'Legend+++': return { border: 'border-amber-400/70', text: 'text-amber-300', bg: 'bg-amber-950/20', shadow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]', hover: 'hover:border-amber-400 hover:bg-amber-900/30' };
    case 'Mythic': return { border: 'border-red-600/60', text: 'text-red-400', bg: 'bg-red-950/20', shadow: 'shadow-[0_0_20px_rgba(220,38,38,0.4)]', hover: 'hover:border-red-500 hover:bg-red-900/30' };
    case 'Mythic+': return { border: 'border-red-500/70', text: 'text-red-400', bg: 'bg-red-950/30', shadow: 'shadow-[0_0_22px_rgba(239,68,68,0.5)]', hover: 'hover:border-red-400 hover:bg-red-900/40' };
    case 'Mythic++': return { border: 'border-rose-500/70', text: 'text-rose-400', bg: 'bg-rose-950/30', shadow: 'shadow-[0_0_25px_rgba(244,63,94,0.5)]', hover: 'hover:border-rose-400 hover:bg-rose-900/40' };
    case 'Mythic+++': return { border: 'border-red-500', text: 'text-red-300', bg: 'bg-red-950/40', shadow: 'shadow-[0_0_28px_rgba(239,68,68,0.6)]', hover: 'hover:border-red-400 hover:bg-red-900/50' };
    case 'Mythic++++': return { border: 'border-red-400 ring-1 ring-red-500/50', text: 'text-red-200', bg: 'bg-gradient-to-br from-red-950/60 to-black', shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.8)]', hover: 'hover:border-red-300 hover:ring-red-400 hover:bg-red-900/60' };
    case 'None': return { border: 'border-dashed border-gray-700', text: 'text-gray-600', bg: 'bg-black/40', shadow: 'shadow-none', hover: 'hover:border-gray-500' };
    default: return { border: 'border-gray-600/50', text: 'text-gray-500', bg: 'bg-gray-900/10', shadow: 'shadow-none', hover: 'hover:border-gray-600 hover:bg-gray-800/30' };
  }
};

export const TREASURE_GEM_COLORS: number[][] = [
  [1, 2, 1], // Tesoro 1: Rojo, Azul, Rojo
  [3, 1, 3], // Tesoro 2: Amarillo, Rojo, Amarillo
  [1, 2, 1], // Tesoro 3: Rojo, Azul, Rojo
  [2, 3, 2], // Tesoro 4: Azul, Amarillo, Azul
  [3, 1, 3], // Tesoro 5: Amarillo, Rojo, Amarillo
  [2, 3, 2], // Tesoro 6: Azul, Amarillo, Azul
];

// Jewel IDs based on their corresponding treasure indices
export const JEWELS = Array.from({ length: 18 }, (_, i) => {
  const treasureIndex = Math.floor(i / 3);
  const gemInTreasure = i % 3;
  const colorIndex = TREASURE_GEM_COLORS[treasureIndex][gemInTreasure];
  return {
    id: `jewel_${i}`,
    treasureIndex,
    colorIndex
  };
});
