import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, Play, CircleStop } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const themes = [
  { id: 'stress', label: 'Stress Relief', prompt: 'a soothing 2-minute meditation script for stress relief, focusing on grounding and release.' },
  { id: 'gratitude', label: 'Gratitude', prompt: 'a heartwarming 2-minute meditation script about gratitude and noticing the small beauties in life.' },
  { id: 'sleep', label: 'Deep Sleep', prompt: 'a calm, slow-paced bedtime meditation script to help someone drift into a deep sleep.' },
  { id: 'focus', label: 'Mental Clarity', prompt: 'a meditation script for mental clarity and sharp focus, using breath as an anchor.' },
];

export default function Meditate() {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState(themes[0]);

  async function generateMeditation() {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate ${activeTheme.prompt}. Output only the meditation script text. Use a serene, poetic tone with Cormorant Garamond aesthetic in mind. Break it into short paragraphs for easy reading.`,
      });
      setScript(response.text || "Failed to generate session. Try again.");
    } catch (error) {
      console.error(error);
      setScript("The universe is quiet right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="meditate-section" className="w-full max-w-2xl mx-auto space-y-8 p-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setActiveTheme(theme)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTheme.id === theme.id 
                ? 'bg-zen-accent text-white shadow-md' 
                : 'bg-white border border-zen-accent/20 text-zen-ink/70 hover:border-zen-accent/50'
            }`}
          >
            {theme.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!script && !loading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-zen-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-zen-accent" />
              </div>
              <p className="text-serif italic text-zen-ink/60">Choose a theme to begin your personal meditation session</p>
              <button
                onClick={generateMeditation}
                className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-zen-ink text-white hover:bg-opacity-90 transition-all font-medium"
              >
                <span>Generar Session</span>
              </button>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              <Loader2 className="w-10 h-10 animate-spin text-zen-accent" />
              <p className="font-serif italic animate-pulse">Channels opening...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 w-full"
            >
              <div className="prose prose-sm font-serif text-lg leading-relaxed text-zen-ink/80 whitespace-pre-wrap italic text-center max-w-lg mx-auto">
                {script}
              </div>
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setScript(null)}
                  className="p-3 rounded-full bg-zen-accent/10 text-zen-accent hover:bg-zen-accent/20 transition-all"
                  title="Finish Session"
                >
                  <CircleStop className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
