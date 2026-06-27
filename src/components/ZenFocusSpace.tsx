import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, RotateCcw, ShieldCheck } from 'lucide-react';
import { startAmbientSound, stopAmbientSound } from '../utils/audioSynth';

export default function ZenFocusSpace() {
  const [timeRemaining, setTimeRemaining] = useState(1500); // 25 min Pomodoro
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Sync ambient audio changes
  useEffect(() => {
    if (selectedSound) {
      startAmbientSound(selectedSound);
    } else {
      stopAmbientSound();
    }
    return () => {
      stopAmbientSound();
    };
  }, [selectedSound]);

  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pct = ((1500 - timeRemaining) / 1500) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-500 uppercase">Focus Room</span>
          <h2 className="text-xl font-bold text-zinc-800">Zen Focus Space</h2>
        </div>
        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 animate-pulse">
          <ShieldCheck size={12} /> Nudge AI Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Focus Pomodoro Timer */}
        <div className="md:col-span-2 glass-panel p-8 bg-white/95 rounded-3xl flex flex-col items-center justify-center">
          
          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            
            {/* Spinning active ring */}
            <div className={`absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/40 ${isTimerRunning ? 'animate-[spin_16s_linear_infinite]' : ''}`} />
            
            {/* Static outer svg progress ring */}
            <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 36 36">
              <path
                className="text-zinc-100"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${pct}, 100` }}
                className="text-emerald-500"
                strokeWidth="2.5"
                strokeDasharray="0, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="text-3xl font-extrabold text-[#1E1B4B] font-mono tracking-wider relative z-10">
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-6 py-3 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-colors ${
                isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
            </button>
            
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimeRemaining(1500);
              }}
              className="p-3 border border-zinc-200 rounded-2xl hover:bg-zinc-50 text-zinc-500 transition-colors"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Ambient audio controller panel */}
        <div className="md:col-span-1 glass-panel p-6 bg-white/95 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-[#1E1B4B]">Ambient Sounds</h3>
              {selectedSound ? (
                <Volume2 size={15} className="text-emerald-500 animate-pulse" />
              ) : (
                <VolumeX size={15} className="text-zinc-400" />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {['Summer Rain', 'Forest Wind', 'Ocean Waves', 'Lofi Focus Beat'].map(sound => (
                <button
                  key={sound}
                  onClick={() => setSelectedSound(selectedSound === sound ? null : sound)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold border text-center transition-all ${
                    selectedSound === sound
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {sound}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-150">
            <AnimatePresence mode="wait">
              {selectedSound ? (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-between items-center text-[10px] text-zinc-400 font-medium"
                >
                  <span>Now Playing: {selectedSound}</span>
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-2.5 bg-emerald-500 animate-[pulse_0.9s_infinite]" />
                    <span className="w-0.5 h-1.5 bg-emerald-500 animate-[pulse_1.2s_infinite]" />
                    <span className="w-0.5 h-3 bg-emerald-500 animate-[pulse_0.7s_infinite]" />
                  </div>
                </motion.div>
              ) : (
                <span className="text-[10px] text-zinc-400 italic">Select soundscapes for sensory isolation.</span>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
