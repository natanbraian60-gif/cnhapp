import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wind, Sparkles, BookHeart, Flower2 } from 'lucide-react';
import Breathe from './components/Breathe';
import Meditate from './components/Meditate';
import Journal from './components/Journal';
import { cn } from './lib/utils';

type Tab = 'home' | 'breathe' | 'meditate' | 'journal';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'breathe', icon: Wind, label: 'Breathe' },
    { id: 'meditate', icon: Sparkles, label: 'Meditate' },
    { id: 'journal', icon: BookHeart, label: 'Journal' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex flex-col items-center selection:bg-zen-accent selection:text-white pb-24 md:pb-0 font-sans">
      {/* Background Zen Element */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-zen-accent/30 blur-[120px]" />
         <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100 blur-[120px]" />
      </div>

      <header className="w-full max-w-5xl px-6 py-8 flex items-center justify-between z-50">
        <div className="flex items-center space-x-2">
          <Flower2 className="w-8 h-8 text-zen-accent" />
          <h1 className="text-2xl font-serif font-light tracking-tighter text-zen-ink">Zenith</h1>
        </div>
        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-zen-ink/40">Mindfulness Companion</div>
      </header>

      <main className="w-full max-w-4xl px-4 flex-1 flex flex-col items-center justify-center relative z-10 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-serif font-light tracking-tight text-zen-ink leading-tight">
                  Find your <span className="italic">stillness</span> today.
                </h2>
                <p className="text-lg text-zen-ink/50 font-light max-w-lg mx-auto">
                  Take a moment for yourself. Breathe, meditate, and reflect. The world can wait.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
                {[
                  { tab: 'breathe', title: 'Box Breathing', desc: 'Regulate your pulse' },
                  { tab: 'meditate', title: 'AI Meditation', desc: 'Bespoke scripts' },
                  { tab: 'journal', title: 'Reflection', desc: 'Deepen awareness' }
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab as Tab)}
                    className="glass p-6 rounded-[2rem] text-left hover:bg-white/60 transition-all group active:scale-95"
                  >
                    <h3 className="font-serif text-xl group-hover:text-zen-accent transition-colors">{item.title}</h3>
                    <p className="text-xs text-zen-ink/40">{item.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'breathe' && (
            <motion.div
              key="breathe"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <Breathe />
            </motion.div>
          )}

          {activeTab === 'meditate' && (
            <motion.div
              key="meditate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <Meditate />
            </motion.div>
          )}

          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <Journal />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Rail / Bottom Nav */}
      <nav className="fixed bottom-6 glass rounded-full px-4 py-2 flex items-center space-x-1 z-[100] shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "relative flex items-center space-x-2 px-4 py-2 rounded-full transition-all group",
                isActive ? "text-zen-ink" : "text-zen-ink/40 hover:text-zen-ink/60"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className={cn(
                "text-xs font-medium relative z-10 overflow-hidden transition-all duration-300",
                isActive ? "w-auto opacity-100 ml-2" : "w-0 opacity-0"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
