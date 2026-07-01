import { useEffect, useState } from 'react';

const Particles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);

  useEffect(() => {
    // Generate random particles for the ash/spores effect
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 70; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 5 + 2, // Slightly larger
          speed: Math.random() * 0.4 + 0.1,
          opacity: Math.random() * 0.6 + 0.3 // Higher opacity
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-red-600"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px rgba(255, 42, 42, 0.8)`, // Added glow
            animation: `float ${10 / p.speed}s linear infinite`,
            animationDelay: `-${Math.random() * 10}s`
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100vh) translateX(20vw); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Particles;
