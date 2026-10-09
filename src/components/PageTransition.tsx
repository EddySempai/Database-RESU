import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  // Congelar la ubicación al montar para que durante el cierre (exit) se mantenga la página saliente
  const [frozenLocation] = useState(location);
  const isNewsRoute = frozenLocation.pathname.startsWith('/noticias');

  // Transición fluida estilo morph para noticias
  if (isNewsRoute) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.02, y: -10, filter: 'blur(6px)' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full flex flex-col flex-1 origin-top"
      >
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<{ location?: any }>, {
              location: frozenLocation
            })
          : children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full flex flex-col flex-1 relative"
    >
      {/* Contenido de la Página */}
      <motion.div
        variants={{
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.25, delay: 0.12 } },
          exit: { opacity: 0, transition: { duration: 0.2 } }
        }}
        className="w-full h-full flex flex-col flex-1"
      >
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<{ location?: any }>, {
              location: frozenLocation
            })
          : children}
      </motion.div>

      {/* COMPUERTA SUPERIOR (Top Metal Shutter Door) - Se Cierra a 0% y se Abre a -100% */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[50vh] z-[9999] bg-gradient-to-b from-[#060608] to-[#111116] border-b-4 border-blood-red flex flex-col items-center justify-end pointer-events-none shadow-[0_20px_45px_rgba(0,0,0,0.95)]"
        variants={{
          initial: { y: '0%' },
          animate: {
            y: '-100%',
            transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.08 }
          },
          exit: {
            y: '0%',
            transition: { duration: 0.38, ease: [0.76, 0, 0.24, 1] }
          }
        }}
      >
        {/* Rayas de Advertencia Tácticas (Hazard Warning Stripes) */}
        <div className="w-full h-3 bg-[repeating-linear-gradient(45deg,#ff2a2a,#ff2a2a_10px,#000_10px,#000_20px)] opacity-65 absolute bottom-0 left-0" />
        
        {/* Sello Táctico Central Superior */}
        <div className="mb-2 px-3.5 py-0.5 rounded-t bg-black/90 border-t border-x border-blood-red/80 font-mono text-[9px] sm:text-[10px] tracking-widest text-red-400 uppercase flex items-center gap-2 shadow-[0_0_12px_rgba(220,38,38,0.4)]">
          <span className="w-1.5 h-1.5 rounded-full bg-blood-red animate-pulse" />
          <span>UMBRELLA FACILITY // SECURITY PORTAL</span>
        </div>
      </motion.div>

      {/* COMPUERTA INFERIOR (Bottom Metal Shutter Door) - Se Cierra a 0% y se Abre a 100% */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-[50vh] z-[9999] bg-gradient-to-t from-[#060608] to-[#111116] border-t-4 border-blood-red flex flex-col items-center justify-start pointer-events-none shadow-[0_-20px_45px_rgba(0,0,0,0.95)]"
        variants={{
          initial: { y: '0%' },
          animate: {
            y: '100%',
            transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.08 }
          },
          exit: {
            y: '0%',
            transition: { duration: 0.38, ease: [0.76, 0, 0.24, 1] }
          }
        }}
      >
        {/* Rayas de Advertencia Tácticas (Hazard Warning Stripes) */}
        <div className="w-full h-3 bg-[repeating-linear-gradient(45deg,#ff2a2a,#ff2a2a_10px,#000_10px,#000_20px)] opacity-65 absolute top-0 left-0" />
        
        {/* Sello Táctico Central Inferior */}
        <div className="mt-2 px-3.5 py-0.5 rounded-b bg-black/90 border-b border-x border-amber-500/80 font-mono text-[9px] sm:text-[10px] tracking-widest text-amber-400 uppercase flex items-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>TRANSIT VERIFIED // ACCESS AUTHORIZED</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PageTransition;
