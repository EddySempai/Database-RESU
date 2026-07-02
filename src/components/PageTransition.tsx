import { motion } from 'framer-motion';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="w-full h-full flex flex-col flex-1"
      >
        {children}
      </motion.main>

      {/* Blood Wipe Overlay */}
      <motion.div
        className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: 0,
          transition: { duration: 0.5, delay: 0.6 } 
        }}
        exit={{ 
          opacity: 1,
          transition: { duration: 0.1 } 
        }}
      >
        {/* Splatters */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#660000] blur-xl mix-blend-multiply"
            style={{
              width: `${Math.random() * 40 + 40}vw`,
              height: `${Math.random() * 40 + 40}vh`,
              left: `${Math.random() * 60}%`,
              top: `${Math.random() * 60}%`,
            }}
            initial={{ scale: 1 }}
            animate={{ 
              scale: 0,
              transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: Math.random() * 0.2 } 
            }}
            exit={{ 
              scale: 2.5, // Grow to cover screen
              transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: Math.random() * 0.2 } 
            }}
          />
        ))}

        {/* Umbrella Logo */}
        <motion.div 
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0.5, opacity: 0, transition: { duration: 0.4, delay: 0.2 } }}
          exit={{ scale: 1, opacity: 1, transition: { duration: 0.4, delay: 0.2 } }}
          className="relative z-10 w-32 h-32 flex items-center justify-center drop-shadow-2xl"
        >
          {/* Simple Umbrella Octagon using CSS */}
          <div className="w-full h-full rounded-full border-8 border-white bg-transparent flex items-center justify-center relative overflow-hidden">
            {/* Red Slices */}
            <div className="absolute w-full h-full bg-red-600" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}></div>
            <div className="absolute w-full h-full bg-red-600" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0 100%)' }}></div>
            <div className="absolute w-full h-full bg-red-600" style={{ clipPath: 'polygon(50% 50%, 0 0, 50% 0)' }}></div>
            <div className="absolute w-full h-full bg-red-600" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 100% 50%)' }}></div>
            
            {/* White Slices (Background shows through) */}
            <div className="absolute w-full h-full bg-white" style={{ clipPath: 'polygon(50% 50%, 100% 0, 50% 0)' }}></div>
            <div className="absolute w-full h-full bg-white" style={{ clipPath: 'polygon(50% 50%, 0 100%, 0 50%)' }}></div>
            <div className="absolute w-full h-full bg-white" style={{ clipPath: 'polygon(50% 50%, 0 0, 0 50%)' }}></div>
            <div className="absolute w-full h-full bg-white" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 50% 100%)' }}></div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default PageTransition;
