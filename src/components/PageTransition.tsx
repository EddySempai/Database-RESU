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

      {/* Top Metal Shutter */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[50vh] z-[100] bg-[#0a0a0a] border-b-4 border-blood-red flex items-end justify-center pointer-events-none shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
        initial={{ y: '0%' }}
        animate={{ 
          y: '-100%',
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 } 
        }}
        exit={{ 
          y: '0%',
          transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } 
        }}
      >
        {/* Warning Stripes */}
        <div className="w-full h-4 bg-[repeating-linear-gradient(45deg,#ff2a2a,#ff2a2a_10px,#000_10px,#000_20px)] opacity-50 absolute bottom-0 left-0" />
      </motion.div>

      {/* Bottom Metal Shutter */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-[50vh] z-[100] bg-[#0a0a0a] border-t-4 border-blood-red flex items-start justify-center pointer-events-none shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
        initial={{ y: '0%' }}
        animate={{ 
          y: '100%',
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 } 
        }}
        exit={{ 
          y: '0%',
          transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } 
        }}
      >
        {/* Warning Stripes */}
        <div className="w-full h-4 bg-[repeating-linear-gradient(45deg,#ff2a2a,#ff2a2a_10px,#000_10px,#000_20px)] opacity-50 absolute top-0 left-0" />
      </motion.div>
    </>
  );
};

export default PageTransition;
