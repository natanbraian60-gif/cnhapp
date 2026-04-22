import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind } from 'lucide-react';

type Phase = 'Inhale' | 'Hold' | 'Exhale' | 'Pause';

export default function Breathe() {
  const [phase, setPhase] = useState<Phase>('Inhale');
  const [counter, setCounter] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setCounter((prev) => {
          if (prev === 1) {
            setPhase((currentPhase) => {
              if (currentPhase === 'Inhale') return 'Hold';
              if (currentPhase === 'Hold') return 'Exhale';
              if (currentPhase === 'Exhale') return 'Pause';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase]);

  const circleVariants = {
    Inhale: { scale: 1.5, opacity: 0.8 },
    Hold: { scale: 1.5, opacity: 1 },
    Exhale: { scale: 1, opacity: 0.6 },
    Pause: { scale: 1, opacity: 0.4 },
  };

  const colors = {
    Inhale: 'bg-zen-accent',
    Hold: 'bg-emerald-400',
    Exhale: 'bg-zen-accent',
    Pause: 'bg-slate-400',
  };

  return (
    <div id="breathe-section" className="flex flex-col items-center justify-center space-y-12">
      <div className="relative flex items-center justify-center w-64 h-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={circleVariants[phase]}
            transition={{ duration: phase === 'Hold' || phase === 'Pause' ? 0.2 : 4, ease: "linear" }}
            className={`absolute w-40 h-40 rounded-full blur-3xl opacity-30 ${colors[phase]}`}
          />
        </AnimatePresence>
        
        <motion.div
          animate={circleVariants[phase]}
          transition={{ duration: (phase === 'Hold' || phase === 'Pause') ? 0.2 : 4, ease: "linear" }}
          className={`w-32 h-32 rounded-full border-4 border-zen-accent/20 flex items-center justify-center bg-white shadow-xl z-10 transition-colors duration-500`}
        >
          <div className="text-4xl font-serif text-zen-accent">
            {isActive ? counter : <Wind className="w-12 h-12" />}
          </div>
        </motion.div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-serif italic mb-2">
          {isActive ? phase : "Box Breathing"}
        </h2>
        <p className="text-sm text-zen-ink/60 max-w-xs mx-auto">
          Inhale, hold, exhale, and pause for 4 seconds each to calm your nervous system.
        </p>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className="px-8 py-3 rounded-full bg-zen-accent text-white font-medium hover:bg-opacity-90 transition-all shadow-md active:scale-95"
      >
        {isActive ? 'Pause' : 'Start Session'}
      </button>
    </div>
  );
}
