import { useState, useEffect } from 'react';

const Simulator = () => {
  const [acc1m, setAcc1m] = useState(0);
  const [acc5m, setAcc5m] = useState(0);
  const [acc1h, setAcc1h] = useState(0);
  const [acc8h, setAcc8h] = useState(0);
  const [acc24h, setAcc24h] = useState(0);
  const [tier, setTier] = useState("T1");
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState({ time: 0, units: 0, points: 0 });

  // Animated counter hook
  const useAnimatedCounter = (endValue: number, duration: number, isSimulating: boolean) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isSimulating) return;
      let startTimestamp: number;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setCount(Math.floor(progress * endValue));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }, [endValue, duration, isSimulating]);

    return isSimulating ? count : 0; // reset to 0 if not simulating
  };

  const handleSimulate = () => {
    setIsSimulating(false); // reset
    setTimeout(() => {
      const totalMinutes = acc1m * 1 + acc5m * 5 + acc1h * 60 + acc8h * 480 + acc24h * 1440;
      
      const tierMultiplier = parseInt(tier.replace('T', ''));
      const estimatedUnits = Math.floor(totalMinutes * (12 / tierMultiplier)); 
      const estimatedPoints = estimatedUnits * tierMultiplier * 15;

      setResults({
        time: totalMinutes,
        units: estimatedUnits,
        points: estimatedPoints
      });
      setIsSimulating(true);
    }, 100);
  };

  const animTime = useAnimatedCounter(results.time, 1500, isSimulating);
  const animUnits = useAnimatedCounter(results.units, 1500, isSimulating);
  const animPoints = useAnimatedCounter(results.points, 1500, isSimulating);

  const tiers = Array.from({length: 10}, (_, i) => `T${i + 1}`);

  return (
    <section className="relative z-10 py-24 px-6 md:px-12 bg-[#050505] border-t border-b border-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="font-mono text-neon-red text-sm tracking-widest uppercase mb-2">Módulo de Logística</h3>
          <h2 className="font-bebas text-5xl md:text-6xl tracking-wider text-white">Simulador de Entrenamiento</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 bg-[#0a0a0a] border border-gray-800 p-2 rounded-sm shadow-2xl shadow-black/80">
          
          {/* Controls Panel */}
          <div className="flex-1 bg-black border border-gray-800 p-6 md:p-8">
            <h4 className="font-mono text-gray-500 uppercase tracking-widest text-xs mb-6 border-b border-gray-800 pb-2">Terminal Umbrella</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6 font-mono text-sm">
              <label className="flex flex-col text-gray-400">
                Aceleradores 1m:
                <input type="number" min="0" value={acc1m} onChange={e => setAcc1m(Number(e.target.value))} className="mt-1 bg-[#111] border border-gray-700 text-white p-2 focus:border-blood-red outline-none transition-colors" />
              </label>
              <label className="flex flex-col text-gray-400">
                Aceleradores 5m:
                <input type="number" min="0" value={acc5m} onChange={e => setAcc5m(Number(e.target.value))} className="mt-1 bg-[#111] border border-gray-700 text-white p-2 focus:border-blood-red outline-none transition-colors" />
              </label>
              <label className="flex flex-col text-gray-400">
                Aceleradores 1h:
                <input type="number" min="0" value={acc1h} onChange={e => setAcc1h(Number(e.target.value))} className="mt-1 bg-[#111] border border-gray-700 text-white p-2 focus:border-blood-red outline-none transition-colors" />
              </label>
              <label className="flex flex-col text-gray-400">
                Aceleradores 8h:
                <input type="number" min="0" value={acc8h} onChange={e => setAcc8h(Number(e.target.value))} className="mt-1 bg-[#111] border border-gray-700 text-white p-2 focus:border-blood-red outline-none transition-colors" />
              </label>
              <label className="flex flex-col text-gray-400">
                Aceleradores 24h:
                <input type="number" min="0" value={acc24h} onChange={e => setAcc24h(Number(e.target.value))} className="mt-1 bg-[#111] border border-gray-700 text-white p-2 focus:border-blood-red outline-none transition-colors" />
              </label>
              <label className="flex flex-col text-gray-400">
                Nivel de Tropa:
                <select value={tier} onChange={e => setTier(e.target.value)} className="mt-1 bg-[#111] border border-gray-700 text-white p-2 focus:border-blood-red outline-none transition-colors appearance-none">
                  {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            </div>

            <button 
              onClick={handleSimulate}
              className="w-full bg-blood-red hover:bg-neon-red text-white font-bebas text-2xl tracking-widest py-4 transition-colors duration-300 shadow-[0_0_15px_rgba(158,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,42,42,0.8)] uppercase"
            >
              Ejecutar Simulación
            </button>
          </div>

          {/* Results Panel */}
          <div className="flex-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] bg-repeat bg-[#030303] p-6 md:p-8 flex flex-col justify-center border border-gray-800">
            <h4 className="font-mono text-gray-500 uppercase tracking-widest text-xs mb-6 border-b border-gray-800 pb-2">Resultados Tácticos</h4>
            
            <div className="space-y-6">
              <div>
                <p className="font-mono text-sm text-gray-500 uppercase mb-1">Tiempo Total (Minutos)</p>
                <div className="font-bebas text-5xl text-white">{animTime}</div>
              </div>
              <div>
                <p className="font-mono text-sm text-gray-500 uppercase mb-1">Unidades Producidas</p>
                <div className="font-bebas text-5xl text-white">{animUnits}</div>
              </div>
              <div>
                <p className="font-mono text-sm text-gray-500 uppercase mb-1">Puntos Estimados</p>
                <div className="font-bebas text-6xl text-neon-red drop-shadow-[0_0_10px_rgba(255,42,42,0.6)]">{animPoints.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mt-8 font-mono text-xs text-gray-600 uppercase">
              * Datos calculados en base a protocolos de eficiencia estándar.
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Simulator;
