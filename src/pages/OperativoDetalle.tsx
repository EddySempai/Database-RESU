import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Star, Sword, Shield, Heart, ChevronLeft, Crosshair, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOperativos } from '../hooks/useOperativos';
import { calculateRequiredExp, calculateRequiredContracts, calculateSkillBooks, getMaxSkillsByRarity } from '../utils/calculators';
import EquipamientoView from '../components/EquipamientoView';

const isDefender = (type: string) => type?.toLowerCase().includes('defen') || type?.includes('ディフェン');
const isAttacker = (type: string) => type?.toLowerCase().includes('atac') || type?.toLowerCase().includes('attack') || type?.includes('アタッカー');
const isRanger = (type: string) => type?.toLowerCase().includes('rang') || type?.includes('レンジャー');

const getUnitIcon = (type: string) => {
  if (isDefender(type)) return <Shield size={14} />;
  if (isAttacker(type)) return <Sword size={14} />;
  if (isRanger(type)) return <Crosshair size={14} />;
  return null;
};

const getUnitColor = (type: string) => {
  if (isDefender(type)) return 'text-blue-400 bg-blue-900/40 border-blue-500/50';
  if (isAttacker(type)) return 'text-blood-red bg-blood-red/20 border-blood-red/50';
  if (isRanger(type)) return 'text-green-400 bg-green-900/40 border-green-500/50';
  return 'text-gray-400 bg-gray-800 border-gray-600';
};

const getCleanIconUrl = (url: string) => {
  if (!url) return '';
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith('/public')) {
    cleanUrl = cleanUrl.replace('/public', '');
  } else if (cleanUrl.startsWith('public/')) {
    cleanUrl = cleanUrl.replace('public/', '/');
  }
  if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
    cleanUrl = '/' + cleanUrl;
  }
  return cleanUrl;
};

const CHARACTER_BG_MAP: Record<string, string> = {
  barry: '/operativos/bg/Character_bg_01.webp',
  brad: '/operativos/bg/Character_bg_01.webp',
  mark: '/operativos/bg/Character_bg_02.webp',
  robert: '/operativos/bg/Character_bg_02.webp',
  becca: '/operativos/bg/Character_bg_02.webp',
  katherine: '/operativos/bg/Character_bg_02.webp',
  alyssa: '/operativos/bg/Character_bg_02.webp',
  tyrone: '/operativos/bg/Character_bg_02.webp',
  ada: '/operativos/bg/Character_bg_02.webp',
  carlos: '/operativos/bg/Character_bg_03.webp',
  mikhail: '/operativos/bg/Character_bg_03.webp',
  tyrell: '/operativos/bg/Character_bg_03.webp',
  murphy: '/operativos/bg/Character_bg_03.webp',
  jill: '/operativos/bg/Character_bg_03.webp',
  claire: '/operativos/bg/Character_bg_04.webp',
  marvin: '/operativos/bg/Character_bg_04.webp',
  leon: '/operativos/bg/Character_bg_04.webp',
  billy: '/operativos/bg/Character_bg_05.webp',
  rebecca: '/operativos/bg/Character_bg_05.webp',
  chris: '/operativos/bg/Character_bg_06.webp',
  ashley: '/operativos/bg/Character_bg_07.webp',
  luis: '/operativos/bg/Character_bg_08.webp',
  jack: '/operativos/bg/Character_bg_08.webp',
  krauser: '/operativos/bg/Character_bg_08.webp',
  piers: '/operativos/bg/Character_bg_09.webp',
  jake: '/operativos/bg/Character_bg_10.webp',
  sherry: '/operativos/bg/Character_bg_10.webp',
  cazadora: '/operativos/bg/Character_bg_11.webp',
  cazador: '/operativos/bg/Character_bg_11.webp'
};

