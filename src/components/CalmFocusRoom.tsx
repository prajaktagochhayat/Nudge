import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, Shield, AlertCircle, ChevronLeft } from 'lucide-react';
import { startAmbientSound, stopAmbientSound } from '../utils/audioSynth';

interface CalmFocusRoomProps {
  onBackToSite: () => void;
  onLaunchConsole: () => void;
}

export default function CalmFocusRoom({ onBackToSite, onLaunchConsole }: CalmFocusRoomProps) {
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25:00
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);

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

  // Soundscape audio simulation
  const soundscapes = [
    { name: 'Summer Rain', emoji: '🌧️' },
    { name: 'Forest Wind', emoji: '🌲' },
    { name: 'Lofi Focus Beat', emoji: '🎧' },
    { name: 'Ocean Waves', emoji: '🌊' }
  ];

  // Pomodoro timer ticker
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((1500 - secondsLeft) / 1500) * 100;

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden rounded-[40px] border border-white/60 dark:border-zinc-800 shadow-xl bg-[#FFFDF9]/60 dark:bg-[#131322]/60 glass-reflection gpu-accelerated">
      
      {/* 1. AMBIENT PASTEL ANIMATED AURORA RIBBONS BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[40px] opacity-70">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#F3EEFF] via-[#FFF0F6] to-[#E7FFF4] dark:from-[#110C24] dark:via-[#1F122C] dark:to-[#0C1B1A] opacity-80" />
        
        {/* Swirling ribbons */}
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-tr from-[#8B6CFF]/8 via-[#F9A8D4]/6 to-[#67E8F9]/8 rounded-full blur-[100px] animate-aurora pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-[#FFAA8A]/5 via-[#F6D365]/5 to-[#6EE7B7]/6 rounded-full blur-[120px] animate-aurora pointer-events-none" style={{ animationDelay: '-12s' }} />
      </div>

      {/* Navigation and Top bar */}
      <div className="absolute top-6 left-8 right-8 z-20 flex justify-between items-center w-full max-w-5xl px-4 pointer-events-auto">
        <button 
          onClick={onBackToSite}
          className="flex items-center gap-1 text-[11px] font-extrabold text-[#312E5B] hover:text-[#8B6CFF] transition-colors cursor-pointer"
        >
          <ChevronLeft size={13} />
          <span>Exit Focus Mode</span>
        </button>
        
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[9px] text-[#6EE7B7] bg-[#6EE7B7]/10 border border-[#6EE7B7]/30 px-3 py-1 rounded-full font-mono font-extrabold shadow-xs">
            <Shield size={10} className="animate-pulse" />
            Nudge AI Active Protection
          </span>
        </div>
      </div>

      {/* Main Focus Center */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-6">
        
        {/* LEFT: TIMER & TASK */}
        <div className="md:col-span-7 flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black text-[#8B6CFF] uppercase tracking-widest bg-[#8B6CFF]/10 px-3 py-1 rounded-full border border-[#8B6CFF]/20">
              Active Focus Target
            </span>
            <h2 className="text-3xl font-black text-[#312E5B] tracking-tight mt-2">Project Presentation</h2>
            <p className="text-xs text-[#4B4B5C]/80 font-medium">Protecting you from email, slack, and social media notifications.</p>
          </div>

          {/* Large Pomodoro Progress Ring */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* Soft background pulse */}
            <div className={`absolute w-full h-full rounded-full border border-dashed border-[#8B6CFF]/30 ${isRunning ? 'animate-[spin_24s_linear_infinite]' : ''}`} />
            
            <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 36 36">
              <path
                className="text-white/40"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${progressPercent}, 100` }}
                className="text-[#8B6CFF]"
                strokeWidth="2"
                strokeDasharray="0, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            {/* Countdown digital display */}
            <div className="flex flex-col items-center justify-center relative z-10">
              <div className="text-5xl font-black text-[#312E5B] font-mono tracking-wider">
                {formatTime(secondsLeft)}
              </div>
              <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-1.5">Pomodoro block</span>
            </div>
          </div>

          {/* Timer controls */}
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-full text-xs font-black text-white flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
                isRunning 
                  ? 'bg-[#FFAA8A] shadow-[#FFAA8A]/25' 
                  : 'bg-gradient-to-r from-[#8B6CFF] to-[#F9A8D4] shadow-[#8B6CFF]/20'
              }`}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              <span>{isRunning ? 'Pause session' : 'Start deep focus'}</span>
            </button>
            
            <button
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(1500);
              }}
              className="p-3.5 border border-zinc-200 bg-white/70 hover:bg-white rounded-2xl text-zinc-500 hover:text-[#312E5B] transition-colors cursor-pointer active:scale-95"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* RIGHT: AMBIENT SOUNDS & NUDGE ALERTS */}
        <div className="md:col-span-5 space-y-6 flex flex-col justify-between h-full py-4">
          
          {/* Soundscape panel */}
          <div className="glass-panel p-5 bg-white/75 rounded-3xl border border-white/60 shadow-sm text-left space-y-3.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 size={13} className="text-[#8B6CFF]" />
                <span>Ambient Soundscapes</span>
              </h3>
              {selectedSound && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#6EE7B7] animate-ping" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {soundscapes.map(sc => (
                <button
                  key={sc.name}
                  onClick={() => setSelectedSound(selectedSound === sc.name ? null : sc.name)}
                  className={`py-2.5 px-2 rounded-xl text-[10px] font-bold border text-center transition-all cursor-pointer ${
                    selectedSound === sc.name
                      ? 'bg-gradient-to-r from-[#8B6CFF] to-[#A78BFA] text-white border-transparent shadow-sm'
                      : 'bg-white/60 border-zinc-200 text-zinc-650 hover:bg-white'
                  }`}
                >
                  <span className="mr-1">{sc.emoji}</span>
                  <span>{sc.name}</span>
                </button>
              ))}
            </div>

            {selectedSound ? (
              <div className="text-[9px] text-[#8B6CFF] font-semibold flex items-center justify-between border-t border-zinc-100 pt-2 mt-2">
                <span>Playing {selectedSound} in background</span>
                <Volume2 size={10} className="animate-bounce" />
              </div>
            ) : (
              <p className="text-[9.5px] text-zinc-400 italic border-t border-zinc-100 pt-2 mt-2 leading-relaxed">
                Select a soundscape to mask surrounding visual/auditory clutter.
              </p>
            )}
          </div>

          {/* AI Nudge Active protection panel */}
          <div className="glass-panel p-5 bg-white/75 rounded-3xl border border-white/60 shadow-sm text-left space-y-3">
            <h4 className="text-xs font-black text-[#312E5B] uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle size={13} className="text-[#FFAA8A]" />
              <span>Nudge AI companion</span>
            </h4>
            
            <div className="space-y-2 text-[10px] font-semibold text-[#4B4B5C] leading-relaxed">
              <div className="p-2.5 bg-[#FFF6CC]/70 border border-[#F6D365]/35 rounded-xl flex items-start gap-2 animate-pulse">
                <span>💡</span>
                <span>You are **12 minutes** away from completing your first deep-work block. Keep going!</span>
              </div>
              
              <div className="p-2.5 bg-[#F3EEFF]/80 border border-[#8B6CFF]/20 rounded-xl flex items-start gap-2">
                <span>🛡️</span>
                <span>Blocked 4 slack pings and locked focus window parameters successfully.</span>
              </div>
            </div>

            <button 
              onClick={onLaunchConsole}
              className="w-full mt-2 bg-[#312E5B] hover:opacity-95 text-white text-[9px] font-bold py-2 rounded-xl transition-all cursor-pointer"
            >
              Open Smart Plan Console
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
