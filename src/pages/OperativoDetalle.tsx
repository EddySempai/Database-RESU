import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield, Sword, Heart, Star, BookOpen, Users, Crosshair } from 'lucide-react';
import operativosData from '../data/operativos.json';
import { calculateRequiredExp, calculateRequiredContracts, calculateSkillBooks, getMaxSkillsByRarity } from '../utils/calculators';
import EquipamientoView from '../components/EquipamientoView';

const getUnitIcon = (type: string) => {
  switch(type) {
    case 'Defensor': return <Shield size={14} />;
    case 'Atacante': return <Sword size={14} />;
    case 'Ranger': return <Crosshair size={14} />;
    default: return null;
  }
};

const getUnitColor = (type: string) => {
  switch(type) {
    case 'Defensor': return 'text-blue-400 bg-blue-900/40 border-blue-500/50';
    case 'Atacante': return 'text-blood-red bg-blood-red/20 border-blood-red/50';
    case 'Ranger': return 'text-green-400 bg-green-900/40 border-green-500/50';
    default: return 'text-gray-400 bg-gray-800 border-gray-600';
  }
};

const OperativoDetalle = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('skills'); // skills, exp, stars, books
  
  const op = operativosData.find(o => o.id === id);

  // States for calculators
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(80);
  
  const [currentStar, setCurrentStar] = useState(0);
  const [currentNode, setCurrentNode] = useState(0);
  const [targetStar, setTargetStar] = useState(6);
  const [targetNode, setTargetNode] = useState(0);

  const [currentSkillLevel, setCurrentSkillLevel] = useState(1);
  const [targetSkillLevel, setTargetSkillLevel] = useState(5);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!op) {
    return (
      <div className="pt-32 text-center text-white h-screen">
        <h1 className="text-4xl font-bebas text-neon-red">Operativo no encontrado</h1>
        <Link to="/operativos" className="text-gray-400 hover:text-white mt-4 inline-block">Volver a Base de Datos</Link>
      </div>
    );
  }

  // Determine rarity from stats or mock it (Legendary = 6 skills, Epic = 5)
  const rarity = op.rarity || 'Épico';
  const maxSkills = getMaxSkillsByRarity(rarity);

  const localImage = `/operativos/${op.imageUrl.split('/').pop()}`;

  return (
    <div className={`pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen relative z-10 flex flex-col ${activeTab === 'equipment' ? '' : 'md:flex-row'} gap-8`}>
      
      {/* Left Column: Visual & Stats */}
      {activeTab !== 'equipment' && (
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-1/3 flex flex-col"
      >
        <Link to="/operativos" className="flex items-center gap-2 text-gray-500 hover:text-white font-mono text-xs uppercase tracking-widest mb-6 transition-colors">
          <ChevronLeft size={16} /> Volver a Base de Datos
        </Link>
        
        <div className="bg-[#050505] border border-gray-800 p-6 relative overflow-hidden group rounded-sm flex-1">
          <div className="absolute inset-0 bg-blood-red/5" />
          <h1 className="font-bebas text-4xl text-white tracking-widest relative z-10 drop-shadow-[0_0_10px_rgba(255,42,42,0.5)]">
            {op.name}
          </h1>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <p className="font-mono text-gray-500 text-xs uppercase tracking-widest">Expediente Táctico</p>
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
              <h3 className="font-mono text-gray-500 text-xs uppercase tracking-widest mb-2">Estadísticas Máximas</h3>
              <div className="flex items-center justify-between bg-black/50 p-3 border border-gray-800/50">
                <div className="flex items-center gap-2 text-green-500"><Heart size={16} /> <span className="font-bebas tracking-widest">SALUD</span></div>
                <span className="font-mono text-white">{op.stats.health.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between bg-black/50 p-3 border border-gray-800/50">
                <div className="flex items-center gap-2 text-blood-red"><Sword size={16} /> <span className="font-bebas tracking-widest">ATAQUE</span></div>
                <span className="font-mono text-white">{op.stats.attack.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between bg-black/50 p-3 border border-gray-800/50">
                <div className="flex items-center gap-2 text-blue-500"><Shield size={16} /> <span className="font-bebas tracking-widest">DEFENSA</span></div>
                <span className="font-mono text-white">{op.stats.defense.toLocaleString()}</span>
              </div>
            </div>
          )}

          {op.fieldStats && op.fieldStats.length > 0 && (
            <div className="mt-6 border-t border-gray-800 pt-6 relative z-10">
              <h3 className="font-mono text-blood-red text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sword size={14} /> Bonificaciones de Campo
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
            { id: 'skills', label: 'Habilidades' },
            { id: 'exp', label: 'Calc. Experiencia' },
            { id: 'stars', label: 'Calc. Ascenso (Contratos)' },
            { id: 'books', label: 'Calc. Libros Habilidad' },
            { id: 'equipment', label: 'Equipamiento' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-xs uppercase tracking-widest px-4 py-3 transition-colors ${
                activeTab === tab.id 
                ? 'bg-blood-red/20 text-white border-b-2 border-blood-red' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'equipment' ? (
          <EquipamientoView op={op} />
        ) : (
        <div className="bg-[#050505] border border-gray-800 p-6 flex-1 relative overflow-hidden">
          
          {/* TAB: Habilidades */}
          {activeTab === 'skills' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="font-bebas text-3xl tracking-widest text-white mb-6 flex items-center gap-3">
                <Star className="text-neon-red" /> Archivos de Habilidad
              </h2>
              <div className="text-gray-400 font-mono text-sm mb-8 leading-relaxed">
                Este operativo es de rareza <span className="text-white">{rarity}</span>, por lo que dispone de <span className="text-neon-red font-bold">{maxSkills}</span> habilidades activas y pasivas en total. (Datos específicos de habilidad se añadirán pronto).
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-black border border-gray-800 p-3">
                  <div className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Shield className="w-3 h-3 text-blood-red" /> Poder de Combate
                  </div>
                  <div className="text-white font-bebas text-2xl tracking-widest">{((op as any).stats?.combatPower || 0).toLocaleString()}</div>
                </div>
                <div className="bg-black border border-gray-800 p-3">
                  <div className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Users className="w-3 h-3 text-blood-red" /> Tropas Base
                  </div>
                  <div className="text-white font-bebas text-2xl tracking-widest">{((op as any).stats?.troops || 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="border border-gray-800 p-4 bg-black/50">
                  <h3 className="font-mono text-blood-red uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Habilidades de Campo</h3>
                  <div className="space-y-4">
                    {[1, 2, maxSkills === 6 ? 3 : null].filter(Boolean).map(i => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex-shrink-0 flex items-center justify-center font-bebas text-gray-500">
                          H{i}
                        </div>
                        <div>
                          <h4 className="text-white font-bebas tracking-widest">Habilidad Campo {i}</h4>
                          <p className="text-xs text-gray-500 font-inter mt-1">Pendiente de extracción de datos oficiales.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-gray-800 p-4 bg-black/50">
                  <h3 className="font-mono text-blue-500 uppercase tracking-widest border-b border-gray-800 pb-2 mb-4">Habilidades de Exploración</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 bg-gray-900 border border-gray-700 flex-shrink-0 flex items-center justify-center font-bebas text-gray-500">
                          E{i}
                        </div>
                        <div>
                          <h4 className="text-white font-bebas tracking-widest">Habilidad Exp. {i}</h4>
                          <p className="text-xs text-gray-500 font-inter mt-1">Pendiente de extracción de datos oficiales.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Calc Experiencia */}
          {activeTab === 'exp' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="font-bebas text-3xl tracking-widest text-white mb-2 flex items-center gap-3">
                Calculadora de Experiencia
              </h2>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-8">Planifica tus recursos de entrenamiento táctico</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Nivel Actual (1-80)</label>
                  <input 
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
                  <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Nivel Deseado (1-80)</label>
                  <input 
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

              <div className="bg-blood-red/10 border border-blood-red/30 p-6 text-center">
                <p className="font-mono text-gray-400 text-sm uppercase mb-2">Experiencia Total Requerida</p>
                <div className="font-bebas text-5xl md:text-6xl text-neon-red tracking-widest">
                  {calculateRequiredExp(currentLevel, targetLevel).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Calc Contratos (Estrellas) */}
          {activeTab === 'stars' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="font-bebas text-3xl tracking-widest text-white mb-2 flex items-center gap-3">
                Calculadora de Ascenso
              </h2>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-8">Contratos de Operativo necesarios</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-black/30 p-6 border border-gray-800">
                
                {/* ESTADO ACTUAL */}
                <div className="flex flex-col items-center justify-center space-y-6 border-b md:border-b-0 md:border-r border-gray-800 pb-6 md:pb-0 md:pr-6">
                  <h3 className="font-mono text-neon-red text-sm tracking-widest uppercase mb-2">Estado Actual</h3>
                  
                  {/* Visual Stars */}
                  <div className="flex gap-1 cursor-pointer">
                    {[0, 1, 2, 3, 4, 5].map(i => {
                      let fillPercent = 0;
                      if (currentStar > i) fillPercent = 100;
                      else if (currentStar === i) fillPercent = (currentNode / 5) * 100;
                      
                      const starColor = currentStar === 6 ? 'text-fuchsia-500 fill-fuchsia-500' : 'text-yellow-500 fill-yellow-500';
                      
                      return (
                        <div key={i} onClick={() => { setCurrentStar(i + 1); setCurrentNode(0); }} className="relative w-8 h-8 md:w-10 md:h-10 transition-transform hover:scale-110">
                          {/* Empty Star */}
                          <Star className="absolute inset-0 text-gray-800 w-full h-full" strokeWidth={1.5} />
                          {/* Filled Star */}
                          <div className="absolute inset-0 overflow-hidden transition-all duration-300" style={{ width: `${fillPercent}%` }}>
                            <Star className={`w-8 h-8 md:w-10 md:h-10 transition-colors duration-500 ${starColor}`} strokeWidth={1} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Node (Astas) Controls */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        let ns = currentStar, nn = currentNode - 1;
                        if (nn < 0) { if (ns > 0) { ns--; nn = 4; } else { nn = 0; } }
                        setCurrentStar(ns); setCurrentNode(nn);
                      }} 
                      disabled={currentStar === 0 && currentNode === 0}
                      className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:border-neon-red transition-colors disabled:opacity-50 disabled:hover:border-gray-700"
                    >-</button>
                    
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map(n => {
                          const nodeColor = currentStar === 6 
                            ? 'bg-fuchsia-500 shadow-[0_0_5px_rgba(217,70,239,0.8)]' 
                            : 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]';
                          const isActive = currentStar === 6 || n <= currentNode;
                          return (
                            <div key={n} className={`w-3 h-3 rotate-45 transition-colors duration-300 ${isActive ? nodeColor : 'bg-gray-900 border border-gray-700'}`} />
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
                      className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:border-neon-red transition-colors disabled:opacity-50 disabled:hover:border-gray-700"
                    >+</button>
                  </div>
                  
                  <div className="text-xs text-gray-500 font-mono tracking-widest uppercase mt-2">
                    {currentStar} Estrella{currentStar !== 1 ? 's' : ''} / {currentNode} Asta{currentNode !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* ESTADO DESEADO */}
                <div className="flex flex-col items-center justify-center space-y-6 pt-6 md:pt-0 md:pl-6">
                  <h3 className="font-mono text-yellow-500 text-sm tracking-widest uppercase mb-2">Objetivo</h3>
                  
                  {/* Visual Stars */}
                  <div className="flex gap-1 cursor-pointer">
                    {[0, 1, 2, 3, 4, 5].map(i => {
                      let fillPercent = 0;
                      if (targetStar > i) fillPercent = 100;
                      else if (targetStar === i) fillPercent = (targetNode / 5) * 100;
                      
                      const starColor = targetStar === 6 ? 'text-fuchsia-500 fill-fuchsia-500' : 'text-yellow-500 fill-yellow-500';
                      
                      return (
                        <div key={i} onClick={() => { setTargetStar(i + 1); setTargetNode(0); }} className="relative w-8 h-8 md:w-10 md:h-10 transition-transform hover:scale-110">
                          {/* Empty Star */}
                          <Star className="absolute inset-0 text-gray-800 w-full h-full" strokeWidth={1.5} />
                          {/* Filled Star */}
                          <div className="absolute inset-0 overflow-hidden transition-all duration-300" style={{ width: `${fillPercent}%` }}>
                            <Star className={`w-8 h-8 md:w-10 md:h-10 transition-colors duration-500 ${starColor}`} strokeWidth={1} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Node (Astas) Controls */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        let ns = targetStar, nn = targetNode - 1;
                        if (nn < 0) { if (ns > 0) { ns--; nn = 4; } else { nn = 0; } }
                        setTargetStar(ns); setTargetNode(nn);
                      }} 
                      disabled={targetStar === 0 && targetNode === 0}
                      className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:border-yellow-500 transition-colors disabled:opacity-50 disabled:hover:border-gray-700"
                    >-</button>
                    
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map(n => {
                          const nodeColor = targetStar === 6 
                            ? 'bg-fuchsia-500 shadow-[0_0_5px_rgba(217,70,239,0.8)]' 
                            : 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]';
                          const isActive = targetStar === 6 || n <= targetNode;
                          return (
                            <div key={n} className={`w-3 h-3 rotate-45 transition-colors duration-300 ${isActive ? nodeColor : 'bg-gray-900 border border-gray-700'}`} />
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
                      className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-700 text-white hover:bg-gray-800 hover:border-yellow-500 transition-colors disabled:opacity-50 disabled:hover:border-gray-700"
                    >+</button>
                  </div>
                  
                  <div className="text-xs text-gray-500 font-mono tracking-widest uppercase mt-2">
                    {targetStar} Estrella{targetStar !== 1 ? 's' : ''} / {targetNode} Asta{targetNode !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/10 border border-yellow-500/30 p-6 text-center">
                <p className="font-mono text-gray-400 text-sm uppercase mb-2">Contratos Totales Requeridos</p>
                <div className="font-bebas text-5xl md:text-6xl text-yellow-400 tracking-widest drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                  {calculateRequiredContracts(currentStar, currentNode, targetStar, targetNode).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-2 font-inter">No incluye los 10 contratos iniciales para desbloquear al personaje.</p>
              </div>
            </div>
          )}

          {/* TAB: Calc Libros */}
          {activeTab === 'books' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="font-bebas text-3xl tracking-widest text-white mb-2 flex items-center gap-3">
                <BookOpen className="text-neon-red" /> Calculadora de Libros
              </h2>
              <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mb-8">Mejora de una Habilidad Específica</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Nivel Actual (1-5)</label>
                  <input 
                    type="number" min="1" max="5" 
                    value={currentSkillLevel} 
                    onChange={e => {
                      let val = Number(e.target.value);
                      if (val > 5) val = 5;
                      if (val < 1 && e.target.value !== '') val = 1;
                      setCurrentSkillLevel(val);
                    }}
                    className="w-full bg-black border border-gray-700 text-white p-3 font-mono outline-none focus:border-neon-red"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-mono text-xs uppercase mb-2">Nivel Deseado (1-5)</label>
                  <input 
                    type="number" min="1" max="5" 
                    value={targetSkillLevel} 
                    onChange={e => {
                      let val = Number(e.target.value);
                      if (val > 5) val = 5;
                      if (val < 1 && e.target.value !== '') val = 1;
                      setTargetSkillLevel(val);
                    }}
                    className="w-full bg-black border border-gray-700 text-white p-3 font-mono outline-none focus:border-neon-red"
                  />
                </div>
              </div>

              <div className="bg-yellow-900/10 border border-yellow-500/30 p-6 text-center">
                <p className="font-mono text-gray-400 text-sm uppercase mb-2">Libros de Habilidad Requeridos</p>
                <div className="font-bebas text-5xl md:text-6xl text-yellow-500 tracking-widest drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                  {calculateSkillBooks(currentSkillLevel, targetSkillLevel).toLocaleString()}
                </div>
                <div className="mt-4 border-t border-gray-800 pt-4 text-xs font-mono text-gray-500 flex flex-col md:flex-row justify-center gap-6">
                  <span>Costo Máximo (1 Habilidad): 165</span>
                  <span>Costo Máximo (Total {rarity}): {165 * maxSkills}</span>
                </div>
                
                {/* Costos por Nivel */}
                <div className="mt-6 flex justify-center">
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-400 border border-gray-800 bg-black/50 px-4 py-2">
                    <span><strong className="text-white">Nv. 1 ➔ 2:</strong> 10</span>
                    <span className="text-gray-600">|</span>
                    <span><strong className="text-white">Nv. 2 ➔ 3:</strong> 30</span>
                    <span className="text-gray-600">|</span>
                    <span><strong className="text-white">Nv. 3 ➔ 4:</strong> 50</span>
                    <span className="text-gray-600">|</span>
                    <span><strong className="text-white">Nv. 4 ➔ 5:</strong> 75</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        )}
      </motion.div>
    </div>
  );
};

export default OperativoDetalle;