const OperativoDetalle = () => {
  const { t } = useTranslation();
  const operativosData = useOperativos();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('skills'); // skills, exp, stars, books
  
  const op = operativosData.find((o: any) => o.id === id);

  // States for calculators
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(80);
  
  const [currentStar, setCurrentStar] = useState(0);
  const [currentNode, setCurrentNode] = useState(0);
  const [targetStar, setTargetStar] = useState(6);
  const [targetNode, setTargetNode] = useState(0);

  const [skillsState, setSkillsState] = useState<Record<string, { current: number; target: number }>>({
    c1: { current: 1, target: 5 },
    c2: { current: 1, target: 5 },
    c3: { current: 1, target: 5 },
    e1: { current: 1, target: 5 },
    e2: { current: 1, target: 5 },
    e3: { current: 1, target: 5 }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!op) {
    return (
      <div className="pt-32 text-center text-white h-screen">
        <h1 className="text-4xl font-bebas text-neon-red">{t('op_detail.not_found')}</h1>
        <Link to="/operativos" className="text-gray-400 hover:text-white mt-4 inline-block">{t('op_detail.back_to_db')}</Link>
      </div>
    );
  }

  // Determine rarity from stats or mock it (Legendary = 6 skills, Epic = 5)
  const rarity = op.rarity || 'Épico';
  const maxSkills = getMaxSkillsByRarity(rarity);

  const localImage = `/operativos/${op.imageUrl.split('/').pop()}`;

  // 6 Skills Breakdown for Books Calculator
  const fieldSkills = (op?.skills || []).filter((s: any) => s.type === 'Campo');
  const exploreSkills = (op?.skills || []).filter((s: any) => s.type === 'Exploración');

  const all6Skills = [
    { id: 'c1', type: 'Campo' as const, code: 'C1', name: (fieldSkills[0] as any)?.name || 'Habilidad de Campo 1', description: (fieldSkills[0] as any)?.description, iconUrl: (fieldSkills[0] as any)?.iconUrl },
    { id: 'c2', type: 'Campo' as const, code: 'C2', name: (fieldSkills[1] as any)?.name || 'Habilidad de Campo 2', description: (fieldSkills[1] as any)?.description, iconUrl: (fieldSkills[1] as any)?.iconUrl },
    { id: 'c3', type: 'Campo' as const, code: 'C3', name: (fieldSkills[2] as any)?.name || 'Habilidad de Campo 3', description: (fieldSkills[2] as any)?.description, iconUrl: (fieldSkills[2] as any)?.iconUrl },
    { id: 'e1', type: 'Exploración' as const, code: 'E1', name: (exploreSkills[0] as any)?.name || 'Habilidad de Exploración 1', description: (exploreSkills[0] as any)?.description, iconUrl: (exploreSkills[0] as any)?.iconUrl },
    { id: 'e2', type: 'Exploración' as const, code: 'E2', name: (exploreSkills[1] as any)?.name || 'Habilidad de Exploración 2', description: (exploreSkills[1] as any)?.description, iconUrl: (exploreSkills[1] as any)?.iconUrl },
    { id: 'e3', type: 'Exploración' as const, code: 'E3', name: (exploreSkills[2] as any)?.name || 'Habilidad de Exploración 3', description: (exploreSkills[2] as any)?.description, iconUrl: (exploreSkills[2] as any)?.iconUrl }
  ];

  const campoSkillsList = all6Skills.filter(s => s.type === 'Campo');
  const exploreSkillsList = all6Skills.filter(s => s.type === 'Exploración');

  const totalCampoBooks = campoSkillsList.reduce((sum, skill) => {
    const st = skillsState[skill.id] || { current: 1, target: 5 };
    return sum + calculateSkillBooks(st.current, st.target);
  }, 0);

  const totalExploreBooks = exploreSkillsList.reduce((sum, skill) => {
    const st = skillsState[skill.id] || { current: 1, target: 5 };
    return sum + calculateSkillBooks(st.current, st.target);
  }, 0);

  return (
    <div className={`pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen relative z-10 flex flex-col ${activeTab === 'equipment' ? '' : 'md:flex-row'} gap-8`}>
      <Helmet>
        <title>{op.name} | RE: Survival Unit Hub</title>
        <meta name="description" content={`${op.name} - Operativo de rareza ${rarity}. Revisa sus habilidades, estadísticas máximas y equipo recomendado.`} />
        <meta property="og:title" content={`${op.name} | RE: Survival Unit Hub`} />
        <meta property="og:description" content={`${op.name} - Operativo de rareza ${rarity}. Revisa sus habilidades, estadísticas máximas y equipo recomendado.`} />
        <meta property="og:image" content={op.iconUrl || `https://www.residentevil-survivalunit.com/operativos/${op.imageUrl.split('/').pop()}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      
      {/* Left Column: Visual & Stats */}
      {activeTab !== 'equipment' && (
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-1/3 flex flex-col"
      >
        <Link to="/operativos" className="flex items-center gap-2 text-gray-500 hover:text-white font-mono text-xs uppercase tracking-widest mb-6 transition-colors">
          <ChevronLeft size={16} /> {t('op_detail.back_to_db')}
        </Link>
        
        <div className="bg-[#050505] border border-gray-800 p-6 relative overflow-hidden group rounded-sm flex-1">
          {/* Fondo Temático Original a Color (Solo Sección Superior) */}
          {CHARACTER_BG_MAP[op.id] && (
            <div 
              className="absolute inset-x-0 top-0 h-[500px] bg-cover bg-center pointer-events-none opacity-80 rounded-t-sm transition-opacity duration-300"
              style={{ 
                backgroundImage: `url(${CHARACTER_BG_MAP[op.id]})`,
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 75%, transparent 100%)'
              }}
            />
          )}
          <div className="absolute inset-0 bg-blood-red/5 pointer-events-none" />
          <h1 className="font-bebas text-4xl text-white tracking-widest relative z-10 drop-shadow-[0_0_10px_rgba(255,42,42,0.5)]">
            {op.name}
          </h1>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <p className="font-mono text-gray-500 text-xs uppercase tracking-widest">{t('op_detail.tactical_dossier')}</p>
            {op.unitType && op.unitType !== 'Desconocido' && (
              <div className={`flex items-center gap-1 px-2 py-1 border text-[10px] font-mono uppercase tracking-widest ${getUnitColor(op.unitType)}`}>
                {getUnitIcon(op.unitType)} {op.unitType}
              </div>
            )}
          </div>
          
          <div className="aspect-[3/4] relative z-10 mb-6">
            <img 
              src={localImage} 
              alt={op.name} 
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
            />
          </div>

          {op.stats && (
            <div className="space-y-4 border-t border-gray-800 pt-6 relative z-10">
              <h3 className="font-mono text-gray-500 text-xs uppercase tracking-widest mb-2">{t('op_detail.max_stats')}</h3>
              <div className="flex items-center justify-between bg-black/50 p-3 border border-gray-800/50">
                <div className="flex items-center gap-2 text-green-500"><Heart size={16} /> <span className="font-bebas tracking-widest">{t('heroes.health')}</span></div>
                <span className="font-mono text-white">{op.stats.health.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between bg-black/50 p-3 border border-gray-800/50">
                <div className="flex items-center gap-2 text-blood-red"><Sword size={16} /> <span className="font-bebas tracking-widest">{t('heroes.attack')}</span></div>
                <span className="font-mono text-white">{op.stats.attack.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between bg-black/50 p-3 border border-gray-800/50">
                <div className="flex items-center gap-2 text-blue-500"><Shield size={16} /> <span className="font-bebas tracking-widest">{t('heroes.defense')}</span></div>
                <span className="font-mono text-white">{op.stats.defense.toLocaleString()}</span>
              </div>
            </div>
          )}

          {op.fieldStats && op.fieldStats.length > 0 && (
            <div className="mt-6 border-t border-gray-800 pt-6 relative z-10">
              <h3 className="font-mono text-blood-red text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sword size={14} /> {t('op_detail.field_bonuses')}
              </h3>
              <div className="space-y-3">
                {op.fieldStats.map((stat: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-blood-red/10 border border-blood-red/20 p-3">
                    <span className="text-gray-400 font-mono text-[10px] uppercase w-2/3">{stat.label}</span>
                    <span className="text-neon-red font-bebas text-lg tracking-widest">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Habilidades VIP (ej. Experto en combate) */}
          {((op as any).skills || []).filter((s: any) => s.isVipSkill).length > 0 && (
            <div className="mt-6 relative z-10 space-y-4">
              {((op as any).skills || []).filter((s: any) => s.isVipSkill).map((skill: any, idx: number) => (
                <div key={idx} className="bg-[#050505] rounded-xl border border-purple-500/20 p-4 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
                  <div className="group flex gap-4 items-start">
                    <div className="relative flex-shrink-0 flex items-center justify-center">
                      {skill.iconUrl ? (
                        <img 
                          src={skill.iconUrl} 
                          alt={skill.name} 
                          className="w-14 h-14 object-contain rounded-full shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-all duration-300" 
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-900 border border-gray-700 flex items-center justify-center font-bebas text-purple-500 rounded-full shadow-inner group-hover:scale-110 transition-all duration-300">
                          V{idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 mt-0.5">
                      <h4 className="text-gray-100 font-bebas tracking-widest text-lg group-hover:text-white transition-colors">{skill.name}</h4>
                      <p className="text-sm text-gray-400 font-inter mt-1.5 leading-relaxed group-hover:text-gray-300 transition-colors">{skill.description}</p>
                      <p className="text-[10px] text-purple-400 font-mono mt-4 uppercase tracking-widest">Se desbloquea con Arma Especial</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </motion.div>
      )}

      {/* Right Column: Tabs & Calculators */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className={`w-full flex flex-col ${activeTab === 'equipment' ? '' : 'md:w-2/3'}`}
      >
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-800 pb-2">
          {[
            { id: 'skills', label: t('op_detail.tab_skills') },
            { id: 'exp', label: t('op_detail.tab_exp') },
            { id: 'stars', label: t('op_detail.tab_stars') },
            { id: 'books', label: t('op_detail.tab_books') },
            { id: 'equipment', label: t('op_detail.tab_equipment') }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-xs uppercase tracking-widest px-4 py-3 transition-all cursor-pointer relative overflow-hidden rounded-t-sm ${
                activeTab === tab.id 
                ? (tab.id === 'equipment' 
                    ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] font-bold' 
                    : 'bg-blood-red/20 text-white border-b-2 border-blood-red') 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {activeTab === 'equipment' ? (
          <EquipamientoView op={op} />
        ) : (
        <div className="bg-[#050505] border border-gray-800 p-6 flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
          {/* TAB: Habilidades */}
          {activeTab === 'skills' && (
            <div>
              <h2 className="font-bebas text-3xl tracking-widest text-white mb-6 flex items-center gap-3">
                <Star className="text-neon-red" /> {t('comparador.skill_archives')}
              </h2>
              <div className="text-gray-400 font-mono text-sm mb-8 leading-relaxed">
                {t('op_detail.rarity_desc_1')} <span className="text-white font-mono">{rarity}</span>{t('op_detail.rarity_desc_2')} <span className="text-neon-red font-bold font-mono">{maxSkills}</span>{t('op_detail.rarity_desc_3')}
              </div>
              <div className="mt-6">
                <div className="bg-black border border-gray-800 p-3">
                  <div className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Users size={12} /> {t('op_detail.base_troops')}
                  </div>
                  <div className="text-white font-bebas text-xl tracking-widest">{((op as any).stats?.troops || 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Exploración Skills */}
                <div className="rounded-xl border border-gray-800/80 bg-gradient-to-b from-black/80 to-black/40 p-5 backdrop-blur-sm shadow-xl">
                  <div className="border-b border-emerald-500/20 pb-3 mb-5">
                    <h3 className="font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      {t('op_detail.explore_skills')}
                    </h3>
                  </div>
                  <div className="space-y-5">
                    {((op as any).skills || []).filter((s: any) => s.type === 'Exploración' && !s.isArmaEspecial && !s.isVipSkill).map((skill: any, idx: number) => (
                      <div key={idx} className="group flex gap-5 items-start p-3 rounded-lg hover:bg-white/[0.03] border border-transparent hover:border-white/10 transition-all duration-300">
                        <div className="relative flex-shrink-0 flex items-center justify-center">
                          {skill.iconUrl ? (
                            <img 
                              src={getCleanIconUrl(skill.iconUrl)} 
                              alt={skill.name} 
                              className="w-14 h-14 object-contain rounded-full shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-all duration-300" 
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-900 border border-gray-700 flex items-center justify-center font-bebas text-emerald-500 rounded-full shadow-inner group-hover:scale-110 transition-all duration-300">
                              E{idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 mt-0.5">
                          <h4 className="text-gray-100 font-bebas tracking-widest text-lg group-hover:text-white transition-colors">{skill.name}</h4>
                          <p className="text-sm text-gray-400 font-inter mt-1.5 leading-relaxed group-hover:text-gray-300 transition-colors">{skill.description}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Habilidad Especial de Exploración */}
                    {((op as any).skills || []).filter((s: any) => s.type === 'Exploración' && s.isArmaEspecial).length > 0 && (
                      <div className="pt-4 mt-2 border-t border-purple-500/20">
                        <h4 className="font-mono text-purple-500 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.8)]"></span>
                          Habilidad de Arma Especial
                        </h4>
                        {((op as any).skills || []).filter((s: any) => s.type === 'Exploración' && s.isArmaEspecial).map((skill: any, idx: number) => (
                          <div key={idx} className="group flex gap-5 items-start p-3 rounded-lg hover:bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 bg-purple-900/5">
                            <div className="relative flex-shrink-0 flex items-center justify-center">
                              {skill.iconUrl ? (
                                <img 
                                  src={getCleanIconUrl(skill.iconUrl)} 
                                  alt={skill.name} 
                                  className="w-14 h-14 object-contain rounded-full shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-all duration-300" 
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gray-900 border border-gray-700 flex items-center justify-center font-bebas text-purple-500 rounded-full shadow-inner group-hover:scale-110 transition-all duration-300">
                                  A{idx + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 mt-0.5">
                              <h4 className="text-gray-100 font-bebas tracking-widest text-lg group-hover:text-white transition-colors">{skill.name}</h4>
                              <p className="text-sm text-gray-400 font-inter mt-1.5 leading-relaxed group-hover:text-gray-300 transition-colors">{skill.description}</p>
                              <p className="text-[10px] text-purple-400 font-mono mt-3 uppercase tracking-widest">Se desbloquea con Arma Especial</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Campo Skills */}
                <div className="rounded-xl border border-gray-800/80 bg-gradient-to-b from-black/80 to-black/40 p-5 backdrop-blur-sm shadow-xl">
                  <div className="border-b border-blood-red/20 pb-3 mb-5">
                    <h3 className="font-mono text-blood-red uppercase tracking-widest flex items-center gap-3">
                      <span className="w-2 h-2 bg-blood-red rounded-full shadow-[0_0_8px_#ff0000]"></span>
                      {t('op_detail.field_skills')}
                    </h3>
                  </div>
                  <div className="space-y-5">
                    {((op as any).skills || []).filter((s: any) => s.type === 'Campo' && !s.isArmaEspecial && !s.isVipSkill).map((skill: any, idx: number) => (
                      <div key={idx} className="group flex gap-5 items-start p-3 rounded-lg hover:bg-white/[0.03] border border-transparent hover:border-white/10 transition-all duration-300">
                        <div className="relative flex-shrink-0 flex items-center justify-center">
                          {skill.iconUrl ? (
                            <img 
                              src={getCleanIconUrl(skill.iconUrl)} 
                              alt={skill.name} 
                              className="w-14 h-14 object-contain rounded-full shadow-[0_0_15px_rgba(220,38,38,0.15)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-all duration-300" 
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-900 border border-gray-700 flex items-center justify-center font-bebas text-blood-red rounded-full shadow-inner group-hover:scale-110 transition-all duration-300">
                              C{idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 mt-0.5">
                          <h4 className="text-gray-100 font-bebas tracking-widest text-lg group-hover:text-white transition-colors">{skill.name}</h4>
                          <p className="text-sm text-gray-400 font-inter mt-1.5 leading-relaxed group-hover:text-gray-300 transition-colors">{skill.description}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Habilidad Especial de Campo */}
                    {((op as any).skills || []).filter((s: any) => s.type === 'Campo' && s.isArmaEspecial).length > 0 && (
                      <div className="pt-4 mt-2 border-t border-purple-500/20">
                        <h4 className="font-mono text-purple-500 text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.8)]"></span>
                          Habilidad de Arma Especial
                        </h4>
                        {((op as any).skills || []).filter((s: any) => s.type === 'Campo' && s.isArmaEspecial).map((skill: any, idx: number) => (
                          <div key={idx} className="group flex gap-5 items-start p-3 rounded-lg hover:bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 bg-purple-900/5">
                            <div className="relative flex-shrink-0 flex items-center justify-center">
                              {skill.iconUrl ? (
                                <img 
                                  src={getCleanIconUrl(skill.iconUrl)} 
                                  alt={skill.name} 
                                  className="w-14 h-14 object-contain rounded-full shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-all duration-300" 
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gray-900 border border-gray-700 flex items-center justify-center font-bebas text-purple-500 rounded-full shadow-inner group-hover:scale-110 transition-all duration-300">
                                  A{idx + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 mt-0.5">
                              <h4 className="text-gray-100 font-bebas tracking-widest text-lg group-hover:text-white transition-colors">{skill.name}</h4>
                              <p className="text-sm text-gray-400 font-inter mt-1.5 leading-relaxed group-hover:text-gray-300 transition-colors">{skill.description}</p>
                              <p className="text-[10px] text-purple-400 font-mono mt-3 uppercase tracking-widest">Se desbloquea con Arma Especial</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                              </div>
            </div>
          )}

          {/* TAB: Calc Experiencia */}
          {activeTab === 'exp' && (
            <div>
              <h2 className="font-bebas text-3xl tracking-widest text-white mb-2 flex items-center gap-3">
                <img src="/recursos/book_exp.webp" alt="Libro EXP" className="w-8 h-8 object-contain" />
                {t('op_detail.tab_exp')}
              </h2>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-8">{t('op_detail.exp_plan')}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-gray-400 font-mono text-xs uppercase mb-2">{t('op_detail.curr_level')}</label>
                  <input 
                    placeholder='0'
                    type="number" min="1" max="80" 
                    value={currentLevel} 
                    onChange={e => {
                      let val = Number(e.target.value);
                      if (val > 80) val = 80;
                      if (val < 1 && e.target.value !== '') val = 1;
                      setCurrentLevel(val);
                    }}
                    className="w-full bg-black border border-gray-700 text-white p-3 font-mono outline-none focus:border-neon-red"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-xs uppercase mb-2">{t('op_detail.target_level')}</label>
                  <input 
                    placeholder='0'
                    type="number" min="1" max="80" 
                    value={targetLevel} 
                    onChange={e => {
                      let val = Number(e.target.value);
                      if (val > 80) val = 80;
                      if (val < 1 && e.target.value !== '') val = 1;
                      setTargetLevel(val);
                    }}
                    className="w-full bg-black border border-gray-700 text-white p-3 font-mono outline-none focus:border-neon-red"
                  />
                </div>
              </div>

              <div className="bg-blood-red/10 border border-blood-red/30 p-6 text-center flex flex-col items-center justify-center relative overflow-hidden group">
                <p className="font-mono text-gray-400 text-sm uppercase mb-2 flex items-center justify-center gap-2 tracking-wider">
                  <img src="/recursos/book_exp.webp" alt="Libro de Experiencia" className="w-5 h-5 object-contain opacity-80" />
                  {t('op_detail.total_exp_req')}
                </p>
                <div className="flex items-center justify-center gap-3 my-1">
                  <img src="/recursos/book_exp.webp" alt="Libro EXP" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_12px_rgba(220,38,38,0.5)] transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-bebas text-5xl md:text-6xl text-neon-red tracking-widest drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                    {calculateRequiredExp(currentLevel, targetLevel).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Calc Contratos (Estrellas) */}
          {activeTab === 'stars' && (
            <div>
              <h2 className="font-bebas text-3xl tracking-widest text-white mb-2 flex items-center gap-3">
                <img src="/recursos/contract.webp" alt="Contrato" className="w-8 h-8 object-contain" />
                {t('op_detail.ascension_calc')}
              </h2>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-8">{t('op_detail.req_contracts')}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-black/30 p-6 border border-gray-800">
                
                {/* ESTADO ACTUAL */}
                <div className="flex flex-col items-center justify-center space-y-6 border-b md:border-b-0 md:border-r border-gray-800 pb-6 md:pb-0 md:pr-6">
                  <h3 className="font-mono text-neon-red text-sm tracking-widest uppercase mb-2">{t('op_detail.curr_state')}</h3>
                  
                  {/* Visual Stars */}
                  <div className="flex gap-1.5 cursor-pointer items-center">
                    {[0, 1, 2, 3, 4, 5].map(i => {
                      const isFilled = currentStar > i;
                      const isPurple = currentStar === 6;
                      const starImage = isPurple 
                        ? '/stars/Hero_Star_6_00.webp' 
                        : '/stars/Hero_Star_00.webp';
                      
                      return (
                        <div 
                          key={i} 
                          onClick={() => { setCurrentStar(i + 1); setCurrentNode(0); }} 
                          className="relative w-8 h-8 md:w-10 md:h-10 transition-transform hover:scale-115 flex items-center justify-center"
                        >
                          <img 
                            src={isFilled ? starImage : '/stars/Hero_Star_Back_01.webp'} 
                            alt={`Star ${i + 1}`} 
                            className={`w-full h-full object-contain filter drop-shadow-md transition-all duration-300 ${isFilled ? 'brightness-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'opacity-40 grayscale'}`} 
                            onError={(e) => {
                              // Fallback if image not found
                              e.currentTarget.src = isFilled ? '/stars/Hero_Star_00.webp' : '/stars/Hero_Star_Back_01.webp';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Node (Astas) Controls */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        let ns = currentStar, nn = currentNode - 1;
                        if (nn < 0) { if (ns > 0) { ns--; nn = 4; } else { nn = 0; } }
                        setCurrentStar(ns); setCurrentNode(nn);
                      }} 
                      disabled={currentStar === 0 && currentNode === 0}
                      className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:border-neon-red transition-colors disabled:opacity-30 disabled:hover:border-gray-700 rounded-sm font-mono font-bold"
                    >-</button>
                    
                    <div className="flex gap-1.5 items-center">
                       {[1, 2, 3, 4, 5].map(n => {
                          const isActive = currentStar === 6 || n <= currentNode;
                          const isPurple = currentStar === 6;
                          const nodeImage = isPurple 
                            ? `/stars/Hero_Star_6_P_0${n}.webp` 
                            : `/stars/Hero_Star_P_0${n}.webp`;

                          return (
                            <img 
                              key={n} 
                              src={nodeImage}
                              alt={`Node ${n}`}
                              className={`w-6 h-6 object-contain transition-all duration-300 ${
                                isActive 
                                  ? 'brightness-125 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)] scale-105' 
                                  : 'opacity-25 grayscale'
                              }`}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          );
                       })}
                    </div>

                    <button 
                      onClick={() => {
                        let ns = currentStar, nn = currentNode + 1;
                        if (nn > 4) { if (ns < 6) { ns++; nn = 0; } else { nn = 0; } }
                        if (ns === 6) nn = 0;
                        setCurrentStar(ns); setCurrentNode(nn);
                      }} 
                      disabled={currentStar === 6}
                      className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:border-neon-red transition-colors disabled:opacity-30 disabled:hover:border-gray-700 rounded-sm font-mono font-bold"
                    >+</button>
                  </div>
                  
                  <div className="text-xs text-gray-500 font-mono tracking-widest uppercase mt-2">
                    {currentStar} {t('op_detail.star')} / {currentNode} {t('op_detail.node')}
                  </div>
                </div>

                {/* ESTADO DESEADO */}
                <div className="flex flex-col items-center justify-center space-y-6 pt-6 md:pt-0 md:pl-6">
                  <h3 className="font-mono text-yellow-500 text-sm tracking-widest uppercase mb-2">{t('op_detail.target')}</h3>
                  
                  {/* Visual Stars */}
                  <div className="flex gap-1.5 cursor-pointer items-center">
                    {[0, 1, 2, 3, 4, 5].map(i => {
                      const isFilled = targetStar > i;
                      const isPurple = targetStar === 6;
                      const starImage = isPurple 
                        ? '/stars/Hero_Star_6_00.webp' 
                        : '/stars/Hero_Star_00.webp';
                      
                      return (
                        <div 
                          key={i} 
                          onClick={() => { setTargetStar(i + 1); setTargetNode(0); }} 
                          className="relative w-8 h-8 md:w-10 md:h-10 transition-transform hover:scale-115 flex items-center justify-center"
                        >
                          <img 
                            src={isFilled ? starImage : '/stars/Hero_Star_Back_01.webp'} 
                            alt={`Target Star ${i + 1}`} 
                            className={`w-full h-full object-contain filter drop-shadow-md transition-all duration-300 ${isFilled ? 'brightness-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'opacity-40 grayscale'}`} 
                            onError={(e) => {
                              e.currentTarget.src = isFilled ? '/stars/Hero_Star_00.webp' : '/stars/Hero_Star_Back_01.webp';
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Node (Astas) Controls */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        let ns = targetStar, nn = targetNode - 1;
                        if (nn < 0) { if (ns > 0) { ns--; nn = 4; } else { nn = 0; } }
                        setTargetStar(ns); setTargetNode(nn);
                      }} 
                      disabled={targetStar === 0 && targetNode === 0}
                      className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:border-yellow-500 transition-colors disabled:opacity-30 disabled:hover:border-gray-700 rounded-sm font-mono font-bold"
                    >-</button>
                    
                    <div className="flex gap-1.5 items-center">
                       {[1, 2, 3, 4, 5].map(n => {
                          const isActive = targetStar === 6 || n <= targetNode;
                          const isPurple = targetStar === 6;
                          const nodeImage = isPurple 
                            ? `/stars/Hero_Star_6_P_0${n}.webp` 
                            : `/stars/Hero_Star_P_0${n}.webp`;

                          return (
                            <img 
                              key={n} 
                              src={nodeImage}
                              alt={`Target Node ${n}`}
                              className={`w-6 h-6 object-contain transition-all duration-300 ${
                                isActive 
                                  ? 'brightness-125 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)] scale-105' 
                                  : 'opacity-25 grayscale'
                              }`}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          );
                       })}
                    </div>

                    <button 
                      onClick={() => {
                        let ns = targetStar, nn = targetNode + 1;
                        if (nn > 4) { if (ns < 6) { ns++; nn = 0; } else { nn = 0; } }
                        if (ns === 6) nn = 0;
                        setTargetStar(ns); setTargetNode(nn);
                      }} 
                      disabled={targetStar === 6}
                      className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:border-yellow-500 transition-colors disabled:opacity-30 disabled:hover:border-gray-700 rounded-sm font-mono font-bold"
                    >+</button>
                  </div>
                  
                  <div className="text-xs text-gray-500 font-mono tracking-widest uppercase mt-2">
                    {targetStar} {t('op_detail.star')} / {targetNode} {t('op_detail.node')}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/10 border border-yellow-500/30 p-6 text-center flex flex-col items-center justify-center relative overflow-hidden group">
                <p className="font-mono text-gray-400 text-sm uppercase mb-2 flex items-center justify-center gap-2 tracking-wider">
                  <img src="/recursos/contract.webp" alt="Contrato" className="w-5 h-5 object-contain" />
                  {t('op_detail.total_contracts_req')}
                </p>
                <div className="flex items-center justify-center gap-3 my-1">
                  <img src="/recursos/contract.webp" alt="Icono Contrato" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_12px_rgba(234,179,8,0.5)] transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-bebas text-5xl md:text-6xl text-yellow-400 tracking-widest drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                    {calculateRequiredContracts(currentStar, currentNode, targetStar, targetNode).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-inter">{t('op_detail.contracts_note')}</p>
              </div>
            </div>
          )}

          {/* TAB: Calc Libros */}
          {activeTab === 'books' && (
            <div>
              {/* Header con botón de reset */}
              <div className="flex items-center justify-between gap-4 mb-6 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-neon-red" size={22} />
                  <h2 className="font-bebas text-2xl tracking-widest text-white uppercase">
                    {t('op_detail.books_calc')}
                  </h2>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSkillsState(prev => {
                        const next = { ...prev };
                        Object.keys(next).forEach(k => { next[k] = { ...next[k], target: 5 }; });
                        return next;
                      });
                    }}
                    className="px-3 py-1 bg-gray-900 border border-gray-700 text-gray-300 font-mono text-xs uppercase hover:text-yellow-400 hover:border-yellow-500/50 transition-colors rounded-sm"
                  >
                    Todas a Nv. 5
                  </button>
                  <button
                    onClick={() => {
                      setSkillsState({
                        c1: { current: 1, target: 1 },
                        c2: { current: 1, target: 1 },
                        c3: { current: 1, target: 1 },
                        e1: { current: 1, target: 1 },
                        e2: { current: 1, target: 1 },
                        e3: { current: 1, target: 1 }
                      });
                    }}
                    className="px-3 py-1 bg-gray-900 border border-gray-700 text-gray-400 font-mono text-xs uppercase hover:text-white transition-colors rounded-sm"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>

              {/* LISTA LIMPIA DE HABILIDADES DE EXPLORACIÓN (LIBRO VERDE) */}
              <div className="mb-6">
                <h3 className="font-mono text-xs text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <img src="/recursos/book_explore.webp" alt="Exploración" className="w-4 h-4 object-contain opacity-80" />
                  Habilidades de Exploración
                </h3>
                <div className="space-y-2">
                  {exploreSkillsList.map(skill => {
                    const st = skillsState[skill.id] || { current: 1, target: 5 };
                    const cost = calculateSkillBooks(st.current, st.target);

                    return (
                      <div
                        key={skill.id}
                        className="bg-[#070707] hover:bg-gradient-to-r hover:from-emerald-900/20 hover:via-[#070707] hover:to-transparent border border-gray-800/80 hover:border-emerald-500/40 p-3 rounded-sm flex items-center justify-between gap-4 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {skill.iconUrl ? (
                            <img 
                              src={getCleanIconUrl(skill.iconUrl)} 
                              alt={skill.name} 
                              className="w-9 h-9 object-contain rounded-full border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)] shrink-0" 
                            />
                          ) : (
                            <div className="w-7 h-7 bg-emerald-950/30 border border-emerald-800/40 text-emerald-500 font-bebas text-sm flex items-center justify-center rounded-sm shrink-0">
                              {skill.code}
                            </div>
                          )}
                          <h4 className="text-white font-bebas tracking-wider text-base truncate">
                            {skill.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400 bg-black/60 px-2 py-1 border border-gray-800 rounded-sm">
                            <span>Nv.</span>
                            <select
                              value={st.current}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSkillsState(prev => ({
                                  ...prev,
                                  [skill.id]: {
                                    ...(prev[skill.id] || { current: 1, target: 5 }),
                                    current: val,
                                    target: Math.max(val, (prev[skill.id]?.target || 5))
                                  }
                                }));
                              }}
                              className="bg-gray-900 border border-gray-700 text-white font-mono text-xs px-1.5 py-0.5 rounded-sm outline-none cursor-pointer hover:border-gray-500"
                            >
                              {[1, 2, 3, 4, 5].map(lvl => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                              ))}
                            </select>
                            <span className="text-gray-600">➔</span>
                            <select
                              value={st.target}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSkillsState(prev => ({
                                  ...prev,
                                  [skill.id]: {
                                    ...(prev[skill.id] || { current: 1, target: 5 }),
                                    target: val
                                  }
                                }));
                              }}
                              className="bg-gray-900 border border-gray-700 text-yellow-400 font-bold font-mono text-xs px-1.5 py-0.5 rounded-sm outline-none cursor-pointer hover:border-gray-500"
                            >
                              {[1, 2, 3, 4, 5].filter(lvl => lvl >= st.current).map(lvl => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 min-w-[60px] justify-end">
                            <img src="/recursos/book_explore.webp" alt="Libro Exploración" className="w-4 h-4 object-contain opacity-70" />
                            <span className="font-bebas text-xl text-yellow-400 tracking-wider">{cost}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LISTA LIMPIA DE HABILIDADES DE CAMPO (LIBRO ROJO) */}
              <div className="mb-6">
                <h3 className="font-mono text-xs text-blood-red uppercase tracking-widest mb-3 flex items-center gap-2">
                  <img src="/recursos/book_field.webp" alt="Campo" className="w-4 h-4 object-contain opacity-80" />
                  Habilidades de Campo
                </h3>
                <div className="space-y-2">
                  {campoSkillsList.map(skill => {
                    const st = skillsState[skill.id] || { current: 1, target: 5 };
                    const cost = calculateSkillBooks(st.current, st.target);

                    return (
                      <div
                        key={skill.id}
                        className="bg-[#070707] hover:bg-gradient-to-r hover:from-blood-red/15 hover:via-[#070707] hover:to-transparent border border-gray-800/80 hover:border-blood-red/40 p-3 rounded-sm flex items-center justify-between gap-4 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {skill.iconUrl ? (
                            <img 
                              src={getCleanIconUrl(skill.iconUrl)} 
                              alt={skill.name} 
                              className="w-9 h-9 object-contain rounded-full border border-blood-red/40 shadow-[0_0_8px_rgba(220,38,38,0.3)] shrink-0" 
                            />
                          ) : (
                            <div className="w-7 h-7 bg-red-950/30 border border-red-800/40 text-blood-red font-bebas text-sm flex items-center justify-center rounded-sm shrink-0">
                              {skill.code}
                            </div>
                          )}
                          <h4 className="text-white font-bebas tracking-wider text-base truncate">
                            {skill.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400 bg-black/60 px-2 py-1 border border-gray-800 rounded-sm">
                            <span>Nv.</span>
                            <select
                              value={st.current}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSkillsState(prev => ({
                                  ...prev,
                                  [skill.id]: {
                                    ...(prev[skill.id] || { current: 1, target: 5 }),
                                    current: val,
                                    target: Math.max(val, (prev[skill.id]?.target || 5))
                                  }
                                }));
                              }}
                              className="bg-gray-900 border border-gray-700 text-white font-mono text-xs px-1.5 py-0.5 rounded-sm outline-none cursor-pointer hover:border-gray-500"
                            >
                              {[1, 2, 3, 4, 5].map(lvl => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                              ))}
                            </select>
                            <span className="text-gray-600">➔</span>
                            <select
                              value={st.target}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setSkillsState(prev => ({
                                  ...prev,
                                  [skill.id]: {
                                    ...(prev[skill.id] || { current: 1, target: 5 }),
                                    target: val
                                  }
                                }));
                              }}
                              className="bg-gray-900 border border-gray-700 text-yellow-400 font-bold font-mono text-xs px-1.5 py-0.5 rounded-sm outline-none cursor-pointer hover:border-gray-500"
                            >
                              {[1, 2, 3, 4, 5].filter(lvl => lvl >= st.current).map(lvl => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 min-w-[60px] justify-end">
                            <img src="/recursos/book_field.webp" alt="Libro Campo" className="w-4 h-4 object-contain opacity-70" />
                            <span className="font-bebas text-xl text-yellow-400 tracking-wider">{cost}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

                            {/* CUADRO DE TOTALES ESTILO ANTIGUO (DORADO) */}
              <div className="bg-yellow-900/10 border border-yellow-500/30 p-6 text-center rounded-sm">
                <p className="font-mono text-gray-400 text-sm uppercase mb-3 tracking-widest">
                  {t('op_detail.req_books')}
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 my-3">
                  {/* Total Exploración (Verde) */}
                  <div className="flex items-center gap-3">
                    <img src="/recursos/book_explore.webp" alt="Exploración" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div className="text-left">
                      <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Total Exploración</div>
                      <div className="font-bebas text-4xl md:text-5xl text-emerald-500 tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                        {totalExploreBooks.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <span className="text-gray-700 text-3xl font-light hidden md:inline">|</span>

                  {/* Total Campo (Rojo) */}
                  <div className="flex items-center gap-3">
                    <img src="/recursos/book_field.webp" alt="Campo" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                    <div className="text-left">
                      <div className="text-[10px] font-mono text-blood-red uppercase tracking-widest">Total Campo</div>
                      <div className="font-bebas text-4xl md:text-5xl text-blood-red tracking-widest drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                        {totalCampoBooks.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

{/* Costos por Nivel (Estilo Antiguo) */}
                <div className="mt-5 flex justify-center">
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-400 border border-gray-800 bg-black/50 px-4 py-2 rounded-sm">
                    <span><strong className="text-white">Nv. 1 ➔ 2 :</strong> 10</span>
                    <span className="text-gray-600">|</span>
                    <span><strong className="text-white">Nv. 2 ➔ 3 :</strong> 30</span>
                    <span className="text-gray-600">|</span>
                    <span><strong className="text-white">Nv. 3 ➔ 4 :</strong> 50</span>
                    <span className="text-gray-600">|</span>
                    <span><strong className="text-white">Nv. 4 ➔ 5 :</strong> 75</span>
                  </div>
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
        )}
      </motion.div>
    </div>
  );
};

export default OperativoDetalle;
