// src/data/llaverosProgression.ts
// Datos de progresión, EXP, poder de combate (CP) y ranuras de Llaveros en RE:SU

export interface KeyringCombatPowerStats {
  tier: 'Common' | 'Advanced' | 'Rare' | 'Epic' | 'Legendary';
  tierEs: string;
  tierEn: string;
  tierJa: string;
  color: string;
  badge: string;
  slots: string;
  slotsEn: string;
  slotsJa: string;
  cpLv10: number;
  cpLv20: number;
  cpLv30: number;
}

export const KEYRING_COMBAT_POWER: KeyringCombatPowerStats[] = [
  {
    tier: 'Common',
    tierEs: 'Común',
    tierEn: 'Common',
    tierJa: 'コモン',
    color: '#94a3b8',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    slots: '1 ranura equipable',
    slotsEn: '1 equippable slot',
    slotsJa: '装備スロット 1',
    cpLv10: 18_660,
    cpLv20: 27_660,
    cpLv30: 36_660
  },
  {
    tier: 'Advanced',
    tierEs: 'Poco Común',
    tierEn: 'Advanced',
    tierJa: 'アンコモン',
    color: '#22c55e',
    badge: 'bg-green-500/20 text-green-300 border-green-500/30',
    slots: '2 ranuras equipables',
    slotsEn: '2 equippable slots',
    slotsJa: '装備スロット 2',
    cpLv10: 44_760,
    cpLv20: 65_160,
    cpLv30: 85_560
  },
  {
    tier: 'Rare',
    tierEs: 'Raro',
    tierEn: 'Rare',
    tierJa: 'レア',
    color: '#3b82f6',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    slots: '2 a 3 ranuras equipables',
    slotsEn: '2-3 equippable slots',
    slotsJa: '装備スロット 2〜3',
    cpLv10: 63_900,
    cpLv20: 93_900,
    cpLv30: 123_900
  },
  {
    tier: 'Epic',
    tierEs: 'Épico',
    tierEn: 'Epic',
    tierJa: 'エピック',
    color: '#a855f7',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    slots: '3 a 4 ranuras equipables',
    slotsEn: '3-4 equippable slots',
    slotsJa: '装備スロット 3〜4',
    cpLv10: 107_370,
    cpLv20: 160_170,
    cpLv30: 212_970
  },
  {
    tier: 'Legendary',
    tierEs: 'Legendario',
    tierEn: 'Legendary',
    tierJa: 'レジェンダリー',
    color: '#f59e0b',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    slots: '3 a 4 ranuras equipables',
    slotsEn: '3-4 equippable slots',
    slotsJa: '装備スロット 3〜4',
    cpLv10: 128_220,
    cpLv20: 191_820,
    cpLv30: 255_420
  }
];

export interface KeyringExpMilestone {
  level: number;
  cumulativeExp: number;
  expDifference: number;
  description: string;
  descriptionEn: string;
  descriptionJa: string;
}

export const KEYRING_EXP_MILESTONES: KeyringExpMilestone[] = [
  {
    level: 10,
    cumulativeExp: 6_480,
    expDifference: 6_480,
    description: 'Primer escalón de evolución. Se desbloquean los rangos intermedios de sub-estadísticas.',
    descriptionEn: 'First evolution milestone. Intermediate sub-stat roll ranges are unlocked.',
    descriptionJa: '最初の進化段階。中間サブステータスの抽選範囲が解放されます。'
  },
  {
    level: 20,
    cumulativeExp: 43_600,
    expDifference: 37_120,
    description: 'Nivel medio de maestría. Aumento sustancial en las estadísticas en posesión pasivas.',
    descriptionEn: 'Mid-level mastery. Substantial increase in passive in-possession stats.',
    descriptionJa: '中級マスタリーレベル。所持パッシブステータスが大幅に向上します。'
  },
  {
    level: 30,
    cumulativeExp: 193_790,
    expDifference: 150_190,
    description: 'Nivel Máximo actual (v1.10.1). Otorga el 100% del potencial de sub-stats y pasivas.',
    descriptionEn: 'Current Maximum Level (v1.10.1). Unlocks 100% of sub-stat and passive potential.',
    descriptionJa: '現在の最大レベル（v1.10.1）。サブステータスとパッシブの100%の潜在能力を解放します。'
  }
];

export const KEYRING_CREATION_PROBABILITY = [20, 20, 20, 20, 20]; // 20% cada slot V1..V5
