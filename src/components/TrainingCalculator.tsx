import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Zap, FastForward, Clock, Plus, Trash2, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Base de Datos: Puntos por Categoría (T1 - T11)
const POINTS_PER_UNIT: Record<number, number> = {
  1: 90, 2: 120, 3: 180, 4: 265, 5: 385, 6: 595,
  7: 830, 8: 1130, 9: 1485, 10: 1960, 11: 2490
};

interface QueueItem {
  id: string;
  type: 'train' | 'upgrade';
  fromLevel: number;
  toLevel: number;
  batchQty: number;
  batchTime: { days: number, hours: number, minutes: number, seconds: number };
  limit: number;
}

const InventoryItem = ({ label, value, onChange, isTroop, rarity }: any) => {
  const bgGradients: Record<string, string> = {
    gray: "from-gray-800 to-black",
    green: "from-green-900 to-black",
    blue: "from-blue-900 to-black",
    purple: "from-purple-900 to-black",
    gold: "from-yellow-900 to-black"
  };
  const bgClass = bgGradients[rarity] || bgGradients.gray;

  return (
    <motion.label 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative group bg-gradient-to-br ${bgClass} border border-gray-700 p-2 rounded-sm flex flex-col items-center justify-center h-[90px] overflow-hidden cursor-text`}
    >
      <div className="absolute top-1 left-1 text-[9px] font-mono text-white bg-black/60 px-1 rounded-sm pointer-events-none">{label}</div>
      <FastForward className="text-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] fill-yellow-600 mt-2 pointer-events-none" size={28} />
      {isTroop && <span className="absolute bottom-1 left-1 text-[12px] opacity-80 pointer-events-none" title="Para Tropas">🔫</span>}
      <input 
        type="number" min="0" value={value || ''} onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="absolute bottom-0 right-0 w-12 bg-black/80 border-t border-l border-gray-700 text-white font-mono text-[10px] p-1 text-right outline-none focus:bg-blood-red/20 focus:border-blood-red transition-colors rounded-tl-sm cursor-text"
        placeholder="0"
      />
    </motion.label>
  );
};

const TrainingCalculator = () => {
  const [mode, setMode] = useState<'direct' | 'advanced'>('direct');
  const [eventMode, setEventMode] = useState<'cumbres' | 'svs'>('cumbres');
  
  // Direct Mode
  const [level, setLevel] = useState<number>(11);
  const [troops, setTroops] = useState<number>(1000);
  
  // Advanced Mode Queues
  const [queues, setQueues] = useState<QueueItem[]>([
    { id: uuidv4(), type: 'train', fromLevel: 8, toLevel: 11, batchQty: 1000, batchTime: { days: 0, hours: 2, minutes: 30, seconds: 0 }, limit: 50000 }
  ]);
  
  // Advanced Mode Inventory
  const [gen1m, setGen1m] = useState<number>(0);
  const [gen5m, setGen5m] = useState<number>(0);
  const [gen1h, setGen1h] = useState<number>(0);
  const [gen3h, setGen3h] = useState<number>(0);
  const [gen8h, setGen8h] = useState<number>(0);
  const [trp1m, setTrp1m] = useState<number>(0);
  const [trp5m, setTrp5m] = useState<number>(0);
  const [trp1h, setTrp1h] = useState<number>(0);

  const updateQueue = (id: string, field: keyof QueueItem, value: any) => {
    setQueues(q => q.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const updateQueueTime = (id: string, timeObj: any) => {
    setQueues(q => q.map(item => item.id === id ? { ...item, batchTime: timeObj } : item));
  };
  const addQueue = () => {
    setQueues([...queues, { id: uuidv4(), type: 'train', fromLevel: 8, toLevel: 11, batchQty: 1000, batchTime: { days: 0, hours: 2, minutes: 30, seconds: 0 }, limit: 50000 }]);
  };
  const removeQueue = (id: string) => {
    if (queues.length > 1) setQueues(q => q.filter(item => item.id !== id));
  };

  const results = useMemo(() => {
    if (mode === 'direct') {
      return { totalPoints: troops * (POINTS_PER_UNIT[level] || 0), totalTroops: troops, queueResults: [] };
    } 
    
    // Inventory total seconds
    const accelSecs = ((gen1m * 1) + (gen5m * 5) + (gen1h * 60) + (gen3h * 180) + (gen8h * 480) + (trp1m * 1) + (trp5m * 5) + (trp1h * 60)) * 60;

    // Evaluate queues
    const evaluatedQueues = queues.map(q => {
      const pDest = POINTS_PER_UNIT[q.toLevel] || 0;
      const pSrc = POINTS_PER_UNIT[q.fromLevel] || 0;
      const pointsGain = q.type === 'upgrade' ? Math.max(0, pDest - pSrc) : pDest;
      
      const batchSecs = (q.batchTime.days * 86400) + (q.batchTime.hours * 3600) + (q.batchTime.minutes * 60) + q.batchTime.seconds;
      const ptsPerSec = batchSecs > 0 ? (pointsGain * q.batchQty) / batchSecs : 0;
      
      return { ...q, pointsGain, batchSecs, ptsPerSec, usedSecs: 0, troopsGenerated: 0, pointsEarned: 0, hitLimit: false };
    });

    // Greedy Optimizer: sort by ptsPerSec descending
    const sortedQueues = [...evaluatedQueues].sort((a, b) => b.ptsPerSec - a.ptsPerSec);
    let remainingSecs = accelSecs;

    for (let q of sortedQueues) {
      if (remainingSecs <= 0 || q.batchSecs <= 0 || q.batchQty <= 0) continue;
      
      let maxSecs = Infinity;
      if (q.type === 'upgrade' && q.limit > 0) {
        maxSecs = (q.limit / q.batchQty) * q.batchSecs;
      }
      
      const secsToSpend = Math.min(remainingSecs, maxSecs);
      const completeBatches = Math.floor(secsToSpend / q.batchSecs);
      const actualSecsSpent = completeBatches * q.batchSecs;
      
      q.usedSecs = actualSecsSpent;
      q.troopsGenerated = completeBatches * q.batchQty;
      q.pointsEarned = q.troopsGenerated * q.pointsGain;
      q.hitLimit = q.type === 'upgrade' && (secsToSpend === maxSecs) && (maxSecs > 0);
      
      remainingSecs -= actualSecsSpent;
    }

    // Remap back to original order for display
    const finalQueues = queues.map(orig => sortedQueues.find(s => s.id === orig.id)!);
    
    const totalPoints = finalQueues.reduce((sum, q) => sum + q.pointsEarned, 0);
    const totalTroops = finalQueues.reduce((sum, q) => sum + q.troopsGenerated, 0);
    const totalUsedSecs = finalQueues.reduce((sum, q) => sum + q.usedSecs, 0);
    const totalUsedDays = totalUsedSecs / 86400;

    return { totalPoints, totalTroops, accelSecs, totalUsedSecs, totalUsedDays, queueResults: finalQueues };
  }, [mode, level, troops, queues, gen1m, gen5m, gen1h, gen3h, gen8h, trp1m, trp5m, trp1h]);

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 py-12 px-6 max-w-7xl mx-auto">
      <div className="bg-[#050505] border border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blood-red/20 to-transparent border-b border-gray-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Calculator className="text-neon-red" size={28} />
            <h2 className="font-bebas text-3xl tracking-widest text-white m-0">Puntos de Entrenamiento</h2>
          </div>
          <div className="flex bg-black border border-gray-800 p-1 rounded-sm">
            <button onClick={() => setEventMode('cumbres')} className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${eventMode === 'cumbres' ? 'bg-blood-red text-white' : 'text-gray-500 hover:text-gray-300'}`}>Cumbres de Ases</button>
            <button disabled className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-gray-700 cursor-not-allowed border-l border-gray-800">SvS (Próximamente)</button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-800 px-6 py-2 bg-[#020202] flex gap-2">
           <button onClick={() => setMode('direct')} className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all ${mode === 'direct' ? 'text-neon-red border-b-2 border-neon-red' : 'text-gray-600 hover:text-gray-400'}`}>Cálculo Directo</button>
           <button onClick={() => setMode('advanced')} className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all ${mode === 'advanced' ? 'text-neon-red border-b-2 border-neon-red' : 'text-gray-600 hover:text-gray-400'}`}>Optimizador de Aceleradores</button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Panel Izquierdo: Entradas */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              
              {/* MODO DIRECTO */}
              {mode === 'direct' && (
                <motion.div key="direct" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div>
                    <label className="block font-mono text-gray-400 text-xs uppercase tracking-widest mb-2">Nivel de Tropa (Categoría)</label>
                    <select value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full bg-black border border-gray-700 text-white font-bebas text-xl p-3 outline-none focus:border-blood-red cursor-pointer appearance-none">
                      {[...Array(11)].map((_, i) => (<option key={i+1} value={i+1}>T{i+1} ({POINTS_PER_UNIT[i+1]} pts/u)</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-gray-400 text-xs uppercase tracking-widest mb-2">Cantidad Total a Entrenar</label>
                    <input type="number" min="0" value={troops || ''} onChange={(e) => setTroops(parseInt(e.target.value) || 0)} className="w-full bg-black border border-gray-700 text-neon-red font-mono text-2xl p-4 outline-none focus:border-blood-red transition-colors" />
                  </div>
                </motion.div>
              )}

              {/* MODO OPTIMIZADOR */}
              {mode === 'advanced' && (
                <motion.div key="advanced" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  
                  {/* Filas de Entrenamiento */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <label className="font-mono text-neon-red text-xs uppercase tracking-widest">Colas de Entrenamiento</label>
                      <button onClick={addQueue} className="flex items-center gap-1 text-[10px] font-mono bg-blue-900/30 text-blue-400 border border-blue-900 px-2 py-1 hover:bg-blue-900/60 transition-colors">
                        <Plus size={12}/> Añadir Tanda
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {queues.map((q) => (
                        <motion.div key={q.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#0a0a0a] border border-gray-800 p-4 relative">
                          {queues.length > 1 && (
                            <button onClick={() => removeQueue(q.id)} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            
                            {/* Selector de Tipo y Niveles */}
                            <div className="md:col-span-4 space-y-3">
                              <div className="flex bg-black border border-gray-700 p-1">
                                <button onClick={() => updateQueue(q.id, 'type', 'train')} className={`flex-1 py-1 font-mono text-[9px] uppercase tracking-widest transition-colors ${q.type === 'train' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-400'}`}>Nuevo</button>
                                <button onClick={() => updateQueue(q.id, 'type', 'upgrade')} className={`flex-1 py-1 font-mono text-[9px] uppercase tracking-widest transition-colors ${q.type === 'upgrade' ? 'bg-blood-red/80 text-white' : 'text-gray-500 hover:text-gray-400'}`}>Mejora</button>
                              </div>
                              <div className="flex items-center gap-2">
                                {q.type === 'upgrade' && (
                                  <>
                                    <select value={q.fromLevel} onChange={(e) => updateQueue(q.id, 'fromLevel', Number(e.target.value))} className="flex-1 bg-black border border-gray-700 text-white font-bebas text-lg p-1 outline-none focus:border-blood-red appearance-none text-center">
                                      {[...Array(11)].map((_, i) => (<option key={i+1} value={i+1}>T{i+1}</option>))}
                                    </select>
                                    <ArrowRight className="text-gray-500" size={16}/>
                                  </>
                                )}
                                <select value={q.toLevel} onChange={(e) => updateQueue(q.id, 'toLevel', Number(e.target.value))} className="flex-1 bg-black border border-gray-700 text-white font-bebas text-lg p-1 outline-none focus:border-blood-red appearance-none text-center">
                                  {[...Array(11)].map((_, i) => (<option key={i+1} value={i+1}>T{i+1}</option>))}
                                </select>
                              </div>
                              <div className="text-[10px] font-mono text-gray-500 text-center">
                                {q.type === 'upgrade' 
                                  ? `Gana ${Math.max(0, POINTS_PER_UNIT[q.toLevel] - POINTS_PER_UNIT[q.fromLevel])} pts/u` 
                                  : `Gana ${POINTS_PER_UNIT[q.toLevel]} pts/u`}
                              </div>
                            </div>
                            
                            {/* Cantidad y Límite */}
                            <div className="md:col-span-3 space-y-3">
                              <div>
                                <label className="block font-mono text-gray-500 text-[9px] uppercase tracking-widest mb-1">Tropas por Tanda</label>
                                <input type="number" min="0" value={q.batchQty || ''} onChange={(e) => updateQueue(q.id, 'batchQty', parseInt(e.target.value) || 0)} className="w-full bg-black border border-gray-700 text-white font-mono p-1 outline-none focus:border-blood-red" />
                              </div>
                              {q.type === 'upgrade' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                  <label className="block font-mono text-blue-400 text-[9px] uppercase tracking-widest mb-1">Límite Disponible</label>
                                  <input type="number" min="0" value={q.limit || ''} onChange={(e) => updateQueue(q.id, 'limit', parseInt(e.target.value) || 0)} className="w-full bg-blue-950/30 border border-blue-900 text-blue-300 font-mono p-1 outline-none focus:border-blue-500" />
                                </motion.div>
                              )}
                            </div>

                            {/* Tiempo por Tanda */}
                            <div className="md:col-span-5">
                              <label className="block font-mono text-gray-500 text-[9px] uppercase tracking-widest mb-1">Tiempo de la Tanda</label>
                              <div className="flex gap-1 h-[28px]">
                                <div className="flex-1 flex items-center bg-black border border-gray-700 focus-within:border-blood-red">
                                  <input type="number" min="0" value={q.batchTime.days || ''} onChange={(e) => updateQueueTime(q.id, { ...q.batchTime, days: parseInt(e.target.value) || 0 })} className="w-full bg-transparent text-white font-mono p-1 text-center outline-none text-xs" /><span className="text-gray-600 font-mono text-[9px] pr-1">d</span>
                                </div>
                                <div className="flex-1 flex items-center bg-black border border-gray-700 focus-within:border-blood-red">
                                  <input type="number" min="0" max="23" value={q.batchTime.hours || ''} onChange={(e) => updateQueueTime(q.id, { ...q.batchTime, hours: parseInt(e.target.value) || 0 })} className="w-full bg-transparent text-white font-mono p-1 text-center outline-none text-xs" /><span className="text-gray-600 font-mono text-[9px] pr-1">h</span>
                                </div>
                                <div className="flex-1 flex items-center bg-black border border-gray-700 focus-within:border-blood-red">
                                  <input type="number" min="0" max="59" value={q.batchTime.minutes || ''} onChange={(e) => updateQueueTime(q.id, { ...q.batchTime, minutes: parseInt(e.target.value) || 0 })} className="w-full bg-transparent text-white font-mono p-1 text-center outline-none text-xs" /><span className="text-gray-600 font-mono text-[9px] pr-1">m</span>
                                </div>
                                <div className="flex-1 flex items-center bg-black border border-gray-700 focus-within:border-blood-red">
                                  <input type="number" min="0" max="59" value={q.batchTime.seconds || ''} onChange={(e) => updateQueueTime(q.id, { ...q.batchTime, seconds: parseInt(e.target.value) || 0 })} className="w-full bg-transparent text-white font-mono p-1 text-center outline-none text-xs" /><span className="text-gray-600 font-mono text-[9px] pr-1">s</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Inventario */}
                  <div className="bg-[#0a0a0a] border border-gray-800 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <label className="font-mono text-neon-red text-xs uppercase tracking-widest">Inventario de Aceleradores</label>
                      <span className="font-mono text-[10px] text-gray-500 bg-black px-2 py-1 border border-gray-800">Total Disp: {((results as any).accelSecs / 3600 || 0).toFixed(1)}h</span>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="text-[10px] text-gray-500 font-mono mb-2 border-b border-gray-800 pb-1">GENERALES</div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          <InventoryItem label="1 m" rarity="gray" value={gen1m} onChange={setGen1m} />
                          <InventoryItem label="5 m" rarity="green" value={gen5m} onChange={setGen5m} />
                          <InventoryItem label="1 h" rarity="blue" value={gen1h} onChange={setGen1h} />
                          <InventoryItem label="3 h" rarity="purple" value={gen3h} onChange={setGen3h} />
                          <InventoryItem label="8 h" rarity="gold" value={gen8h} onChange={setGen8h} />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500 font-mono mb-2 border-b border-gray-800 pb-1">ENTRENAMIENTO (TROPAS)</div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          <InventoryItem label="1 m" rarity="gray" value={trp1m} onChange={setTrp1m} isTroop />
                          <InventoryItem label="5 m" rarity="green" value={trp5m} onChange={setTrp5m} isTroop />
                          <InventoryItem label="1 h" rarity="blue" value={trp1h} onChange={setTrp1h} isTroop />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Panel Derecho: Resultados */}
          <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-gray-800 p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-blood-red/5 group-hover:bg-blood-red/10 transition-colors" />
            
            <motion.div key={results.totalPoints} initial={{ scale: 0.9, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="relative z-10 flex flex-col h-full">
              
              <div className="text-center mb-8">
                <Zap className="text-neon-red mx-auto mb-4 opacity-50" size={40} />
                <h3 className="font-mono text-gray-500 text-xs uppercase tracking-widest mb-2">Puntos Máximos Estimados</h3>
                <p className="font-bebas text-5xl md:text-6xl text-white drop-shadow-[0_0_15px_rgba(255,42,42,0.6)] break-all">
                  {results.totalPoints.toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-3 font-mono text-xs flex-1">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Tropas Generadas:</span><span className="text-white font-bold">{results.totalTroops.toLocaleString()}</span>
                </div>
                
                {mode === 'advanced' && (
                  <>
                    <div className="flex justify-between items-center text-gray-400 mt-4 pt-2 border-t border-gray-800/50">
                      <span className="flex items-center gap-1"><Clock size={12}/> T. Utilizado:</span>
                      <span className="text-white">{(((results as any).totalUsedSecs || 0) / 60).toLocaleString(undefined, { maximumFractionDigits: 1 })} min</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400 text-[10px]">
                      <span>(Equivalente):</span>
                      <span className="text-gray-500">{((results as any).totalUsedDays || 0).toFixed(2)} días</span>
                    </div>

                    {/* Resumen del Algoritmo Avaro */}
                    <div className="mt-6 pt-4 border-t border-gray-800">
                      <h4 className="text-[10px] text-neon-red mb-3 uppercase tracking-widest">Resumen de Inversión</h4>
                      <div className="space-y-3">
                        {(results as any).queueResults?.map((qr: any, idx: number) => (
                          <div key={idx} className="bg-black/50 border border-gray-800 p-2 rounded-sm relative">
                            <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                              <span>Fila {idx + 1} ({qr.type === 'upgrade' ? `T${qr.fromLevel}»T${qr.toLevel}` : `Nuevo T${qr.toLevel}`})</span>
                              <span className="text-yellow-500">+{qr.pointsEarned.toLocaleString()} pts</span>
                            </div>
                            <div className="flex justify-between text-[9px]">
                              <span className="text-gray-500">{(qr.usedSecs / 3600).toFixed(1)}h invertidas</span>
                              {qr.hitLimit && <span className="text-blue-400">Límite alcanzado</span>}
                            </div>
                            {/* Barra de progreso visual sutil basada en prioridad */}
                            <div className="absolute bottom-0 left-0 h-[1px] bg-blood-red/50" style={{ width: qr.usedSecs > 0 ? '100%' : '0%' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TrainingCalculator;
