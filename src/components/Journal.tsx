import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Frown, Meh, Heart, Sun, CloudRain } from 'lucide-react';

interface Entry {
  id: string;
  mood: string;
  date: string;
  note: string;
}

const moods = [
  { icon: <Sun className="w-6 h-6" />, label: 'Radiant', color: 'text-yellow-500' },
  { icon: <Smile className="w-6 h-6" />, label: 'Good', color: 'text-green-500' },
  { icon: <Meh className="w-6 h-6" />, label: 'Okay', color: 'text-slate-500' },
  { icon: <Frown className="w-6 h-6" />, label: 'Down', color: 'text-blue-500' },
  { icon: <CloudRain className="w-6 h-6" />, label: 'Difficult', color: 'text-indigo-500' },
];

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedMood, setSelectedMood] = useState(moods[1]);
  const [note, setNote] = useState('');

  const addEntry = () => {
    if (!note.trim()) return;
    const newEntry: Entry = {
      id: Date.now().toString(),
      mood: selectedMood.label,
      date: new Date().toLocaleDateString(),
      note: note.trim(),
    };
    setEntries([newEntry, ...entries]);
    setNote('');
  };

  return (
    <div id="journal-section" className="max-w-xl mx-auto p-4 space-y-8">
      <div className="glass rounded-3xl p-6 space-y-6">
        <h3 className="text-xl font-serif text-center">How are you feeling?</h3>
        
        <div className="flex justify-between items-center gap-2">
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m)}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all flex-1 ${
                selectedMood.label === m.label 
                  ? 'bg-zen-accent/20 scale-105 ring-1 ring-zen-accent/30' 
                  : 'hover:bg-zen-accent/5'
              }`}
            >
              <div className={`${m.color}`}>{m.icon}</div>
              <span className="text-[10px] mt-1 font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a thought or what made you feel this way..."
            className="w-full h-24 p-4 rounded-2xl border border-zen-accent/10 focus:outline-none focus:ring-2 focus:ring-zen-accent/20 bg-white/50 placeholder:text-zen-ink/30 resize-none font-serif text-lg italic"
          />
          <button
            onClick={addEntry}
            className="w-full py-3 rounded-full bg-zen-accent text-white font-medium hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-md"
            disabled={!note.trim()}
          >
            Save Reflection
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-zen-ink/40 pl-2">Recent Reflections</h4>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {entries.length === 0 ? (
              <p className="text-center text-zen-ink/30 italic font-serif py-8">Your journey begins with the first word...</p>
            ) : (
              entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="glass p-4 rounded-2xl flex items-start gap-4"
                >
                  <div className="p-2 rounded-full bg-zen-accent/10 text-zen-accent">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-xs text-zen-accent">{entry.date}</span>
                      <span className="text-[10px] uppercase font-bold text-zen-ink/30">{entry.mood}</span>
                    </div>
                    <p className="font-serif italic text-zen-ink/70 leading-relaxed text-sm">
                      "{entry.note}"
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
