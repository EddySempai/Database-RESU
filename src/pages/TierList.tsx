import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import operativosData from '../data/operativos.json';

const PVP_EARLY_GAME = {
  S: ['sheva', 'barry', 'mark', 'chris'],
  A: ['sherry', 'carlos', 'ashley', 'piers', 'luis', 'rebecca', 'marvin'],
  B: ['excella', 'jake', 'robert', 'tyrone', 'jack', 'tyrell', 'nemesis', 'leon', 'mikhail'],
  C: ['ada', 'brad', 'claire', 'jill', 'samurai', 'becca'],
  D: ['alyssa', 'billy', 'katherine', 'murphy', 'david']
};

const TIER_COLORS = {
  S: 'bg-red-400',
  A: 'bg-orange-300',
  B: 'bg-yellow-300',
  C: 'bg-green-200',
  D: 'bg-blue-200'
};

const TierList = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pvp-early');

  const getOperative = (id: string) => {
    return operativosData.find(op => op.id === id) || { id, name: id, imageUrl: `https://www.residentevil-survivalunit.com/assets/images/common/character-${id}-visual.png` };
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bebas tracking-widest text-white mb-4">
          {t('tier_title', 'Tier List')}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {t('tier_desc', 'Descubre quiénes son los mejores personajes para el meta actual.')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <button 
          className={`px-6 py-2 font-bebas text-xl tracking-wider ${activeTab === 'pvp-early' ? 'bg-blood-red text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          onClick={() => setActiveTab('pvp-early')}
        >
          PVP (Early Game)
        </button>
      </div>

      {/* Tier List */}
      <div className="flex flex-col gap-1 bg-[#111] p-2 rounded-lg shadow-2xl border border-gray-800">
        {Object.entries(PVP_EARLY_GAME).map(([tier, ids]) => (
          <div key={tier} className="flex min-h-[100px] border-b border-gray-900 last:border-b-0">
            <div className={`w-24 ${TIER_COLORS[tier as keyof typeof TIER_COLORS]} flex items-center justify-center text-black font-bebas text-4xl shadow-inner`}>
              {tier}
            </div>
            <div className="flex-1 bg-[#1a1a1a] p-2 flex flex-wrap gap-2">
              {ids.map(id => {
                const op = getOperative(id);
                return (
                  <div key={id} className="relative group w-20 h-20 md:w-24 md:h-24 overflow-hidden border-2 border-gray-700 hover:border-blood-red transition-colors cursor-pointer bg-black">
                    {op.imageUrl ? (
                      <img 
                        src={op.imageUrl} 
                        alt={op.name} 
                        className="w-full h-full object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=?'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 break-words text-center">{op.name}</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[10px] text-center opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      {op.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierList;
