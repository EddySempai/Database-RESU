import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const characters = [
  {
    name: "Leon S. Kennedy",
    role: "Asalto / Liderazgo",
    desc: "Agente del gobierno con vasta experiencia en supervivencia biológica. Experto en combate cercano y armas de fuego.",
    stats: { level: 80, hp: 85400, atk: 15200, def: 2800, troops: "+12000", bonus: "Ataque cuerpo a cuerpo +250%" }
  },
  {
    name: "Piers Nivans",
    role: "Francotirador de Élite",
    desc: "Tirador experto de la BSAA. Mantiene la sangre fría bajo presión extrema.",
    stats: { level: 80, hp: 99719, atk: 14714, def: 2979, troops: "+13470", bonus: "Bono a Distancia: 370.33%" }
  },
  {
    name: "Ada Wong",
    role: "Espía / Infiltración",
    desc: "Operativa independiente envuelta en misterio. Especialista en misiones encubiertas.",
    stats: { level: 80, hp: 78500, atk: 16500, def: 2400, troops: "+11000", bonus: "Evasión y Sigilo +400%" }
  },
  {
    name: "Chris Redfield",
    role: "Comandante BSAA",
    desc: "Veterano con fuerza bruta y tácticas militares avanzadas. Inquebrantable en combate.",
    stats: { level: 80, hp: 105000, atk: 14000, def: 3500, troops: "+15000", bonus: "Defensa Global +300%" }
  },
  {
    name: "Jill Valentine",
    role: "Especialista Táctica",
    desc: "Maestra en desarmar trampas y cerraduras. Superviviente de élite.",
    stats: { level: 80, hp: 82000, atk: 14900, def: 2600, troops: "+11500", bonus: "Velocidad de Movimiento +150%" }
  }
];

const OperativesCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-24 z-10 bg-[#050505] border-t border-gray-900 group">
      <div className="px-6 md:px-12 mb-8 flex justify-between items-end max-w-[1400px] mx-auto">
        <div>
          <h3 className="font-mono text-neon-red text-sm tracking-widest uppercase mb-2">Base de Datos Táctica</h3>
          <h2 className="font-bebas text-5xl md:text-6xl tracking-wider text-white">Operativos de Élite</h2>
        </div>
      </div>

      <div className="relative w-full overflow-hidden max-w-[1400px] mx-auto">
        
        {/* Left Edge Hover Nav */}
        <div 
          onClick={scrollLeft}
          className="hidden md:flex absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-black via-black/80 to-transparent z-20 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        >
          <div className="bg-black/50 p-2 rounded-full border border-blood-red/50 hover:bg-blood-red hover:text-white text-neon-red transition-colors shadow-[0_0_15px_rgba(158,0,0,0.5)]">
            <ChevronLeft size={32} />
          </div>
        </div>

        {/* Right Edge Hover Nav */}
        <div 
          onClick={scrollRight}
          className="hidden md:flex absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-black via-black/80 to-transparent z-20 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        >
          <div className="bg-black/50 p-2 rounded-full border border-blood-red/50 hover:bg-blood-red hover:text-white text-neon-red transition-colors shadow-[0_0_15px_rgba(158,0,0,0.5)]">
            <ChevronRight size={32} />
          </div>
        </div>

        <div 
          ref={carouselRef}
          className="flex gap-6 px-6 md:px-12 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 relative z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {characters.map((char, i) => (
            <div 
              key={i} 
              className="min-w-[320px] md:min-w-[380px] bg-[#0a0a0a] border border-gray-800 flex flex-col snap-start shrink-0 hover:border-gray-600 transition-colors"
            >
              {/* Image Placeholder Section */}
              <div className="h-[250px] w-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center border-b border-gray-800 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] opacity-20" />
                <div className="text-center z-10 px-4">
                  <h3 className="font-bebas text-4xl text-gray-400 group-hover:text-white transition-colors tracking-widest uppercase">
                    {char.name}
                  </h3>
                  <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mt-2 block">Imagen Pendiente</span>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-6 flex-grow flex flex-col">
                <p className="font-mono text-neon-red text-sm font-bold uppercase tracking-widest mb-3">
                  {char.role}
                </p>
                <p className="font-inter text-gray-400 text-sm mb-6 flex-grow">
                  {char.desc}
                </p>

                {/* Stats Panel */}
                <div className="bg-black/50 border border-blood-red/20 p-4 font-mono text-xs text-gray-300">
                  <div className="flex justify-between border-b border-gray-800 pb-2 mb-2">
                    <span className="text-gray-500">Nivel Actual</span>
                    <span className="text-white font-bold">{char.stats.level} MAX</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2">
                    <div><span className="text-gray-500">Salud:</span> <span className="text-green-400">{char.stats.hp}</span></div>
                    <div><span className="text-gray-500">Ataque:</span> <span className="text-red-400">{char.stats.atk}</span></div>
                    <div><span className="text-gray-500">Defensa:</span> <span className="text-blue-400">{char.stats.def}</span></div>
                    <div><span className="text-gray-500">Tropas:</span> <span className="text-yellow-400">{char.stats.troops}</span></div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-800 text-neon-red">
                    {char.stats.bonus}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default OperativesCarousel;
