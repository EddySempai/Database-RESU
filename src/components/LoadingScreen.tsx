import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-umbrella-black">
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.98, 1, 0.98] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-16 h-16 border-4 border-gray-800 border-t-neon-red rounded-full animate-spin mb-6" />
        <span className="font-mono text-neon-red tracking-widest text-sm uppercase animate-pulse">Loading Data...</span>
      </motion.div>
    </div>
  );
}
